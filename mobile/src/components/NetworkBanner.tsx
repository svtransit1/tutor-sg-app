import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, AccessibilityInfo, findNodeHandle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * A banner that displays the current network connectivity state.
 *
 * - **Offline:** Yellow warning banner — "You're offline / Camera homework still works.
 *   Downloads need Wi-Fi."
 * - **Wi-Fi:** No banner shown (fully functional).
 * - **Cellular:** Subtle info banner — "On cellular data / Large downloads are paused
 *   to save data."
 *
 * The banner is positioned above navigation and does not block UI interaction
 * (overlay-style, not modal).
 */
export function NetworkBanner() {
  const { isConnected, type } = useNetworkStatus();
  const { t } = useTranslation();
  const bannerRef = useRef<View>(null);

  // Determine visibility and variant
  const isOnlineWifi = isConnected && type === 'wifi';
  const isOffline = !isConnected;
  const isCellular = isConnected && type === 'cellular';

  // Announce connectivity changes for VoiceOver/TalkBack
  useEffect(() => {
    try {
      if (bannerRef.current) {
        const reactTag = findNodeHandle(bannerRef.current);
        if (reactTag) {
          if (isOffline) {
            AccessibilityInfo.announceForAccessibility(t('network.offline'));
          } else if (isCellular) {
            AccessibilityInfo.announceForAccessibility(t('network.cellular'));
          }
        }
      }
    } catch {
      // Gracefully handle environments where findNodeHandle is unavailable
      // (e.g. test runners with version-mismatched renderers)
    }
  }, [isOffline, isCellular, t]);

  // Don't render anything on Wi-Fi
  if (isOnlineWifi) return null;

  return (
    <View
      ref={bannerRef}
      style={[
        styles.banner,
        isOffline ? styles.bannerOffline : styles.bannerCellular,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.title, isOffline ? styles.titleOffline : styles.titleCellular]}>
        {isOffline ? t('network.offline') : t('network.cellular')}
      </Text>
      <Text style={[styles.description, isOffline ? styles.descriptionOffline : styles.descriptionCellular]}>
        {isOffline ? t('network.offline.description') : t('network.cellular.description')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 100,
  },
  bannerOffline: {
    backgroundColor: '#FFF3CD',
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
  },
  bannerCellular: {
    backgroundColor: '#E8F4FD',
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleOffline: {
    color: '#856404',
  },
  titleCellular: {
    color: '#0C5460',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  descriptionOffline: {
    color: '#856404',
  },
  descriptionCellular: {
    color: '#0C5460',
  },
});
