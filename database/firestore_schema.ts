/**
 * Firebase Firestore 스키마 정의
 * Management GL - 음식 데이터베이스
 */

import {FoodCategory, GLClassification} from '../src/types';

// Firestore 컬렉션 이름
export const COLLECTIONS = {
  FOODS: 'foods',
  MEAL_RECORDS: 'meal_records',
  USERS: 'users',
} as const;

// Firestore 음식 문서 인터페이스
export interface FirestoreFoodDocument {
  nameKo: string; // 한글 음식명
  nameEn: string; // 영문 음식명
  glycemicIndex: number; // GI (혈당지수)
  carbohydratesPer100g: number; // 100g당 탄수화물 함량 (g)
  standardServingSize: number; // 1회 표준 섭취량 (g)
  calculatedGL: number; // 계산된 GL 값
  category: FoodCategory; // 음식 카테고리
  glClassification: GLClassification; // GL 분류
  imageUrl?: string; // 이미지 URL
  caloriesPer100g?: number; // 100g당 칼로리
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Firestore 인덱스 설정 (firestore.indexes.json에 추가 필요)
export const FIRESTORE_INDEXES = {
  foods: [
    {
      collectionGroup: 'foods',
      queryScope: 'COLLECTION',
      fields: [
        {fieldPath: 'category', order: 'ASCENDING'},
        {fieldPath: 'calculatedGL', order: 'ASCENDING'},
      ],
    },
    {
      collectionGroup: 'foods',
      queryScope: 'COLLECTION',
      fields: [
        {fieldPath: 'glClassification', order: 'ASCENDING'},
        {fieldPath: 'calculatedGL', order: 'ASCENDING'},
      ],
    },
    {
      collectionGroup: 'foods',
      queryScope: 'COLLECTION',
      fields: [
        {fieldPath: 'nameKo', order: 'ASCENDING'},
      ],
    },
  ],
};

// Firestore 보안 규칙 예시 (firestore.rules에 추가)
export const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 음식 데이터는 모든 사용자가 읽기 가능
    match /foods/{foodId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // 식사 기록은 본인만 접근 가능
    match /meal_records/{recordId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // 사용자 정보는 본인만 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
`;

// GL 계산 헬퍼 함수 (Firestore Functions에서 사용)
export function calculateGL(
  gi: number,
  carbsPer100g: number,
  servingSize: number,
): number {
  const carbsInServing = (carbsPer100g * servingSize) / 100;
  return Math.round((gi * carbsInServing) / 100);
}

// GL 분류 헬퍼 함수
export function getGLClassification(gl: number): GLClassification {
  if (gl <= 10) {
    return 'SAFE';
  } else if (gl < 20) {
    return 'MODERATE';
  } else {
    return 'HIGH_RISK';
  }
}

