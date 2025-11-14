/**
 * 타이포그래피 시스템
 * 중장년층을 고려한 큰 글씨
 */

export const TYPOGRAPHY = {
  // 헤딩
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // 본문
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // 큰 본문 (중장년층 고려)
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },

  // 버튼
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.5,
  },

  // 캡션
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 14,
  },

  // 숫자 강조 (GL 값 등)
  display: {
    fontSize: 64,
    fontWeight: 'bold' as const,
    lineHeight: 72,
    letterSpacing: -1,
  },
  displayMedium: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    lineHeight: 56,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    lineHeight: 44,
  },
};

