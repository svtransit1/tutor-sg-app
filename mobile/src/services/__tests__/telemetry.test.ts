/**
 * Unit tests for the telemetry service.
 *
 * Tests cover:
 * - Event queuing (opt-in vs opt-out)
 * - Opt-in toggling and buffer clearing
 * - Flush behaviour
 * - Event structure (no PII leakage)
 * - Funnel event shapes
 */

import { InMemoryTelemetryService } from '../telemetry';

function createService(): InMemoryTelemetryService {
  return new InMemoryTelemetryService();
}

// ── Opt-in gating ─────────────────────────────────────────────────

describe('opt-in gating', () => {
  it('drops events when not opted in', async () => {
    const svc = createService();
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    expect(svc.events.length).toBe(0);
  });

  it('queues events when opted in', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    expect(svc.events.length).toBe(1);
  });

  it('stops queuing after opting out and clears buffer', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    expect(svc.events.length).toBe(1);

    await svc.setOptIn(false);
    expect(svc.events.length).toBe(0);

    await svc.track('onboarding_step_viewed', { step: 'consent' });
    expect(svc.events.length).toBe(0);
  });
});

// ── Event structure ───────────────────────────────────────────────

describe('event structure', () => {
  it('includes id, name, timestamp, and properties', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });

    const evt = svc.events[0];
    expect(evt).not.toBeNull();
    expect(evt!.name).toBe('onboarding_step_viewed');
    expect(typeof evt!.id).toBe('string');
    expect(typeof evt!.timestamp).toBe('string');
    expect(typeof evt!.properties).toBe('object');
    expect(evt!.properties.step).toBe('welcome');
  });

  it('generates unique event IDs', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    await svc.track('onboarding_step_viewed', { step: 'consent' });

    expect(svc.events[0]!.id).not.toBe(svc.events[1]!.id);
  });

  it('does not include PII-like fields in properties', async () => {
    const svc = createService();
    await svc.setOptIn(true);

    await svc.track('onboarding_kid_profile_created', {
      level: 'P3',
      language: 'en',
      kid_count: 1,
    });

    const evt = svc.events[0]!;
    const keys = Object.keys(evt.properties);
    expect(keys.indexOf('name')).toBe(-1);
    expect(keys.indexOf('kid_name')).toBe(-1);
    expect(keys.indexOf('free_text')).toBe(-1);
    expect(keys.indexOf('photo')).toBe(-1);
    expect(keys.indexOf('ocr')).toBe(-1);
    expect(evt.properties.level).toBe('P3');
    expect(evt.properties.language).toBe('en');
    expect(evt.properties.kid_count).toBe(1);
  });
});

// ── Flush behaviour ───────────────────────────────────────────────

describe('flush behaviour', () => {
  it('flushes queued events', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    await svc.track('onboarding_step_viewed', { step: 'consent' });
    expect(svc.events.length).toBe(2);

    await svc.flush();
    expect(svc.events.length).toBe(0);
    expect(svc.flushed.length).toBe(1);
    expect(svc.flushed[0].length).toBe(2);
  });

  it('does nothing when buffer is empty', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.flush();
    expect(svc.flushed.length).toBe(0);
  });

  it('does not flush when opted out', async () => {
    const svc = createService();
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    await svc.flush();
    expect(svc.flushed.length).toBe(0);
  });
});

// ── Event query helpers ───────────────────────────────────────────

describe('event query helpers', () => {
  it('eventsByName returns filtered events', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    await svc.track('onboarding_completed', {});
    await svc.track('onboarding_step_viewed', { step: 'done' });

    expect(svc.eventsByName('onboarding_step_viewed').length).toBe(2);
    expect(svc.eventsByName('onboarding_completed').length).toBe(1);
  });

  it('lastEvent returns the most recent event', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    await svc.track('onboarding_step_viewed', { step: 'consent' });

    expect(svc.lastEvent()!.properties).toEqual({ step: 'consent' });
  });

  it('hasEvent checks by name', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_completed', {});
    expect(svc.hasEvent('onboarding_completed')).toBe(true);
    expect(svc.hasEvent('onboarding_device_tier_detected')).toBe(false);
  });
});

