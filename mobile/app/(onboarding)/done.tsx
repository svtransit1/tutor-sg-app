import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  setOnboardingCompleted,
  getOnboardingState,
} from '@/storage/onboarding';

const SUBJECT_ICONS: Record<string, string> = {
  math: '🔢',
  english: '📖',
  chinese: '🀄',
  science: '🔬',
};

const SUBJECT_LABELS: Record<string, { en: string; zh: string }> = {
  math: { en: 'Math', zh: '数学' },
  english: { en: 'English', zh: '英文' },
  chinese: { en: 'Chinese', zh: '中文' },
  science: { en: 'Science', zh: '科学' },
};

export default function DoneScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const isZh = i18n.language === 'zh-Hans';

  const profile = getOnboardingState();

  const handleStartLearning = () => {
    setOnboardingCompleted(true);
    router.replace('/(kid)/home');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration icon */}
        <View
          style={[
            styles.celebrationCircle,
            { backgroundColor: isDark ? '#1E3A5F' : '#E8F4FD' },
          ]}
        >
          <Text style={styles.celebrationIcon} accessibilityRole="image" accessibilityLabel="Celebration star">
            ⭐
          </Text>
        </View>

        {/* Title & subtitle */}
        <Text
          style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
          accessibilityRole="header"
        >
          {t('onboarding.done.title')}
        </Text>
        <Text
          style={[styles.subtitle, { color: isDark ? '#B0B0B0' : '#666666' }]}
          accessibilityRole="text"
        >
          {t('onboarding.done.subtitle')}
        </Text>

        {/* Summary card */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
              borderColor: isDark ? '#333333' : '#E0E0E0',
            },
          ]}
        >
          <Text
            style={[
              styles.summaryTitle,
              { color: isDark ? '#FFFFFF' : '#1A1A1A' },
            ]}
          >
            {t('onboarding.done.summary')}
          </Text>

          {/* Grade */}
          <SummaryRow
            icon="📚"
            label={isZh ? '年级' : 'Grade'}
            value={profile.grade}
            isDark={isDark}
          />

          {/* Language */}
          <SummaryRow
            icon="🌐"
            label={isZh ? '语言' : 'Language'}
            value={isZh ? '中文（简体）' : 'English'}
            isDark={isDark}
          />

          {/* Subjects */}
          <View style={styles.subjectsRow}>
            <Text style={styles.subjectIcon} accessibilityRole="image">📋</Text>
            <View style={styles.subjectsContent}>
              <Text
                style={[
                  styles.subjectLabel,
                  { color: isDark ? '#B0B0B0' : '#666666' },
                ]}
              >
                {isZh ? '科目' : 'Subjects'}
              </Text>
              <View style={styles.subjectChips}>
                {profile.subjects.map((subject: string) => (
                  <View
                    key={subject}
                    style={[
                      styles.subjectChip,
                      {
                        backgroundColor: isDark ? '#2A2A2A' : '#E3F2FD',
                        borderColor: isDark ? '#444444' : '#BBDEFB',
                      },
                    ]}
                  >
                    <Text style={styles.subjectChipIcon}>
                      {SUBJECT_ICONS[subject] ?? '📝'}
                    </Text>
                    <Text style={[styles.subjectChipText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                      {SUBJECT_LABELS[subject]?.[isZh ? 'zh' : 'en'] ?? subject}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Model status */}
          <SummaryRow
            icon={profile.modelDownloaded ? '✅' : '⏳'}
            label={isZh ? 'AI 模型' : 'AI Model'}
            value={
              profile.modelDownloaded
                ? t('onboarding.done.modelDownloaded')
                : t('onboarding.done.modelNotDownloaded')
            }
            isDark={isDark}
          />
        </View>
      </ScrollView>

      {/* CTA Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? '#4A90D9' : '#2563EB' },
          { marginBottom: Math.max(insets.bottom, 16) },
        ]}
        onPress={handleStartLearning}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.done.startLearning')}
        activeOpacity={0.8}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Text style={styles.buttonText}>
          {t('onboarding.done.startLearning')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  isDark,
}: {
  icon: string;
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryIcon} accessibilityRole="image">{icon}</Text>
      <View style={styles.summaryTextGroup}>
        <Text
          style={[styles.summaryLabel, { color: isDark ? '#B0B0B0' : '#666666' }]}
        >
          {label}
        </Text>
        <Text
          style={[styles.summaryValue, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  celebrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  celebrationIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  subjectsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  subjectsContent: {
    flex: 1,
  },
  subjectLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  subjectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  subjectChipIcon: {
    fontSize: 14,
  },
  subjectIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  subjectChipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
