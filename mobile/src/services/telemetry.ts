/**
 * Telemetry service — opt-in only, privacy-safe event tracking.
 *
 * Architecture:
 * - Events are tracked as **Sentry breadcrumbs** (AAAS-26), not a separate analytics SDK.
 * - Sentry is only initialized when the parent has opted in (see `sentry.ts`).
 * - If Sentry is not initialized, breadcrumbs are no-ops — zero network egress.
 * - The `InMemoryTelemetryService` is used in tests for assertions.
 *
 * Privacy guarantees:
 * - No PII, no free-text, no photo data is ever included in breadcrumb data.
 * - With telemetry off, zero network egress occurs during onboarding.
 * - Sentry.init() is never called without explicit parent consent.
 */

import { v4 as uuidv4 } from 'uuid';

// ── Event types ───────────────────────────────────────────────────

export type OnboardingEventName =
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_step_completed'
  | 'onboarding_back_navigated'
  | 'onboarding_device_tier_detected'
  | 'onboarding_device_tier_unsupported'
  | 'onboarding_model_download_started'
  | 'onboarding_model_download_progress'
  | 'onboarding_model_download_completed'
  | 'onboarding_model_download_failed'
  | 'onboarding_kid_profile_created'
  | 'onboarding_kid_profile_count'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'onboarding_error'
  | 'consent_given'
  | 'first_homework_submitted'
  | 'first_feedback_received';

export type TelemetryEventName = OnboardingEventName | string;

export interface TelemetryEvent {
  id: string;
  name: string;
  timestamp: string;
  properties: Record<string, string | number | boolean | null>;
}

export interface TelemetryService {
  track(name: TelemetryEventName, properties?: TelemetryEvent['properties']): Promise<void>;
  flush(): Promise<void>;
  setOptIn(enabled: boolean): Promise<void>;
  getOptIn(): Promise<boolean>;
  clearBuffer(): Promise<void>;
  bufferSize(): Promise<number>;
}

// ── Helpers ───────────────────────────────────────────────────────

function nowISO(): string {
  return new Date().toISOString();
}

function createEvent(
  name: TelemetryEventName,
  properties: TelemetryEvent['properties'] = {},
): TelemetryEvent {
  return {
    id: uuidv4(),
    name,
    timestamp: nowISO(),
    properties,
  };
}

// ── Production implementation (Sentry breadcrumbs) ─────────────────

export class SentryTelemetryService implements TelemetryService {
  private optedIn: boolean = false;

  async track(
    name: TelemetryEventName,
    properties: TelemetryEvent['properties'] = {},
  ): Promise<void> {
    if (!this.optedIn) return;

    const evt = createEvent(name, properties);

    try {
      const { addOnboardingBreadcrumb } = await import('./sentry');
      addOnboardingBreadcrumb(name, {
        ...properties,
        _event_id: evt.id,
      });
    } catch {
      // Sentry module not available — silently ignore
    }
  }

  async flush(): Promise<void> {
    // Sentry breadcrumbs flush automatically with error reports
  }

  async setOptIn(enabled: boolean): Promise<void> {
    this.optedIn = enabled;
    if (enabled) {
      try {
        const { initSentry } = await import('./sentry');
        initSentry();
      } catch {
        // Sentry module not available
      }
    }
  }

  async getOptIn(): Promise<boolean> {
    return this.optedIn;
  }

  async clearBuffer(): Promise<void> {
    // Sentry breadcrumbs are transient; no buffer to clear
  }

  async bufferSize(): Promise<number> {
    return 0;
  }
}

// ── In-memory implementation (tests / dev) ────────────────────────

export class InMemoryTelemetryService implements TelemetryService {
  public events: TelemetryEvent[] = [];
  public flushed: TelemetryEvent[][] = [];
  public optedIn: boolean = false;

  async track(
    name: TelemetryEventName,
    properties: TelemetryEvent['properties'] = {},
  ): Promise<void> {
    if (!this.optedIn) return;
    this.events.push(createEvent(name, properties));
  }

  async flush(): Promise<void> {
    if (!this.optedIn) return;
    if (this.events.length > 0) {
      this.flushed.push([...this.events]);
      this.events = [];
    }
  }

  async setOptIn(enabled: boolean): Promise<void> {
    this.optedIn = enabled;
    if (!enabled) {
      await this.clearBuffer();
    }
  }

  async getOptIn(): Promise<boolean> {
    return this.optedIn;
  }

  async clearBuffer(): Promise<void> {
    this.events = [];
  }

  async bufferSize(): Promise<number> {
    return this.events.length;
  }

  eventsByName(name: string): TelemetryEvent[] {
    return this.events.filter((e) => e.name === name);
  }

  lastEvent(): TelemetryEvent | undefined {
    return this.events[this.events.length - 1];
  }

  hasEvent(name: string): boolean {
    return this.events.some((e) => e.name === name);
  }
}
