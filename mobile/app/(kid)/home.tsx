import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

const SUBJECTS = [
  { key: 'math', icon: '📐' },
  { key: 'english', icon: '📖' },
  { key: 'science', icon: '🔬' },
  { key: 'chinese_mt', icon: '✍️' },
];

export default function KidHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleCameraPress = () => {
    router.push({
      pathname: '/(kid)/camera',
      params: { subject: 'math', level: 'P3' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {t('onboarding.home.greeting')}
        </Text>
      </View>

      {/* Main action — Snap homework */}
      <View style={styles.tilesSection}>
        <TouchableOpacity style={styles.cameraTile} onPress={handleCameraPress}>
          <Text style={styles.tileIcon}>📷</Text>
          <Text style={styles.tileTitle}>
            {t('onboarding.home.snapHomework')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subject quick-select row */}
      <View style={styles.subjectsSection}>
        <Text style={styles.subjectsLabel}>
          {t('onboarding.subjects.title')}
        </Text>
        <View style={styles.subjectRow}>
          {SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject.key}
              style={styles.subjectTile}
              onPress={() =>
                router.push({
                  pathname: '/(kid)/camera',
                  params: { subject: subject.key, level: 'P3' },
                })
              }
            >
              <Text style={styles.subjectIcon}>{subject.icon}</Text>
              <Text style={styles.subjectText}>
                {t(`onboarding.subjects.${subject.key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* History link placeholder — add when M3 parent log is built */}
      <View style={styles.historyLink}>
        <Text style={styles.historyLinkText}>
          {t('onboarding.home.history')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  tilesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  cameraTile: {
    backgroundColor: '#4A90D9',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  tileIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subjectsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  subjectsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  subjectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subjectTile: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subjectIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90D9',
  },
  historyLink: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    padding: 8,
  },
  historyLinkText: {
    fontSize: 14,
    color: '#999',
  },
});
