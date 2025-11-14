// 앱 상수 정의

// GL (혈당부하지수) 기준값
export const GL_THRESHOLD = {
  SAFE: 10, // 안전 (저혈당부하): GL 10 이하
  MODERATE: 20, // 위험 (중혈당부하): GL 11~19
  HIGH_RISK: 20, // 매우 위험 (고혈당부하): GL 20 이상
};

// GL 안전성 레벨
export enum GLSafetyLevel {
  SAFE = 'SAFE', // 안전 (저혈당부하): GL 10 이하
  MODERATE = 'MODERATE', // 위험 (중혈당부하): GL 11~19
  HIGH_RISK = 'HIGH_RISK', // 매우 위험 (고혈당부하): GL 20 이상
}

// 음식 카테고리 목록
export const FOOD_CATEGORIES = [
  '곡물',
  '채소',
  '과일',
  '육류',
  '어류',
  '유제품',
  '견과류',
  '음료',
  '간식',
  '한식',
  '서양식',
  '중식',
  '일식',
  '가공식품',
  '외식메뉴',
  '기타',
] as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  // AI 이미지 분석
  ANALYZE_IMAGE: '/api/analyze-image',
  // 음식 데이터 검색
  SEARCH_FOOD: '/api/food/search',
  // 식사 기록
  MEAL_RECORDS: '/api/meals',
};

// 이미지 설정
export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
};

// 색상 상수 (하위 호환성을 위해 유지, 새로운 코드는 theme 사용 권장)
export const COLORS = {
  PRIMARY: '#4A90E2',
  SECONDARY: '#4CAF50',
  WARNING: '#FFC107',
  DANGER: '#F44336',
  SAFE: '#4CAF50',
  BACKGROUND: '#F5F5F5',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
};

// GL 안전성에 따른 색상 매핑 (새로운 색상 코드 적용)
export const GL_COLOR_MAP = {
  [GLSafetyLevel.SAFE]: '#4CAF50', // 초록
  [GLSafetyLevel.MODERATE]: '#FFC107', // 노랑
  [GLSafetyLevel.HIGH_RISK]: '#F44336', // 빨강
};

// GL 분류에 따른 한글 레이블
export const GL_LABEL_MAP = {
  [GLSafetyLevel.SAFE]: '안전 (저혈당부하)',
  [GLSafetyLevel.MODERATE]: '위험 (중혈당부하)',
  [GLSafetyLevel.HIGH_RISK]: '매우 위험 (고혈당부하)',
};

