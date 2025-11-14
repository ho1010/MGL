# 음식 데이터베이스 및 검색 기능 가이드

## 📋 개요

음식 데이터베이스 검색 및 관리 기능은 사용자가 음식을 검색하고, 필터링하며, 즐겨찾기와 최근 조회 기능을 제공합니다.

## 🎯 주요 기능

### 1. 음식 검색
- **자동완성**: 입력 시 실시간 자동완성 제안
- **다중 검색**: 한글명, 영문명으로 검색 가능
- **관련도 정렬**: 검색어와의 유사도에 따라 정렬

### 2. 필터링
- **카테고리 필터**: 16개 카테고리 (곡물, 채소, 과일, 한식, 서양식, 중식, 일식 등)
- **GI 범위 필터**: 최소/최대 GI 값 설정
- **GL 범위 필터**: 최소/최대 GL 값 설정
- **GL 분류 필터**: 안전/위험/매우위험 선택

### 3. 즐겨찾기
- 음식 카드에서 즐겨찾기 추가/제거
- 즐겨찾기 탭에서 모아보기
- 로컬 스토리지에 저장

### 4. 최근 조회
- 최근 조회한 음식 목록 (최대 50개)
- 자동 저장 및 표시

### 5. 음식 제안
- 사용자가 새로운 음식 정보 제안 가능
- 관리자 승인 후 데이터베이스 추가
- 제안 상태 추적 (대기/승인/거부)

## 📐 데이터베이스 구조

### 음식 데이터
- **500개 이상**의 한국 음식 포함
- 다양한 카테고리:
  - 한식 (김치볶음밥, 비빔밥, 불고기 등)
  - 서양식 (파스타, 피자, 햄버거 등)
  - 중식 (짜장면, 짬뽕, 탕수육 등)
  - 일식 (초밥, 라멘, 우동 등)
  - 가공식품 (라면, 햄, 소시지 등)
  - 외식메뉴 (치킨, 족발 등)

### 필드 구조
```typescript
{
  id: string;
  nameKo: string;        // 한글명
  nameEn: string;        // 영문명
  glycemicIndex: number; // GI 값
  carbohydratesPer100g: number; // 100g당 탄수화물
  standardServingSize: number;  // 표준 섭취량
  calculatedGL: number;  // 계산된 GL
  category: FoodCategory; // 카테고리
  glClassification: 'SAFE' | 'MODERATE' | 'HIGH_RISK';
}
```

## 🎨 화면 구성

### SearchScreen

1. **검색 헤더**
   - 자동완성 입력창
   - 필터 버튼 (활성 필터 개수 표시)

2. **탭 선택**
   - 검색: 검색 결과 표시
   - 즐겨찾기: 즐겨찾기 목록
   - 최근 조회: 최근 조회한 음식

3. **검색 결과**
   - 음식 카드 목록
   - 즐겨찾기 버튼
   - GL 계산 화면으로 이동

4. **빈 상태**
   - 검색 결과 없음
   - 최근 검색어 표시

## 🔧 구현 세부사항

### 파일 구조

```
src/
├── services/
│   ├── searchService.ts          # 검색 서비스
│   └── foodSuggestionService.ts  # 음식 제안 서비스
├── components/
│   ├── AutocompleteInput.tsx     # 자동완성 입력
│   ├── FoodFilter.tsx            # 필터 컴포넌트
│   └── FoodSuggestionModal.tsx   # 음식 제안 모달
└── screens/
    └── SearchScreen.tsx          # 검색 화면
```

### 검색 서비스

#### `searchService.searchFoods(filter)`
```typescript
const results = await searchService.searchFoods({
  query: '김치',
  categories: ['한식'],
  giRange: {min: 0, max: 50},
  glRange: {min: 0, max: 10},
  glClassification: ['SAFE'],
});
```

#### `searchService.getAutocompleteSuggestions(query)`
```typescript
const suggestions = await searchService.getAutocompleteSuggestions('김치', 10);
```

### 즐겨찾기 서비스

#### 즐겨찾기 추가/제거
```typescript
await searchService.addFavorite(foodId);
await searchService.removeFavorite(foodId);
const favorites = await searchService.getFavorites();
```

### 최근 조회 서비스

#### 최근 조회 저장/조회
```typescript
await searchService.saveRecentFood(foodId);
const recentFoods = await searchService.getRecentFoods();
```

### 음식 제안 서비스

#### 제안 제출
```typescript
await foodSuggestionService.submitSuggestion({
  nameKo: '새로운 음식',
  nameEn: 'New Food',
  glycemicIndex: 50,
  carbohydratesPer100g: 25,
  category: '한식',
});
```

## 🚀 사용 방법

### 검색
1. **SearchScreen으로 이동**
2. **검색어 입력** (자동완성 제안 표시)
3. **필터 적용** (선택)
4. **결과 확인 및 선택**

### 필터링
1. **필터 버튼 클릭**
2. **카테고리 선택**
3. **GI/GL 범위 설정**
4. **GL 분류 선택**
5. **적용 버튼 클릭**

### 즐겨찾기
1. **음식 카드의 하트 아이콘 클릭**
2. **즐겨찾기 탭에서 확인**

### 음식 제안
1. **ProfileScreen에서 "음식 제안" 버튼 클릭**
2. **음식 정보 입력**
3. **제출**
4. **관리자 검토 후 데이터베이스 추가**

## 📊 데이터 생성

### 확장된 데이터 생성
```bash
node scripts/generate_food_data.js
```

이 스크립트는 `database/extended_food_data.json` 파일을 생성합니다.

## 🔐 데이터 저장

### 로컬 저장
- **AsyncStorage** 사용
- 최근 검색어: `@recent_searches`
- 즐겨찾기: `@favorite_foods`
- 최근 조회: `@recent_foods`
- 음식 제안: `@food_suggestions`

## 📝 주요 함수

### searchService

```typescript
// 검색
const results = await searchService.searchFoods(filter);

// 자동완성
const suggestions = await searchService.getAutocompleteSuggestions(query, 10);

// 즐겨찾기
await searchService.addFavorite(foodId);
await searchService.removeFavorite(foodId);
const favorites = await searchService.getFavorites();

// 최근 조회
await searchService.saveRecentFood(foodId);
const recentFoods = await searchService.getRecentFoods();
```

### foodSuggestionService

```typescript
// 제안 제출
await foodSuggestionService.submitSuggestion(suggestion);

// 제안 조회
const suggestions = await foodSuggestionService.getAllSuggestions();
const pending = await foodSuggestionService.getPendingSuggestions();

// 제안 승인/거부 (관리자)
await foodSuggestionService.approveSuggestion(id, adminId);
await foodSuggestionService.rejectSuggestion(id, adminId);
```

## 🎯 향후 개선 사항

- [ ] 클라우드 동기화 (즐겨찾기, 최근 조회)
- [ ] 검색 히스토리 분석
- [ ] 인기 검색어 표시
- [ ] 음식 비교 기능
- [ ] 음식 공유 기능
- [ ] 관리자 대시보드 (제안 승인)

## 📞 문의

검색 기능 관련 문의사항이 있으시면 이슈를 생성해주세요.

