# 데이터베이스 스키마 및 샘플 데이터

## 📋 개요

이 폴더에는 Management GL 앱의 데이터베이스 스키마와 샘플 데이터가 포함되어 있습니다.

## 📁 파일 구조

```
database/
├── schema.sql                    # Supabase (PostgreSQL) 스키마
├── sample_data.sql               # Supabase 샘플 데이터 50개
├── firestore_schema.ts           # Firebase Firestore 스키마 정의
├── firestore_sample_data.json    # Firestore 샘플 데이터 50개 (JSON)
├── migration_guide.md            # 마이그레이션 가이드
└── README.md                     # 이 파일
```

## 🗄️ 데이터베이스 스키마

### 필수 필드

1. **음식명**
   - `name_ko` (한글 음식명)
   - `name_en` (영문 음식명)

2. **혈당지수 (GI)**
   - `glycemic_index`: 0-100 범위의 정수

3. **탄수화물 함량**
   - `carbohydrates_per_100g`: 100g당 탄수화물 함량 (g)

4. **표준 섭취량**
   - `standard_serving_size`: 1회 표준 섭취량 (g)

5. **계산된 GL 값**
   - `calculated_gl`: 자동 계산된 혈당부하지수
   - 계산 공식: `GL = (GI × (100g당 탄수화물 × 표준섭취량/100)) / 100`

6. **음식 카테고리**
   - `category`: 곡물, 채소, 과일, 육류, 어류, 유제품, 견과류, 음료, 간식, 기타

7. **이미지 URL**
   - `image_url`: 음식 이미지 URL (선택)

8. **GL 분류**
   - `gl_classification`: SAFE, MODERATE, HIGH_RISK

## 📊 GL 분류 기준

- **SAFE (안전 - 저혈당부하)**: GL 10 이하
- **MODERATE (위험 - 중혈당부하)**: GL 11~19
- **HIGH_RISK (매우 위험 - 고혈당부하)**: GL 20 이상

## 📦 샘플 데이터 구성

총 50개의 샘플 데이터가 포함되어 있으며, 카테고리별 분포는 다음과 같습니다:

- **곡물**: 10개
- **채소**: 10개
- **과일**: 10개
- **육류**: 5개
- **어류**: 5개
- **유제품**: 5개
- **간식**: 5개

## 🚀 사용 방법

### Supabase 사용 시

1. `schema.sql` 파일을 Supabase SQL Editor에서 실행
2. `sample_data.sql` 파일을 실행하여 샘플 데이터 삽입

### Firebase 사용 시

1. `firestore_sample_data.json` 파일의 데이터를 Firestore에 임포트
2. `firestore_schema.ts`의 인덱스 및 보안 규칙 설정 참고

자세한 내용은 `migration_guide.md`를 참고하세요.

## 🔍 데이터 검증

### GL 계산 검증

모든 샘플 데이터의 GL 값은 다음 공식으로 계산되었습니다:

```
GL = (GI × (100g당 탄수화물 × 표준섭취량/100)) / 100
```

### GL 분류 검증

- GL ≤ 10: SAFE
- 11 ≤ GL < 20: MODERATE
- GL ≥ 20: HIGH_RISK

## 📝 주의사항

1. **이미지 URL**: 샘플 데이터의 이미지 URL은 예시입니다. 실제 이미지 URL로 교체해야 합니다.

2. **데이터 정확성**: GI 값과 탄수화물 함량은 참고용입니다. 실제 사용 시 정확한 영양 정보 데이터베이스를 사용하세요.

3. **자동 계산**: Supabase 스키마에는 GL 자동 계산 트리거가 포함되어 있습니다. 데이터 삽입 시 자동으로 GL 값이 계산됩니다.

## 🔄 업데이트

새로운 음식 데이터를 추가하거나 기존 데이터를 수정할 때는:

1. GL 값이 올바르게 계산되는지 확인
2. GL 분류가 올바른지 확인
3. 필수 필드가 모두 채워져 있는지 확인

## 📞 문의

데이터베이스 관련 문의사항이 있으시면 이슈를 생성해주세요.

