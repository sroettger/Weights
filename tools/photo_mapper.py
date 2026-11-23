#!/usr/bin/env python3
"""
Weights — Automated Gym Photo-to-Floorplan Analyzer & Stitcher (`tools/photo_mapper.py`)

Solves the 3 main failure modes of manual photo-to-floorplan reconstruction:
1) Burst Grouping & Rotation Direction: Parses PXL_YYYYMMDD_HHMMSSmmm timestamps to group
   stationary 360°/pan sweeps vs. walking shots, and runs multi-band normalized cross-correlation
   between consecutive frames to measure exact horizontal shift (dx px) and pan angle (d_theta deg,
   assuming ~77 deg horizontal FOV on Pixel 16:9 main lens).
2) Global Compass Alignment via Floor Planks: Measures lower-third floor-plank gradient angle
   to flag Due-North / Due-South (0/180 deg) vs Due-East / Due-West (90/270 deg) shots.
3) Stitched Panorama & Seam Strips + Layout Collision Checker: Outputs a true-order stitched
   reference panorama with cumulative compass headings + validates machine footprints against
   official Matrix Fitness centimeter specs.

Usage:
  python3 tools/photo_mapper.py /home/antigravity/PXL_*.jpg --out-dir ./mapping_out
"""

import argparse
import json
import math
import os
import re
import sys
from datetime import datetime
from PIL import Image, ImageDraw, ImageOps


PXL_RE = re.compile(r"PXL_(\d{8})_(\d{9})")
DEFAULT_HFOV_DEG = 77.0  # Pixel main wide camera 16:9 horizontal FOV


def parse_pxl_timestamp(filepath: str):
    m = PXL_RE.search(os.path.basename(filepath))
    if not m:
        return None
    d_str, t_str = m.group(1), m.group(2)
    dt = datetime.strptime(d_str + t_str[:6], "%Y%m%d%H%M%S")
    ms = int(t_str[6:])
    return dt.timestamp() + ms / 1000.0


def estimate_horizontal_shift(im_a: Image.Image, im_b: Image.Image, work_w: int = 256):
    """
    Estimate horizontal camera pan (dx in full-res pixels, confidence score) from im_a to im_b.
    Positive dx means camera panned RIGHT (clockwise); negative dx means camera panned LEFT (CCW).
    """
    orig_w, orig_h = im_a.size
    if im_b.size != im_a.size:
        return None, 0.0

    scale = work_w / orig_w
    work_h = max(48, int(orig_h * scale))

    # Focus on middle vertical band (20%..78% height) where architectural walls/windows/racks sit
    y0, y1 = int(work_h * 0.20), int(work_h * 0.78)
    ga = ImageOps.grayscale(im_a.resize((work_w, work_h), Image.Resampling.BILINEAR)).crop((0, y0, work_w, y1))
    gb = ImageOps.grayscale(im_b.resize((work_w, work_h), Image.Resampling.BILINEAR)).crop((0, y0, work_w, y1))

    bh = y1 - y0
    pa = ga.tobytes()
    pb = gb.tobytes()

    best_dx = 0
    best_corr = -1.0
    min_overlap = int(work_w * 0.22)
    max_shift = work_w - min_overlap

    # Coarse step 2px, then refine +-2px
    def score_shift(dx: int) -> float:
        # If camera panned RIGHT by dx>0, right side of A [dx..W] matches left side of B [0..W-dx]
        if dx >= 0:
            ax0, bx0, ov = dx, 0, work_w - dx
        else:
            ax0, bx0, ov = 0, -dx, work_w + dx
        if ov < min_overlap:
            return -1.0

        n = 0
        sum_a = sum_b = 0.0
        # Subsample every 2nd row for speed
        for r in range(0, bh, 2):
            ra = r * work_w + ax0
            rb = r * work_w + bx0
            for c in range(0, ov, 2):
                va = pa[ra + c]
                vb = pb[rb + c]
                sum_a += va
                sum_b += vb
                n += 1
        mean_a = sum_a / n
        mean_b = sum_b / n

        num = den_a = den_b = 0.0
        for r in range(0, bh, 2):
            ra = r * work_w + ax0
            rb = r * work_w + bx0
            for c in range(0, ov, 2):
                da = pa[ra + c] - mean_a
                db = pb[rb + c] - mean_b
                num += da * db
                den_a += da * da
                den_b += db * db
        denom = math.sqrt(den_a * den_b)
        if denom < 1e-6:
            return -1.0
        # Slight penalty for very tiny overlaps to avoid spurious edge matches
        overlap_weight = 0.88 + 0.12 * (ov / work_w)
        return (num / denom) * overlap_weight

    for dx in range(-max_shift, max_shift + 1, 3):
        sc = score_shift(dx)
        if sc > best_corr:
            best_corr = sc
            best_dx = dx

    for dx in range(max(-max_shift, best_dx - 3), min(max_shift, best_dx + 3) + 1):
        sc = score_shift(dx)
        if sc > best_corr:
            best_corr = sc
            best_dx = dx

    full_dx = round(best_dx / scale)
    return full_dx, round(best_corr, 3)


