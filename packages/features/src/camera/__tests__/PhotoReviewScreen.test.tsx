import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PhotoReviewScreen } from '../PhotoReviewScreen';
import type { PhotoReviewScreenProps, PhotoReviewPage } from '../PhotoReviewScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    const t = (key: string, opts?: Record<string, unknown>) => {
      const keys: Record<string, string> = {
        'camera.photoReview.retake': 'Retake',
        'camera.photoReview.usePhoto': 'Use this photo',
        'camera.photoReview.retakeButton': 'Retake the photo',
        'camera.photoReview.confirmButton': 'Use this photo and continue',
        'camera.photoReview.addPageButton': 'Capture another page',
        'camera.photoReview.addPage': 'Add page',
        'camera.photoReview.removePage': 'Remove',
        'camera.photoReview.multiPageHint': 'You can add multiple pages',
        'camera.photoReview.crop': 'Crop',
        'camera.photoReview.cropButton': 'Adjust crop area',
        'camera.photoReview.cancelCrop': 'Cancel',
        'camera.photoReview.confirmCrop': 'Confirm crop',
      };
      if (opts && opts.count && key === 'camera.photoReview.usePhotos') {
        return `Use ${opts.count} photos`;
      }
      if (opts && opts.count && key === 'camera.photoReview.usePhotos_plural') {
        return `Use ${opts.count} photos`;
      }
      if (opts && opts.count && key === 'camera.photoReview.confirmButtonPlural') {
        return `Use all ${opts.count} photos and continue`;
      }
      if (opts && opts.number && key === 'camera.photoReview.pageThumbnail') {
        return `Page ${opts.number} thumbnail`;
      }
      if (opts && opts.number && key === 'camera.photoReview.removePageButton') {
        return `Remove page ${opts.number}`;
      }
      if (opts && opts.current && opts.total && key === 'camera.photoReview.pageCount') {
        return `Page ${opts.current} of ${opts.total}`;
      }
      return keys[key] ?? key;
    };
    return { t, i18n: { language: 'en' } };
  },
}));

function makePage(uri: string): PhotoReviewPage {
  return { uri, width: 1200, height: 1600 };
}

const defaultProps: PhotoReviewScreenProps = {
  pages: [makePage('file:///photo1.jpg')],
  selectedPageIndex: 0,
  onSelectPage: jest.fn(),
  onRetake: jest.fn(),
  onConfirm: jest.fn(),
  onAddPage: jest.fn(),
  onRemovePage: jest.fn(),
  maxPages: 5,
};

function renderComponent(props: Partial<PhotoReviewScreenProps> = {}) {
  return render(<PhotoReviewScreen {...defaultProps} {...props} />);
}

