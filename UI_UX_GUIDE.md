# UI/UX 개선 및 디자인 시스템 가이드

## 📋 개요

앱의 전체 UI/UX를 개선하여 깔끔하고 직관적인 인터페이스를 제공하며, 중장년층을 고려한 큰 글씨와 명확한 아이콘을 사용합니다.

## 🎨 디자인 시스템

### 색상 코드

#### 안전도 색상
- **안전 (초록)**: `#4CAF50` - GL 10 이하
- **위험 (노랑)**: `#FFC107` - GL 11-19
- **매우 위험 (빨강)**: `#F44336` - GL 20 이상

#### 기본 색상
- **Primary**: `#4A90E2` (파란색)
- **Background**: 라이트 모드 `#F5F5F5`, 다크 모드 `#121212`
- **Surface**: 라이트 모드 `#FFFFFF`, 다크 모드 `#1E1E1E`
- **Text Primary**: 라이트 모드 `#212121`, 다크 모드 `#FFFFFF`
- **Text Secondary**: 라이트 모드 `#757575`, 다크 모드 `#B0B0B0`

### 타이포그래피

중장년층을 고려한 큰 글씨:

- **Display**: 64px (GL 값 등 큰 숫자)
- **H1**: 32px (메인 타이틀)
- **H2**: 28px (서브 타이틀)
- **H3**: 24px (섹션 타이틀)
- **Body Large**: 18px (본문, 중장년층 고려)
- **Body**: 16px (일반 본문)
- **Caption**: 12px (작은 설명)

### 간격 시스템

8px 기준 그리드 시스템:

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 40px
- **xxxl**: 48px

### 그림자

Material Design Elevation 기반:

- **sm**: 작은 그림자 (카드)
- **md**: 중간 그림자 (버튼)
- **lg**: 큰 그림자 (모달)
- **xl**: 매우 큰 그림자 (플로팅 버튼)

## 🌓 다크 모드

### 지원 기능
- 시스템 설정 자동 감지
- 수동 전환 (설정 화면)
- AsyncStorage에 저장
- 모든 화면 자동 적용

### 사용 방법
```typescript
import {useTheme} from '../contexts/ThemeContext';

const MyComponent = () => {
  const {theme, toggleTheme} = useTheme();
  
  return (
    <View style={{backgroundColor: theme.colors.BACKGROUND}}>
      <Text style={{color: theme.colors.TEXT_PRIMARY}}>텍스트</Text>
    </View>
  );
};
```

## 🎬 애니메이션

### GL 값 카운팅 애니메이션
- 숫자가 0에서 목표값까지 부드럽게 증가
- 스프링 애니메이션으로 자연스러운 움직임
- `AnimatedGLValue` 컴포넌트 사용

### 색상 전환 애니메이션
- 안전도에 따라 배경색이 부드럽게 전환
- 초록 → 노랑 → 빨강
- `ColorTransitionView` 컴포넌트 사용

### 버튼 프레스 애니메이션
- 버튼을 누를 때 스케일 다운 효과
- 놓을 때 스프링으로 원래 크기로 복귀

### 화면 전환 효과
- React Navigation 기본 전환 효과
- 페이드 인/아웃 효과

## 📱 주요 화면 개선

### 1. 홈 화면

**개선 사항:**
- 카메라 버튼 중앙 배치 및 크기 확대
- 큰 아이콘 (64px)
- 명확한 텍스트 (24px)
- 안전도 가이드 추가
- GL 공식 표시

**레이아웃:**
```
[헤더]
  - 타이틀 (36px)
  - 서브타이틀 (18px)

[메인 버튼]
  - 카메라 버튼 (큰 원형)
  - 검색 버튼 (보조)

[안전도 가이드]
  - 초록/노랑/빨강 표시

[정보 섹션]
  - GL 설명
```

### 2. GL 계산 화면

**개선 사항:**
- GL 값 대형 표시 (64px)
- 색상 전환 애니메이션
- 숫자 카운팅 애니메이션
- 큰 슬라이더 (50px 높이)
- 아이콘으로 정보 시각화

