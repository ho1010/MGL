# GL 계산 및 분석 화면 가이드

## 📋 개요

GL 계산 화면은 음식의 혈당부하지수(Glycemic Load)를 계산하고 시각적으로 표시하는 화면입니다. 사용자가 섭취량을 조절하면 실시간으로 GL 값이 재계산됩니다.

## 🎯 주요 기능

### 1. 음식 정보 표시
- 음식 이미지 썸네일
- 한글/영문 음식명
- GI 값, 탄수화물 함량, 카테고리

### 2. 섭취량 조절
- 슬라이더로 10g ~ 500g 범위에서 조절
- 기본값: 표준 섭취량
- 실시간 값 표시

### 3. GL 계산 및 표시
- 계산 공식: `GL = (GI × 1회 섭취량의 탄수화물 g) ÷ 100`
- 큰 숫자로 강조 표시
- 계산 과정 표시

### 4. 안전도 표시
- 색상 코드:
  - 🟢 초록색: 안전 (GL ≤ 10)
  - 🟡 노란색: 위험 (GL 11~19)
  - 🔴 빨간색: 매우 위험 (GL ≥ 20)
- 안전도 텍스트 및 메시지

### 5. 애니메이션 효과
- GL 값 카운트업 애니메이션
- 색상 전환 애니메이션
- 스케일 펄스 효과

## 📐 계산 공식

```
GL = (GI × 1회 섭취량의 탄수화물 g) ÷ 100
```

### 단계별 계산
1. **1회 섭취량의 탄수화물 계산**
   ```
   섭취량의 탄수화물 = (100g당 탄수화물 × 섭취량) ÷ 100
   ```

2. **GL 계산**
   ```
   GL = (GI × 섭취량의 탄수화물) ÷ 100
   ```

### 예시
- GI: 50
- 100g당 탄수화물: 20g
- 섭취량: 150g

```
섭취량의 탄수화물 = (20 × 150) ÷ 100 = 30g
GL = (50 × 30) ÷ 100 = 15
```

## 🎨 화면 구성

### 상단 영역
- 음식 이미지 썸네일
- 음식명 (한글/영문)

### 정보 카드
- GI 값
- 탄수화물 함량 (100g당)
- 카테고리

### 섭취량 조절 영역
- 슬라이더
- 현재 섭취량 표시
- 섭취량 기준 탄수화물 표시

### GL 결과 카드
- GL 값 (큰 숫자)
- 계산 공식
- 계산 과정

### 안전도 표시
- 색상 배지
- 안전도 텍스트
- 안전도 메시지

### 상세 정보
- 계산된 GL
- 섭취량
- 섭취량 기준 탄수화물
- 섭취량 기준 칼로리 (있는 경우)

## 🔄 실시간 재계산

슬라이더를 조절하면:
1. 섭취량 값 업데이트
2. 섭취량 기준 탄수화물 재계산
3. GL 값 재계산
4. 안전도 레벨 재평가
5. 애니메이션 효과 적용

## 🎬 애니메이션 효과

### 1. GL 값 카운트업
- 이전 값에서 새 값으로 부드럽게 증가/감소
- 500ms 동안 30단계로 애니메이션

### 2. 색상 전환
- 안전도 레벨에 따라 배경색 전환
- 300ms 동안 부드럽게 전환

### 3. 스케일 펄스
- 값 변경 시 1.1배 확대 후 원래 크기로 복귀
- 300ms 동안 애니메이션

## 🚀 사용 방법

### 프로그래밍 방식

```typescript
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const navigation = useNavigation<NavigationProp>();

// GL 계산 화면으로 이동
navigation.navigate('GLCalculation', {
  food: foodItem, // FoodItem 타입
});
```

### FoodItemCard 클릭
- `FoodItemCard` 컴포넌트를 클릭하면 자동으로 GL 계산 화면으로 이동합니다.

## 📱 네비게이션

### 화면 추가
`AppNavigator.tsx`에 이미 추가되어 있습니다:

```typescript
<Stack.Screen
  name="GLCalculation"
  component={GLCalculationScreen}
  options={{title: 'GL 계산'}}
/>
```

### 파라미터
```typescript
type RootStackParamList = {
  GLCalculation: {food: FoodItem};
};
```

## 🎯 안전도 기준

| GL 값 | 분류 | 색상 | 설명 |
|-------|------|------|------|
| ≤ 10 | SAFE | 🟢 초록 | 안전 (저혈당부하) |
| 11~19 | MODERATE | 🟡 노랑 | 위험 (중혈당부하) |
| ≥ 20 | HIGH_RISK | 🔴 빨강 | 매우 위험 (고혈당부하) |

## 🔧 커스터마이징

### 슬라이더 범위 조정
`GLCalculationScreen.tsx`에서:

```typescript
<Slider
  minimumValue={10}  // 최소값
  maximumValue={500}  // 최대값
  step={10}           // 단계
  // ...
/>
```

### 애니메이션 속도 조정
```typescript
const duration = 500;  // 애니메이션 지속 시간 (ms)
const steps = 30;      // 애니메이션 단계 수
```

## 📦 필요한 패키지

- `@react-native-community/slider`: 슬라이더 컴포넌트
- `react-native`: 기본 컴포넌트
- `@react-navigation/native`: 네비게이션

## 🐛 문제 해결

### 슬라이더가 작동하지 않음
- `@react-native-community/slider` 패키지 설치 확인
- iOS의 경우 `pod install` 실행

### 애니메이션이 부드럽지 않음
- `steps` 값을 증가시키면 더 부드러워집니다
- `duration` 값을 조정하여 속도 변경

### GL 값이 정확하지 않음
- 계산 공식 확인
- 섭취량과 탄수화물 값 확인

## 📝 TODO

- [ ] 여러 음식 동시 계산 기능
- [ ] 계산 결과 저장 기능
- [ ] 히스토리 연동
- [ ] 공유 기능

## 📞 문의

GL 계산 화면 관련 문의사항이 있으시면 이슈를 생성해주세요.

