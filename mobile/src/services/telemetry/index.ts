/**
 * @module telemetry
 *
 * Opt-in telemetry tracker for the tutor-sg onboarding funnel.
 *
 * **M2 behaviour:** events are buffered locally via MMKV and never sent.
 * `flush()` is a no-op until the analytics sink is wired in M3+.
 *
 * **Opt-in by default:** `trackEvent()` is a no-op unless the parent
 * explicitly grants telemetry consent (default: denied).
 *
 * Usage (in onboarding screens):
 *
 * ```ts
 * import { trackEvent } from '@/services/telemetry';
 *
 * trackEvent({
 *   event: 'onboarding_lang_picked',
 *   timestamp: Date.now(),
 *   lang: 'en',
 * });
 * ```
 *
 * Per Onboarding Dev Spec §6, AC #9, AC #12.
 */

import {
  appendEvent,
  setConsent as persistConsent,
  getConsent as readConsent,
  drainEvents as drainAllEvents,
  countEvents as bufferCount,
} from './storage';
import type { TelemetryEvent, TelemetryConsent } from './types';

// ── Runtime opt-in guard ───────────────────────────────────────────

let consent: TelemetryConsent = readConsent();

/**
 * Update the telemetry consent preference.
 * - `'granted'`: buffering is active; events will be persisted locally.
 * - `'denied'`: no events are stored; existing buffer is cleared.
 *
 * Call this when the parent toggles the privacy/analytics setting.
 */
export function setTelemetryConsent(value: TelemetryConsent): void {
  consent = value;
  persistConsent(value);

  // If the parent revokes consent, purge any buffered events.
  if (value === 'denied') {
    drainAllEvents();
  }
}

/**
 * Returns the current telemetry consent state.
 */
export function getTelemetryConsent(): TelemetryConsent {
  return consent;
}

// ── Event tracking ─────────────────────────────────────────────────

/**
 * Record a telemetry event.
 *
 * Safe to call unconditionally from any onboarding screen — if the
 * parent has not consented, this is a no-op.
 *
 * Each event is validated against the discriminated union schema at
 * compile time (via TypeScript) and stored as JSON in MMKV.
 */
export function trackEvent(event: TelemetryEvent): void {
  if (consent !== 'granted') return;

  // Runtime safety: ensure timestamp is always set
  const safeEvent = {
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  };

  appendEvent(safeEvent);
}

// ── Buffer introspection ───────────────────────────────────────────

/**
 * Number of events currently buffered locally.
 */
export function getEventCount(): number {
  return bufferCount();
}

// ── Flush (no-op in M2) ───────────────────────────────────────────

/**
 * Transmit all buffered events to the backend analytics sink.
 *
 * **M2:** no-op — events stay local. Wire this to Supabase/PostHog/etc.
 * in M3+ per ADD §7.
 *
 * After a successful flush, the local buffer is drained.
 */
export async function flush(): Promise<void> {
  // M2 — no-op. Implementation pending for M3+ analytics sink.
  // When wired, this should:
  //   1. Drain events via drainAllEvents()
  //   2. POST to Supabase / telemetry endpoint
  //   3. Handle retries, dedup, etc.
  return Promise.resolve();
}
