import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import type { KidProfile } from '../../src/storage';
import { getKids, deleteKid } from '../../src/storage';
import { MAX_KIDS } from '../../src/constants';

const SUBJECTS = [
  { key: 'math', label: 'Mathematics', labelZh: '数学' },
  { key: 'english', label: 'English', labelZh: '英语' },
  { key: 'science', label: 'Science', labelZh: '科学' },
  { key: 'chinese_mt', label: 'Chinese MT', labelZh: '华文' },
];

export default function AppHome() {
  const { t } = useTranslation();
  const router = useRouter();
  const [kids, setKids] = useState<KidProfile[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('math');

  const loadKids = useCallback(async () => {
    const data = await getKids();
    setKids(data);
  }, []);

  useEffect(() => {
    loadKids();
  }, [loadKids]);

  const levelLabel = (level: string) => {
    const key = `onboarding.kidProfile.levels.${level}`;
    const translated = t(key);
    return translated === key ? level : translated;
  };

  const handleCameraPress = () => {
    const kid = kids[0];
    router.push({
      pathname: '/(app)/camera',
      params: {
        subject: selectedSubject,
        level: kid?.level ?? 'P3',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {t('onboarding.home.greeting')}
        </Text>
      </View>

      {/* Active kid profile summary */}
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>
          {t('onboarding.kidProfile.children')} ({kids.length}/{MAX_KIDS})
        </Text>
        {kids.length === 0 ? (
          <TouchableOpacity
            style={styles.addKidFromHome}
            onPress={() => router.push('/(onboarding)/kid-setup')}
          >
            <Text style={styles.addKidFromHomeText}>
              {t('onboarding.kidProfile.addFirst')}
            </Text>
          </TouchableOpacity>
        ) : (
          kids.map((kid) => (
            <TouchableOpacity
              key={kid.id}
              style={styles.kidCard}
              onPress={() => router.push(`/(onboarding)/kid-setup?id=${kid.id}`)}
              accessibilityLabel={`${t('onboarding.kidProfile.edit')} ${kid.name}`}
            >
              <View style={styles.kidCardContent}>
                <Text style={styles.kidName}>{kid.name}</Text>
                <Text style={styles.kidLevel}>
                  {levelLabel(kid.level)} &middot; {kid.language === 'en' ? 'English' : '简体中文'}
                </Text>
              </View>
              <Text style={styles.kidEditCaret}>{'>'}</Text>
            </TouchableOpacity>
          ))
        )}
        {kids.length > 0 && kids.length < MAX_KIDS && (
          <TouchableOpacity
            style={styles.addKidButton}
            onPress={() => router.push('/(onboarding)/kid-setup')}
          >
            <Text style={styles.addKidButtonText}>
              {t('onboarding.kidProfile.addAnother')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main action tiles */}
      <View style={styles.tiles}>
        <TouchableOpacity style={styles.tile} onPress={handleCameraPress}>
          <Text style={styles.tileIcon}>📷</Text>
          <Text style={styles.tileTitle}>
            {t('onboarding.home.snapHomework')}
          </Text>
        </TouchableOpacity>

        <View style={styles.subjectRow}>
          {SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject.key}
              style={[
                styles.subjectTile,
                selectedSubject === subject.key && styles.subjectTileSelected,
              ]}
              onPress={() => setSelectedSubject(subject.key)}
            >
              <Text
                style={[
                  styles.subjectText,
                  selectedSubject === subject.key && styles.subjectTextSelected,
                ]}
              >
                {t(`onboarding.subjects.${subject.key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Parent area link */}
      <TouchableOpacity style={styles.parentLink}>
        <Text style={styles.parentLinkText}>
          {t('onboarding.home.parentArea')}
        </Text>
      </TouchableOpacity>
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
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  noKids: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  kidCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kidCardContent: {
    flex: 1,
  },
  kidEditCaret: {
    fontSize: 18,
    color: '#999',
    marginLeft: 8,
  },
  addKidButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A90D9',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addKidButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90D9',
  },
  addKidFromHome: {
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  addKidFromHomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90D9',
  },
  kidName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  kidLevel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tiles: {
    paddingHorizontal: 24,
  },
  tile: {
    backgroundColor: '#4A90D9',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryTile: {
    backgroundColor: '#4A90D9',
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
  subjectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  subjectTile: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90D9',
  },
  subjectTileSelected: {
    backgroundColor: '#4A90D9',
  },
  subjectTextSelected: {
    color: '#fff',
  },
  parentLink: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    padding: 8,
  },
  parentLinkText: {
    fontSize: 12,
    color: '#999',
  },
});
