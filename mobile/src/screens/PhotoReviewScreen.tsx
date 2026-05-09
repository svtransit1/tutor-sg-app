import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';

export interface PhotoReviewPage {
  uri: string;
  width: number;
  height: number;
}

export interface PhotoReviewScreenProps {
  pages: PhotoReviewPage[];
  selectedPageIndex: number;
  onSelectPage: (index: number) => void;
  onRetake: () => void;
  onConfirm: (pages: PhotoReviewPage[]) => void;
  onAddPage: () => void;
  onRemovePage: (index: number) => void;
  onCropConfirm?: (page: PhotoReviewPage, cropRect: CropRect) => void;
  maxPages?: number;
  /** Fixed aspect ratio for crop box (width/height). Defaults to A4 paper ratio 210/297 ≈ 0.707. */
  cropAspectRatio?: number;
}

export interface CropRect {
  /** Normalized horizontal offset (-0.5 to 0.5), 0 = centered */
  x: number;
  /** Normalized vertical offset (-0.5 to 0.5), 0 = centered */
  y: number;
  /** Scale factor: 1 = entire image fills crop box, >1 = zoom in */
  scale: number;
}

const THUMBNAIL_SIZE = 64;
const THUMBNAIL_GAP = 8;
const MAX_PAGES_DEFAULT = 5;

/** Normalized crop rect where {x:0, y:0, scale:1} means centered, full-fit */
const DEFAULT_CROP: CropRect = { x: 0, y: 0, scale: 1 };

/* ─── Crop Overlay ──────────────────────────────────────────────────── */

interface CropOverlayProps {
  imageWidth: number;
  imageHeight: number;
  aspectRatio: number;
  initialRect: CropRect;
  onConfirm: (rect: CropRect) => void;
  onCancel: () => void;
}