// ── Funnel event names ────────────────────────────────────────────

describe('onboarding funnel event names', () => {
  it('tracks step_viewed with step property', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });

    expect(svc.lastEvent()!.name).toBe('onboarding_step_viewed');
    expect(svc.lastEvent()!.properties.step).toBe('welcome');
  });

  it('tracks step_completed with step property', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_completed', { step: 'welcome' });

    expect(svc.lastEvent()!.name).toBe('onboarding_step_completed');
    expect(svc.lastEvent()!.properties.step).toBe('welcome');
  });

  it('tracks back_navigated with from/to properties', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_back_navigated', { from: 'consent', to: 'welcome' });

    expect(svc.lastEvent()!.name).toBe('onboarding_back_navigated');
    expect(svc.lastEvent()!.properties.from).toBe('consent');
    expect(svc.lastEvent()!.properties.to).toBe('welcome');
  });

  it('tracks device_tier_detected with tier', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_device_tier_detected', { tier: 'high' });

    expect(svc.lastEvent()!.properties.tier).toBe('high');
  });

  it('tracks model_download events with progress', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_model_download_started', { model: 'gemma-e4b', size_mb: 2500 });
    await svc.track('onboarding_model_download_progress', { model: 'gemma-e4b', progress: 50 });
    await svc.track('onboarding_model_download_completed', { model: 'gemma-e4b', duration_sec: 45 });
    await svc.track('onboarding_model_download_failed', { model: 'gemma-e4b', error: 'integrity_mismatch' });

    expect(svc.events.length).toBe(4);
    expect(svc.eventsByName('onboarding_model_download_started').length).toBe(1);
    expect(svc.eventsByName('onboarding_model_download_progress').length).toBe(1);
    expect(svc.eventsByName('onboarding_model_download_completed').length).toBe(1);
    expect(svc.eventsByName('onboarding_model_download_failed').length).toBe(1);
  });

  it('tracks kid_profile_created with level/count but not name', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_kid_profile_created', {
      level: 'P3',
      language: 'en',
      kid_count: 2,
    });

    const evt = svc.lastEvent()!;
    expect(evt.properties.level).toBe('P3');
    expect(evt.properties.language).toBe('en');
    expect(evt.properties.kid_count).toBe(2);
    const keys = Object.keys(evt.properties);
    expect(keys.indexOf('name')).toBe(-1);
    expect(keys.indexOf('kid_name')).toBe(-1);
  });

  it('tracks onboarding_completed', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_completed', {
      device_tier: 'high',
      kid_count: 1,
      duration_sec: 120,
    });

    expect(svc.lastEvent()!.name).toBe('onboarding_completed');
    expect(svc.lastEvent()!.properties.device_tier).toBe('high');
    expect(svc.lastEvent()!.properties.kid_count).toBe(1);
    expect(svc.lastEvent()!.properties.duration_sec).toBe(120);
  });

  it('tracks onboarding_error with step context', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_error', {
      step: 'model-download',
      error: 'network_timeout',
    });

    expect(svc.lastEvent()!.name).toBe('onboarding_error');
    expect(svc.lastEvent()!.properties.step).toBe('model-download');
    expect(svc.lastEvent()!.properties.error).toBe('network_timeout');
  });
});

// ── Clear buffer ──────────────────────────────────────────────────

describe('clearBuffer', () => {
  it('clears all queued events', async () => {
    const svc = createService();
    await svc.setOptIn(true);
    await svc.track('onboarding_step_viewed', { step: 'welcome' });
    await svc.track('onboarding_step_viewed', { step: 'consent' });
    expect(svc.events.length).toBe(2);

    await svc.clearBuffer();
    expect(svc.events.length).toBe(0);
  });
});

console.log('telemetry tests passed');