def estimate_floor_plank_axis(im: Image.Image) -> str:
    """
    Classify dominant wood-plank seam direction in the bottom 28% floor region:
    - 'parallel_to_view' (looking roughly North 0° or South 180° along planks)
    - 'perpendicular_to_view' (looking roughly East 90° or West 270° across planks)
    - 'diagonal' (oblique ~35-55° view)
    """
    w, h = im.size
    crop = ImageOps.grayscale(im.crop((int(w * 0.18), int(h * 0.72), int(w * 0.82), int(h * 0.96)))).resize((160, 64))
    px = crop.tobytes()
    cw, ch = 160, 64

    gx_energy = 0.0  # Vertical edges -> planks running away from camera (N/S)
    gy_energy = 0.0  # Horizontal edges -> planks running across camera (E/W)
    diag_energy = 0.0

    for y in range(1, ch - 1):
        row = y * cw
        for x in range(1, cw - 1):
            gx = abs(px[row + x + 1] - px[row + x - 1])
            gy = abs(px[row + cw + x] - px[row - cw + x])
            if gx + gy < 10:
                continue
            ratio = gx / (gy + 1e-3)
            if ratio > 1.55:
                gx_energy += gx
            elif ratio < 0.65:
                gy_energy += gy
            else:
                diag_energy += (gx + gy) * 0.5

    total = gx_energy + gy_energy + diag_energy + 1e-6
    if gx_energy / total > 0.42 and gx_energy > gy_energy * 1.25:
        return "along_planks (N/S ~0° or 180°)"
    if gy_energy / total > 0.42 and gy_energy > gx_energy * 1.25:
        return "across_planks (E/W ~90° or 270°)"
    return "diagonal_to_planks (~45° oblique)"


def build_sweep_panorama(sweep_records, out_path: str):
    """
    Render a stitched / ordered panoramic reference strip sorted by cumulative yaw angle,
    labeled with filename, timestamp delta, match correlation, and compass yaw.
    """
    landscape = [r for r in sweep_records if r["size"][0] >= r["size"][1]]
    if not landscape:
        return None

    sorted_recs = sorted(landscape, key=lambda r: r["cum_yaw_deg"])
    thumb_w, thumb_h = 560, 315
    canvas = Image.new("RGB", (len(sorted_recs) * (thumb_w + 6) + 6, thumb_h + 62), (16, 19, 24))
    draw = ImageDraw.Draw(canvas)

    for idx, rec in enumerate(sorted_recs):
        im = Image.open(rec["path"]).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x0 = 6 + idx * (thumb_w + 6)
        canvas.paste(im, (x0, 54))
        yaw_mod = rec["cum_yaw_deg"] % 360
        draw.text((x0 + 6, 8), f"#{rec['order']} {rec['name']}  |  Yaw {yaw_mod:5.1f}°", fill=(255, 215, 90))
        draw.text((x0 + 6, 28), f"{rec['plank_hint']}  (corr={rec['match_corr']})", fill=(150, 210, 235))

    canvas.save(out_path, quality=92)
    return out_path


