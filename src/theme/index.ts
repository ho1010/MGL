/**
 * 디자인 시스템 통합
 */

import {LIGHT_COLORS, DARK_COLORS, GL_SAFETY_COLORS} from './colors';
import {TYPOGRAPHY} from './typography';
import {SPACING, SCREEN_PADDING, CARD_PADDING} from './spacing';
import {SHADOWS} from './shadows';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: typeof LIGHT_COLORS;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  shadows: typeof SHADOWS;
  screenPadding: typeof SCREEN_PADDING;
  cardPadding: typeof CARD_PADDING;
}

// 라이트 테마
export const lightTheme: Theme = {
  mode: 'light',
  colors: LIGHT_COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  shadows: SHADOWS,
  screenPadding: SCREEN_PADDING,
  cardPadding: CARD_PADDING,
};

// 다크 테마
export const darkTheme: Theme = {
  mode: 'dark',
  colors: DARK_COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  shadows: SHADOWS,
  screenPadding: SCREEN_PADDING,
  cardPadding: CARD_PADDING,
};

// GL 안전도 색상 (모드 무관)
export {GL_SAFETY_COLORS};

// 기본 테마 (라이트)
export const defaultTheme = lightTheme;

