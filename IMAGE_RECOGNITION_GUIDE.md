# 이미지 인식 기능 가이드

## 📋 개요

이 문서는 Management GL 앱의 이미지 인식 기능 구현에 대한 상세 가이드를 제공합니다.

## 🔄 처리 흐름

### 1. 이미지 선택/촬영
- 사용자가 카메라로 촬영하거나 갤러리에서 선택
- `react-native-image-picker` 사용
- `includeBase64: true` 옵션으로 base64 데이터 포함

### 2. 이미지 전처리
- **압축**: quality 0.8 설정
- **리사이징**: 최대 1024x1024 픽셀
- **Base64 변환**: OpenAI API 전송을 위해 base64 인코딩

### 3. AI 이미지 분석
- **OpenAI Vision API** 사용 (GPT-4o 또는 GPT-4 Vision)
- 이미지를 base64로 전송
- JSON 형식으로 음식 목록 반환 요청
- 한글/영문 음식명 모두 추출

### 4. 데이터베이스 검색
- 인식된 각 음식명으로 데이터베이스 검색
- 한글명, 영문명 모두 검색 시도
- 유사도 순으로 정렬

### 5. 결과 처리
- **자동 선택**: 매칭되는 음식이 1개인 경우
- **사용자 선택**: 매칭되는 음식이 여러 개인 경우 모달 표시
- **무시**: 매칭되는 음식이 없는 경우

## 📁 주요 파일

### 서비스 레이어
- `src/services/openAIVisionService.ts`: OpenAI Vision API 통신
- `src/services/foodDatabaseService.ts`: 데이터베이스 검색
- `src/utils/imageProcessor.ts`: 이미지 전처리

### 컴포넌트
- `src/screens/CameraScreen.tsx`: 메인 카메라 화면
- `src/components/FoodSelectionModal.tsx`: 음식 선택 모달

### 상태 관리
- `src/store/slices/foodSlice.ts`: Redux 상태 관리

## 🔧 설정

### OpenAI API 키 설정

`.env` 파일에 다음 추가:
```
OPENAI_API_KEY=your-openai-api-key
```

또는 `config/api.ts`에서 직접 설정:
```typescript
export const config = {
  openAIApiKey: 'your-api-key',
  // ...
};
```

### 이미지 설정

`src/constants/index.ts`에서 이미지 설정 조정:
```typescript
export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
};
```

## 🚀 사용 방법

### 기본 사용

1. **카메라 화면 열기**
   ```typescript
   navigation.navigate('Camera');
   ```

2. **이미지 촬영/선택**
   - "카메라로 촬영" 버튼 클릭
   - 또는 "갤러리에서 선택" 버튼 클릭

3. **자동 분석**
   - 이미지가 자동으로 분석됨
   - 인식된 음식이 표시됨

4. **음식 선택** (필요시)
   - 여러 옵션이 있으면 모달이 표시됨
   - 적절한 음식 선택

### 프로그래밍 방식 사용

```typescript
import {analyzeFoodImage} from '../store/slices/foodSlice';
import {useDispatch} from 'react-redux';

const dispatch = useDispatch();

// 이미지 분석
dispatch(analyzeFoodImage(imageBase64));

// Redux 상태에서 결과 확인
const {detectedFoods, pendingSelections, loading} = useSelector(
  (state: RootState) => state.food
);
```

## 🔍 API 응답 형식

### OpenAI Vision API 요청

```typescript
{
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'You are a food recognition expert...'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: '이미지에서 음식을 식별하고 JSON 형식으로 반환...'
        },
        {
          type: 'image_url',
          image_url: {
            url: 'data:image/jpeg;base64,...'
          }
        }
      ]
    }
  ],
  max_tokens: 500,
  response_format: {type: 'json_object'}
}
```

### 예상 응답

```json
{
  "foods": [
    {
      "nameKo": "현미밥",
      "nameEn": "Brown Rice",
      "confidence": 0.9
    },
    {
      "nameKo": "된장찌개",
      "nameEn": "Doenjang Jjigae",
      "confidence": 0.85
    }
  ]
}
```

## 🐛 문제 해결

### 1. API 키 오류
**증상**: "API 키가 유효하지 않습니다" 오류

**해결**:
- `.env` 파일에 올바른 API 키 설정 확인
- OpenAI 대시보드에서 API 키 유효성 확인

### 2. 네트워크 오류
**증상**: "네트워크 오류가 발생했습니다" 오류

**해결**:
- 인터넷 연결 확인
- API 타임아웃 설정 확인 (기본 30초)

### 3. 음식 인식 실패
**증상**: "음식을 인식할 수 없습니다" 메시지

**해결**:
- 더 명확한 사진 촬영
- 음식이 잘 보이도록 조명 확인
- 배경이 깔끔한 사진 사용

### 4. 데이터베이스 매칭 실패
**증상**: 인식은 되지만 매칭되는 음식이 없음

**해결**:
- 데이터베이스에 해당 음식 데이터 추가
- 음식명 표기 확인 (한글/영문)

## 📊 성능 최적화

### 이미지 크기 최적화
- 최대 크기 제한: 1024x1024
- Quality: 0.8 (80%)
- Base64 인코딩 최적화

### API 호출 최적화
- 한 번의 API 호출로 여러 음식 인식
- 병렬 데이터베이스 검색
- 결과 캐싱 (향후 구현)

## 🔐 보안 고려사항

1. **API 키 보호**
   - 환경 변수로 관리
   - `.env` 파일은 `.gitignore`에 포함
   - 프로덕션에서는 안전한 키 관리 시스템 사용

2. **이미지 데이터**
   - Base64 데이터는 메모리에서 즉시 삭제
   - 로컬 저장소에 민감한 이미지 저장 금지

3. **API 요청 제한**
   - Rate limiting 구현 (향후)
   - 사용량 모니터링

## 📝 TODO

- [ ] 이미지 캐싱 기능
- [ ] 오프라인 모드 지원
- [ ] 다중 이미지 분석
- [ ] 음식 인식 정확도 개선
- [ ] 사용자 피드백 수집 (인식 정확도 개선용)

## 📞 문의

이미지 인식 기능 관련 문의사항이 있으시면 이슈를 생성해주세요.

