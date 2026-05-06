/**
 * Tests for tierDisplayInfo pure utility functions.
 *
 * These do NOT depend on @tutor-sg/device-tier native module and
 * run in the 'node' test environment.
 *
 * Covers:
 * - getTierDisplayInfo for high tier (en + zh-Hans)
 * - getTierDisplayInfo for mid tier (en + zh-Hans)
 */
import { getTierDisplayInfo } from '../tierDisplayInfo';

describe('getTierDisplayInfo', () => {
  it('returns correct display info for high tier (en)', () => {
    const info = getTierDisplayInfo('high', 'en');
    expect(info.label).toBe('High Performance');
    expect(info.downloadSize).toBe('~2 GB');
    expect(info.modelNames).toBe('Gemma 4B + Qwen 3.5 4B');
  });

  it('returns correct display info for mid tier (en)', () => {
    const info = getTierDisplayInfo('mid', 'en');
    expect(info.label).toBe('Standard');
    expect(info.downloadSize).toBe('~700 MB');
    expect(info.modelNames).toBe('Gemma 2B + Qwen 3.5 2B');
  });

  it('returns zh-Hans display info for high tier', () => {
    const info = getTierDisplayInfo('high', 'zh-Hans');
    expect(info.label).toBe('高性能');
    expect(info.downloadSize).toBe('约 2 GB');
    expect(info.modelNames).toBe('Gemma 4B + Qwen 3.5 4B');
  });

  it('returns zh-Hans display info for mid tier', () => {
    const info = getTierDisplayInfo('mid', 'zh-Hans');
    expect(info.label).toBe('标准');
    expect(info.downloadSize).toBe('约 700 MB');
  });
});
