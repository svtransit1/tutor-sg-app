export interface ColorTokens {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  border: string;
  borderLight: string;
  error: string;
  errorBg: string;
  errorText: string;
  warning: string;
  warningBg: string;
  warningText: string;
  success: string;
  successBg: string;
  successText: string;
  disabled: string;
  disabledText: string;
  overlay: string;
}

export const lightColors: ColorTokens = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  primaryDark: '#1D4ED8',
  textPrimary: '#1A1A1A',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  textInverse: '#FFFFFF',
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F8F9FA',
  bgTertiary: '#F3F4F6',
  border: '#D1D5DB',
  borderLight: '#E5E7EB',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorText: '#991B1B',
  warning: '#92400E',
  warningBg: '#FEF3C7',
  warningText: '#78350F',
  success: '#059669',
  successBg: '#D1FAE5',
  successText: '#065F46',
  disabled: '#D1D5DB',
  disabledText: '#6B7280',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const darkColors: ColorTokens = {
  primary: '#60A5FA',
  primaryLight: '#1E3A5F',
  primaryDark: '#93C5FD',
  textPrimary: '#F3F4F6',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#1A1A1A',
  bgPrimary: '#111827',
  bgSecondary: '#1F2937',
  bgTertiary: '#374151',
  border: '#4B5563',
  borderLight: '#374151',
  error: '#FCA5A5',
  errorBg: '#451A1A',
  errorText: '#FECACA',
  warning: '#FBBF24',
  warningBg: '#451A03',
  warningText: '#FDE68A',
  success: '#34D399',
  successBg: '#064E3B',
  successText: '#A7F3D0',
  disabled: '#4B5563',
  disabledText: '#6B7280',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/** Kid mode uses light palette (vibrant, playful) */
export const kidColors = lightColors;
export type KidColors = typeof kidColors;

/** Parent mode uses dark palette (professional, calm) */
export const parentColors = darkColors;
export type ParentColors = typeof parentColors;