function CropOverlay({ imageWidth, imageHeight, aspectRatio, initialRect, onConfirm, onCancel }: CropOverlayProps) {
  const { t } = useTranslation();
  const screenW = Dimensions.get('window').width;

  // Crop box size (full width, fixed aspect ratio)
  const cropW = screenW;
  const cropH = cropW / aspectRatio;

  // Image display dimensions (object-contain)
  const imageDisplayW = screenW;
  const imageDisplayH = (screenW / imageWidth) * imageHeight;
  const imageTop = (cropH - imageDisplayH) / 2;

  // Crop state
  const [offset, setOffset] = useState({ x: initialRect.x, y: initialRect.y });
  const [scale, setScale] = useState(initialRect.scale);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (event: GestureResponderEvent) => {
          const { locationX, locationY } = event.nativeEvent;
          // locationX/locationY are relative to the gesture responder's view
          // Normalize to -0.5..0.5, then clamp
          const newX = clamp((locationX / cropW) - 0.5, -0.5, 0.5);
          const newY = clamp((locationY / cropH) - 0.5, -0.5, 0.5);
          setOffset({ x: newX, y: newY });
        },
        onPanResponderRelease: () => {},
      }),
    [cropW, cropH]
  );

  // Scale via pinch-like vertical drag on the crop box
  const panResponderScale = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (event: GestureResponderEvent) => {
          const { locationY } = event.nativeEvent;
          // Drag up = zoom in, drag down = zoom out
          const delta = (cropH / 2 - locationY) * 0.003;
          const newScale = clamp(1 - delta, 0.5, 4);
          setScale(newScale);
        },
        onPanResponderRelease: () => {},
      }),
    [cropH]
  );

  return (
    <View style={styles.cropContainer} pointerEvents="box-none">
      {/* Darkened overlay outside crop box */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top dim */}
        <View style={{ height: imageTop > 0 ? imageTop : 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        {/* Middle: dim sides of crop box */}
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      </View>

      {/* Centered crop box */}
      <View
        style={[
          styles.cropBox,
          {
            width: cropW,
            height: cropH,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Corner handles */}
        {(
          [
            { key: 'tl', style: { top: -6, left: -6 } },
            { key: 'tr', style: { top: -6, right: -6 } },
            { key: 'bl', style: { bottom: -6, left: -6 } },
            { key: 'br', style: { bottom: -6, right: -6 } },
          ] as const
        ).map(({ key, style }) => (
          <View key={key} style={[styles.cropHandle, style]} />
        ))}
      </View>

      {/* Scale drag zone (tap outside crop box) */}
      <View
        style={[StyleSheet.absoluteFill, { top: imageTop > 0 ? 0 : cropH, height: imageDisplayH - cropH }]}
        {...panResponderScale.panHandlers}
      />

      {/* Action buttons */}
      <View style={styles.cropActions}>
        <Pressable style={styles.cropCancelButton} onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('kidHome.camera.photoReview.cancelCrop')}>
          <Text style={styles.cropCancelText}>{t('kidHome.camera.photoReview.cancelCrop')}</Text>
        </Pressable>
        <Pressable
          style={styles.cropConfirmButton}
          onPress={() => onConfirm({ x: offset.x, y: offset.y, scale })}
          accessibilityRole="button"
          accessibilityLabel={t('kidHome.camera.photoReview.confirmCrop')}
        >
          <Text style={styles.cropConfirmText}>{t('kidHome.camera.photoReview.confirmCrop')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Main PhotoReviewScreen ─────────────────────────────────────────── */

export function PhotoReviewScreen({
  pages,
  selectedPageIndex,
  onSelectPage,
  onRetake,
  onConfirm,
  onAddPage,
  onRemovePage,
  onCropConfirm,
  maxPages = MAX_PAGES_DEFAULT,
  cropAspectRatio = 210 / 297,
}: PhotoReviewScreenProps) {
  const { t } = useTranslation();
  const isMultiPage = pages.length > 1;
  const currentPage = pages[selectedPageIndex];
  const canAddMore = pages.length < maxPages;

  const [showCrop, setShowCrop] = useState(false);

  const handleConfirm = useCallback(() => {
    onConfirm(pages);
  }, [pages, onConfirm]);

  const handleRemovePage = useCallback(() => {
    if (pages.length > 1) {
      const newIndex = Math.min(selectedPageIndex, pages.length - 2);
      onRemovePage(selectedPageIndex);
      if (newIndex !== selectedPageIndex) {
        onSelectPage(newIndex);
      }
    }
  }, [pages.length, selectedPageIndex, onRemovePage, onSelectPage]);

  const handleCropConfirm = useCallback(
    (cropRect: CropRect) => {
      if (currentPage && onCropConfirm) {
        onCropConfirm(currentPage, cropRect);
      }
      setShowCrop(false);
    },
    [currentPage, onCropConfirm]
  );

  return (
    <View style={styles.container}>
      {currentPage && (
        <>
          <Image
            source={{ uri: currentPage.uri }}
            style={[
              styles.fullPreview,
              { width: Dimensions.get('window').width },
            ]}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={t('kidHome.camera.photoReview.pageThumbnail', {
              number: selectedPageIndex + 1,
            })}
          />

          {showCrop && currentPage && (
            <CropOverlay
              imageWidth={currentPage.width}
              imageHeight={currentPage.height}
              aspectRatio={cropAspectRatio}
              initialRect={DEFAULT_CROP}
              onConfirm={handleCropConfirm}
              onCancel={() => setShowCrop(false)}
            />
          )}
        </>
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        {isMultiPage && (
          <View style={styles.topBar}>
            <View style={styles.pageBadge}>
              <Text style={styles.pageBadgeText}>
                {t('kidHome.camera.photoReview.pageCount', {
                  current: selectedPageIndex + 1,
                  total: pages.length,
                })}
              </Text>
            </View>

            {pages.length > 1 && (
              <Pressable
                style={styles.removePageButton}
                onPress={handleRemovePage}
                accessibilityRole="button"
                accessibilityLabel={t('kidHome.camera.photoReview.removePageButton', {
                  number: selectedPageIndex + 1,
                })}
                hitSlop={8}
              >
                <Text style={styles.removePageIcon}>✕</Text>
              </Pressable>
            )}
          </View>
        )}

        {isMultiPage && canAddMore && (
          <Text style={styles.multiPageHint}>
            {t('kidHome.camera.photoReview.multiPageHint')}
          </Text>
        )}
      </View>

      <View style={styles.bottomSection}>
        {(isMultiPage || canAddMore) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailScrollContent}
          >
            {pages.map((page, index) => (
              <Pressable
                key={`page-${index}`}
                style={[
                  styles.thumbnailWrapper,
                  index === selectedPageIndex && styles.thumbnailSelected,
                ]}
                onPress={() => onSelectPage(index)}
                accessibilityRole="button"
                accessibilityLabel={t('kidHome.camera.photoReview.pageThumbnail', {
                  number: index + 1,
                })}
                accessibilityState={{ selected: index === selectedPageIndex }}
              >
                <Image
                  source={{ uri: page.uri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                {isMultiPage && (
                  <View style={styles.thumbnailIndex}>
                    <Text style={styles.thumbnailIndexText}>{index + 1}</Text>
                  </View>
                )}
              </Pressable>
            ))}

            {canAddMore && (
              <Pressable
                style={styles.addPageThumbnail}
                onPress={onAddPage}
                accessibilityRole="button"
                accessibilityLabel={t('kidHome.camera.photoReview.addPageButton')}
              >
                <Text style={styles.addPageIcon}>+</Text>
                <Text style={styles.addPageLabel}>
                  {t('kidHome.camera.photoReview.addPage')}
                </Text>
              </Pressable>
            )}
          </ScrollView>
        )}

        <View style={styles.actionRow}>
          <Pressable
            style={styles.retakeButton}
            onPress={onRetake}
            accessibilityRole="button"
            accessibilityLabel={t('kidHome.camera.photoReview.retakeButton')}
          >
            <Text style={styles.retakeButtonText}>
              {t('kidHome.camera.photoReview.retake')}
            </Text>
          </Pressable>

          {onCropConfirm && !showCrop && (
            <Pressable
              style={styles.cropButton}
              onPress={() => setShowCrop(true)}
              accessibilityRole="button"
              accessibilityLabel={t('kidHome.camera.photoReview.cropButton')}
            >
              <Text style={styles.cropButtonText}>
                {t('kidHome.camera.photoReview.crop')}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.confirmButton}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel={
              isMultiPage
                ? t('kidHome.camera.photoReview.confirmButtonPlural', {
                    count: pages.length,
                  })
                : t('kidHome.camera.photoReview.confirmButton')
            }
          >
            <Text style={styles.confirmButtonText}>
              {isMultiPage
                ? t('kidHome.camera.photoReview.usePhotos', { count: pages.length })
                : t('kidHome.camera.photoReview.usePhoto')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  fullPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  pageBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pageBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removePageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePageIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  multiPageHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    gap: 12,
    paddingBottom: 24,
  },
  thumbnailScrollContent: {
    paddingHorizontal: 16,
    gap: THUMBNAIL_GAP,
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#4A90D9',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  thumbnailIndex: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIndexText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  addPageThumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPageIcon: {
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 24,
    color: '#4A90D9',
  },
  addPageLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4A90D9',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  retakeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cropButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4A90D9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cropButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A90D9',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  // Crop overlay
  cropContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropBox: {
    borderWidth: 2,
    borderColor: '#4A90D9',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  cropHandle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90D9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cropActions: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  cropCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  cropCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cropConfirmButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  cropConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});