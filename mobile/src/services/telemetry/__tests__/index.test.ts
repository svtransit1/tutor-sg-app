/**
 * Tests for telemetry service.
 *
 * Covers:
 * - Default opt-out behaviour (consent denied)
 * - Opt-in enabling event buffering
 * - Opt-out purging existing buffer
 * - Event schema validation (all 12 onboarding events)
 * - Buffer overflow (FIFO eviction)
 * - flush() is a no-op in M2
 * - Persistence in storage layer
 */

import { MMKV } from 'react-native-mmkv';

// Reset MMKV stores before each test
beforeEach(() => {
  MMKV.__clearAllStores();
});

// ── Module-level helpers ───────────────────────────────────────────

function resetTelemetry(): void {
  // Clear mock storage under the telemetry ID
  const storage = new MMKV({ id: 'telemetry' });
  storage.clearAll();
}

// ── Tests ──────────────────────────────────────────────────────────

describe('telemetry service — opt-in consent', () => {
  beforeEach(() => {
    jest.resetModules();
    resetTelemetry();
  });

  it('defaults to denied (opt-out)', () => {
    const { getTelemetryConsent } = require('../index');
    expect(getTelemetryConsent()).toBe('denied');
  });

  it('returns granted after setTelemetryConsent("granted")', () => {
    const { setTelemetryConsent, getTelemetryConsent } = require('../index');
    setTelemetryConsent('granted');
    expect(getTelemetryConsent()).toBe('granted');
  });

  it('returns denied after revoking consent', () => {
    const { setTelemetryConsent, getTelemetryConsent } = require('../index');
    setTelemetryConsent('granted');
    setTelemetryConsent('denied');
    expect(getTelemetryConsent()).toBe('denied');
  });

  it('persists consent in MMKV storage', () => {
    const { setTelemetryConsent } = require('../index');
    const { getConsent } = require('../storage');
    setTelemetryConsent('granted');
    // Verify the raw storage layer preserved the value
    expect(getConsent()).toBe('granted');
  });
});

describe('telemetry service — trackEvent', () => {
  beforeEach(() => {
    jest.resetModules();
    resetTelemetry();
  });

  it('does not buffer events when consent is denied', () => {
    const { trackEvent, getEventCount } = require('../index');
    trackEvent({
      event: 'onboarding_lang_picked',
      timestamp: Date.now(),
      lang: 'en',
    });
    expect(getEventCount()).toBe(0);
  });

  it('buffers events when consent is granted', () => {
    const { setTelemetryConsent, trackEvent, getEventCount } = require('../index');
    setTelemetryConsent('granted');
    trackEvent({
      event: 'onboarding_lang_picked',
      timestamp: Date.now(),
      lang: 'en',
    });
    expect(getEventCount()).toBe(1);
  });

  it('buffers multiple events', () => {
    const { setTelemetryConsent, trackEvent, getEventCount } = require('../index');
    setTelemetryConsent('granted');

    trackEvent({ event: 'onboarding_lang_picked', timestamp: Date.now(), lang: 'en' });
    trackEvent({ event: 'onboarding_grade_picked', timestamp: Date.now(), grade: 'P3' });

    expect(getEventCount()).toBe(2);
  });

  it('buffers all 12 event types', () => {
    const { setTelemetryConsent, trackEvent, getEventCount } = require('../index');
    setTelemetryConsent('granted');

    const now = Date.now();

    trackEvent({ event: 'onboarding_lang_picked', timestamp: now, lang: 'en' });
    trackEvent({ event: 'onboarding_grade_picked', timestamp: now, grade: 'P5' });
    trackEvent({ event: 'onboarding_subjects_picked', timestamp: now, subjects: ['math', 'english'] });
    trackEvent({ event: 'onboarding_sibling_added', timestamp: now, count: 1 });
    trackEvent({ event: 'onboarding_device_tier', timestamp: now, tier: 'high' });
    trackEvent({ event: 'onboarding_perm_camera', timestamp: now, granted: true });
    trackEvent({ event: 'onboarding_perm_notif', timestamp: now, granted: false });
    trackEvent({ event: 'onboarding_download_started', timestamp: now, tier: 'high', bytes: 1_400_000_000 });
    trackEvent({ event: 'onboarding_download_completed', timestamp: now, durationSec: 120, bytes: 1_400_000_000, retries: 0 });
    trackEvent({ event: 'onboarding_download_failed', timestamp: now, reason: 'network_error' });
    trackEvent({ event: 'onboarding_completed', timestamp: now, totalDurationSec: 245 });
    trackEvent({ event: 'first_camera_open_after_onboarding', timestamp: now, latencySec: 30 });

    expect(getEventCount()).toBe(12);
  });

  it('clears buffer when consent is revoked', () => {
    const { setTelemetryConsent, trackEvent, getEventCount } = require('../index');
    setTelemetryConsent('granted');
    trackEvent({ event: 'onboarding_lang_picked', timestamp: Date.now(), lang: 'en' });
    expect(getEventCount()).toBe(1);

    setTelemetryConsent('denied');
    expect(getEventCount()).toBe(0);
  });
});

