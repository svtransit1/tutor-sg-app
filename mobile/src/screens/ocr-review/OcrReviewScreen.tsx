import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import OcrOverlay from '../../components/OcrOverlay';
import type { OcrBlock } from '../../models/ocr';
import { getConfidenceLevel, getConfidenceColor, getConfidenceBgColor } from '../../models/ocr';

export interface OcrReviewScreenProps {
  photoUri: string;
  blocks: OcrBlock[];
  imageWidth: number;
  imageHeight: number;
  onConfirm: () => void;
  onRetake: () => void;
  onBlockPress?: (index: number) => void;
}

function ConfidenceSummary({ blocks }: { blocks: OcrBlock[] }) {
  const { t } = useTranslation();
  const { total, high, medium, low } = useMemo(() => ({
    total: blocks.length,
    high: blocks.filter((b) => getConfidenceLevel(b.confidence) === 'high').length,
    medium: blocks.filter((b) => getConfidenceLevel(b.confidence) === 'medium').length,
    low: blocks.filter((b) => getConfidenceLevel(b.confidence) === 'low').length,
  }), [blocks]);

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>{t('ocrReview.summaryTitle', { count: total })}</Text>
      <View style={styles.statsRow}>
        <StatBadge label={t('ocrReview.confidenceHigh')} count={high} color="#22C55E" bgColor="#DCFCE7" />
        <StatBadge label={t('ocrReview.confidenceMedium')} count={medium} color="#EAB308" bgColor="#FEF9C3" />
        <StatBadge label={t('ocrReview.confidenceLow')} count={low} color="#EF4444" bgColor="#FEE2E2" />
      </View>
    </View>
  );
}

function StatBadge({ label, count, color, bgColor }: { label: string; count: number; color: string; bgColor: string }) {
  return (
    <View style={[styles.statBadge, { backgroundColor: bgColor, borderColor: color }]}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

function BlockList({ blocks }: { blocks: OcrBlock[] }) {
  const { t } = useTranslation();
  return (
    <View style={styles.blockListContainer}>
      <Text style={styles.blockListTitle}>{t('ocrReview.detectedRegions')}</Text>
      {blocks.map((block, index) => {
        const level = getConfidenceLevel(block.confidence);
        const color = getConfidenceColor(level);
        const bgColor = getConfidenceBgColor(level);
        return (
          <View key={index} style={styles.blockRow}>
            <View style={styles.blockIndexCircle}><Text style={styles.blockIndexText}>{index + 1}</Text></View>
            <View style={styles.blockContent}><Text style={styles.blockText} numberOfLines={2}>{block.text}</Text></View>
            <View style={[styles.blockConfidence, { backgroundColor: bgColor, borderColor: color }]}>
              <Text style={[styles.blockConfidenceText, { color }]}>{Math.round(block.confidence * 100)}%</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function OcrReviewScreen({ photoUri, blocks, imageWidth, imageHeight, onConfirm, onRetake, onBlockPress }: OcrReviewScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const needsManual = useMemo(() => blocks.some((b) => getConfidenceLevel(b.confidence) !== 'high'), [blocks]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onRetake} style={styles.headerBackButton} accessibilityRole="button" accessibilityLabel={t('common.back')}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('ocrReview.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.photoArea}>
        <OcrOverlay imageSource={{ uri: photoUri }} blocks={blocks} imageWidth={imageWidth} imageHeight={imageHeight} onBlockPress={onBlockPress} onRetake={onRetake} />
      </View>
      <View style={styles.footer}>
        <ScrollView style={styles.detailsScroll} contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
          <ConfidenceSummary blocks={blocks} />
          <BlockList blocks={blocks} />
          {needsManual && (
            <View style={styles.manualNotice}>
              <Ionicons name="information-circle-outline" size={18} color="#EAB308" />
              <Text style={styles.manualNoticeText}>{t('ocrReview.manualInputNotice')}</Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.actions}>
          <Pressable style={styles.retakeButton} onPress={onRetake} accessibilityRole="button" accessibilityLabel={t('ocrReview.retake')}>
            <Ionicons name="camera-outline" size={18} color="#374151" />
            <Text style={styles.retakeButtonText}>{t('ocrReview.retake')}</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={onConfirm} accessibilityRole="button" accessibilityLabel={t('ocrReview.confirm')}>
            <Text style={styles.confirmButtonText}>{t('ocrReview.confirm')}</Text>
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.8)' },
  headerBackButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  headerSpacer: { width: 40 },
  photoArea: { flex: 1 },
  footer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: 320 },
  detailsScroll: { maxHeight: 200 },
  detailsContent: { padding: 16, gap: 12 },
  summaryContainer: { gap: 8 },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, borderWidth: 1, gap: 2 },
  statCount: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
  blockListContainer: { gap: 8 },
  blockListTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#F8F9FA', borderRadius: 10 },
  blockIndexCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  blockIndexText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  blockContent: { flex: 1 },
  blockText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  blockConfidence: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  blockConfidenceText: { fontSize: 13, fontWeight: '700' },
  manualNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF9C3', borderRadius: 10, padding: 12 },
  manualNoticeText: { flex: 1, fontSize: 13, color: '#854D0E', lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  retakeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, gap: 6, borderWidth: 1.5, borderColor: '#D1D5DB' },
  retakeButtonText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  confirmButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14, gap: 6 },
  confirmButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
