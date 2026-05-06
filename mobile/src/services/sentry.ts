/**
 * Sentry initialization and management.
 *
 * Sentry is only initialized when the parent has opted in to telemetry.
 * The DSN is configured via environment variable (EXPO_PUBLIC_SENTRY_DSN).
 *
 * All onboarding funnel events are tracked as Sentry breadcrumbs so they
 * appear alongside crash/error reports. Breadcrumbs respect the opt-in gate
 * because Sentry.init() is never called without consent.
 *
 * @see AAAS-26 for full Sentry integration (DSN config, source maps, etc.)
 */

import * as Sentry from '@sentry/react-native';

/** Default DSN — override via EXPO_PUBLIC_SENTRY_DSN env var */
const DEFAULT_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let _initialized = false;

/**
 * Initialize Sentry if not already initialized.
 * Only call this AFTER the parent has consented to telemetry.
 */
export function initSentry(): boolean {
  if (_initialized) return true;
  if (!DEFAULT_DSN) {
    // No DSN configured — Sentry is not available in this environment.
    // This is fine for development; AAAS-26 will set up the proper DSN.
    console.warn('[sentry] No DSN configured — Sentry breadcrumbs will be no-ops.');
    _initialized = true;
    return false;
  }

  try {
    Sentry.init({
      dsn: DEFAULT_DSN,
      enableNative: true,
      debug: __DEV__,
      tracesSampleRate: 0.1,
      profilesSampleRate: undefined,
      integrations: [],
    });
    _initialized = true;
    return true;
  } catch (e) {
    console.warn('[sentry] Failed to initialize:', e);
    return false;
  }
}

/**
 * Add a breadcrumb for the onboarding funnel.
 * Safe to call even if Sentry is not initialized — it will be a no-op.
 */
export function addOnboardingBreadcrumb(
  eventName: string,
  data?: Record<string, string | number | boolean | null>,
): void {
  if (!_initialized) return;

  Sentry.addBreadcrumb({
    category: 'onboarding.funnel',
    message: eventName,
    level: 'info',
    data: data as Record<string, unknown> | undefined,
  });
}

/**
 * Capture an onboarding error as a Sentry event.
 * Only fires if Sentry is initialized (i.e., parent opted in).
 */
export function captureOnboardingError(
  error: Error | string,
  step?: string,
): void {
  if (!_initialized) return;

  const message = typeof error === 'string' ? error : error.message;
  Sentry.captureMessage(`[onboarding] ${message}`, {
    level: 'error',
    extra: { step },
  });
}

/**
 * Check if Sentry has been initialized.
 */
export function isSentryInitialized(): boolean {
  return _initialized;
}

/**
 * Reset Sentry state (for testing).
 */
export function resetSentryState(): void {
  _initialized = false;
}
