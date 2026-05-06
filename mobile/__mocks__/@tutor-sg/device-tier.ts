// Dummy mock — actual mock is in jest.mock factory in the test file
export const assignTier = () => ({ tier: 'high', belowFloor: false });
export const MODEL_MAP = { high: { llm: '', mt: '' }, mid: { llm: '', mt: '' }, low: { llm: '', mt: '' } };
export const BelowFloorModal = () => null;
export const TIER_THRESHOLDS = { HIGH_RAM_GB: 6, MID_RAM_GB: 4, FLOOR_RAM_GB: 3 };
export const HIGH_TIER_CHIPSETS = ['A14','A15','A16','A17','A18','SDM8 Gen1','SDM8 Gen2','SDM8 Gen3','Tensor G2','Tensor G3','Tensor G4'];
export const SETTINGS_KEY = 'device_tier';
