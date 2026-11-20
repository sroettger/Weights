/**
 * Weights — Google Fitbit Air (BLE 0x180D) & Google Health API v4 Connector
 *
 * 1) Live 1 Hz Heart Rate directly over Web Bluetooth (BLE Heart Rate Service 0x180D / 0x2A37)
 *    Requires: Google Health app -> Devices -> Fitbit Air -> Share heart rate -> Always visible
 * 2) Optional Google Health API v4 (health.googleapis.com/v4) for daily resting HR, HRV & steps
 * 3) Built-in live workout simulator for testing without a paired device
 */

const HEART_RATE_SERVICE = 0x180d;
const HEART_RATE_MEASUREMENT = 0x2a37;
const BATTERY_SERVICE = 0x180f;
const BATTERY_LEVEL = 0x2a19;

const GOOGLE_HEALTH_BASE = 'https://health.googleapis.com/v4';
const GOOGLE_HEALTH_SCOPES = [
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
  'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
].join(' ');

/**
 * Parse standard Bluetooth SIG Heart Rate Measurement (0x2A37) payload.
 */
export function parseHeartRateMeasurement(dataView) {
  if (!dataView || dataView.byteLength < 2) return null;
  const flags = dataView.getUint8(0);
  const is16Bit = Boolean(flags & 0x01);
  const contactSupported = Boolean(flags & 0x04);
  const contactDetected = Boolean(flags & 0x02);
  const energyPresent = Boolean(flags & 0x08);
  const rrPresent = Boolean(flags & 0x10);

  let offset = 1;
  const bpm = is16Bit ? dataView.getUint16(offset, true) : dataView.getUint8(offset);
  offset += is16Bit ? 2 : 1;

  let energyExpended = null;
  if (energyPresent && dataView.byteLength >= offset + 2) {
    energyExpended = dataView.getUint16(offset, true);
    offset += 2;
  }

  const rrIntervalsMs = [];
  if (rrPresent) {
    while (dataView.byteLength >= offset + 2) {
      const raw = dataView.getUint16(offset, true);
      // 1/1024 second units -> ms
      rrIntervalsMs.push(Math.round((raw / 1024) * 1000));
      offset += 2;
    }
  }

  return {
    bpm,
    contact: contactSupported ? contactDetected : true,
    energyExpended,
    rrIntervalsMs,
  };
}

/**
 * Compute Heart Rate Reserve (Karvonen) zone 1-5 + continuous decimal zone.
 */
export function computeHrZone(bpm, restingHr = 60, maxHr = 188) {
  const b = Number(bpm) || 0;
  const rhr = Math.max(35, Math.min(110, Number(restingHr) || 60));
  const mhr = Math.max(rhr + 40, Number(maxHr) || 188);
  if (b <= 0) {
    return { zone: 0, decimal: 0, label: 'Idle', pct: 0, color: 'var(--text-muted)' };
  }

  const hrr = Math.max(0, Math.min(1.15, (b - rhr) / (mhr - rhr)));
  const pct = Math.round(hrr * 100);

  if (hrr < 0.5) {
    return { zone: 1, decimal: +(1 + (hrr / 0.5) * 0.9).toFixed(1), label: 'Recovery', pct, color: 'var(--success)' };
  }
  if (hrr < 0.65) {
    return { zone: 2, decimal: +(2 + ((hrr - 0.5) / 0.15) * 0.9).toFixed(1), label: 'Fat Burn', pct, color: 'hsl(188, 72%, 48%)' };
  }
  if (hrr < 0.8) {
    return { zone: 3, decimal: +(3 + ((hrr - 0.65) / 0.15) * 0.9).toFixed(1), label: 'Cardio', pct, color: 'var(--warning)' };
  }
  if (hrr < 0.9) {
    return { zone: 4, decimal: +(4 + ((hrr - 0.8) / 0.1) * 0.9).toFixed(1), label: 'Hard', pct, color: 'var(--accent)' };
  }
  return { zone: 5, decimal: Math.min(5.9, +(5 + ((hrr - 0.9) / 0.15) * 0.9).toFixed(1)), label: 'Peak', pct, color: 'var(--danger)' };
}

export class WearableManager {
  constructor(getProfile, onUpdate) {
    this.getProfile = getProfile;
    this.onUpdate = onUpdate;

    this.device = null;
    this.characteristic = null;
    this.simTimerId = null;
    this.simPhase = 0;

    this.live = {
      status: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'simulating' | 'error'
      deviceName: '',
      bpm: null,
      batteryPct: null,
      contact: true,
      samples: [], // last 90 readings: { t, bpm }
      sessionSum: 0,
      sessionCount: 0,
      sessionPeak: 0,
      estKcal: 0,
      lastSampleAt: null,
      errorMessage: '',
    };
  }

