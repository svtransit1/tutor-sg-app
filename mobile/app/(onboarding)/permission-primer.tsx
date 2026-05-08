/**
 * Permission Primer route — Onboarding step 8/10.
 * Route: /onboarding/permission-primer
 *
 * Per Article 12 §3.8: Soft-ask camera + notification permissions
 * with WHY copy before the OS system prompt. Two sequential cards:
 * Camera first, then Notifications. Both deferrable.
 *
 * Key UX patterns:
 * - Each permission has its own card with explanation, "Allow" CTA,
 *   and "Not now" deferral
 * - Permanent denial detection -> "Open Settings" deep link
 * - Telemetry: onboarding_perm_camera + onboarding_perm_notif
 * - Bilingual EN / zh-Hans via react-i18next
 *
 * @see /wiki/projects/tutor-sg/articles/12-first-90s-onboarding-dev-spec.md §3.8
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera } from 'expo-camera';
import { useOnboarding } from '../../src/onboarding';
import { trackEvent } from '../../src/services/telemetry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PermissionStep = 'camera' | 'notifications' | 'done';

interface PermissionState {
  status: 'undetermined' | 'granted' | 'denied' | 'blocked';
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Notification permission (stub — expo-notifications not yet installed)
// ---------------------------------------------------------------------------

type NotifResponse = { status: 'granted' | 'denied' };

async function requestNotifPermissionAsync(): Promise<NotifResponse> {
  // TODO(M3): Replace with Notifications.requestPermissionsAsync()
  // once expo-notifications is added to package.json
  return { status: 'denied' };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map expo-camera PermissionResponse to our PermissionState status. */
function mapCameraResult(
  result: { granted: boolean; status: string; canAskAgain: boolean },
): PermissionState['status'] {
  if (result.granted) return 'granted';
  if (result.status === 'denied' && !result.canAskAgain) return 'blocked';
  return 'denied';
}

