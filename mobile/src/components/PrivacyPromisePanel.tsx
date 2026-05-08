/**
 * PrivacyPromisePanel — inline privacy promise panel for onboarding
 *
 * Prominently surfaces the "data stays on device" promise — our key trust
 * wedge per the onboarding dev spec.
 *
 * Three visual variants for embedding across onboarding screens:
 * - `card`   (default) — stand-alone panel with shield icon + headline + 3 bullet promises
 * - `badge`  — compact row for tight spaces (device tier cards, permission primers)
 * - `inline` — minimal inline notice, no extra padding
 *
 * The card variant supports an optional "Learn more" expand/collapse section
 * that shows the full privacy summary.
 *
 * This is a marketing surface, not a legal EULA — keeps copy concise.
 *
 * Bilingual (EN + zh-Hans). Kid-safe. Accessible.
 * Dark mode supported via useColorScheme.
 *
 * @see articles/12-first-90s-onboarding-dev-spec.md §3.9
 * @see ADD §4.2 — Privacy promise hard rule
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
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
   * Whether to show the "Learn more" expandable section (card variant only).
   * Defaults to true for card variant.
   */
  showLearnMore?: boolean;
  /**
   * Override the body text. Defaults to i18n key
   * `onboarding.privacyPromise.body` or `onboarding.privacyPromise.badgeText`
   * depending on variant.
   */
  body?: string;
}

// ── Bullet point shape icons ───────────────────────────────────────

const BULLET_ICONS = ['📷', '💬', '👨‍👩‍👧‍👦'];

// ── Component ──────────────────────────────────────────────────────

export default function PrivacyPromisePanel({
  variant = 'card',
  style,
  showLearnMore: showLearnMoreProp = true,
  body,
}: PrivacyPromisePanelProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const label = t('onboarding.privacyPromise.accessibility');
  const title = t('onboarding.privacyPromise.title');
  const bullets: [string, string, string] = [
    t('onboarding.privacyPromise.bullet1'),
    t('onboarding.privacyPromise.bullet2'),
    t('onboarding.privacyPromise.bullet3'),
  ];

  // ── Learn-more expand state ───────────────────────────────

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  // ── Learn-more section ──────────────────────────────────

  function renderLearnMore() {
    if (!showLearnMoreProp) return null;
    return (
      <View style={cardStyles.learnMoreWrap}>
        <TouchableOpacity
          style={cardStyles.learnMoreBtn}
          onPress={toggleExpanded}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? t('onboarding.privacyPromise.learnMoreHide')
              : t('onboarding.privacyPromise.learnMoreShow')
          }
          accessibilityState={{ expanded }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[
              cardStyles.learnMoreText,
              { color: isDark ? '#81C784' : '#2E7D32' },
            ]}
          >
            {expanded
              ? `▲ ${t('onboarding.privacyPromise.learnLess')}`
              : `▼ ${t('onboarding.privacyPromise.learnMore')}`}
          </Text>
        </TouchableOpacity>

        {expanded && (
          <Text
            style={[
              cardStyles.learnMoreBody,
              { color: isDark ? '#B0B0B0' : '#4A5568' },
            ]}
            accessibilityRole="summary"
            accessibilityLabel={t('onboarding.privacyPromise.learnMoreBody')}
          >
            {t('onboarding.privacyPromise.learnMoreBody')}
          </Text>
        )}
      </View>
    );
  }

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
        <View style={inlineStyles.textWrap}>
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
      </View>
    );
  }

  // ── Default: card variant ────────────────────────────────

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
      {/* Shield icon in a circle */}
      <View
        style={[
          cardStyles.iconCircle,
          {
            backgroundColor: isDark ? '#2A4A3A' : '#E8F5E9',
            borderColor: isDark ? '#3A5A4A' : '#C8E6C9',
          },
        ]}
      >
        <Text style={cardStyles.icon}>🛡️</Text>
      </View>

      {/* Headline */}
      <Text
        style={[
          cardStyles.title,
          { color: isDark ? '#FFFFFF' : '#1A1A1A' },
        ]}
        accessibilityRole="header"
      >
        {title}
      </Text>

      {/* Three bullet promises */}
      <View style={cardStyles.bulletList}>
        {bullets.map((text, i) => (
          <View key={i} style={cardStyles.bulletRow}>
            <Text style={cardStyles.bulletIcon}>
              {BULLET_ICONS[i]}
            </Text>
            <Text
              style={[
                cardStyles.bulletText,
                { color: isDark ? '#D0D0D0' : '#374151' },
              ]}
            >
              {text}
            </Text>
          </View>
        ))}
      </View>

      {/* Learn more expand/collapse */}
      {renderLearnMore()}
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

  // Bullet list
  bulletList: {
    width: '100%',
    gap: 12,
    paddingVertical: 4,
  } satisfies ViewStyle,

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  } satisfies ViewStyle,

  bulletIcon: {
    fontSize: 18,
    marginTop: 1,
    width: 24,
    textAlign: 'center',
  } satisfies TextStyle,

  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  } satisfies TextStyle,

  // Learn more
  learnMoreWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  } satisfies ViewStyle,

  learnMoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  } satisfies ViewStyle,

  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
  } satisfies TextStyle,

  learnMoreBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
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

  textWrap: {
    flex: 1,
  } satisfies ViewStyle,

  text: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    flexShrink: 1,
  } satisfies TextStyle,
});
