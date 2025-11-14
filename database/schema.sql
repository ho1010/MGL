-- ============================================
-- Management GL - 음식 데이터베이스 스키마
-- ============================================
-- Supabase (PostgreSQL)용 스키마

-- 음식 카테고리 ENUM 타입
CREATE TYPE food_category AS ENUM (
  '곡물',
  '채소',
  '과일',
  '육류',
  '어류',
  '유제품',
  '견과류',
  '음료',
  '간식',
  '기타'
);

-- GL 분류 ENUM 타입
CREATE TYPE gl_classification AS ENUM (
  'SAFE',        -- 안전 (저혈당부하): GL 10 이하
  'MODERATE',    -- 위험 (중혈당부하): GL 11~19
  'HIGH_RISK'    -- 매우 위험 (고혈당부하): GL 20 이상
);

-- 음식 테이블
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ko VARCHAR(100) NOT NULL,              -- 한글 음식명
  name_en VARCHAR(100) NOT NULL,               -- 영문 음식명
  glycemic_index INTEGER NOT NULL CHECK (glycemic_index >= 0 AND glycemic_index <= 100), -- GI (혈당지수)
  carbohydrates_per_100g DECIMAL(5, 2) NOT NULL CHECK (carbohydrates_per_100g >= 0), -- 100g당 탄수화물 함량 (g)
  standard_serving_size INTEGER NOT NULL CHECK (standard_serving_size > 0), -- 1회 표준 섭취량 (g)
  calculated_gl DECIMAL(5, 2) NOT NULL CHECK (calculated_gl >= 0), -- 계산된 GL 값
  category food_category NOT NULL,             -- 음식 카테고리
  gl_classification gl_classification NOT NULL, -- GL 분류
  image_url TEXT,                              -- 이미지 URL
  calories_per_100g INTEGER,                   -- 100g당 칼로리 (선택)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  CONSTRAINT unique_food_name UNIQUE (name_ko, name_en)
);

-- 인덱스 생성
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_gl_classification ON foods(gl_classification);
CREATE INDEX idx_foods_calculated_gl ON foods(calculated_gl);
CREATE INDEX idx_foods_name_ko ON foods(name_ko);
CREATE INDEX idx_foods_name_en ON foods(name_en);

-- GL 분류 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_gl_classification(gl_value DECIMAL)
RETURNS gl_classification AS $$
BEGIN
  IF gl_value <= 10 THEN
    RETURN 'SAFE';
  ELSIF gl_value < 20 THEN
    RETURN 'MODERATE';
  ELSE
    RETURN 'HIGH_RISK';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- GL 값 자동 계산 트리거 함수
CREATE OR REPLACE FUNCTION calculate_gl_value()
RETURNS TRIGGER AS $$
BEGIN
  -- GL = (GI × (100g당 탄수화물 × 표준섭취량/100)) / 100
  NEW.calculated_gl := ROUND(
    (NEW.glycemic_index * (NEW.carbohydrates_per_100g * NEW.standard_serving_size / 100.0)) / 100.0,
    2
  );
  
  -- GL 분류 자동 설정
  NEW.gl_classification := calculate_gl_classification(NEW.calculated_gl);
  
  -- updated_at 자동 업데이트
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (INSERT, UPDATE 시 GL 자동 계산)
CREATE TRIGGER trigger_calculate_gl
  BEFORE INSERT OR UPDATE ON foods
  FOR EACH ROW
  EXECUTE FUNCTION calculate_gl_value();

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 뷰 생성: GL 분류별 음식 통계
CREATE VIEW food_statistics AS
SELECT
  gl_classification,
  category,
  COUNT(*) as food_count,
  AVG(calculated_gl) as avg_gl,
  MIN(calculated_gl) as min_gl,
  MAX(calculated_gl) as max_gl
FROM foods
GROUP BY gl_classification, category;

-- 뷰 생성: 카테고리별 평균 GL
CREATE VIEW category_gl_average AS
SELECT
  category,
  COUNT(*) as food_count,
  ROUND(AVG(calculated_gl)::numeric, 2) as avg_gl,
  ROUND(AVG(glycemic_index)::numeric, 2) as avg_gi
FROM foods
GROUP BY category
ORDER BY avg_gl;

-- 주석 추가
COMMENT ON TABLE foods IS '음식 정보 및 GL 데이터';
COMMENT ON COLUMN foods.name_ko IS '한글 음식명';
COMMENT ON COLUMN foods.name_en IS '영문 음식명';
COMMENT ON COLUMN foods.glycemic_index IS '혈당지수 (GI), 0-100 범위';
COMMENT ON COLUMN foods.carbohydrates_per_100g IS '100g당 탄수화물 함량 (g)';
COMMENT ON COLUMN foods.standard_serving_size IS '1회 표준 섭취량 (g)';
COMMENT ON COLUMN foods.calculated_gl IS '계산된 혈당부하지수 (GL)';
COMMENT ON COLUMN foods.category IS '음식 카테고리';
COMMENT ON COLUMN foods.gl_classification IS 'GL 분류: SAFE(10이하), MODERATE(11-19), HIGH_RISK(20이상)';
COMMENT ON COLUMN foods.image_url IS '음식 이미지 URL';

