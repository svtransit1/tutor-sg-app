/**
 * Telemetry React context and provider.
 *
 * Provides a `useTelemetry()` hook to any component that needs to fire
 * opt-in telemetry events. The underlying `TelemetryService` is shared
 * across the app as a singleton.
 *
 * Production: uses `SentryTelemetryService` — events are Sentry breadcrumbs.
 * Test: uses `InMemoryTelemetryService`.
 */

import React, { createContext, useContext, useCallback, useRef } from 'react';
import {
  TelemetryService,
  SentryTelemetryService,
  InMemoryTelemetryService,
  TelemetryEventName,
  TelemetryEvent,
} from './telemetry';

// ── Singleton service ─────────────────────────────────────────────

let _service: TelemetryService | null = null;

export function getTelemetryService(): TelemetryService {
  if (!_service) {
    _service =
      process.env.NODE_ENV === 'test'
        ? new InMemoryTelemetryService()
        : new SentryTelemetryService();
  }
  return _service;
}

export function setTelemetryService(svc: TelemetryService): TelemetryService | null {
  const prev = _service;
  _service = svc;
  return prev;
}

// ── Context ───────────────────────────────────────────────────────

interface TelemetryContextValue {
  track: (name: TelemetryEventName, properties?: TelemetryEvent['properties']) => Promise<void>;
  flush: () => Promise<void>;
  setOptIn: (enabled: boolean) => Promise<void>;
  getOptIn: () => Promise<boolean>;
  clearBuffer: () => Promise<void>;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const svcRef = useRef<TelemetryService>(getTelemetryService());

  const track = useCallback(
    (name: TelemetryEventName, properties?: TelemetryEvent['properties']) =>
      svcRef.current.track(name, properties),
    [],
  );

  const flush = useCallback(() => svcRef.current.flush(), []);
  const setOptIn = useCallback((enabled: boolean) => svcRef.current.setOptIn(enabled), []);
  const getOptIn = useCallback(() => svcRef.current.getOptIn(), []);
  const clearBuffer = useCallback(() => svcRef.current.clearBuffer(), []);

  return (
    <TelemetryContext.Provider value={{ track, flush, setOptIn, getOptIn, clearBuffer }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return ctx;
}