describe('telemetry service — buffer overflow (FIFO)', () => {
  beforeEach(() => {
    jest.resetModules();
    resetTelemetry();
  });

  it('drops oldest events when buffer exceeds MAX_EVENTS (1000)', () => {
    const { setTelemetryConsent, trackEvent } = require('../index');
    const { countEvents, readAllEvents } = require('../storage');
    setTelemetryConsent('granted');

    // Fill buffer to 1000 events
    for (let i = 0; i < 1000; i++) {
      trackEvent({ event: 'onboarding_lang_picked', timestamp: i, lang: 'en' });
    }

    expect(countEvents()).toBe(1000);

    // Add one more — should evict oldest (timestamp 0)
    trackEvent({ event: 'onboarding_lang_picked', timestamp: 9999, lang: 'en' });
    expect(countEvents()).toBe(1000);

    // Verify oldest is gone (timestamp 0 should not be present)
    const events = readAllEvents();
    const timestamps = events.map((e: { timestamp: number }) => e.timestamp);
    expect(timestamps).not.toContain(0);
    expect(timestamps).toContain(9999);
  });
});

describe('telemetry service — flush (M2 no-op)', () => {
  beforeEach(() => {
    jest.resetModules();
    resetTelemetry();
  });

  it('flush resolves without error', async () => {
    const { flush } = require('../index');
    await expect(flush()).resolves.toBeUndefined();
  });

  it('flush does not drain buffer in M2', () => {
    const { setTelemetryConsent, trackEvent, flush, getEventCount } = require('../index');
    setTelemetryConsent('granted');
    trackEvent({ event: 'onboarding_lang_picked', timestamp: Date.now(), lang: 'en' });
    expect(getEventCount()).toBe(1);

    flush();
    // In M2, flush is a no-op — events stay.
    expect(getEventCount()).toBe(1);
  });
});

describe('telemetry service — storage layer', () => {
  beforeEach(() => {
    jest.resetModules();
    resetTelemetry();
  });

  it('drainEvents returns and clears', () => {
    const { setTelemetryConsent, trackEvent } = require('../index');
    const { drainEvents, countEvents } = require('../storage');

    setTelemetryConsent('granted');
    trackEvent({ event: 'onboarding_lang_picked', timestamp: Date.now(), lang: 'en' });
    trackEvent({ event: 'onboarding_grade_picked', timestamp: Date.now(), grade: 'P2' });

    const drained = drainEvents();
    expect(drained).toHaveLength(2);
    expect(countEvents()).toBe(0);
  });

  it('clearEvents empties buffer', () => {
    const { setTelemetryConsent, trackEvent } = require('../index');
    const { clearEvents, countEvents } = require('../storage');

    setTelemetryConsent('granted');
    trackEvent({ event: 'onboarding_lang_picked', timestamp: Date.now(), lang: 'en' });

    clearEvents();
    expect(countEvents()).toBe(0);
  });

  it('readAllEvents returns empty array when no events stored', () => {
    const { readAllEvents } = require('../storage');
    expect(readAllEvents()).toEqual([]);
  });
});
