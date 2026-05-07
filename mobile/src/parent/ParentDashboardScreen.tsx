/**
 * ParentDashboardScreen — Placeholder parent dashboard.
 *
 * Shows the parent log (homework sessions) in a PIN-protected area.
 * M3 will flesh out with actual session data from SQLite.
 * This is the screen shown AFTER PIN authentication succeeds.
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  type TextStyle,
} from 'react-native';
import { useI18n } from '@tutor-sg/i18n';

// ── Types ──────────────────────────────────────────────────────────

interface ParentDashboardScreenProps {
  /** Called when user taps "Sign Out" or leaves the parent area. */
  onDismiss?: () => void;
}

// ── Screen Component ───────────────────────────────────────────────

export default function ParentDashboardScreen({
  onDismiss,
}: ParentDashboardScreenProps) {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('parent:dashboard_title')}
        </Text>
        <Pressable
          style={styles.dismissButton}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('common:back') ?? 'Back'}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Empty state */}
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>
            {t('parent:log_title')}
          </Text>
          <Text style={styles.emptyBody}>
            {t('parent:log_empty')}
          </Text>
        </View>

        {/* Placeholder for M3: actual session log */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Session log coming in M3 — sessions will appear here once your
            child uses the camera homework feature.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Placeholder
  placeholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    textAlign: 'center',
  },
} as TextStyle);
