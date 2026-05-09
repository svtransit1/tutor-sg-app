import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Animated,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { ScaffoldedHelp, ScaffoldedHelpTab } from '@/models/homework-feedback';
import { Skeleton } from '@/components/Skeleton';

export type HomeworkFeedbackCardVariant = 'loading' | 'error' | 'ready';

export interface HomeworkFeedbackCardProps {
  variant?: HomeworkFeedbackCardVariant;
  help?: ScaffoldedHelp;
  questionNumber: number;
  questionText?: string;
  title?: string;
  initialTab?: ScaffoldedHelpTab;
  onRetry?: () => void;
  errorMessage?: string;
  style?: ViewStyle;
}

const LEVEL_LABELS: Record<ScaffoldedHelpTab, 'hint' | 'steps' | 'solution'> = {
  hint: 'hint',
  steps: 'steps',
  solution: 'solution',
};

const LEVEL_PROGRESS: ScaffoldedHelpTab[] = ['hint', 'steps', 'solution'];

function getNextTab(current: ScaffoldedHelpTab): ScaffoldedHelpTab | null {
  const idx = LEVEL_PROGRESS.indexOf(current);
  if (idx < LEVEL_PROGRESS.length - 1) return LEVEL_PROGRESS[idx + 1];
  return null;
}

function getPrevTab(current: ScaffoldedHelpTab): ScaffoldedHelpTab | null {
  const idx = LEVEL_PROGRESS.indexOf(current);
  if (idx > 0) return LEVEL_PROGRESS[idx - 1];
  return null;
}

function TabDot({ active, label }: { active: boolean; label: string }) {
  return (
    <View
      style={[
        cardStyles.dot,
        active ? cardStyles.dotActive : cardStyles.dotInactive,
      ]}
      accessibilityLabel={label}
    />
  );
}

function InlineMath({ text, style }: { text: string; style?: TextStyle }) {
  const processed = text
    .replace(/(\d+)\s*x\s*(\d+)/g, '$1 × $2')
    .replace(/(\d+)\s*÷\s*(\d+)/g, '$1 ÷ $2')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/sqrt\((\d+)\)/g, '√($1)')
    .replace(/pi/g, 'π')
    .replace(/>=/g, '≥')
    .replace(/<=/g, '≤')
    .replace(/!=/g, '≠');

  return (
    <Text style={[cardStyles.bodyText, style]} accessibilityRole="text">
      {processed}
    </Text>
  );
}

