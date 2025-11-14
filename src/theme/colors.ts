/**
 * 색상 시스템
 * Material Design 기반 색상 팔레트
 */

// 기본 색상 (사용자 요청 색상)
export const BASE_COLORS = {
  SAFE: '#4CAF50', // 초록 - 안전
  WARNING: '#FFC107', // 노랑 - 위험
  DANGER: '#F44336', // 빨강 - 매우 위험
  PRIMARY: '#4A90E2', // 기본 파란색
};

// 라이트 모드 색상
export const LIGHT_COLORS = {
  // 기본 색상
  PRIMARY: BASE_COLORS.PRIMARY,
  SECONDARY: BASE_COLORS.SAFE,
  WARNING: BASE_COLORS.WARNING,
  DANGER: BASE_COLORS.DANGER,
  SAFE: BASE_COLORS.SAFE,

  // 배경 색상
  BACKGROUND: '#F5F5F5',
  SURFACE: '#FFFFFF',
  SURFACE_VARIANT: '#F9F9F9',

  // 텍스트 색상
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  TEXT_DISABLED: '#BDBDBD',
  TEXT_ON_PRIMARY: '#FFFFFF',
  TEXT_ON_DANGER: '#FFFFFF',

  // 구분선
  DIVIDER: '#E0E0E0',
  BORDER: '#E0E0E0',

  // 기타
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
};

// 다크 모드 색상
export const DARK_COLORS = {
  // 기본 색상
  PRIMARY: '#64B5F6',
  SECONDARY: '#81C784',
  WARNING: '#FFB74D',
  DANGER: '#E57373',
  SAFE: '#81C784',

  // 배경 색상
  BACKGROUND: '#121212',
  SURFACE: '#1E1E1E',
  SURFACE_VARIANT: '#2C2C2C',

  // 텍스트 색상
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#B0B0B0',
  TEXT_DISABLED: '#616161',
  TEXT_ON_PRIMARY: '#000000',
  TEXT_ON_DANGER: '#FFFFFF',

  // 구분선
  DIVIDER: '#424242',
  BORDER: '#424242',

  // 기타
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  OVERLAY: 'rgba(0, 0, 0, 0.7)',
};

// GL 안전도별 색상
export const GL_SAFETY_COLORS = {
  SAFE: BASE_COLORS.SAFE,
  MODERATE: BASE_COLORS.WARNING,
  HIGH_RISK: BASE_COLORS.DANGER,
};

// 그라데이션 색상
export const GRADIENT_COLORS = {
  SAFE: ['#4CAF50', '#66BB6A'],
  WARNING: ['#FFC107', '#FFD54F'],
  DANGER: ['#F44336', '#EF5350'],
  PRIMARY: ['#4A90E2', '#64B5F6'],
};

