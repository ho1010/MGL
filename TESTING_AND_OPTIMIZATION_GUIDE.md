# 테스트 및 최적화 가이드

## 📋 개요

이 문서는 Management GL 앱의 테스트 및 성능 최적화에 대한 가이드를 제공합니다.

## 🧪 테스트 항목

### 1. 이미지 인식 정확도 테스트

**파일**: `src/__tests__/imageRecognition.test.ts`

**테스트 내용**:
- OpenAI Vision API 음식 인식 성공 케이스
- 낮은 신뢰도 음식 필터링
- 음식 인식 실패 시 에러 메시지
- 데이터베이스 매칭 정확도
- 여러 음식 동시 인식
- 신뢰도 임계값 테스트

**실행 방법**:
```bash
npm test -- imageRecognition.test.ts
```

### 2. GL 계산 정확성 검증

**파일**: `src/__tests__/glCalculator.test.ts`

**테스트 내용**:
- 기본 GL 계산: `GL = (GI × 탄수화물(g)) / 100`
- 표준 섭취량 기준 GL 계산
- GL 안전성 레벨 판단 (SAFE/MODERATE/HIGH_RISK)
- 여러 음식의 총 GL 계산
- 엣지 케이스 (0 값, 큰 값, 음수)

**실행 방법**:
```bash
npm test -- glCalculator.test.ts
```

### 3. 다양한 화면 크기 대응 테스트

**파일**: `src/__tests__/responsiveDesign.test.ts`

**테스트 내용**:
- 화면 크기 감지
- 화면 비율 계산
- 픽셀 밀도 감지 및 조정
- 화면 회전 감지
- 폰트 스케일링
- Safe Area 처리
- 태블릿 vs 폰 구분

**실행 방법**:
```bash
npm test -- responsiveDesign.test.ts
```

### 4. 오프라인 모드 동작 확인

**파일**: `src/__tests__/offlineMode.test.ts`

**테스트 내용**:
- 네트워크 상태 감지
- 오프라인 상태 감지
- 로컬 저장소 (AsyncStorage) 동작
- 캐시된 데이터 사용
- 캐시 만료 시간 확인
- 오프라인 큐 동작
- 오프라인 상태에서 에러 처리

**실행 방법**:
```bash
npm test -- offlineMode.test.ts
```

### 5. 메모리 누수 체크

**파일**: `src/__tests__/memoryLeak.test.ts`

**테스트 내용**:
- 컴포넌트 언마운트 시 리소스 정리
- 이벤트 리스너 정리
- 이미지 메모리 관리
- Base64 이미지 데이터 해제
- 배열 및 객체 정리
- 순환 참조 방지
- 타이머 정리 (setTimeout, setInterval)
- Redux subscription 정리
- 비동기 작업 취소

**실행 방법**:
```bash
npm test -- memoryLeak.test.ts
```

## ⚡ 최적화 항목

### 1. 이미지 압축 및 캐싱

**파일**: `src/utils/imageCache.ts`

**기능**:
- 이미지 자동 압축 (최대 1024x1024, quality 0.8)
- 이미지 캐싱 (최대 50개, 7일 만료)
- 중복 이미지 방지 (해시 기반)
- 캐시 크기 관리 (LRU 방식)
- 캐시 통계 조회

**사용 예시**:
```typescript
import {imageCacheManager} from '../utils/imageCache';

// 초기화
await imageCacheManager.initialize();

// 이미지 압축 및 캐싱
const compressed = await imageCacheManager.compressImage(imageUri);
await imageCacheManager.addToCache({
  uri: imageUri,
  compressedUri: compressed.uri,
  width: compressed.width,
  height: compressed.height,
  size: compressed.size,
  timestamp: Date.now(),
  hash: '',
});

// 캐시에서 조회
const cached = await imageCacheManager.getFromCache(imageUri);
```

### 2. 데이터베이스 쿼리 최적화

**파일**: `src/services/optimizedFoodDatabaseService.ts`

**기능**:
- 음식 데이터 캐싱 (24시간 만료)
- 검색 결과 캐싱 (최대 100개)
- 배치 조회 최적화
- 인덱스 기반 빠른 검색
- GL 범위별 검색 최적화

**사용 예시**:
```typescript
import {optimizedFoodDatabaseService} from '../services/optimizedFoodDatabaseService';

// 초기화
await optimizedFoodDatabaseService.initialize();

// 최적화된 검색
const foods = await optimizedFoodDatabaseService.searchFoodOptimized('사과', 20);

// 배치 조회
const foods = await optimizedFoodDatabaseService.getMultipleFoodsOptimized(detectedFoods);
```

