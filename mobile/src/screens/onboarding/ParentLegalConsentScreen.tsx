/**
 * ParentLegalConsentScreen — onboarding step: privacy policy + EULA consent.
 *
 * Shows expandable Privacy Policy and EULA sections with checkboxes
 * for explicit parental consent. Both must be accepted to proceed.
 *
 * Records legal consent per COPPA / PDPA compliance (ADD §8).
 * Place after parent-pin-setup, before grade-subject-pick.
 *
 * Bilingual (EN + zh-Hans). Kid-safe. Accessible.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface ParentLegalConsentScreenProps {
  onContinue?: () => void;
  onPrivacyPolicyAccepted?: (accepted: boolean) => void;
  onEulaAccepted?: (accepted: boolean) => void;
}

export default function ParentLegalConsentScreen({
  onContinue,
  onPrivacyPolicyAccepted,
  onEulaAccepted,
}: ParentLegalConsentScreenProps) {
  const { t } = useTranslation();

  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [eulaExpanded, setEulaExpanded] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [eulaAccepted, setEulaAccepted] = useState(false);

  const allAccepted = policyAccepted && eulaAccepted;

  const togglePolicyExpanded = useCallback(() => setPolicyExpanded((v) => !v), []);
  const toggleEulaExpanded = useCallback(() => setEulaExpanded((v) => !v), []);

  const handleTogglePolicy = useCallback(() => {
    const next = !policyAccepted;
    setPolicyAccepted(next);
    onPrivacyPolicyAccepted?.(next);
  }, [policyAccepted, onPrivacyPolicyAccepted]);

  const handleToggleEula = useCallback(() => {
    const next = !eulaAccepted;
    setEulaAccepted(next);
    onEulaAccepted?.(next);
  }, [eulaAccepted, onEulaAccepted]);

  const handleContinue = useCallback(() => {
    if (!allAccepted) return;
    onContinue?.();
  }, [allAccepted, onContinue]);

  function renderCheckbox(
    label: string,
    checked: boolean,
    onToggle: () => void,
    accessibilityLabel: string,
  ) {
    return (
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel}
      >
        <View
          style={[
            styles.checkbox,
            { backgroundColor: checked ? '#2563EB' : 'transparent', borderColor: checked ? '#2563EB' : '#D1D5DB' },
          ]}
        >
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function renderSection(
    sectionTitle: string,
    summary: string,
    fullBody: string,
    expanded: boolean,
    showLabel: string,
    hideLabel: string,
    onToggleExpand: () => void,
  ) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <Text style={styles.sectionSummary}>{summary}</Text>

        {!expanded ? (
          <TouchableOpacity
            style={styles.showFullBtn}
            onPress={onToggleExpand}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={showLabel}
          >
            <Text style={styles.showFullText}>▼ {showLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.sectionFullBody}>{fullBody}</Text>
            <TouchableOpacity
              style={styles.showFullBtn}
              onPress={onToggleExpand}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={hideLabel}
            >
              <Text style={styles.showFullText}>▲ {hideLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📋</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} accessibilityRole="header">
          {t('onboarding.legalConsent.title')}
        </Text>
        <Text style={styles.subtitle}>
          {t('onboarding.legalConsent.subtitle')}
        </Text>

        {/* Privacy Policy */}
        {renderSection(
          t('onboarding.legalConsent.privacyPolicy'),
          t('onboarding.legalConsent.privacyPolicySummary'),
          t('onboarding.legalConsent.privacyPolicyBody'),
          policyExpanded,
          t('onboarding.legalConsent.showFullPolicy'),
          t('onboarding.legalConsent.hideFull'),
          togglePolicyExpanded,
        )}

        {/* EULA */}
        {renderSection(
          t('onboarding.legalConsent.eula'),
          t('onboarding.legalConsent.eulaSummary'),
          t('onboarding.legalConsent.eulaBody'),
          eulaExpanded,
          t('onboarding.legalConsent.showFullEula'),
          t('onboarding.legalConsent.hideFull'),
          toggleEulaExpanded,
        )}

        {/* Checkboxes */}
        <View style={styles.checkboxSection}>
          {renderCheckbox(
            t('onboarding.legalConsent.acceptPrivacyPolicy'),
            policyAccepted,
            handleTogglePolicy,
            t('onboarding.legalConsent.accessibility.privacyCheckbox'),
          )}
          {renderCheckbox(
            t('onboarding.legalConsent.acceptEula'),
            eulaAccepted,
            handleToggleEula,
            t('onboarding.legalConsent.accessibility.eulaCheckbox'),
          )}
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[styles.continueBtn, !allAccepted && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!allAccepted}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            allAccepted
              ? t('onboarding.legalConsent.continue')
              : t('onboarding.legalConsent.accessibility.continueDisabled')
          }
          accessibilityState={{ disabled: !allAccepted }}
        >
          <Text style={[styles.continueBtnText, !allAccepted && styles.continueBtnTextDisabled]}>
            {t('onboarding.legalConsent.continue')}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
    alignItems: 'center',
  },

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 16,
  },

  section: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  showFullBtn: {
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  showFullText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  sectionFullBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
    paddingTop: 4,
  },

  checkboxSection: {
    width: '100%',
    gap: 14,
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    color: '#1A1A1A',
    flex: 1,
  },

  continueBtn: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  continueBtnTextDisabled: {
    color: '#9CA3AF',
  },
});
