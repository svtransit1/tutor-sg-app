import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useColorScheme, LayoutAnimation } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KidProfileRepository } from '@/storage/kidProfiles';
import type { KidProfile } from '@/storage/kidProfiles';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];

interface ProfileSwitcherProps {
  onProfileChange?: (profile: KidProfile) => void;
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function ProfileAvatar({ name, index, size }: { name: string; index: number; size: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: getAvatarColor(index) }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.45 }]}>{getInitial(name)}</Text>
    </View>
  );
}

function ProfileInfo({ name, level, nameStyle, levelStyle }: { name: string; level: string; nameStyle?: object; levelStyle?: object }) {
  return (
    <View style={styles.profileInfo}>
      <Text style={[styles.profileName, nameStyle]} numberOfLines={1}>{name}</Text>
      <Text style={[styles.profileLevel, levelStyle]}>{level}</Text>
    </View>
  );
}

export default function ProfileSwitcher({ onProfileChange }: ProfileSwitcherProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<KidProfile | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [all, active] = await Promise.all([
        KidProfileRepository.getProfiles(),
        KidProfileRepository.getActiveKid(),
      ]);
      setProfiles(all);
      setActiveProfile(active);
    } catch {
      setError(t('parent.profileSwitcher.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles, retryCount]);

  const toggleExpand = useCallback(() => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // no-op in test environments
    }
    setExpanded((prev) => !prev);
  }, []);

  const handleSwitch = useCallback(async (profile: KidProfile) => {
    try {
      await KidProfileRepository.setActiveKid(profile.id);
    } catch {
      return;
    }
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // no-op in test environments
    }
    setActiveProfile(profile);
    setExpanded(false);
    onProfileChange?.(profile);
  }, [onProfileChange]);

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const bgColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#AAAAAA' : '#6B7280';
  const borderColor = isDark ? '#333333' : '#E5E7EB';

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.statusText, { color: mutedColor }]}>{t('parent.profileSwitcher.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.errorText, { color: '#DC2626' }]}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel={t('common.retry')}
        >
          <Text style={[styles.retryText, { color: '#2563EB' }]}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (profiles.length === 0) {
    return null;
  }

  const activeIndex = profiles.findIndex((p) => p.id === activeProfile?.id);

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.label, { color: mutedColor }]}>{t('parent.profileSwitcher.label')}</Text>
      <Pressable
        style={[styles.trigger, { borderColor }]}
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityLabel={
          activeProfile
            ? t('parent.profileSwitcher.current', { name: activeProfile.name, level: activeProfile.level })
            : t('parent.profileSwitcher.label')
        }
        accessibilityHint={expanded ? '' : t('parent.profileSwitcher.switchTo', { name: '' })}
      >
        {activeProfile && activeIndex >= 0 && (
          <>
            <ProfileAvatar name={activeProfile.name} index={activeIndex} size={36} />
            <ProfileInfo
              name={activeProfile.name}
              level={activeProfile.level}
              nameStyle={{ color: textColor }}
              levelStyle={{ color: mutedColor }}
            />
          </>
        )}
        <Text style={[styles.chevron, { color: mutedColor }]}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={[styles.dropdown, { borderColor }]}>
          <ScrollView style={styles.dropdownScroll} bounces={false} keyboardShouldPersistTaps="handled">
            {profiles.map((profile, idx) => {
              const isActive = profile.id === activeProfile?.id;
              return (
                <Pressable
                  key={profile.id}
                  style={[
                    styles.dropdownItem,
                    isActive && { backgroundColor: isDark ? '#2A2A2A' : '#F0F5FF' },
                  ]}
                  onPress={() => handleSwitch(profile)}
                  accessibilityRole="button"
                  accessibilityLabel={t('parent.profileSwitcher.current', { name: profile.name, level: profile.level })}
                  accessibilityHint={isActive ? '' : t('parent.profileSwitcher.switchTo', { name: profile.name })}
                >
                  <ProfileAvatar name={profile.name} index={idx} size={32} />
                  <ProfileInfo
                    name={profile.name}
                    level={profile.level}
                    nameStyle={{ color: textColor }}
                    levelStyle={{ color: mutedColor }}
                  />
                  {isActive && <View style={[styles.activeDot, { backgroundColor: '#2563EB' }]} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  chevron: {
    fontSize: 12,
    marginLeft: 'auto',
    paddingLeft: 8,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileLevel: {
    fontSize: 14,
    marginTop: 1,
  },
  dropdown: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 4,
  },
  retryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