**레이아웃:**
```
[음식 이미지]
[음식명]

[정보 카드]
  - GI, 탄수화물, 카테고리

[섭취량 슬라이더]
  - 큰 숫자 표시 (48px)

[GL 결과 카드]
  - 큰 GL 값 (64px)
  - 색상 전환 애니메이션

[안전도 배지]
[섭취 제안]
```

### 3. 기록 화면

**개선 사항:**
- 캘린더 크기 확대
- 식사 목록 카드 개선
- 큰 글씨 (18px)
- 명확한 아이콘

### 4. 검색 화면

**개선 사항:**
- 큰 검색 입력창
- 필터 버튼 강조
- 음식 카드 개선
- 탭 크기 확대

### 5. 설정 화면

**개선 사항:**
- 프로필 헤더 개선
- 목표 GL 큰 숫자 표시 (64px)
- 테마 토글 추가
- 메뉴 항목 크기 확대

## 🎯 접근성 개선

### 중장년층 고려 사항

1. **큰 글씨**
   - 최소 16px (본문)
   - 중요 정보 18-24px
   - GL 값 64px

2. **명확한 아이콘**
   - 최소 24px
   - 주요 버튼 48-64px
   - 색상 대비 강화

3. **넓은 터치 영역**
   - 버튼 최소 44x44px
   - 메뉴 항목 최소 48px 높이

4. **명확한 색상 구분**
   - 초록/노랑/빨강 명확히 구분
   - 텍스트와 배경 대비 강화

## 🔧 구현 세부사항

### 파일 구조

```
src/
├── theme/
│   ├── colors.ts          # 색상 시스템
│   ├── typography.ts      # 타이포그래피
│   ├── spacing.ts         # 간격 시스템
│   ├── shadows.ts         # 그림자
│   └── index.ts           # 테마 통합
├── contexts/
│   └── ThemeContext.tsx   # 테마 컨텍스트
└── components/
    ├── AnimatedGLValue.tsx      # GL 값 애니메이션
    ├── ColorTransitionView.tsx  # 색상 전환
    └── ThemeToggle.tsx          # 테마 토글
```

### 테마 사용 예시

```typescript
import {useTheme} from '../contexts/ThemeContext';

const MyComponent = () => {
  const {theme} = useTheme();
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.SURFACE,
        padding: theme.spacing.md,
        ...theme.shadows.md,
      }}>
      <Text
        style={{
          color: theme.colors.TEXT_PRIMARY,
          ...theme.typography.h3,
        }}>
        제목
      </Text>
    </View>
  );
};
```

### 애니메이션 사용 예시

```typescript
// GL 값 애니메이션
<AnimatedGLValue value={gl} size="large" />

// 색상 전환
<ColorTransitionView
  fromColor="#4CAF50"
  toColor="#FFC107"
  duration={300}>
  <Text>내용</Text>
</ColorTransitionView>
```

## 🚀 사용 방법

### 테마 적용
1. **App.tsx에 ThemeProvider 추가** (이미 완료)
2. **컴포넌트에서 useTheme 훅 사용**
3. **theme.colors, theme.typography 등 사용**

### 다크 모드 전환
1. **ProfileScreen에서 테마 토글 클릭**
2. **자동으로 모든 화면에 적용**

### 애니메이션 적용
1. **AnimatedGLValue 컴포넌트 사용**
2. **ColorTransitionView로 색상 전환**
3. **Animated API로 커스텀 애니메이션**

## 📊 색상 팔레트

### 라이트 모드
- Background: `#F5F5F5`
- Surface: `#FFFFFF`
- Text Primary: `#212121`
- Text Secondary: `#757575`

### 다크 모드
- Background: `#121212`
- Surface: `#1E1E1E`
- Text Primary: `#FFFFFF`
- Text Secondary: `#B0B0B0`

## 🎯 향후 개선 사항

- [ ] 접근성 라벨 추가 (Screen Reader)
- [ ] 폰트 크기 사용자 설정
- [ ] 고대비 모드
- [ ] 애니메이션 속도 조절
- [ ] 커스텀 테마 색상

## 📞 문의

UI/UX 개선 관련 문의사항이 있으시면 이슈를 생성해주세요.