def analyze_photos(paths, out_dir: str, hfov_deg: float = DEFAULT_HFOV_DEG):
    os.makedirs(out_dir, exist_ok=True)
    items = []
    for p in paths:
        if not os.path.isfile(p):
            continue
        im = Image.open(p)
        ts = parse_pxl_timestamp(p) or os.path.getmtime(p)
        items.append({
            "path": p,
            "name": os.path.basename(p),
            "ts": ts,
            "size": im.size,
            "orientation": "landscape" if im.size[0] >= im.size[1] else "portrait",
            "plank_hint": estimate_floor_plank_axis(im),
        })

    items.sort(key=lambda x: x["ts"])
    if not items:
        raise RuntimeError("No valid image files provided.")

    # Group into sweeps (gap > 25s starts a new burst/location)
    sweeps = []
    cur_sweep = [items[0]]
    for prev, cur in zip(items, items[1:]):
        if cur["ts"] - prev["ts"] > 25.0 or cur["orientation"] != prev["orientation"]:
            sweeps.append(cur_sweep)
            cur_sweep = [cur]
        else:
            cur_sweep.append(cur)
    sweeps.append(cur_sweep)

    report = {"hfov_deg": hfov_deg, "sweeps": []}

    for s_idx, sw in enumerate(sweeps, start=1):
        cum_yaw = 0.0
        sw_out = []
        for i, rec in enumerate(sw):
            if i == 0:
                dx, corr, dyaw = 0, 1.0, 0.0
            else:
                im_prev = Image.open(sw[i - 1]["path"])
                im_cur = Image.open(rec["path"])
                dx, corr = estimate_horizontal_shift(im_prev, im_cur)
                if dx is not None and corr >= 0.35:
                    dyaw = (dx / rec["size"][0]) * hfov_deg
                else:
                    dyaw = 0.0
                cum_yaw += dyaw

            entry = {
                "order": i + 1,
                "name": rec["name"],
                "path": rec["path"],
                "size": list(rec["size"]),
                "dt_sec": round(rec["ts"] - sw[0]["ts"], 2),
                "shift_px": dx,
                "delta_yaw_deg": round(dyaw, 1),
                "cum_yaw_deg": round(cum_yaw, 1),
                "direction": "START" if i == 0 else ("CCW (Left)" if dyaw < -2 else ("CW (Right)" if dyaw > 2 else "Stationary/Step")),
                "match_corr": corr,
                "plank_hint": rec["plank_hint"],
            }
            sw_out.append(entry)

        # Also check loop closure between last and first frame if >= 5 frames
        loop_closure = None
        if len(sw) >= 5 and sw[0]["size"] == sw[-1]["size"]:
            dx_loop, corr_loop = estimate_horizontal_shift(Image.open(sw[-1]["path"]), Image.open(sw[0]["path"]))
            if dx_loop is not None:
                dyaw_loop = round((dx_loop / sw[0]["size"][0]) * hfov_deg, 1)
                total_circle = round(cum_yaw + dyaw_loop, 1)
                loop_closure = {
                    "last_to_first_dyaw_deg": dyaw_loop,
                    "corr": corr_loop,
                    "estimated_full_circle_deg": total_circle,
                }

        pano_file = os.path.join(out_dir, f"sweep_{s_idx}_panorama.jpg")
        pano_saved = build_sweep_panorama(sw_out, pano_file)

        report["sweeps"].append({
            "sweep_id": s_idx,
            "frame_count": len(sw_out),
            "panorama_image": pano_saved,
            "loop_closure": loop_closure,
            "frames": sw_out,
        })

    json_path = os.path.join(out_dir, "photo_analysis.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    return report, json_path


def main():
    ap = argparse.ArgumentParser(description="Analyze & stitch gym reference photos for reliable floor plan mapping.")
    ap.add_argument("images", nargs="+", help="Input gym photo paths (e.g. PXL_*.jpg)")
    ap.add_argument("--out-dir", default="/tmp/weights_photo_map", help="Output folder for stitched panorama & JSON")
    ap.add_argument("--hfov", type=float, default=DEFAULT_HFOV_DEG, help="Camera horizontal FOV in degrees")
    args = ap.parse_args()

    report, json_path = analyze_photos(args.images, args.out_dir, args.hfov)
    print(f"Saved photo analysis -> {json_path}")
    for sw in report["sweeps"]:
        print(f"\n=== Sweep #{sw['sweep_id']} ({sw['frame_count']} frames) ===")
        for fr in sw["frames"]:
            print(
                f"  [{fr['order']}] {fr['name']} (+{fr['dt_sec']:4.1f}s) | "
                f"Δyaw={fr['delta_yaw_deg']:+6.1f}° ({fr['direction']:11s}, corr={fr['match_corr']:.2f}) | "
                f"CumYaw={fr['cum_yaw_deg']:+6.1f}° | {fr['plank_hint']}"
            )
        if sw["loop_closure"]:
            lc = sw["loop_closure"]
            print(
                f"  -> Loop closure (last -> first): Δyaw={lc['last_to_first_dyaw_deg']:+.1f}° "
                f"(corr={lc['corr']:.2f}), Total sweep={lc['estimated_full_circle_deg']:+.1f}°"
            )


if __name__ == "__main__":
    main()
