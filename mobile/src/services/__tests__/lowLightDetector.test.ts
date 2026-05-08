import { isLowLightFromExif } from '../lowLightDetector';

const mockPlatform = (os: string) => {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    Platform: { OS: os },
  }));
};

describe('isLowLightFromExif', () => {
  beforeEach(() => jest.resetModules());

  describe('iOS (BrightnessValue)', () => {
    beforeEach(() => mockPlatform('ios'));

    it('detects low light when brightnessValue < 0.5', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({ brightnessValue: 0.3 });
      expect(result.isLowLight).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.suggestedFix).toBeDefined();
    });

    it('returns not low light when brightnessValue >= 0.5', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({ brightnessValue: 0.7 });
      expect(result.isLowLight).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('returns not low light when brightnessValue missing', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({ iso: 1600, exposureTime: 1 / 8 });
      expect(result.isLowLight).toBe(false);
      expect(result.confidence).toBe('low');
    });
  });

  describe('Android (ISO + exposureTime)', () => {
    beforeEach(() => mockPlatform('android'));

    it('detects low light when ISO >= 800 and exposure >= 1/15s', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({ iso: 1600, exposureTime: 1 / 8 });
      expect(result.isLowLight).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.suggestedFix).toBeDefined();
    });

    it('returns not low light when ISO < 800', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({ iso: 400, exposureTime: 1 / 8 });
      expect(result.isLowLight).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('returns not low light when exposure < 1/15s', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({ iso: 1600, exposureTime: 1 / 30 });
      expect(result.isLowLight).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('returns not low light when EXIF data missing', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({});
      expect(result.isLowLight).toBe(false);
      expect(result.confidence).toBe('low');
    });
  });

  describe('default (unsupported platform)', () => {
    beforeEach(() => mockPlatform('web'));

    it('returns not low light', () => {
      const { isLowLightFromExif: check } = require('../lowLightDetector');
      const result = check({ iso: 1600, exposureTime: 1 / 8 });
      expect(result.isLowLight).toBe(false);
      expect(result.confidence).toBe('low');
    });
  });
});
