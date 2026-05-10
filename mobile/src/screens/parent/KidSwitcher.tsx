import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KidProfileRepository, type KidProfile } from '../../storage/kidProfiles';

interface KidSwitcherProps { selectedId: string; onSelectKid: (id: string) => void }

export default function KidSwitcher({ selectedId, onSelectKid }: KidSwitcherProps) {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  useEffect(() => { KidProfileRepository.getProfiles().then(setProfiles).catch(() => {}) }, []);
  const handleSelect = useCallback((id: string) => { onSelectKid(id); KidProfileRepository.setActiveKid(id).catch(() => {}) }, [onSelectKid]);
  if (profiles.length === 0) return null;
  return (
    <View style={s.c}>
      <Text style={s.l}>{t('parent.kidSwitcher.label')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.r}>
        {profiles.map((p) => (
          <Pressable key={p.id} style={[s.chip, p.id === selectedId && s.sel]} onPress={() => handleSelect(p.id)}>
            <Text style={s.e}>{p.avatarKey || '👤'}</Text>
            <Text style={[s.cl, p.id === selectedId && s.sl]}>{p.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  l: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  r: { gap: 8, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  sel: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  e: { fontSize: 16 }, cl: { fontSize: 14, fontWeight: '600', color: '#6B7280' }, sl: { color: '#2563EB' },
})
