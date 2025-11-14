# 사용자 설정 및 프로필 기능 가이드

## 📋 개요

사용자 맞춤 설정 기능은 당뇨 타입, 목표 GL, 알림 설정 등을 관리하고 개인화된 서비스를 제공합니다.

## 🎯 주요 기능

### 1. 프로필 정보
- **당뇨 타입**: 1형/2형/전단계 당뇨 선택
- **목표 일일 GL**: 기본 80, 사용자 조정 가능
- **알림 설정**: 식사 시간 알림, 목표 GL 초과 알림
- **선호/피해야 할 음식**: 음식 ID 목록 관리

### 2. 개인화 기능
- **목표 GL 초과 알림**: 일일 GL이 목표를 초과할 때 알림
- **권장 음식 추천**: 저GL 음식 위주 추천 (향후 구현)
- **혈당 반응 기록**: 개인별 혈당 수치 기록 (옵션)

### 3. 설정 화면
- **프로필 편집**: 이름, 이메일, 당뇨 타입, 목표 GL 수정
- **알림 설정**: 식사 시간, GL 초과 알림 설정
- **데이터 백업/복원**: JSON 형식으로 데이터 백업 및 복원
- **로그인/로그아웃**: 사용자 인증 관리

## 📐 데이터 구조

### UserSettings
```typescript
{
  userId: string;
  dailyGLTarget: number; // 목표 일일 GL
  notifications: {
    mealTimeReminder: boolean;
    glExceedAlert: boolean;
    enabled: boolean;
    mealTimes: {
      breakfast?: string; // "08:00"
      lunch?: string;
      dinner?: string;
      snack?: string;
    };
  };
  preferredFoods: string[]; // 선호 음식 ID 목록
  avoidedFoods: string[]; // 피해야 할 음식 ID 목록
  bloodSugarTracking: {
    enabled: boolean;
    targetRange?: {min: number; max: number};
  };
}
```

### BloodSugarRecord
```typescript
{
  id: string;
  userId: string;
  value: number; // 혈당 수치 (mg/dL)
  mealType?: MealType;
  mealRecordId?: string;
  timestamp: Date;
  notes?: string;
}
```

## 🎨 화면 구성

### ProfileScreen

1. **프로필 헤더**
   - 아바타
   - 사용자 이름, 이메일
   - 당뇨 타입 배지
   - 프로필 편집 버튼

2. **목표 GL 카드**
   - 현재 목표 GL 표시
   - 큰 숫자로 강조

3. **설정 메뉴**
   - 알림 설정 (접기/펼치기)
   - 데이터 백업
   - 데이터 복원
   - 음식 제안
   - 로그아웃

### ProfileEditModal

- 이름, 이메일 편집
- 당뇨 타입 선택
- 목표 일일 GL 설정

### NotificationSettings

- 알림 전체 활성/비활성
- 식사 시간 알림 설정
- 식사 시간 입력 (HH:mm)
- 목표 GL 초과 알림 설정

## 🔧 구현 세부사항

### 파일 구조

```
src/
├── services/
│   ├── userSettingsService.ts  # 사용자 설정 서비스
│   └── notificationService.ts   # 알림 서비스
├── components/
│   ├── ProfileEditModal.tsx     # 프로필 편집 모달
│   └── NotificationSettings.tsx # 알림 설정 컴포넌트
└── screens/
    └── ProfileScreen.tsx        # 프로필 화면
```

### 사용자 설정 서비스

#### 설정 조회/저장
```typescript
const settings = await userSettingsService.getUserSettings(userId);
await userSettingsService.saveUserSettings(settings);
```

#### 목표 GL 업데이트
```typescript
await userSettingsService.updateDailyGLTarget(userId, 70);
```

#### 알림 설정 업데이트
```typescript
await userSettingsService.updateNotificationSettings(userId, {
  mealTimeReminder: true,
  glExceedAlert: true,
});
```

#### 선호/피해야 할 음식
```typescript
await userSettingsService.togglePreferredFood(userId, foodId);
await userSettingsService.toggleAvoidedFood(userId, foodId);
```

### 알림 서비스

#### 알림 초기화
```typescript
notificationService.initialize();
```

#### 식사 시간 알림 설정
```typescript
notificationService.scheduleMealTimeNotifications(settings);
```

#### 목표 GL 초과 알림
```typescript
notificationService.showGLExceedAlert(currentGL, targetGL);
```

### 혈당 기록

#### 기록 저장
```typescript
await userSettingsService.saveBloodSugarRecord({
  userId,
  value: 120,
  mealType: 'lunch',
  timestamp: new Date(),
});
```

#### 기록 조회
```typescript
const records = await userSettingsService.getBloodSugarRecords(userId);
```

### 데이터 백업/복원

#### 백업
```typescript
const backupJson = await userSettingsService.backupAllData(userId);
// Share API로 공유 또는 파일로 저장
```

#### 복원
```typescript
await userSettingsService.restoreData(userId, backupJson);
```

## 🚀 사용 방법

### 프로필 편집
1. **ProfileScreen에서 "프로필 편집" 버튼 클릭**
2. **정보 수정**
3. **저장**

### 알림 설정
1. **"알림 설정" 메뉴 클릭**
2. **알림 활성화 토글**
3. **식사 시간 입력**
4. **자동으로 알림 스케줄링**

### 데이터 백업
1. **"데이터 백업" 메뉴 클릭**
2. **백업 파일 공유 또는 저장**
3. **안전한 곳에 보관**

### 데이터 복원
1. **"데이터 복원" 메뉴 클릭**
2. **백업 파일 선택 또는 붙여넣기**
3. **복원 확인**

## 📊 알림 스케줄

### 식사 시간 알림
- 매일 설정한 시간에 알림
- 반복 알림 (매일)
- 알림 메시지: "아침 식사 시간입니다."

### 목표 GL 초과 알림
- 일일 GL이 목표를 초과할 때 즉시 알림
- 알림 메시지: "목표 GL 초과: 현재 GL: 85 (목표: 80)"

## 🔐 데이터 저장

### AsyncStorage 키
- `@user_settings`: 사용자 설정
- `@blood_sugar_records_{userId}`: 혈당 기록

## 📝 주요 함수

### userSettingsService

```typescript
// 설정 조회
const settings = await userSettingsService.getUserSettings(userId);

// 설정 저장
await userSettingsService.saveUserSettings(settings);

// 목표 GL 업데이트
await userSettingsService.updateDailyGLTarget(userId, 70);

// 알림 설정 업데이트
await userSettingsService.updateNotificationSettings(userId, {...});

// 혈당 기록
await userSettingsService.saveBloodSugarRecord(record);
const records = await userSettingsService.getBloodSugarRecords(userId);

// 백업/복원
const backup = await userSettingsService.backupAllData(userId);
await userSettingsService.restoreData(userId, backup);
```

### notificationService

```typescript
// 초기화
notificationService.initialize();

// 식사 시간 알림 설정
notificationService.scheduleMealTimeNotifications(settings);

// GL 초과 알림
notificationService.showGLExceedAlert(currentGL, targetGL);
```

## 🎯 향후 개선 사항

- [ ] 클라우드 동기화 (설정, 혈당 기록)
- [ ] 권장 음식 추천 알고리즘
- [ ] 혈당 그래프 및 분석
- [ ] 식사 패턴 분석
- [ ] 건강 리포트 생성
- [ ] 소셜 로그인 (Google, Apple)
- [ ] 다중 기기 지원

## 📞 문의

프로필 및 설정 기능 관련 문의사항이 있으시면 이슈를 생성해주세요.