### 3. 앱 로딩 속도 개선

**파일**: `src/utils/performanceOptimizer.ts`

**기능**:
- InteractionManager를 사용한 지연 렌더링
- 이미지 지연 로딩
- 배치 업데이트
- 디바운스/쓰로틀 함수
- 백그라운드 작업 관리
- 취소 가능한 요청

**사용 예시**:
```typescript
import {runAfterInteractions, debounce, throttle} from '../utils/performanceOptimizer';

// 네이티브 애니메이션 완료 후 실행
runAfterInteractions(() => {
  // 무거운 작업
});

// 디바운스 (검색 입력)
const debouncedSearch = debounce((query: string) => {
  searchFoods(query);
}, 300);

// 쓰로틀 (스크롤 이벤트)
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

### 4. 배터리 소모 최소화

**기능**:
- 백그라운드 작업 최소화
- 불필요한 폴링 제거
- 네트워크 요청 최적화
- 메모리 사용량 최적화

**사용 예시**:
```typescript
import {backgroundTaskManager} from '../utils/performanceOptimizer';

// 백그라운드 작업 등록
backgroundTaskManager.registerTask('sync', () => {
  syncData();
}, 60000); // 1분마다

// 작업 정리
backgroundTaskManager.clearTask('sync');
```

## 🛡️ 에러 처리

### 1. 네트워크 오류 처리

**파일**: `src/utils/errorHandler.ts`

**기능**:
- 네트워크 상태 확인
- 네트워크 오류 감지 및 처리
- 오프라인 모드 자동 전환
- 재시도 가능 여부 확인

**사용 예시**:
```typescript
import {handleNetworkError, checkNetworkStatus} from '../utils/errorHandler';

const isOnline = await checkNetworkStatus();
if (!isOnline) {
  const error = handleNetworkError(new Error('Network error'));
  // 오프라인 모드로 전환
}
```

### 2. AI 인식 실패 시 대체 방안

**파일**: `src/services/fallbackFoodService.ts`

**기능**:
- 유사 음식 검색 (부분 매칭)
- 기본 음식 데이터 생성
- 카테고리별 평균값 조회
- 수동 입력 템플릿 제공
- 인기 음식 제안

**사용 예시**:
```typescript
import {fallbackFoodService} from '../services/fallbackFoodService';

// AI 인식 실패 시 유사 음식 검색
const similarFoods = await fallbackFoodService.findSimilarFoods(detectedFood);

// 기본 음식 데이터 생성
const defaultFood = fallbackFoodService.createDefaultFood(detectedFood, '과일');
```

### 3. 데이터 없는 음식 처리

**기능**:
- 음식 데이터 없음 에러 처리
- 사용자 친화적 메시지
- 수동 입력 안내
- 대체 음식 제안

**사용 예시**:
```typescript
import {handleFoodNotFoundError} from '../utils/errorHandler';

const error = handleFoodNotFoundError('알 수 없는 음식');
// "알 수 없는 음식"에 대한 영양 정보를 찾을 수 없습니다. 수동으로 입력하거나 다른 음식을 선택해주세요.
```

## 📊 성능 모니터링

### 메모리 사용량 체크

```typescript
import {checkMemoryUsage} from '../utils/performanceOptimizer';

checkMemoryUsage('After image load');
```

### 함수 실행 시간 측정

```typescript
import {measurePerformance} from '../utils/performanceOptimizer';

const result = await measurePerformance('Image Analysis', async () => {
  return await analyzeImage(imageUri);
});
```

## 🚀 실행 방법

### 전체 테스트 실행

```bash
npm test
```

### 특정 테스트 실행

```bash
npm test -- glCalculator.test.ts
npm test -- imageRecognition.test.ts
npm test -- responsiveDesign.test.ts
npm test -- offlineMode.test.ts
npm test -- memoryLeak.test.ts
```

### 테스트 커버리지 확인

```bash
npm test -- --coverage
```

## 📝 주의사항

1. **테스트 환경**: 실제 디바이스와 에뮬레이터에서 모두 테스트해야 합니다.
2. **네트워크 테스트**: 오프라인 모드 테스트를 위해 비행기 모드 사용을 권장합니다.
3. **메모리 테스트**: 장시간 사용 시나리오를 테스트해야 합니다.
4. **성능 테스트**: 실제 디바이스에서 성능을 측정해야 합니다.

## 🔄 지속적인 개선

- 정기적인 테스트 실행
- 성능 메트릭 수집
- 사용자 피드백 수집
- 에러 로그 분석
- 캐시 히트율 모니터링

## 📞 문의

테스트 및 최적화 관련 문의사항이 있으시면 이슈를 생성해주세요.

