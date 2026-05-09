import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, type TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

type WalkthroughStepId = 'camera' | 'help' | 'language';

const STEPS: WalkthroughStepId[] = ['camera', 'help', 'language'];

interface FirstUseWalkthroughProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface StepContent {
  emoji: string;
  title: string;
  body: string;
}

function getStepContent(stepId: WalkthroughStepId, t: (key: string) => string): StepContent {
  switch (stepId) {
    case 'camera': return { emoji: String.fromCodePoint(0x1F4F7), title: t('tutorial.camera.title'), body: t('tutorial.camera.body') };
    case 'help': return { emoji: String.fromCodePoint(0x1F4A1), title: t('tutorial.help.title'), body: t('tutorial.help.body') };
    case 'language': return { emoji: String.fromCodePoint(0x1F310), title: t('tutorial.language.title'), body: t('tutorial.language.body') };
  }
}

export function FirstUseWalkthrough({ visible, onComplete, onSkip }: FirstUseWalkthroughProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLast = currentIndex === STEPS.length - 1;

  useEffect(() => { if (visible) setCurrentIndex(0); }, [visible]);

  const handleNext = useCallback(() => {
    if (isLast) { onComplete(); } else { setCurrentIndex((prev) => prev + 1); }
  }, [isLast, onComplete]);

  if (!visible) return null;

  const content = getStepContent(STEPS[currentIndex], t);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onSkip}
        accessibilityRole="button" accessibilityLabel={t('tutorial.skipA11y')} accessibilityHint={t('tutorial.skipHint')}>
        <TouchableOpacity activeOpacity={1}
          style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}
          accessibilityRole="alert"
          accessibilityLabel={t('tutorial.stepIndicator', { current: currentIndex + 1, total: STEPS.length })}>
          <View style={[styles.emojiCircle, { backgroundColor: isDark ? '#2A3A5A' : '#EEF2FF' }]}>
            <Text style={styles.emoji}>{content.emoji}</Text>
          </View>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>{content.title}</Text>
          <Text style={[styles.body, { color: isDark ? '#B0B0B0' : '#6B7280' }]}>{content.body}</Text>
          <View style={styles.dots}>
            {STEPS.map((_, idx) => (
              <View key={idx} style={[styles.dot, {
                backgroundColor: idx === currentIndex ? (isDark ? '#60A5FA' : '#2563EB') : (isDark ? '#4B5563' : '#D1D5DB'),
                width: idx === currentIndex ? 24 : 8,
              }]} />
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}
              accessibilityRole="button" accessibilityLabel={t('tutorial.skip')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={[styles.skipText, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>{t('tutorial.skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext}
              style={[styles.nextButton, { backgroundColor: isDark ? '#2563EB' : '#2563EB' }]}
              accessibilityRole="button" accessibilityLabel={isLast ? t('tutorial.gotIt') : t('tutorial.next')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.8}>
              <Text style={styles.nextText}>{isLast ? t('tutorial.gotIt') : t('tutorial.next')}</Text>
              {!isLast && <Text style={styles.nextArrow}>{String.fromCodePoint(0x2192)}</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const MIN_TOUCH = 44;

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999, elevation: 9999 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  card: { width: '100%', maxWidth: 380, borderRadius: 28, paddingVertical: 36, paddingHorizontal: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12 },
  emojiCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emoji: { fontSize: 42 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 12, letterSpacing: -0.3 } as TextStyle,
  body: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 28, paddingHorizontal: 4 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 32, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  skipButton: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, paddingVertical: 12, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center' },
  skipText: { fontSize: 15, fontWeight: '500' },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, gap: 8 },
  nextText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  nextArrow: { fontSize: 17, color: '#FFFFFF', fontWeight: '600' },
});
