// 음식 카테고리 타입
export type FoodCategory =
  | '곡물'
  | '채소'
  | '과일'
  | '육류'
  | '어류'
  | '유제품'
  | '견과류'
  | '음료'
  | '간식'
  | '한식'
  | '서양식'
  | '중식'
  | '일식'
  | '가공식품'
  | '외식메뉴'
  | '기타';

// GL 분류 타입
export type GLClassification = 'SAFE' | 'MODERATE' | 'HIGH_RISK';

// 음식 정보 타입
export interface FoodItem {
  id: string;
  nameKo: string; // 한글 음식명
  nameEn: string; // 영문 음식명
  glycemicIndex: number; // 혈당지수 (GI)
  carbohydratesPer100g: number; // 100g당 탄수화물 함량 (g)
  standardServingSize: number; // 1회 표준 섭취량 (g)
  calculatedGL: number; // 계산된 GL 값
  category: FoodCategory; // 음식 카테고리
  imageUrl?: string; // 이미지 URL
  caloriesPer100g?: number; // 100g당 칼로리 (선택)
  glClassification: GLClassification; // GL 분류
  createdAt?: Date; // 생성일
  updatedAt?: Date; // 수정일
}

// AI 분석 결과 타입
export interface FoodAnalysisResult {
  detectedFoods: DetectedFood[];
  confidence: number;
  timestamp: Date;
}

export interface DetectedFood {
  name: string; // 기본 음식명 (검색용)
  nameKo?: string; // 한글 음식명
  nameEn?: string; // 영문 음식명
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  name: string;
  diabetesType?: 'type1' | 'type2' | 'prediabetes';
  createdAt: Date;
  profileImageUrl?: string;
}

// 사용자 설정 타입
export interface UserSettings {
  userId: string;
  dailyGLTarget: number; // 목표 일일 GL (기본 80)
  notifications: {
    mealTimeReminder: boolean; // 식사 시간 알림
    glExceedAlert: boolean; // 목표 GL 초과 알림
    enabled: boolean; // 알림 전체 활성화
    mealTimes?: {
      breakfast?: string; // HH:mm 형식
      lunch?: string;
      dinner?: string;
      snack?: string;
    };
  };
  preferredFoods: string[]; // 선호 음식 ID 목록
  avoidedFoods: string[]; // 피해야 할 음식 ID 목록
  bloodSugarTracking: {
    enabled: boolean; // 혈당 추적 활성화
    targetRange?: {
      min: number;
      max: number;
    };
  };
  updatedAt: Date;
}

// 혈당 기록 타입
export interface BloodSugarRecord {
  id: string;
  userId: string;
  value: number; // 혈당 수치 (mg/dL)
  mealType?: MealType; // 식사 타입
  mealRecordId?: string; // 관련 식사 기록 ID
  timestamp: Date;
  notes?: string;
}

// 식사 타입
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// 식사 타입 레이블
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
};

// 식사 기록 타입
export interface MealRecord {
  id: string;
  userId?: string;
  mealType: MealType; // 아침/점심/저녁/간식
  foods: FoodItem[];
  totalGL: number;
  imageUrl?: string;
  timestamp: Date;
  notes?: string;
  servingSizes?: {[foodId: string]: number}; // 각 음식의 실제 섭취량
}

// 일일 GL 통계 타입
export interface DailyGLStats {
  date: string; // YYYY-MM-DD
  totalGL: number;
  mealCount: number;
  meals: MealRecord[];
  safetyBreakdown: {
    safe: number; // GL ≤ 10인 음식 수
    moderate: number; // GL 11-19인 음식 수
    highRisk: number; // GL ≥ 20인 음식 수
  };
}

// 주간/월간 통계 타입
export interface PeriodStats {
  period: string; // 'week' | 'month'
  startDate: string;
  endDate: string;
  dailyStats: DailyGLStats[];
  averageGL: number;
  totalMeals: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 검색 필터 타입
export interface FoodSearchFilter {
  query?: string;
  categories?: FoodCategory[];
  giRange?: {
    min?: number;
    max?: number;
  };
  glRange?: {
    min?: number;
    max?: number;
  };
  glClassification?: GLClassification[];
}

// 음식 제안 타입
export interface FoodSuggestion {
  id: string;
  nameKo: string;
  nameEn?: string;
  suggestedBy?: string; // 사용자 ID
  glycemicIndex?: number;
  carbohydratesPer100g?: number;
  standardServingSize?: number;
  category?: FoodCategory;
  imageUrl?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // 관리자 ID
}

