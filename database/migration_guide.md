# 데이터베이스 마이그레이션 가이드

## Supabase (PostgreSQL) 마이그레이션

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 Database URL과 API 키 확인

### 2. SQL 스키마 실행
1. Supabase Dashboard → SQL Editor 이동
2. `database/schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행
4. `database/sample_data.sql` 파일 내용 복사하여 샘플 데이터 삽입

### 3. 환경 변수 설정
`.env` 파일에 다음 추가:
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Row Level Security (RLS) 설정 (선택)
```sql
-- 음식 테이블은 모든 사용자가 읽기 가능
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Foods are viewable by everyone"
  ON foods FOR SELECT
  USING (true);

-- 관리자만 쓰기 가능 (필요시)
CREATE POLICY "Foods are insertable by admins"
  ON foods FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

## Firebase (Firestore) 마이그레이션

### 1. Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com)에 로그인
2. 새 프로젝트 생성
3. Firestore Database 활성화

### 2. 샘플 데이터 임포트
방법 1: Firebase Console에서 수동 입력
- Firestore Database → 데이터 추가
- `foods` 컬렉션 생성
- `firestore_sample_data.json`의 각 항목을 문서로 추가

방법 2: Firebase CLI 사용
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init firestore

# 데이터 임포트 (스크립트 작성 필요)
# 또는 Firebase Console에서 직접 임포트
```

### 3. Firestore 인덱스 설정
`firestore.indexes.json` 파일 생성:
```json
{
  "indexes": [
    {
      "collectionGroup": "foods",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "calculatedGL",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "foods",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "glClassification",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "calculatedGL",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

### 4. Firestore 보안 규칙 설정
`firestore.rules` 파일:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /foods/{foodId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### 5. 환경 변수 설정
`.env` 파일에 다음 추가:
```
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## 데이터 검증

### Supabase
```sql
-- 전체 음식 수 확인
SELECT COUNT(*) FROM foods;

-- GL 분류별 통계
SELECT gl_classification, COUNT(*) 
FROM foods 
GROUP BY gl_classification;

-- 카테고리별 평균 GL
SELECT category, AVG(calculated_gl) 
FROM foods 
GROUP BY category;
```

### Firestore
Firebase Console에서:
- `foods` 컬렉션의 문서 수 확인
- 각 문서의 필드가 올바르게 설정되었는지 확인

## 주의사항

1. **GL 계산 검증**: 데이터 삽입 후 GL 값이 올바르게 계산되었는지 확인
2. **인덱스**: 자주 사용하는 쿼리에 대한 인덱스 생성
3. **보안**: 프로덕션 환경에서는 적절한 보안 규칙 설정
4. **백업**: 정기적으로 데이터베이스 백업 수행

## 문제 해결

### Supabase
- 트리거가 작동하지 않는 경우: `trigger_calculate_gl` 함수 확인
- GL 값이 0인 경우: GI 또는 탄수화물 값 확인

### Firestore
- 인덱스 오류: 필요한 인덱스 생성 요청 확인
- 권한 오류: 보안 규칙 확인

