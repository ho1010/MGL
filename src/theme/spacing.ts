/**
 * 간격 시스템
 * 8px 기준 그리드 시스템
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// 화면 패딩
export const SCREEN_PADDING = {
  horizontal: SPACING.md,
  vertical: SPACING.md,
};

// 카드 패딩
export const CARD_PADDING = {
  default: SPACING.md,
  large: SPACING.lg,
};

// 간격 유틸리티
export const getSpacing = (multiplier: number) => SPACING.sm * multiplier;