/** Deep-link to this app's page in OS Settings. */
function openAppSettings(): void {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PermissionPrimerRoute() {
  const { t } = useTranslation();
  const { goNext, updateState, state } = useOnboarding();
  const mountedRef = useRef(true);

  const [step, setStep] = useState<PermissionStep>('camera');
  const [cameraPerm, setCameraPerm] = useState<PermissionState>({
    status: state.cameraPermissionGranted ? 'granted' : 'undetermined',
    loading: false,
  });
  const [notifPerm, setNotifPerm] = useState<PermissionState>({
    status: state.notificationPermissionGranted ? 'granted' : 'undetermined',
    loading: false,
  });

  // -----------------------------------------------------------------------
  // Check current camera permission state on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const current = await Camera.getCameraPermissionsAsync();
        if (!mountedRef.current) return;
        setCameraPerm((prev) => ({
          ...prev,
          status: mapCameraResult(current),
        }));
      } catch {
        // Ignore — keep default state
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -----------------------------------------------------------------------
  // Camera allow handler
  // -----------------------------------------------------------------------
  const handleCameraAllow = useCallback(async () => {
    setCameraPerm((prev) => ({ ...prev, loading: true }));
    try {
      const result = await Camera.requestCameraPermissionsAsync();
      if (!mountedRef.current) return;
      const status = mapCameraResult(result);
      setCameraPerm({ status, loading: false });
      trackEvent({
        event: 'onboarding_perm_camera',
        timestamp: Date.now(),
        granted: status === 'granted',
      });
    } catch {
      if (!mountedRef.current) return;
      setCameraPerm({ status: 'denied', loading: false });
    }
    setStep('notifications');
  }, []);

  // -----------------------------------------------------------------------
  // Camera not-now handler
  // -----------------------------------------------------------------------
  const handleCameraNotNow = useCallback(() => {
    trackEvent({
      event: 'onboarding_perm_camera',
      timestamp: Date.now(),
      granted: false,
    });
    setStep('notifications');
  }, []);

  // -----------------------------------------------------------------------
  // Camera open-settings handler
  // -----------------------------------------------------------------------
  const handleCameraOpenSettings = useCallback(() => {
    openAppSettings();
  }, []);

  // -----------------------------------------------------------------------
  // Notification allow handler
  // -----------------------------------------------------------------------
  const handleNotifAllow = useCallback(async () => {
    setNotifPerm((prev) => ({ ...prev, loading: true }));
    try {
      const result = await requestNotifPermissionAsync();
      if (!mountedRef.current) return;
      const status: PermissionState['status'] =
        result.status === 'granted' ? 'granted' : 'denied';
      setNotifPerm({ status, loading: false });
      trackEvent({
        event: 'onboarding_perm_notif',
        timestamp: Date.now(),
        granted: status === 'granted',
      });
    } catch {
      if (!mountedRef.current) return;
      setNotifPerm({ status: 'denied', loading: false });
    }
    setStep('done');
  }, []);

  // -----------------------------------------------------------------------
  // Notification not-now handler
  // -----------------------------------------------------------------------
  const handleNotifNotNow = useCallback(() => {
    trackEvent({
      event: 'onboarding_perm_notif',
      timestamp: Date.now(),
      granted: false,
    });
    setStep('done');
  }, []);

  // -----------------------------------------------------------------------
  // Notification open-settings handler
  // -----------------------------------------------------------------------
  const handleNotifOpenSettings = useCallback(() => {
    openAppSettings();
  }, []);

  // -----------------------------------------------------------------------
  // Continue handler (done screen)
  // -----------------------------------------------------------------------
  const handleContinue = useCallback(() => {
    updateState({
      cameraPermissionGranted: cameraPerm.status === 'granted',
      notificationPermissionGranted: notifPerm.status === 'granted',
    });
    goNext();
  }, [cameraPerm.status, notifPerm.status, goNext, updateState]);

  // -----------------------------------------------------------------------
  // Done screen
  // -----------------------------------------------------------------------
  if (step === 'done') {
    const allGranted =
      cameraPerm.status === 'granted' && notifPerm.status === 'granted';
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {t('permissionPrimer.step')}
            </Text>
          </View>

          <View style={styles.doneSection}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>✅</Text>
            </View>
            <Text style={styles.title}>
              {t('permissionPrimer.done.title')}
            </Text>
            <Text style={styles.body}>
              {allGranted
                ? t('permissionPrimer.done.bodyAll')
                : t('permissionPrimer.done.bodySome')}
            </Text>

            {/* Summary of what was granted / deferred */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryIcon}>
                  {cameraPerm.status === 'granted' ? '✅' : '⏭️'}
                </Text>
                <Text style={styles.summaryLabel}>
                  {t('permissionPrimer.camera.title')}
                </Text>
                <Text style={styles.summaryStatus}>
                  {cameraPerm.status === 'granted'
                    ? t('common.enabled', 'Enabled')
                    : t('common.deferred', 'Deferred')}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryIcon}>
                  {notifPerm.status === 'granted' ? '✅' : '⏭️'}
                </Text>
                <Text style={styles.summaryLabel}>
                  {t('permissionPrimer.notifications.title')}
                </Text>
                <Text style={styles.summaryStatus}>
                  {notifPerm.status === 'granted'
                    ? t('common.enabled', 'Enabled')
                    : t('common.deferred', 'Deferred')}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleContinue}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('permissionPrimer.done.continue')}
          >
            <Text style={styles.btnPrimaryText}>
              {t('permissionPrimer.done.continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -----------------------------------------------------------------------
  // Permission card (camera or notifications)
  // -----------------------------------------------------------------------
  const isCamera = step === 'camera';
  const perm = isCamera ? cameraPerm : notifPerm;
  const isBlocked = perm.status === 'blocked';
  const isLoading = perm.loading;

  const titleKey = isCamera
    ? 'permissionPrimer.camera.title'
    : 'permissionPrimer.notifications.title';
  const bodyKey = isCamera
    ? 'permissionPrimer.camera.body'
    : 'permissionPrimer.notifications.body';
  const allowKey = isCamera
    ? 'permissionPrimer.camera.allow'
    : 'permissionPrimer.notifications.allow';
  const notNowKey = isCamera
    ? 'permissionPrimer.camera.notNow'
    : 'permissionPrimer.notifications.notNow';
  const deniedKey = isCamera
    ? 'permissionPrimer.camera.permanentlyDenied'
    : 'permissionPrimer.notifications.permanentlyDenied';
  const settingsKey = isCamera
    ? 'permissionPrimer.camera.openSettings'
    : 'permissionPrimer.notifications.openSettings';

  const handleAllow = isCamera ? handleCameraAllow : handleNotifAllow;
  const handleNotNow = isCamera ? handleCameraNotNow : handleNotifNotNow;
  const handleSettings = isCamera
    ? handleCameraOpenSettings
    : handleNotifOpenSettings;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {t('permissionPrimer.step')}
          </Text>
        </View>

        {/* Permission card */}
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>
              {isCamera ? '📷' : '🔔'}
            </Text>
          </View>

          <Text style={styles.title}>{t(titleKey)}</Text>
          <Text style={styles.body}>{t(bodyKey)}</Text>

          {isBlocked ? (
            <>
              {/* Permanent denial — show "Open Settings" instead of "Allow" */}
              <View style={styles.deniedBanner}>
                <Text style={styles.deniedIcon}>⚠️</Text>
                <Text style={styles.deniedText}>
                  {t(deniedKey)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.btnSettings}
                onPress={handleSettings}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t(settingsKey)}
              >
                <Text style={styles.btnSettingsText}>
                  ⚙️ {t(settingsKey)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnNotNow}
                onPress={handleNotNow}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t(notNowKey)}
              >
                <Text style={styles.btnNotNowText}>
                  {t(notNowKey)}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  isLoading && styles.btnDisabled,
                ]}
                onPress={handleAllow}
                disabled={isLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t(allowKey)}
              >
                <Text style={styles.btnPrimaryText}>
                  {isLoading
                    ? t('common.loading')
                    : t(allowKey)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnNotNow}
                onPress={handleNotNow}
                disabled={isLoading}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t(notNowKey)}
              >
                <Text style={styles.btnNotNowText}>
                  {t(notNowKey)}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Privacy footer */}
        <View style={styles.privacyFooter}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            {t(
              'deviceTierResult.consentText',
              'Models run entirely on this device. Nothing leaves your phone.',
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Step indicator
  stepIndicator: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Permission card
  card: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  // Icon circle
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  icon: { fontSize: 44 },

  // Typography
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 4,
  },

  // Primary CTA
  btnPrimary: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },

  // Not now link
  btnNotNow: {
    width: '100%',
    maxWidth: 400,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  btnNotNowText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },

  // Permanent denial state
  deniedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  deniedIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  deniedText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#92400E',
  },
  btnSettings: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  btnSettingsText: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '600',
  },

  // Privacy footer
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  privacyIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  privacyText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    flex: 1,
  },

  // Done screen
  doneSection: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Summary card
  summaryCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 0,
  },
  summaryIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  summaryStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
