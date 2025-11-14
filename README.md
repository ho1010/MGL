# Management GL - 당뇨 관리 모바일 앱

음식 사진을 찍으면 혈당부하지수(GL)를 자동으로 분석하여 표시하는 당뇨 관리 모바일 앱입니다.

## 📱 주요 기능

- **음식 이미지 인식**: 카메라로 음식을 촬영하거나 갤러리에서 선택하여 AI로 음식 인식
- **혈당부하지수(GL) 자동 계산**: 인식된 음식의 영양 정보를 기반으로 GL 자동 계산
- **안전성 판단**: GL 값에 따라 안전/주의/경고 레벨 표시
- **식사 기록**: 분석한 음식 정보를 기록하여 관리
- **히스토리 조회**: 과거 식사 기록 조회

## 🛠 기술 스택

### 프론트엔드
- **React Native 0.72.6**: 크로스 플랫폼 모바일 앱 개발
- **TypeScript**: 타입 안정성 보장
- **Redux Toolkit**: 상태 관리
- **React Navigation**: 네비게이션 관리

### AI 및 이미지 처리
- **Google Vision API**: 음식 이미지 인식 (선택)
- **OpenAI Vision API**: 음식 이미지 인식 (선택)
- **react-native-image-picker**: 이미지 선택 및 촬영

### 백엔드
- **Supabase**: 백엔드 및 데이터베이스 (선택)
- **Firebase**: 백엔드 및 데이터베이스 (선택)
- **Axios**: HTTP 클라이언트

## 📁 프로젝트 구조

```
Management-GL/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── GLBadge.tsx      # GL 배지 컴포넌트
│   │   └── FoodItemCard.tsx # 음식 아이템 카드
│   ├── screens/             # 화면 컴포넌트
│   │   ├── HomeScreen.tsx   # 홈 화면
│   │   ├── CameraScreen.tsx # 카메라/분석 화면
│   │   ├── HistoryScreen.tsx # 기록 화면
│   │   └── ProfileScreen.tsx # 프로필 화면
│   ├── services/            # API 서비스
│   │   ├── aiService.ts     # AI 이미지 분석 서비스
│   │   ├── foodDatabaseService.ts # 음식 데이터베이스 서비스
│   │   └── backendService.ts # 백엔드 서비스
│   ├── store/               # Redux 상태 관리
│   │   ├── store.ts         # Redux store 설정
│   │   └── slices/          # Redux slices
│   │       ├── foodSlice.ts
│   │       ├── mealSlice.ts
│   │       └── userSlice.ts
│   ├── navigation/          # 네비게이션 설정
│   │   └── AppNavigator.tsx
│   ├── utils/               # 유틸리티 함수
│   │   └── glCalculator.ts  # GL 계산 유틸리티
│   ├── hooks/               # 커스텀 훅
│   │   └── useImagePicker.ts
│   ├── constants/           # 상수 정의
│   │   └── index.ts
│   └── types/               # TypeScript 타입 정의
│       └── index.ts
├── config/                   # 설정 파일
│   └── api.ts               # API 설정
├── assets/                   # 이미지, 폰트 등 리소스
├── App.tsx                   # 앱 진입점
├── index.js                  # 네이티브 진입점
├── package.json
├── tsconfig.json
└── babel.config.js
```

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18
- React Native 개발 환경 설정
  - Android: Android Studio
  - iOS: Xcode (macOS만)

### 설치

1. **의존성 설치**
   ```bash
   cd Management-GL
   npm install
   # 또는
   yarn install
   ```

2. **iOS 의존성 설치** (iOS만)
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **환경 변수 설정**
   
   `.env` 파일을 생성하고 다음 변수들을 설정하세요:
   ```
   API_BASE_URL=https://your-api-url.com
   API_KEY=your-api-key
   GOOGLE_VISION_API_KEY=your-google-vision-key
   OPENAI_API_KEY=your-openai-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-key
   ```

4. **앱 실행**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## 🔧 설정

### AI 서비스 선택

`src/services/aiService.ts`에서 사용할 AI 서비스를 선택할 수 있습니다:

- **Google Vision API**: `analyzeWithGoogleVision()` 메서드 사용
- **OpenAI Vision API**: `analyzeWithOpenAI()` 메서드 사용

### 백엔드 선택

`src/services/backendService.ts`와 `src/services/foodDatabaseService.ts`에서 백엔드 서비스를 설정할 수 있습니다:

- **Supabase**: `@supabase/supabase-js` 사용
- **Firebase**: `@react-native-firebase/app` 사용

## 📦 주요 패키지

### 핵심 의존성
- `react-native`: 0.72.6
- `@react-navigation/native`: 네비게이션
- `@reduxjs/toolkit`: 상태 관리
- `axios`: HTTP 클라이언트

### 이미지 처리
- `react-native-image-picker`: 이미지 선택/촬영
- `react-native-camera`: 카메라 기능 (선택)

### 백엔드
- `@supabase/supabase-js`: Supabase 클라이언트
- `@react-native-async-storage/async-storage`: 로컬 스토리지

### UI
- `react-native-vector-icons`: 아이콘
- `react-native-safe-area-context`: Safe Area 처리

## 🧮 GL (혈당부하지수) 계산

GL은 다음 공식으로 계산됩니다:

```
GL = (GI × 탄수화물(g)) / 100
```

### GL 안전성 기준
- **안전 (SAFE)**: GL ≤ 10
- **주의 (MODERATE)**: 10 < GL < 20
- **경고 (HIGH_RISK)**: GL ≥ 20

## 🔐 보안

- API 키는 환경 변수로 관리하세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- 프로덕션 빌드 시 환경 변수를 안전하게 관리하세요

## 🌐 웹 데모

GitHub Pages에서 프로젝트 소개 페이지를 확인할 수 있습니다:
👉 [https://ho1010.github.io/MGL/](https://ho1010.github.io/MGL/)

## 📝 TODO

- [ ] 실제 AI API 연동 (Google Vision / OpenAI Vision)
- [ ] 음식 영양 데이터베이스 구축 및 연동
- [ ] Supabase/Firebase 백엔드 연동
- [ ] 사용자 인증 구현
- [ ] 식사 기록 상세 화면 구현
- [ ] 통계 및 차트 기능 추가
- [ ] 푸시 알림 기능
- [ ] 다국어 지원

## 🤝 기여

프로젝트에 기여하고 싶으시다면 이슈를 생성하거나 Pull Request를 보내주세요.
