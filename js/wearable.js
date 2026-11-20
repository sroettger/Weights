/**
 * Weights — Live Heart Rate Connector (Garmin Venu 4s & Google Fitbit Air)
 *
 * 1) Live 1 Hz Heart Rate over Web Bluetooth (BLE Heart Rate Service 0x180D / 0x2A37)
 *    - Garmin Venu 4s: Settings -> Health & Wellness -> Wrist Heart Rate -> Broadcast Heart Rate
 *      (or Controls menu, or auto-enable under Strength Activity Settings)
 *    - Google Fitbit Air: Google Health app -> Devices -> Fitbit Air -> Share heart rate -> Always visible
 * 2) Optional Battery (0x180F) & Device Info (0x180A) reads + RR-interval HRV (RMSSD)
 * 3) Optional Google Health API v4 (health.googleapis.com/v4) for Fitbit Air daily RHR/HRV
 * 4) Built-in live workout simulator for testing without a paired device
 */

const HEART_RATE_SERVICE = 0x180d;
const HEART_RATE_MEASUREMENT = 0x2a37;
const BATTERY_SERVICE = 0x180f;
const BATTERY_LEVEL = 0x2a19;
const DEVICE_INFO_SERVICE = 0x180a;
const MODEL_NUMBER_CHAR = 0x2a24;

export const WEARABLE_PRESETS = {
  garmin_venu_4s: {
    id: 'garmin_venu_4s',
    label: 'Garmin Venu 4s',
    shortLabel: 'Venu 4s',
    connectLabel: 'Connect Venu 4s',
    disconnectHint: 'Venu 4s disconnected · Re-enable Broadcast Heart Rate on watch.',
    stepsTitle: 'Garmin Venu 4s Setup',
    steps: [
      'Watch: <strong>Settings → Health &amp; Wellness → Wrist Heart Rate → Broadcast Heart Rate</strong> (or <strong>Controls</strong> menu)',
      'Auto option: <strong>Strength Settings → Broadcast Heart Rate → On</strong>',
      'Chrome (Android) or Bluefy (iOS) → <strong>Connect Venu 4s</strong>',
    ],
    zonesHint: 'Match your Venu 4s (Settings → User Profile → Heart Rate & Power Zones)',
  },
  fitbit_air: {
    id: 'fitbit_air',
    label: 'Fitbit Air',
    shortLabel: 'Air',
    connectLabel: 'Connect Air',
    disconnectHint: 'Fitbit Air disconnected · Toggle "Share heart rate" Off → On in Google Health.',
    stepsTitle: 'Google Health Setup',
    steps: [
      '<strong>Google Health</strong> → top-left device icon → <strong>Fitbit Air → Share heart rate</strong>',
      'Turn on <strong>Always visible</strong> (if reconnect stalls, toggle Off → On once)',
      'Tap <strong>Connect Air</strong> &amp; approve Google Health prompt if shown',
    ],
    zonesHint: 'Karvonen HR reserve zones (Z1–Z5)',
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, label) {
  let timerId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const err = new Error(`${label} timed out after ${Math.round(ms / 1000)}s`);
      err.name = 'TimeoutError';
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timerId !== null) clearTimeout(timerId);
  });
}

export function detectWearableType(deviceName) {
  const n = String(deviceName || '').toLowerCase();
  if (n.includes('venu') || n.includes('garmin') || n.includes('forerunner') || n.includes('fenix')) {
    return 'garmin_venu_4s';
  }
  if (n.includes('fitbit') || n.includes('pixel') || /\bair\b/.test(n) || n.includes('charge')) {
    return 'fitbit_air';
  }
  return null;
}

const GOOGLE_HEALTH_BASE = 'https://health.googleapis.com/v4';
const GOOGLE_HEALTH_SCOPES = [
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
  'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
].join(' ');

/**
 * Parse standard Bluetooth SIG Heart Rate Measurement (0x2A37) payload.
 */
