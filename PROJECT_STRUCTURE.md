# 프로젝트 구조 상세 설명

## 📂 폴더 구조

```
Management-GL/
│
├── src/                          # 소스 코드
│   ├── components/               # 재사용 가능한 UI 컴포넌트
│   │   ├── GLBadge.tsx          # GL 값 표시 배지
│   │   ├── FoodItemCard.tsx     # 음식 아이템 카드
│   │   └── index.ts             # 컴포넌트 export
│   │
│   ├── screens/                  # 화면 컴포넌트
│   │   ├── HomeScreen.tsx       # 홈 화면 (메인)
│   │   ├── CameraScreen.tsx     # 카메라/이미지 분석 화면
│   │   ├── HistoryScreen.tsx    # 식사 기록 조회 화면
│   │   └── ProfileScreen.tsx    # 사용자 프로필 화면
│   │
│   ├── services/                 # API 및 외부 서비스 연동
│   │   ├── aiService.ts         # AI 이미지 분석 (Google Vision, OpenAI)
│   │   ├── foodDatabaseService.ts # 음식 영양 정보 조회
│   │   └── backendService.ts    # 백엔드 API (Supabase/Firebase)
│   │
│   ├── store/                    # Redux 상태 관리
│   │   ├── store.ts             # Redux store 설정
│   │   └── slices/              # Redux slices
│   │       ├── foodSlice.ts     # 음식 관련 상태
│   │       ├── mealSlice.ts     # 식사 기록 상태
│   │       └── userSlice.ts     # 사용자 정보 상태
│   │
│   ├── navigation/               # 네비게이션 설정
│   │   └── AppNavigator.tsx     # 메인 네비게이션 구조
│   │
│   ├── utils/                    # 유틸리티 함수
│   │   └── glCalculator.ts      # GL 계산 및 안전성 판단
│   │
│   ├── hooks/                    # 커스텀 React 훅
│   │   ├── useImagePicker.ts    # 이미지 선택 훅
│   │   └── index.ts             # 훅 export
│   │
│   ├── constants/                # 상수 정의
│   │   └── index.ts             # GL 기준값, 색상, API 엔드포인트 등
│   │
│   └── types/                     # TypeScript 타입 정의
│       └── index.ts             # 모든 타입 정의
│
├── config/                        # 설정 파일
│   └── api.ts                    # API 키 및 설정
│
├── assets/                        # 정적 리소스
│   ├── images/                   # 이미지 파일
│   └── fonts/                    # 폰트 파일
│
├── App.tsx                        # 앱 진입점 (최상위 컴포넌트)
├── index.js                       # 네이티브 진입점
├── package.json                   # 의존성 및 스크립트
├── tsconfig.json                  # TypeScript 설정
├── babel.config.js                # Babel 설정
├── metro.config.js                # Metro 번들러 설정
├── jest.config.js                 # Jest 테스트 설정
└── README.md                      # 프로젝트 문서
```

## 🔄 데이터 흐름

### 1. 이미지 분석 플로우
```
사용자 이미지 선택/촬영
    ↓
CameraScreen → useImagePicker
    ↓
dispatch(analyzeFoodImage(imageUri))
    ↓
foodSlice → aiService.analyzeFoodImage()
    ↓
AI API 호출 (Google Vision / OpenAI)
    ↓
foodDatabaseService.getMultipleFoodNutritionInfo()
    ↓
영양 정보 조회 및 GL 계산
    ↓
Redux store 업데이트
    ↓
UI 업데이트 (GL 표시)
```

### 2. 식사 기록 저장 플로우
```
사용자가 분석 결과 확인
    ↓
식사 기록 저장 버튼 클릭
    ↓
dispatch(saveMealRecord(mealData))
    ↓
mealSlice → backendService.saveMealRecord()
    ↓
백엔드 API 호출 (Supabase/Firebase)
    ↓
데이터베이스 저장
    ↓
Redux store 업데이트
```

## 🎯 주요 파일 설명

### App.tsx
- 앱의 최상위 컴포넌트
- Redux Provider, Navigation Container 설정
- SafeAreaProvider로 안전 영역 처리

### services/aiService.ts
- AI 이미지 분석 서비스
- Google Vision API 및 OpenAI Vision API 지원
- 음식 인식 및 객체 탐지

### services/foodDatabaseService.ts
- 음식 영양 정보 데이터베이스 조회
- Supabase/Firebase 연동
- GL 계산에 필요한 GI, 탄수화물 정보 제공

### utils/glCalculator.ts
- GL 계산 로직
- 안전성 레벨 판단
- 총 GL 계산

### store/slices/foodSlice.ts
- 음식 분석 결과 상태 관리
- 이미지 분석 비동기 액션
- 인식된 음식 목록 관리

## 🔌 API 연동 포인트

### AI 서비스
- `src/services/aiService.ts`의 `analyzeFoodImage()` 메서드
- Google Vision API 또는 OpenAI Vision API 선택 가능

### 백엔드
- `src/services/backendService.ts`: 식사 기록 저장/조회
- `src/services/foodDatabaseService.ts`: 음식 영양 정보 조회

### 설정
- `config/api.ts`: 모든 API 키 및 엔드포인트 설정
- 환경 변수로 관리 권장

## 📱 화면 구성

1. **HomeScreen**: 메인 화면, 카메라 버튼
2. **CameraScreen**: 이미지 촬영/선택, 분석 결과 표시
3. **HistoryScreen**: 과거 식사 기록 조회
4. **ProfileScreen**: 사용자 정보 및 설정

## 🎨 스타일링

- StyleSheet 사용 (React Native 기본)
- `src/constants/index.ts`에 색상 상수 정의
- GL 안전성에 따른 색상 매핑

## 🔐 보안 고려사항

- API 키는 환경 변수로 관리
- `.env` 파일은 `.gitignore`에 포함
- 프로덕션 빌드 시 환경 변수 안전하게 주입

