import {
  getConfidenceLevel,
  getConfidenceColor,
  getConfidenceBgColor,
  isTapToType,
} from '../ocr';

describe('ocr types', () => {
  describe('getConfidenceLevel', () => {
    it('returns high for confidence > 0.8', () => {
      expect(getConfidenceLevel(1.0)).toBe('high');
      expect(getConfidenceLevel(0.81)).toBe('high');
      expect(getConfidenceLevel(0.85)).toBe('high');
    });

    it('returns medium for 0.5 <= confidence <= 0.8', () => {
      expect(getConfidenceLevel(0.5)).toBe('medium');
      expect(getConfidenceLevel(0.65)).toBe('medium');
      expect(getConfidenceLevel(0.8)).toBe('medium');
    });

    it('returns low for confidence < 0.5', () => {
      expect(getConfidenceLevel(0.49)).toBe('low');
      expect(getConfidenceLevel(0)).toBe('low');
      expect(getConfidenceLevel(0.3)).toBe('low');
    });
  });

  describe('isTapToType', () => {
    it('returns true for confidence < 0.8', () => {
      expect(isTapToType(0.79)).toBe(true);
      expect(isTapToType(0)).toBe(true);
    });
    it('returns false for confidence >= 0.8', () => {
      expect(isTapToType(0.8)).toBe(false);
      expect(isTapToType(1)).toBe(false);
    });
  });

  describe('getConfidenceColor', () => {
    it('returns green for high', () => expect(getConfidenceColor('high')).toBe('#22C55E'));
    it('returns yellow for medium', () => expect(getConfidenceColor('medium')).toBe('#EAB308'));
    it('returns red for low', () => expect(getConfidenceColor('low')).toBe('#EF4444'));
  });

  describe('getConfidenceBgColor', () => {
    it('returns light green for high', () => expect(getConfidenceBgColor('high')).toBe('#DCFCE7'));
    it('returns light yellow for medium', () => expect(getConfidenceBgColor('medium')).toBe('#FEF9C3'));
    it('returns light red for low', () => expect(getConfidenceBgColor('low')).toBe('#FEE2E2'));
  });
});
