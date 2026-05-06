/**
 * PrivacyPromisePanel — inline privacy promise panel for onboarding
 *
 * Prominently surfaces the "data stays on device" promise — our key trust
 * wedge per the onboarding dev spec.
 *
 * Three visual variants for embedding across onboarding screens:
 * - `card`   (default) — stand-alone panel with title + body + lock icon
 * - `badge`  — compact row for tight spaces (device tier cards, etc.)
 * - `inline` — minimal inline notice, no extra padding
 *
 * Bilingual (EN + zh-Hans). Kid-safe. Accessible.
 * Dark mode supported via useColorScheme.
 *
 * @see articles/12-first-90s-onboarding-dev-spec.md §3.9
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

// ── Variants ───────────────────────────────────────────────────────

export type PrivacyPromiseVariant = 'card' | 'badge' | 'inline';

// ── Props ──────────────────────────────────────────────────────────

export interface PrivacyPromisePanelProps {
  /** Visual variant — defaults to 'card' */
  variant?: PrivacyPromiseVariant;
  /** Optional custom container style (applied on top of variant styles) */
  style?: ViewStyle;
  /**
   * Override the body text. Defaults to i18n key
   * `onboarding.privacyPromise.body` or `onboarding.privacyPromise.badgeText`
   * depending on variant.
   */
  body?: string;
}

// ── Component ──────────────────────────────────────────────────────

export default function PrivacyPromisePanel({
  variant = 'card',
  style,
  body,
}: PrivacyPromisePanelProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const label = t('onboarding.privacyPromise.accessibility');
  const title = t('onboarding.privacyPromise.title');

  // ── Variant renderers ────────────────────────────────────

  if (variant === 'badge') {
    return (
      <View
        style={[
          badgeStyles.container,
          {
            backgroundColor: isDark ? '#1A2A2A' : '#E8F5E9',
            borderColor: isDark ? '#2A4A3A' : '#C8E6C9',
          },
          style,
        ]}
        accessibilityRole="summary"
        accessibilityLabel={label}
      >
        <Text style={badgeStyles.icon}>🔒</Text>
        <Text
          style={[
            badgeStyles.text,
            { color: isDark ? '#A5D6A7' : '#2E7D32' },
          ]}
          numberOfLines={2}
        >
          {body ?? t('onboarding.privacyPromise.badgeText')}
        </Text>
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <View
        style={[
          inlineStyles.container,
          {
            backgroundColor: isDark ? '#1A2A2A' : '#F0FFF4',
            borderColor: isDark ? '#2A4A3A' : '#C6F6D5',
          },
          style,
        ]}
        accessibilityRole="summary"
        accessibilityLabel={label}
      >
        <Text style={inlineStyles.icon}>🔒</Text>
        <Text
          style={[
            inlineStyles.text,
            { color: isDark ? '#A5D6A7' : '#276749' },
          ]}
          numberOfLines={3}
        >
          {body ?? t('onboarding.privacyPromise.body')}
        </Text>
      </View>
    );
  }

  // Default: card variant
  return (
    <View
      style={[
        cardStyles.container,
        {
          backgroundColor: isDark ? '#1A2E1A' : '#F0FFF4',
          borderColor: isDark ? '#2A4A3A' : '#C6F6D5',
        },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={label}
    >
      {/* Lock icon in a circle */}
      <View
        style={[
          cardStyles.iconCircle,
          {
            backgroundColor: isDark ? '#2A4A3A' : '#E8F5E9',
            borderColor: isDark ? '#3A5A4A' : '#C8E6C9',
          },
        ]}
      >
        <Text style={cardStyles.icon}>🔒</Text>
      </View>

      {/* Title */}
      <Text
        style={[
          cardStyles.title,
          { color: isDark ? '#FFFFFF' : '#1A1A1A' },
        ]}
        accessibilityRole="header"
      >
        {title}
      </Text>

      {/* Body */}
      <Text
        style={[
          cardStyles.body,
          { color: isDark ? '#B0B0B0' : '#4A5568' },
        ]}
      >
        {body ?? t('onboarding.privacyPromise.body')}
      </Text>
    </View>
  );
}

// ── Card Styles ────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  } satisfies ViewStyle,

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#276749',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  } satisfies ViewStyle,

  icon: {
    fontSize: 30,
  } satisfies TextStyle,

  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  } satisfies TextStyle,
});

// ── Badge Styles ───────────────────────────────────────────────────

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  } satisfies ViewStyle,

  icon: {
    fontSize: 16,
  } satisfies TextStyle,

  text: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    flexShrink: 1,
  } satisfies TextStyle,
});

// ── Inline Styles ──────────────────────────────────────────────────

const inlineStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  } satisfies ViewStyle,

  icon: {
    fontSize: 14,
    marginTop: 2,
  } satisfies TextStyle,

  text: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    flexShrink: 1,
  } satisfies TextStyle,
});
