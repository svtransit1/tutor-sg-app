import {
  PRIVACY_POLICY_URL,
  buildConsentSnapshot,
  getSentryInitFlag,
} from './privacy-preferences';

function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const acceptedAt = '2026-05-06T10:00:00.000Z';

const optedOut = buildConsentSnapshot({
  telemetryOptIn: false,
  acceptedAt,
});

assertEqual(optedOut.privacyConsentAcceptedAt, acceptedAt);
assertEqual(optedOut.privacyPolicyUrl, PRIVACY_POLICY_URL);
assertEqual(optedOut.telemetryOptIn, false);
assertEqual(getSentryInitFlag(optedOut), false);

const optedIn = buildConsentSnapshot({
  telemetryOptIn: true,
  acceptedAt,
});

assertEqual(optedIn.telemetryOptIn, true);
assertEqual(getSentryInitFlag(optedIn), true);
assertEqual(getSentryInitFlag({ telemetryOptIn: true }), false);

console.log('privacy-preferences tests passed');
