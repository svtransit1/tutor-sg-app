import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
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
  maxPages?: number;
}

const THUMBNAIL_SIZE = 64;
const THUMBNAIL_GAP = 8;
const MAX_PAGES_DEFAULT = 5;

export function PhotoReviewScreen({
  pages,
  selectedPageIndex,
  onSelectPage,
  onRetake,
  onConfirm,
  onAddPage,
  onRemovePage,
  maxPages = MAX_PAGES_DEFAULT,
}: PhotoReviewScreenProps) {
  const { t } = useTranslation();
  const isMultiPage = pages.length > 1;
  const currentPage = pages[selectedPageIndex];
  const canAddMore = pages.length < maxPages;

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

  return (
    <View style={styles.container}>
      {currentPage && (
        <Image
          source={{ uri: currentPage.uri }}
          style={[
            styles.fullPreview,
            { width: Dimensions.get('window').width },
          ]}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={t('camera.photoReview.pageThumbnail', {
            number: selectedPageIndex + 1,
          })}
        />
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        {isMultiPage && (
          <View style={styles.topBar}>
            <View style={styles.pageBadge}>
              <Text style={styles.pageBadgeText}>
                {t('camera.photoReview.pageCount', {
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
                accessibilityLabel={t('camera.photoReview.removePageButton', {
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
            {t('camera.photoReview.multiPageHint')}
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
                accessibilityLabel={t('camera.photoReview.pageThumbnail', {
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
                accessibilityLabel={t('camera.photoReview.addPageButton')}
              >
                <Text style={styles.addPageIcon}>+</Text>
                <Text style={styles.addPageLabel}>
                  {t('camera.photoReview.addPage')}
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
            accessibilityLabel={t('camera.photoReview.retakeButton')}
          >
            <Text style={styles.retakeButtonText}>
              {t('camera.photoReview.retake')}
            </Text>
          </Pressable>

          <Pressable
            style={styles.confirmButton}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel={
              isMultiPage
                ? t('camera.photoReview.confirmButtonPlural', {
                    count: pages.length,
                  })
                : t('camera.photoReview.confirmButton')
            }
          >
            <Text style={styles.confirmButtonText}>
              {isMultiPage
                ? t('camera.photoReview.usePhotos', { count: pages.length })
                : t('camera.photoReview.usePhoto')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

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
});