export function parseHeartRateMeasurement(rawVal) {
  const dataView =
    rawVal instanceof DataView
      ? rawVal
      : rawVal?.buffer
      ? new DataView(rawVal.buffer, rawVal.byteOffset || 0, rawVal.byteLength)
      : null;
  if (!dataView || dataView.byteLength < 2) return null;
  const flags = dataView.getUint8(0);
  const is16Bit = Boolean(flags & 0x01);
  const contactSupported = Boolean(flags & 0x04);
  const contactDetected = Boolean(flags & 0x02);
  const energyPresent = Boolean(flags & 0x08);
  const rrPresent = Boolean(flags & 0x10);

  let offset = 1;
  if (dataView.byteLength < offset + (is16Bit ? 2 : 1)) return null;
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
    this.connectAttemptId = 0;
    this.userDisconnected = false;
    this.reconnectingInBg = false;
    this._boundDisconnected = null;
    this._boundHrChanged = null;
    this._firstPacketResolver = null;

    this.live = {
      status: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'simulating' | 'error'
      connectingStage: '',
      deviceName: '',
      detectedType: null,
      bpm: null,
      batteryPct: null,
      hrvMs: null,
      contact: true,
      samples: [], // last 90 readings: { t, bpm }
      rrBuffer: [], // last 30 RR intervals (ms)
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

  getPreset() {
    const profile = this.getProfile();
    return WEARABLE_PRESETS[profile?.deviceType] || WEARABLE_PRESETS.garmin_venu_4s;
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
      canReconnect:
        Boolean(this.device) &&
        this.live.status !== 'connected' &&
        this.live.status !== 'connecting' &&
        this.live.status !== 'simulating',
      preset: this.getPreset(),
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
    this.live.rrBuffer = [];
    this.live.hrvMs = null;
    this.emit();
  }

  recordSample(bpm, contact = true, rrIntervalsMs = []) {
    const now = Date.now();
    const prevAt = this.live.lastSampleAt;
    if (this.live.status === 'connecting') {
      this.live.status = 'connected';
      this.live.connectingStage = '';
      this.live.errorMessage = '';
    }
    this.live.bpm = bpm;
    this.live.contact = contact;
    this.live.lastSampleAt = now;

    if (Array.isArray(rrIntervalsMs) && rrIntervalsMs.length) {
      for (const rr of rrIntervalsMs) {
        if (rr >= 300 && rr <= 2000) this.live.rrBuffer.push(rr);
      }
      if (this.live.rrBuffer.length > 30) {
        this.live.rrBuffer = this.live.rrBuffer.slice(-30);
      }
      if (this.live.rrBuffer.length >= 6) {
        let sumSq = 0;
        let n = 0;
        for (let i = 1; i < this.live.rrBuffer.length; i++) {
          const d = this.live.rrBuffer[i] - this.live.rrBuffer[i - 1];
          sumSq += d * d;
          n += 1;
        }
        if (n > 0) this.live.hrvMs = Math.round(Math.sqrt(sumSq / n));
      }
    }

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

  _cleanupCharacteristicListener() {
    if (this.characteristic && this._boundHrChanged) {
      try {
        this.characteristic.removeEventListener('characteristicvaluechanged', this._boundHrChanged);
      } catch {
        // Ignore
      }
    }
    this.characteristic = null;
    this._boundHrChanged = null;
  }

  _attachDisconnectHandler(device) {
    if (!device) return;
    if (this._boundDisconnected) {
      try {
        device.removeEventListener('gattserverdisconnected', this._boundDisconnected);
      } catch {
        // Ignore
      }
    }
    this._boundDisconnected = () => {
      if (this.userDisconnected || this.device !== device) return;
      // Ignore transient disconnects while connectBle's own retry loop is actively running
      if (this.live.status === 'connecting') return;

      if (this.live.status === 'connected' && !this.reconnectingInBg) {
        void this._tryAutoReconnect(device);
      }
    };
    device.addEventListener('gattserverdisconnected', this._boundDisconnected);
  }

  async _tryAutoReconnect(device) {
    this.reconnectingInBg = true;
    const token = this.connectAttemptId;
    try {
      await sleep(900);
      if (this.userDisconnected || token !== this.connectAttemptId || this.device !== device) return;
      const ok = await this._establishHrStream(device, token, { maxTries: 2, silentStage: true });
      if (ok) return;
    } catch {
      // Fall through to disconnected state
    } finally {
      this.reconnectingInBg = false;
    }

    if (!this.userDisconnected && this.device === device) {
      const activePreset = WEARABLE_PRESETS[this.live.detectedType] || this.getPreset();
      this.live.status = 'disconnected';
      this.live.connectingStage = '';
      this.live.bpm = null;
      this.live.hrvMs = null;
      this.live.errorMessage = activePreset.disconnectHint;
      this.emit();
    }
  }

  async _establishHrStream(device, attemptToken, { maxTries = 3, silentStage = false } = {}) {
    let lastErr = null;

    for (let tries = 1; tries <= maxTries; tries += 1) {
      if (this.userDisconnected || attemptToken !== this.connectAttemptId) return false;

      if (!silentStage) {
        this.live.connectingStage =
          tries === 1
            ? `Connecting to ${this.live.deviceName || 'watch'}…`
            : `Completing HR handshake (${tries}/${maxTries})…`;
        this.emit();
      }

      try {
        const server = device.gatt.connected
          ? device.gatt
          : await withTimeout(device.gatt.connect(), 8000, 'Bluetooth GATT connect');

        if (this.userDisconnected || attemptToken !== this.connectAttemptId) return false;

        if (!silentStage) {
          this.live.connectingStage = 'Opening Heart Rate service (0x180D)…';
          this.emit();
        }
        const hrService = await withTimeout(
          server.getPrimaryService(HEART_RATE_SERVICE),
          6000,
          'Heart Rate service lookup'
        );

        const hrChar = await withTimeout(
          hrService.getCharacteristic(HEART_RATE_MEASUREMENT),
          5000,
          'Heart Rate characteristic lookup'
        );

        this._cleanupCharacteristicListener();
        this.characteristic = hrChar;

        const firstPacketPromise = new Promise((resolve) => {
          this._firstPacketResolver = resolve;
        });

        this._boundHrChanged = (event) => {
          if (this.userDisconnected) return;
          if (this._firstPacketResolver) {
            const resolve = this._firstPacketResolver;
            this._firstPacketResolver = null;
            resolve(true);
          }
          const parsed = parseHeartRateMeasurement(event?.target?.value);
          if (parsed && parsed.bpm > 0) {
            this.recordSample(parsed.bpm, parsed.contact, parsed.rrIntervalsMs);
          } else if (this.live.status !== 'connected') {
            // Even a 0-bpm warmup packet proves 0x2A37 notifications are live
            this.live.status = 'connected';
            this.live.connectingStage = '';
            this.live.errorMessage = '';
            this.emit();
          }
        };

        hrChar.addEventListener('characteristicvaluechanged', this._boundHrChanged);

        if (!silentStage) {
          this.live.connectingStage = 'Starting live HR stream…';
          this.emit();
        }

        // Race startNotifications() against the first incoming 0x2A37 packet AND a 6s timeout.
        // On Android + Fitbit Air, Google Health's "sharing heart rate" notification can stall
        // Chromium's startNotifications() promise even when BLE notifications are already arriving,
        // or briefly reset GATT right as sharing turns on (handled by the retry loop below).
        await Promise.race([
          hrChar.startNotifications(),
          firstPacketPromise,
          sleep(6000).then(() => {
            if (this.live.status === 'connected') return true;
            const tErr = new Error('Waiting for HR stream timed out');
            tErr.name = 'TimeoutError';
            throw tErr;
          }),
        ]);

        this._firstPacketResolver = null;
        if (this.userDisconnected || attemptToken !== this.connectAttemptId) return false;

        this.live.status = 'connected';
        this.live.connectingStage = '';
        this.live.errorMessage = '';
        this.emit();

        // Non-blocking initial read ONLY if characteristic explicitly supports Read
        if (hrChar.properties?.read) {
          hrChar
            .readValue()
            .then((val) => {
              const parsed = parseHeartRateMeasurement(val);
              if (parsed && parsed.bpm > 0 && !this.live.bpm) {
                this.recordSample(parsed.bpm, parsed.contact, parsed.rrIntervalsMs);
              }
            })
            .catch(() => {});
        }

        return true;
      } catch (err) {
        this._firstPacketResolver = null;
        lastErr = err;
        // If notifications already started delivering packets during the race, treat as connected!
        if (this.live.status === 'connected') {
          this.live.connectingStage = '';
          this.live.errorMessage = '';
          this.emit();
          return true;
        }
        if (this.userDisconnected || attemptToken !== this.connectAttemptId) return false;

        if (tries < maxTries) {
          try {
            if (device.gatt?.connected) device.gatt.disconnect();
          } catch {
            // Ignore
          }
          await sleep(850 * tries);
        }
      }
    }

    throw lastErr || new Error('Could not start Heart Rate notifications.');
  }

  async _readOptionalDeviceMetadata(device, attemptToken) {
    // Delay slightly so we never contend with initial 0x2A37 subscription on Android GATT
    await sleep(1600);
    if (
      this.userDisconnected ||
      attemptToken !== this.connectAttemptId ||
      this.live.status !== 'connected' ||
      !device?.gatt?.connected
    ) {
      return;
    }

    const server = device.gatt;
    try {
      const battService = await withTimeout(server.getPrimaryService(BATTERY_SERVICE), 2500, 'Battery service');
      const battChar = await withTimeout(battService.getCharacteristic(BATTERY_LEVEL), 2500, 'Battery char');
      const battVal = await withTimeout(battChar.readValue(), 2500, 'Battery read');
      this.live.batteryPct = battVal.getUint8(0);
      this.emit();
    } catch {
      // Optional battery service not exposed
    }

    if (this.userDisconnected || attemptToken !== this.connectAttemptId || !device?.gatt?.connected) return;

    try {
      const infoService = await withTimeout(server.getPrimaryService(DEVICE_INFO_SERVICE), 2500, 'Info service');
      const modelChar = await withTimeout(infoService.getCharacteristic(MODEL_NUMBER_CHAR), 2500, 'Model char');
      const modelVal = await withTimeout(modelChar.readValue(), 2500, 'Model read');
      const modelStr = new TextDecoder().decode(modelVal).replace(/\0/g, '').trim();
      if (modelStr && (!device.name || device.name.length < 4)) {
        this.live.deviceName = modelStr;
      }
      const detected = detectWearableType(this.live.deviceName) || detectWearableType(modelStr);
      if (detected) this.live.detectedType = detected;
      this.emit();
    } catch {
      // Optional device info service not exposed
    }
  }

  async connectBle({ reuseDevice = false } = {}) {
    const preset = this.getPreset();
    if (!WearableManager.isBleSupported()) {
      this.live.status = 'error';
      this.live.connectingStage = '';
      this.live.errorMessage =
        'Web Bluetooth needs Chrome (Android/Desktop) or Bluefy (iOS). Try Simulate HR below.';
      this.emit();
      return false;
    }

    this.stopSimulation();
    const attemptToken = ++this.connectAttemptId;
    this.userDisconnected = false;

    if (!reuseDevice && this.device?.gatt?.connected) {
      try {
        this.device.gatt.disconnect();
      } catch {
        // Ignore
      }
    }

    this.live.status = 'connecting';
    this.live.connectingStage = reuseDevice && this.device ? 'Reconnecting…' : 'Select watch in Bluetooth prompt…';
    this.live.errorMessage = '';
    this.emit();

    try {
      let device = reuseDevice && this.device ? this.device : null;
      if (!device) {
        device = await navigator.bluetooth.requestDevice({
          filters: [
            { services: [HEART_RATE_SERVICE] },
            { namePrefix: 'Fitbit' },
            { namePrefix: 'Pixel' },
            { namePrefix: 'Garmin' },
            { namePrefix: 'Venu' },
          ],
          optionalServices: [HEART_RATE_SERVICE, BATTERY_SERVICE, DEVICE_INFO_SERVICE],
        });
      }

      if (this.userDisconnected || attemptToken !== this.connectAttemptId) return false;

      this.device = device;
      this.live.deviceName = device.name || preset.label;
      this.live.detectedType = detectWearableType(this.live.deviceName);
      this._attachDisconnectHandler(device);

      const connected = await this._establishHrStream(device, attemptToken, { maxTries: 3 });
      if (!connected) return false;

      // Fitbit Air only exposes 0x180D to third-party BLE clients; probing 0x180F/0x180A
      // over its Google Health multiplexed link can stall Android's GATT queue.
      const isFitbit =
        this.live.detectedType === 'fitbit_air' || this.getProfile()?.deviceType === 'fitbit_air';
      if (!isFitbit) {
        void this._readOptionalDeviceMetadata(device, attemptToken);
      }

      return true;
    } catch (err) {
      if (this.userDisconnected || attemptToken !== this.connectAttemptId) {
        return false;
      }
      if (err?.name === 'NotFoundError') {
        this.live.status = 'disconnected';
        this.live.connectingStage = '';
        this.live.errorMessage = '';
      } else {
        this.live.status = 'error';
        this.live.connectingStage = '';
        const isFitbit =
          this.live.detectedType === 'fitbit_air' || this.getProfile()?.deviceType === 'fitbit_air';
        this.live.errorMessage = isFitbit
          ? 'Google Health started sharing, but BLE link timed out. Tap Retry Pair below (or toggle Share heart rate Off → On).'
          : err?.message || `Could not connect to ${preset.label} over Bluetooth.`;
      }
      this.emit();
      return false;
    }
  }

  disconnect() {
    this.userDisconnected = true;
    this.connectAttemptId += 1;
    this._firstPacketResolver = null;
    this.stopSimulation();
    this._cleanupCharacteristicListener();
    if (this.device?.gatt?.connected) {
      try {
        this.device.gatt.disconnect();
      } catch {
        // Ignore
      }
    }
    this.live.status = 'disconnected';
    this.live.connectingStage = '';
    this.live.bpm = null;
    this.live.batteryPct = null;
    this.live.hrvMs = null;
    this.live.rrBuffer = [];
    this.live.errorMessage = '';
    this.emit();
  }

  /**
   * Simulates realistic lifting + rest heart-rate fluctuations
   * so the user can preview live zones, sparkline, and recovery coaching anywhere.
   */
  startSimulation(isRestingFn) {
    this.disconnect();
    this.userDisconnected = false;
    const preset = this.getPreset();
    this.live.status = 'simulating';
    this.live.connectingStage = '';
    this.live.deviceName = `${preset.label} (Demo)`;
    this.live.detectedType = preset.id;
    this.live.batteryPct = 84;
    this.live.errorMessage = '';
    let currentBpm = 114;
    this.recordSample(currentBpm, true);

    this.simTimerId = setInterval(() => {
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
      clearInterval(this.simTimerId);
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
