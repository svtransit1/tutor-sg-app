import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { FirstUseWalkthrough } from '@/components/FirstUseWalkthrough';
import { isTutorialShown, markTutorialShown } from '@/storage/tutorial-storage';

export default function KidHomeScreen() {
  const { t } = useTranslation();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    isTutorialShown().then((shown) => {
      if (!shown) setShowWalkthrough(true);
    });
  }, []);

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    markTutorialShown();
  };

  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false);
    markTutorialShown();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>tutor-sg</Text>
      <Text style={styles.subtitle}>{t('kidHome.firstSession.ctaCamera')}</Text>
      <Pressable style={styles.parentButton} onPress={() => router.push('/(parent)')} accessibilityRole="button">
        <Text style={styles.parentButtonText}>{t('onboarding.done.parentArea')}</Text>
      </Pressable>

      <FirstUseWalkthrough
        visible={showWalkthrough}
        onComplete={handleWalkthroughComplete}
        onSkip={handleWalkthroughSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 48 },
  parentButton: { marginTop: 32, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#F3F4F6', borderRadius: 12 },
  parentButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
});
