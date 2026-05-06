/**
 * @module telemetry/storage
 *
 * MMKV-backed local buffer for telemetry events.
 *
 * Events are serialised to JSON and stored in a list key under MMKV.
 * In M2, events are never sent — this is the entire pipeline.
 * In M3+, a flush operation will drain the buffer to Supabase.
 *
 * Per AC #12: no child data leaves the device (guaranteed by never
 * transmitting in M2).
 */

import { MMKV } from 'react-native-mmkv';
import type { TelemetryEvent } from './types';

// ── Constants ──────────────────────────────────────────────────────

const STORAGE_ID = 'telemetry';
const EVENTS_KEY = 'events';
const MAX_EVENTS = 1000;

// ── Storage singleton ──────────────────────────────────────────────

const storage = new MMKV({ id: STORAGE_ID });

// ── Private ────────────────────────────────────────────────────────

function writeAllEvents(events: TelemetryEvent[]): void {
  storage.set(EVENTS_KEY, JSON.stringify(events));
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Append an event to the persisted buffer.
 *
 * If the buffer exceeds MAX_EVENTS, the oldest events are dropped (FIFO).
 */
export function appendEvent(event: TelemetryEvent): void {
  const buffer = readAllEvents();
  buffer.push(event);

  // Drop oldest if over limit
  while (buffer.length > MAX_EVENTS) {
    buffer.shift();
  }

  writeAllEvents(buffer);
}

/**
 * Return all buffered events without clearing.
 */
export function readAllEvents(): TelemetryEvent[] {
  const raw = storage.getString(EVENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TelemetryEvent[];
  } catch {
    return [];
  }
}

/**
 * Drain and return all buffered events, clearing the buffer.
 * Designed for use by flush() in M3+.
 */
export function drainEvents(): TelemetryEvent[] {
  const events = readAllEvents();
  storage.delete(EVENTS_KEY);
  return events;
}

/**
 * Remove all events from the buffer without returning them.
 */
export function clearEvents(): void {
  storage.delete(EVENTS_KEY);
}

/**
 * Number of events currently buffered.
 */
export function countEvents(): number {
  return readAllEvents().length;
}

// ── Opt-in consent persistence ─────────────────────────────────────

const CONSENT_KEY = 'telemetry_consent';

/**
 * Persist the telemetry consent preference.
 */
export function setConsent(consent: 'granted' | 'denied'): void {
  storage.set(CONSENT_KEY, consent);
}

/**
 * Read the persisted telemetry consent preference.
 * Returns 'denied' if no preference has been set (default opt-out).
 */
export function getConsent(): 'granted' | 'denied' {
  const raw = storage.getString(CONSENT_KEY);
  if (raw === 'granted') return 'granted';
  return 'denied';
}

// ── Testing helpers ────────────────────────────────────────────────

/**
 * Clear all telemetry storage (for test isolation).
 */
export function __reset(): void {
  storage.clearAll();
}