describe('PhotoReviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the confirm button', () => {
      const { getByLabelText } = renderComponent();
      expect(getByLabelText('Use this photo and continue')).toBeTruthy();
    });

    it('renders the retake button', () => {
      const { getByLabelText } = renderComponent();
      expect(getByLabelText('Retake the photo')).toBeTruthy();
    });

    it('renders thumbnail for each page', () => {
      const pages = [makePage('a'), makePage('b'), makePage('c')];
      const { getAllByLabelText } = renderComponent({ pages });
      // Each page has a full-preview image + a thumbnail image with the label
      const page1 = getAllByLabelText('Page 1 thumbnail');
      const page2 = getAllByLabelText('Page 2 thumbnail');
      const page3 = getAllByLabelText('Page 3 thumbnail');
      expect(page1.length).toBe(2); // full preview + thumbnail
      expect(page2.length).toBe(1); // thumbnail only (not selected)
      expect(page3.length).toBe(1);
    });

    it('shows add page button when under max', () => {
      const { getByLabelText } = renderComponent();
      expect(getByLabelText('Capture another page')).toBeTruthy();
    });

    it('hides add page button at maxPages limit', () => {
      const pages = Array.from({ length: 5 }, (_, i) =>
        makePage(`file:///p${i}.jpg`),
      );
      const { queryByLabelText } = renderComponent({ pages });
      expect(queryByLabelText('Capture another page')).toBeNull();
    });
  });

  describe('multi-page', () => {
    it('shows page count badge when multi-page', () => {
      const pages = [makePage('a'), makePage('b')];
      const { getByText } = renderComponent({ pages });
      expect(getByText('Page 1 of 2')).toBeTruthy();
    });

    it('shows remove button when multi-page', () => {
      const pages = [makePage('a'), makePage('b')];
      const { getByLabelText } = renderComponent({ pages });
      expect(getByLabelText('Remove page 1')).toBeTruthy();
    });

    it('shows multi-page hint', () => {
      const pages = [makePage('a'), makePage('b')];
      const { getByText } = renderComponent({ pages });
      expect(getByText('You can add multiple pages')).toBeTruthy();
    });

    it('shows plural confirm label when multi-page', () => {
      const pages = [makePage('a'), makePage('b')];
      const { getByLabelText } = renderComponent({ pages });
      expect(getByLabelText('Use all 2 photos and continue')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onRetake when retake pressed', () => {
      const onRetake = jest.fn();
      const { getByLabelText } = renderComponent({ onRetake });
      fireEvent.press(getByLabelText('Retake the photo'));
      expect(onRetake).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm with pages when confirm pressed', () => {
      const onConfirm = jest.fn();
      const { getByLabelText } = renderComponent({ onConfirm });
      fireEvent.press(getByLabelText('Use this photo and continue'));
      expect(onConfirm).toHaveBeenCalledWith(defaultProps.pages);
    });

    it('calls onAddPage when add page pressed', () => {
      const onAddPage = jest.fn();
      const { getByLabelText } = renderComponent({ onAddPage });
      fireEvent.press(getByLabelText('Capture another page'));
      expect(onAddPage).toHaveBeenCalledTimes(1);
    });

    it('calls onSelectPage when thumbnail pressed', () => {
      const onSelectPage = jest.fn();
      const pages = [makePage('a'), makePage('b')];
      const { getByLabelText } = renderComponent({ pages, onSelectPage });
      fireEvent.press(getByLabelText('Page 2 thumbnail'));
      expect(onSelectPage).toHaveBeenCalledWith(1);
    });

    it('calls onRemovePage when remove button pressed', () => {
      const onRemovePage = jest.fn();
      const pages = [makePage('a'), makePage('b')];
      const { getByLabelText } = renderComponent({
        pages,
        onRemovePage,
        selectedPageIndex: 0,
      });
      fireEvent.press(getByLabelText('Remove page 1'));
      expect(onRemovePage).toHaveBeenCalledWith(0);
    });
  });

  describe('crop', () => {
    it('shows crop button when onCropConfirm is provided', () => {
      const onCropConfirm = jest.fn();
      const { getByLabelText } = renderComponent({ onCropConfirm });
      expect(getByLabelText('Adjust crop area')).toBeTruthy();
    });

    it('hides crop button when onCropConfirm is not provided', () => {
      const { queryByLabelText } = renderComponent({ onCropConfirm: undefined });
      expect(queryByLabelText('Adjust crop area')).toBeNull();
    });

    it('shows crop overlay when crop button is pressed', () => {
      const onCropConfirm = jest.fn();
      const { getByLabelText } = renderComponent({ onCropConfirm });
      fireEvent.press(getByLabelText('Adjust crop area'));
      expect(getByLabelText('Cancel')).toBeTruthy();
      expect(getByLabelText('Confirm crop')).toBeTruthy();
    });

    it('dismisses crop overlay when cancel is pressed', () => {
      const onCropConfirm = jest.fn();
      const { getByLabelText, queryByLabelText } = renderComponent({ onCropConfirm });
      fireEvent.press(getByLabelText('Adjust crop area'));
      expect(getByLabelText('Cancel')).toBeTruthy();
      fireEvent.press(getByLabelText('Cancel'));
      expect(queryByLabelText('Confirm crop')).toBeNull();
    });

    it('calls onCropConfirm with page and rect when confirm crop is pressed', () => {
      const onCropConfirm = jest.fn();
      const page = makePage('file:///photo1.jpg');
      const { getByLabelText } = renderComponent({ onCropConfirm, pages: [page] });
      fireEvent.press(getByLabelText('Adjust crop area'));
      fireEvent.press(getByLabelText('Confirm crop'));
      expect(onCropConfirm).toHaveBeenCalledTimes(1);
      const [receivedPage, receivedRect] = onCropConfirm.mock.calls[0];
      expect(receivedPage.uri).toBe(page.uri);
      expect(receivedRect).toHaveProperty('x');
      expect(receivedRect).toHaveProperty('y');
      expect(receivedRect).toHaveProperty('scale');
    });
  });

  describe('bilingual support', () => {
    it('has all i18n keys defined in both EN and zh-Hans', () => {
      // Load from mobile locale files which are the active i18n source
      const en = require('../../../../../mobile/src/i18n/locales/en.json');
      const zh = require('../../../../../mobile/src/i18n/locales/zh-Hans.json');

      const enKeys = en?.camera?.photoReview;
      const zhKeys = zh?.camera?.photoReview;

      expect(enKeys).toBeDefined();
      expect(zhKeys).toBeDefined();

      expect(Object.keys(enKeys).sort()).toEqual(
        [
          'addPage',
          'addPageButton',
          'cancelCrop',
          'confirmButton',
          'confirmButtonPlural',
          'confirmCrop',
          'crop',
          'cropButton',
          'multiPageHint',
          'pageCount',
          'pageThumbnail',
          'removePage',
          'removePageButton',
          'retake',
          'retakeButton',
          'usePhoto',
          'usePhotos',
          'usePhotos_plural',
        ].sort(),
      );
      expect(Object.keys(zhKeys).sort()).toEqual(
        Object.keys(enKeys).sort(),
      );
    });
  });

  describe('accessibility', () => {
    it('has accessibility labels on all interactive elements', () => {
      const pages = [makePage('a'), makePage('b')];
      const { getByLabelText, getAllByLabelText } = renderComponent({
        pages,
        selectedPageIndex: 0,
      });

      expect(getByLabelText('Retake the photo')).toBeTruthy();
      expect(getByLabelText('Use all 2 photos and continue')).toBeTruthy();
      expect(getAllByLabelText('Page 1 thumbnail').length).toBeGreaterThanOrEqual(1);
      expect(getByLabelText('Page 2 thumbnail')).toBeTruthy();
      expect(getByLabelText('Remove page 1')).toBeTruthy();
      expect(getByLabelText('Capture another page')).toBeTruthy();
    });

    it('has role button on action elements', () => {
      const { getByLabelText } = renderComponent();
      expect(
        getByLabelText('Retake the photo').props.accessibilityRole,
      ).toBe('button');
      expect(
        getByLabelText('Use this photo and continue').props.accessibilityRole,
      ).toBe('button');
    });
  });
});