  static isBleSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
  }

  getSnapshot() {
    const profile = this.getProfile();
    const zone = computeHrZone(this.live.bpm, profile.restingHr, profile.maxHr);
    const avgBpm =
      this.live.sessionCount > 0
        ? Math.round(this.live.sessionSum / this.live.sessionCount)
        : null;

    return {
      ...this.live,
      bleSupported: WearableManager.isBleSupported(),
      zone,
      avgBpm,
      peakBpm: this.live.sessionPeak || null,
      restingHr: profile.restingHr,
      maxHr: profile.maxHr,
    };
  }

  resetSessionMetrics() {
    this.live.sessionSum = 0;
    this.live.sessionCount = 0;
    this.live.sessionPeak = 0;
    this.live.estKcal = 0;
    this.live.samples = [];
    this.emit();
  }

  recordSample(bpm, contact = true) {
    const now = Date.now();
    const prevAt = this.live.lastSampleAt;
    this.live.bpm = bpm;
    this.live.contact = contact;
    this.live.lastSampleAt = now;

    if (bpm > 30 && bpm < 230) {
      this.live.samples.push({ t: now, bpm });
      if (this.live.samples.length > 90) {
        this.live.samples = this.live.samples.slice(-90);
      }
      this.live.sessionSum += bpm;
      this.live.sessionCount += 1;
      if (bpm > this.live.sessionPeak) this.live.sessionPeak = bpm;

      // Rough active calorie estimate between samples (Keytel-style approximation)
      if (prevAt) {
        const dtMin = Math.min(0.25, Math.max(0, (now - prevAt) / 60000));
        const profile = this.getProfile();
        const rhr = profile.restingHr || 60;
        const intensity = Math.max(0, (bpm - rhr) / Math.max(40, (profile.maxHr || 188) - rhr));
        const kcalPerMin = 1.4 + intensity * 10.5;
        this.live.estKcal += kcalPerMin * dtMin;
      }
    }

    this.emit();
  }

  async connectBle() {
    if (!WearableManager.isBleSupported()) {
      this.live.status = 'error';
      this.live.errorMessage =
        'Web Bluetooth requires Chrome (Android, macOS, Windows) or Bluefy on iOS. You can test Live Mode with Simulate below.';
      this.emit();
      return false;
    }

    this.stopSimulation();
    this.live.status = 'connecting';
    this.live.errorMessage = '';
    this.emit();

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [BATTERY_SERVICE],
      });

      this.device = device;
      this.live.deviceName = device.name || 'Google Fitbit Air';

      device.addEventListener('gattserverdisconnected', () => {
        if (this.live.status === 'connected') {
          this.live.status = 'disconnected';
          this.live.bpm = null;
          this.live.errorMessage = 'Fitbit Air disconnected. Ensure "Share heart rate" is on in Google Health.';
          this.emit();
        }
      });

      const server = await device.gatt.connect();
      const hrService = await server.getPrimaryService(HEART_RATE_SERVICE);
      const hrChar = await hrService.getCharacteristic(HEART_RATE_MEASUREMENT);
      this.characteristic = hrChar;

      hrChar.addEventListener('characteristicvaluechanged', (event) => {
        const parsed = parseHeartRateMeasurement(event.target.value);
        if (parsed && parsed.bpm > 0) {
          this.recordSample(parsed.bpm, parsed.contact);
        }
      });

      await hrChar.startNotifications();

      // Optional battery read
      try {
        const battService = await server.getPrimaryService(BATTERY_SERVICE);
        const battChar = await battService.getCharacteristic(BATTERY_LEVEL);
        const battVal = await battChar.readValue();
        this.live.batteryPct = battVal.getUint8(0);
      } catch {
        this.live.batteryPct = null;
      }

      this.live.status = 'connected';
      this.live.errorMessage = '';
      this.emit();
      return true;
    } catch (err) {
      if (err?.name === 'NotFoundError') {
        this.live.status = 'disconnected';
        this.live.errorMessage = '';
      } else {
        this.live.status = 'error';
        this.live.errorMessage = err?.message || 'Could not connect to Fitbit Air over Bluetooth.';
      }
      this.emit();
      return false;
    }
  }

  disconnect() {
    this.stopSimulation();
    if (this.device?.gatt?.connected) {
      try {
        this.device.gatt.disconnect();
      } catch {
        // Ignore
      }
    }
    this.device = null;
    this.characteristic = null;
    this.live.status = 'disconnected';
    this.live.bpm = null;
    this.live.batteryPct = null;
    this.live.errorMessage = '';
    this.emit();
  }

  /**
   * Simulates realistic lifting + rest heart-rate fluctuations from a Fitbit Air
   * so the user can preview live zones, sparkline, and recovery coaching anywhere.
   */
  startSimulation(isRestingFn) {
    this.disconnect();
    this.live.status = 'simulating';
    this.live.deviceName = 'Fitbit Air (Demo)';
    this.live.batteryPct = 84;
    this.live.errorMessage = '';
    let currentBpm = 114;
    this.recordSample(currentBpm, true);

    this.simTimerId = window.setInterval(() => {
      const resting = typeof isRestingFn === 'function' ? isRestingFn() : false;
      const target = resting ? 102 : 146;
      const step = resting ? -2.2 : 2.8;
      const jitter = (Math.random() - 0.5) * 3;
      currentBpm = Math.round(
        Math.max(82, Math.min(168, currentBpm + (target > currentBpm ? Math.abs(step) : -Math.abs(step)) + jitter))
      );
      this.recordSample(currentBpm, true);
    }, 1000);
  }

  stopSimulation() {
    if (this.simTimerId) {
      window.clearInterval(this.simTimerId);
      this.simTimerId = null;
    }
  }

  /**
   * Google Health API v4 (health.googleapis.com/v4) OAuth 2.0 helper.
   * Pulls today's resting heart rate, HRV, and steps from a user's Google Health account.
   */
  static buildGoogleHealthAuthUrl(clientId, redirectUri) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: GOOGLE_HEALTH_SCOPES,
      include_granted_scopes: 'true',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  static extractAccessTokenFromHash() {
    if (typeof window === 'undefined' || !window.location.hash) return null;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('access_token');
    if (token) {
      // Clean sensitive token from URL bar
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        // Ignore
      }
      return {
        accessToken: token,
        expiresAt: Date.now() + (Number(params.get('expires_in')) || 3600) * 1000,
      };
    }
    return null;
  }

  static async fetchGoogleHealthSummary(accessToken) {
    if (!accessToken) throw new Error('Missing Google Health access token');
    const headers = { Authorization: `Bearer ${accessToken}` };

    const fetchType = async (dataType) => {
      const url = `${GOOGLE_HEALTH_BASE}/users/me/dataTypes/${dataType}/dataPoints?pageSize=5&dataSourceFamily=users/me/dataSourceFamilies/google-wearables`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = new Error(`Google Health API ${res.status}`);
        err.status = res.status;
        throw err;
      }
      return res.json();
    };

    const [rhrRes, hrvRes, stepsRes] = await Promise.allSettled([
      fetchType('daily-resting-heart-rate'),
      fetchType('daily-heart-rate-variability'),
      fetchType('steps'),
    ]);

    const summary = { syncedAt: Date.now(), restingHr: null, hrvMs: null, recentSteps: null };

    if (rhrRes.status === 'fulfilled' && Array.isArray(rhrRes.value?.dataPoints) && rhrRes.value.dataPoints[0]) {
      const dp = rhrRes.value.dataPoints[0];
      const val = dp.dailyRestingHeartRate?.beatsPerMinute ?? dp.value?.beatsPerMinute ?? null;
      if (val) summary.restingHr = Math.round(Number(val));
    }

    if (hrvRes.status === 'fulfilled' && Array.isArray(hrvRes.value?.dataPoints) && hrvRes.value.dataPoints[0]) {
      const dp = hrvRes.value.dataPoints[0];
      const val = dp.dailyHeartRateVariability?.rmssdMilliseconds ?? dp.value?.rmssdMilliseconds ?? null;
      if (val) summary.hrvMs = Math.round(Number(val));
    }

    if (stepsRes.status === 'fulfilled' && Array.isArray(stepsRes.value?.dataPoints)) {
      const total = stepsRes.value.dataPoints.reduce((acc, dp) => acc + (Number(dp.steps?.count) || 0), 0);
      if (total > 0) summary.recentSteps = total;
    }

    if (rhrRes.status === 'rejected' && hrvRes.status === 'rejected' && stepsRes.status === 'rejected') {
      throw rhrRes.reason || new Error('Failed to reach Google Health API');
    }

    return summary;
  }

  emit() {
    this.onUpdate(this.getSnapshot());
  }
}
