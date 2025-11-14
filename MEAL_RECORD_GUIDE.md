# 식사 기록 및 통계 기능 가이드

## 📋 개요

식사 기록 및 통계 기능은 사용자가 촬영한 음식을 식사 기록으로 저장하고, 일일/주간/월간 GL 통계를 확인할 수 있는 기능입니다.

## 🎯 주요 기능

### 1. 식사 기록 저장
- 촬영한 음식을 식사 기록으로 저장
- 식사 타입 선택 (아침/점심/저녁/간식)
- 메모 추가 (선택)
- 로컬 스토리지 (AsyncStorage)에 저장

### 2. 일일 GL 통계
- 일일 총 GL 계산 및 표시
- 목표 GL (80 이하) 대비 진행률 표시
- GL 진행바 (0-80 목표, 80+ 초과 경고)
- 안전/위험/매우위험 음식 섭취 비율

### 3. 주간/월간 통계
- 주간/월간 GL 추이 그래프
- 평균 일일 GL 계산
- 목표 달성 일수 계산
- 안전도별 섭취 비율 차트

### 4. 캘린더 뷰
- 식사 기록이 있는 날짜 표시
- 날짜별 GL 값에 따른 색상 표시
- 날짜 선택 시 해당 날짜의 식사 목록 표시

## 📐 목표 GL 기준

- **일일 목표 GL**: 80 이하
- **안전**: GL ≤ 10
- **위험**: GL 11-19
- **매우 위험**: GL ≥ 20

## 🎨 화면 구성

### HistoryScreen

1. **뷰 모드 선택**
   - 일별 / 주간 / 월간

2. **캘린더 뷰**
   - 식사 기록이 있는 날짜 표시
   - GL 값에 따른 색상 표시

3. **일일 GL 진행바** (일별 모드)
   - 현재 GL / 목표 GL (80)
   - 진행률 표시
   - 목표 초과 경고

4. **GL 추이 차트** (주간/월간 모드)
   - 일별 GL 추이 선 그래프
   - 목표선 표시

5. **안전도 비율 차트** (월간 모드)
   - 안전/위험/매우위험 비율 파이 차트

6. **식사 목록** (일별 모드)
   - 선택된 날짜의 식사 목록
   - 식사 타입, 시간, 음식 목록, 총 GL 표시
   - 삭제 기능

7. **요약 정보** (주간/월간 모드)
   - 평균 일일 GL
   - 총 식사 수

## 🔧 구현 세부사항

### 파일 구조

```
src/
├── services/
│   └── mealRecordService.ts      # 식사 기록 저장/조회 서비스
├── utils/
│   └── statistics.ts             # 통계 계산 유틸리티
├── components/
│   ├── CalendarView.tsx           # 캘린더 컴포넌트
│   ├── GLProgressBar.tsx         # GL 진행바
│   ├── GLTrendChart.tsx          # GL 추이 차트
│   ├── SafetyRatioChart.tsx      # 안전도 비율 차트
│   ├── StatisticsChart.tsx       # 통계 차트 래퍼
│   └── SaveMealModal.tsx         # 식사 저장 모달
└── screens/
    └── HistoryScreen.tsx         # 기록 화면
```

### 데이터 저장

#### AsyncStorage 구조
```typescript
{
  "@meal_records": [
    {
      "id": "meal_1234567890_abc123",
      "mealType": "lunch",
      "foods": [...],
      "totalGL": 25,
      "timestamp": "2024-01-15T12:00:00.000Z",
      "notes": "점심 식사"
    }
  ]
}
```

### 통계 계산

#### 일일 통계
```typescript
{
  date: "2024-01-15",
  totalGL: 65,
  mealCount: 3,
  meals: [...],
  safetyBreakdown: {
    safe: 5,
    moderate: 2,
    highRisk: 1
  }
}
```

#### 주간/월간 통계
```typescript
{
  period: "week" | "month",
  startDate: "2024-01-15",
  endDate: "2024-01-21",
  dailyStats: [...],
  averageGL: 72.5,
  totalMeals: 21
}
```

## 🚀 사용 방법

### 식사 기록 저장

1. **카메라 화면에서 음식 촬영**
2. **음식 인식 및 GL 계산**
3. **"식사 기록 저장" 버튼 클릭**
4. **식사 타입 선택** (아침/점심/저녁/간식)
5. **메모 입력** (선택)
6. **저장 버튼 클릭**

### 통계 확인

1. **History 탭으로 이동**
2. **뷰 모드 선택** (일별/주간/월간)
3. **캘린더에서 날짜 선택** (일별 모드)
4. **통계 및 차트 확인**

## 📊 차트 종류

### 1. GL 추이 차트 (Line Chart)
- 주간/월간 일별 GL 추이
- 목표선 표시 (80)
- 영역 그래프로 시각화

### 2. 안전도 비율 차트 (Pie Chart)
- 안전/위험/매우위험 비율
- 색상으로 구분
- 비율 퍼센트 표시

## 🔐 데이터 관리

### 로컬 저장
- AsyncStorage 사용
- 앱 삭제 시 데이터 삭제

### 클라우드 백업 (향후 구현)
- Supabase/Firebase 연동
- 사용자별 데이터 동기화
- 다중 기기 지원

## 📝 주요 함수

### mealRecordService

```typescript
// 식사 기록 저장
await mealRecordService.saveMealRecord({
  mealType: 'lunch',
  foods: [...],
  notes: '점심 식사'
});

// 일일 통계 조회
const stats = await mealRecordService.getDailyGLStats(date);

// 주간 통계 조회
const weeklyStats = await mealRecordService.getWeeklyStats(startDate);

// 월간 통계 조회
const monthlyStats = await mealRecordService.getMonthlyStats(year, month);
```

### 통계 유틸리티

```typescript
// 일일 진행률 계산
const progress = calculateDailyProgress(currentGL, targetGL);

// 안전도 비율 계산
const ratio = calculateSafetyRatio(dailyStats);

// GL 추이 데이터 생성
const trendData = generateGLTrendData(periodStats);
```

## 🎯 향후 개선 사항

- [ ] 클라우드 백업 기능
- [ ] 데이터 내보내기 (CSV, PDF)
- [ ] 목표 GL 사용자 설정
- [ ] 알림 기능 (목표 초과 시)
- [ ] 식사 패턴 분석
- [ ] 건강 리포트 생성

## 📞 문의

식사 기록 및 통계 기능 관련 문의사항이 있으시면 이슈를 생성해주세요.