function AnimatedBody({
  tab,
  currentTab,
  children,
}: {
  tab: ScaffoldedHelpTab;
  currentTab: ScaffoldedHelpTab;
  children: React.ReactNode;
}) {
  const visible = tab === currentTab;
  const anim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [visible, anim]);

  return (
    <Animated.View
      style={[
        cardStyles.bodyOuter,
        {
          maxHeight: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300],
          }),
          opacity: anim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function LoadingSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <View style={cardStyles.skeletonWrap}>
      <View style={cardStyles.skeletonHeader}>
        <Skeleton.Circle size={28} isDark={isDark} />
        <Skeleton width="60%" height={20} borderRadius={4} isDark={isDark} />
      </View>
      <Skeleton width="100%" height={60} borderRadius={12} isDark={isDark} style={{ marginTop: 12 }} />
      <Skeleton width="30%" height={14} borderRadius={4} isDark={isDark} style={{ marginTop: 16 }} />
      <Skeleton width="100%" height={80} borderRadius={8} isDark={isDark} style={{ marginTop: 12 }} />
      <Skeleton.Button height={44} isDark={isDark} style={{ marginTop: 16 }} />
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
  isDark,
}: {
  message: string;
  onRetry?: () => void;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={[
        cardStyles.errorWrap,
        { backgroundColor: isDark ? '#2A1A1A' : '#FFF5F5', borderColor: isDark ? '#5A2A2A' : '#FECACA' },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Text style={cardStyles.errorIcon}>⚠️</Text>
      <Text
        style={[
          cardStyles.errorText,
          { color: isDark ? '#FCA5A5' : '#DC2626' },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[cardStyles.errorRetryBtn, { backgroundColor: isDark ? '#DC2626' : '#EF4444' }]}
          onPress={onRetry}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('homeworkError.retry')}
        >
          <Text style={cardStyles.errorRetryText}>{t('common.retry', 'Retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeworkFeedbackCard({
  variant = 'ready',
  help,
  questionNumber,
  questionText,
  title,
  initialTab = 'hint',
  onRetry,
  errorMessage,
  style,
}: HomeworkFeedbackCardProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [activeTab, setActiveTab] = useState<ScaffoldedHelpTab>(initialTab);
  const [showSolution, setShowSolution] = useState(false);

  const currentLevel = activeTab === 'solution' && !showSolution ? 'hint' : activeTab;

  const handleShowMore = useCallback(() => {
    setActiveTab('steps');
  }, []);

  const handleShowAnswer = useCallback(() => {
    setActiveTab('solution');
    setShowSolution(true);
  }, []);

  const handleShowLess = useCallback(() => {
    setActiveTab('hint');
    setShowSolution(false);
  }, []);

  const nextTab = activeTab === 'solution' ? null : getNextTab(activeTab);
  const prevTab = activeTab !== 'hint' ? getPrevTab(activeTab) : null;

  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#B0B0B0' : '#6B7280';
  const headingColor = isDark ? '#90CAF9' : '#2563EB';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#333333' : '#E5E7EB';
  const primaryColor = isDark ? '#2563EB' : '#4A90D9';
  const secondaryBg = isDark ? '#2A2A2A' : '#F3F4F6';

  if (variant === 'loading') {
    return (
      <View
        style={[
          cardStyles.container,
          { backgroundColor: cardBg, borderColor },
          style,
        ]}
        accessibilityRole="summary"
        accessibilityLabel={t('homeworkFeedback.accessibility.card')}
      >
        <LoadingSkeleton isDark={isDark} />
      </View>
    );
  }

  if (variant === 'error') {
    return (
      <View
        style={[
          cardStyles.container,
          { backgroundColor: cardBg, borderColor },
          style,
        ]}
      >
        <ErrorState
          message={errorMessage ?? t('homeworkError.UNKNOWN.body')}
          onRetry={onRetry}
          isDark={isDark}
        />
      </View>
    );
  }

  if (!help) return null;

  function renderLevelBody() {
    switch (currentLevel) {
      case 'hint':
        return (
          <InlineMath
            text={help!.hint || t('homeworkFeedback.hint.body')}
            style={{ color: textColor }}
          />
        );
      case 'steps':
        return (
          <View style={cardStyles.stepsList} accessibilityRole="list">
            {help!.guidedSteps.map((step, i) => (
              <View key={i} style={cardStyles.stepRow}>
                <View
                  style={[
                    cardStyles.stepNumber,
                    { backgroundColor: primaryColor },
                  ]}
                >
                  <Text style={cardStyles.stepNumberText}>{i + 1}</Text>
                </View>
                <InlineMath
                  text={step}
                  style={{ color: textColor, flex: 1 }}
                />
              </View>
            ))}
          </View>
        );
      case 'solution':
        return (
          <InlineMath
            text={help!.workedSolution || t('homeworkFeedback.solution.body')}
            style={{ color: textColor }}
          />
        );
      default:
        return null;
    }
  }

  return (
    <View
      style={[
        cardStyles.container,
        { backgroundColor: cardBg, borderColor },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${t('homeworkFeedback.accessibility.card')} ${t('homeworkFeedback.accessibility.levelIndicator', { level: t(`homeworkFeedback.${LEVEL_LABELS[currentLevel]}.heading`), total: 3 })}`}
    >
      <View style={cardStyles.inner}>
        <View style={cardStyles.header}>
          <View style={cardStyles.headerLeft}>
            <Text
              style={[cardStyles.questionBadge, { backgroundColor: primaryColor }]}
              accessibilityLabel={`Question ${questionNumber}`}
            >
              <Text style={cardStyles.questionBadgeText}>{questionNumber}</Text>
            </Text>
            <Text
              style={[cardStyles.title, { color: textColor }]}
              accessibilityRole="header"
              numberOfLines={2}
            >
              {title ?? t('homeworkFeedback.title')}
            </Text>
          </View>
        </View>

        {questionText && (
          <View
            style={[
              cardStyles.questionBlock,
              { backgroundColor: secondaryBg, borderColor },
            ]}
          >
            <Text
              style={[cardStyles.questionText, { color: mutedColor }]}
              numberOfLines={4}
            >
              {questionText}
            </Text>
          </View>
        )}

        <View style={cardStyles.levelIndicator}>
          <Text
            style={[cardStyles.levelLabel, { color: headingColor }]}
            accessibilityRole="header"
          >
            {t(`homeworkFeedback.${LEVEL_LABELS[currentLevel]}.heading`)}
          </Text>
          <View style={cardStyles.dotsRow}>
            {LEVEL_PROGRESS.map((tab) => (
              <TabDot
                key={tab}
                active={tab === currentLevel}
                label={
                  tab === currentLevel
                    ? `${t(`homeworkFeedback.${LEVEL_LABELS[tab]}.heading`)} - active`
                    : t(`homeworkFeedback.${LEVEL_LABELS[tab]}.heading`)
                }
              />
            ))}
          </View>
        </View>

        <AnimatedBody tab={currentLevel} currentTab={currentLevel}>
          <ScrollView
            style={cardStyles.bodyScroll}
            contentContainerStyle={cardStyles.bodyContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled
          >
            {renderLevelBody()}
          </ScrollView>
        </AnimatedBody>

        <View style={cardStyles.actions}>
          {nextTab === 'steps' && (
            <TouchableOpacity
              style={[cardStyles.actionBtn, { backgroundColor: primaryColor }]}
              onPress={handleShowMore}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('homeworkFeedback.actions.accessibility.showMore')}
            >
              <Text style={cardStyles.actionBtnText}>
                {t('homeworkFeedback.actions.showMore')}
              </Text>
            </TouchableOpacity>
          )}

          {nextTab === 'solution' && activeTab === 'steps' && (
            <TouchableOpacity
              style={[
                cardStyles.actionBtnSecondary,
                { borderColor: primaryColor },
              ]}
              onPress={handleShowAnswer}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('homeworkFeedback.actions.accessibility.showAnswer')}
            >
              <Text style={[cardStyles.actionBtnSecondaryText, { color: primaryColor }]}>
                {t('homeworkFeedback.actions.showAnswer')}
              </Text>
            </TouchableOpacity>
          )}

          {prevTab && (
            <TouchableOpacity
              style={[
                cardStyles.actionBtnSecondary,
                { borderColor: isDark ? '#444444' : '#D1D5DB' },
              ]}
              onPress={handleShowLess}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('homeworkFeedback.actions.accessibility.hideAnswer')}
            >
              <Text style={[cardStyles.actionBtnSecondaryText, { color: mutedColor }]}>
                {t('homeworkFeedback.actions.showLess')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  } satisfies ViewStyle,

  inner: {
    padding: 20,
    gap: 12,
  } satisfies ViewStyle,

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies ViewStyle,

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  } satisfies ViewStyle,

  questionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  questionBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  } satisfies TextStyle,

  title: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  } satisfies TextStyle,

  questionBlock: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  } satisfies ViewStyle,

  questionText: {
    fontSize: 14,
    lineHeight: 20,
  } satisfies TextStyle,

  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies ViewStyle,

  levelLabel: {
    fontSize: 14,
    fontWeight: '600',
  } satisfies TextStyle,

  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  } satisfies ViewStyle,

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } satisfies ViewStyle,

  dotActive: {
    backgroundColor: '#4A90D9',
    width: 10,
    height: 10,
    borderRadius: 5,
  } satisfies ViewStyle,

  dotInactive: {
    backgroundColor: '#D1D5DB',
  } satisfies ViewStyle,

  bodyOuter: {
    overflow: 'hidden',
  } satisfies ViewStyle,

  bodyScroll: {
    maxHeight: 240,
  } satisfies ViewStyle,

  bodyContent: {
    gap: 12,
    paddingVertical: 4,
  } satisfies ViewStyle,

  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  stepsList: {
    gap: 12,
  } satisfies ViewStyle,

  stepRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  } satisfies ViewStyle,

  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  } satisfies ViewStyle,

  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  } satisfies TextStyle,

  actions: {
    gap: 10,
    paddingTop: 4,
  } satisfies ViewStyle,

  actionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  } satisfies ViewStyle,

  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,

  actionBtnSecondary: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  } satisfies ViewStyle,

  actionBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,

  skeletonWrap: {
    padding: 20,
    gap: 8,
  } satisfies ViewStyle,

  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  } satisfies ViewStyle,

  errorWrap: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  } satisfies ViewStyle,

  errorIcon: {
    fontSize: 36,
  } satisfies TextStyle,

  errorText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  } satisfies TextStyle,

  errorRetryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 4,
  } satisfies ViewStyle,

  errorRetryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,
});
