-- ============================================
-- Management GL - 샘플 데이터 50개
-- ============================================

-- GL 분류 기준:
-- SAFE: GL 10 이하 (안전 - 저혈당부하)
-- MODERATE: GL 11~19 (위험 - 중혈당부하)
-- HIGH_RISK: GL 20 이상 (매우 위험 - 고혈당부하)

-- ============================================
-- 곡물류 (10개)
-- ============================================
INSERT INTO foods (name_ko, name_en, glycemic_index, carbohydrates_per_100g, standard_serving_size, category, image_url, calories_per_100g) VALUES
('현미밥', 'Brown Rice', 50, 23.0, 150, '곡물', 'https://example.com/images/brown-rice.jpg', 111),
('백미밥', 'White Rice', 73, 28.0, 150, '곡물', 'https://example.com/images/white-rice.jpg', 130),
('보리밥', 'Barley Rice', 25, 22.0, 150, '곡물', 'https://example.com/images/barley-rice.jpg', 123),
('귀리', 'Oats', 55, 66.0, 40, '곡물', 'https://example.com/images/oats.jpg', 389),
('퀴노아', 'Quinoa', 53, 64.0, 100, '곡물', 'https://example.com/images/quinoa.jpg', 368),
('통밀빵', 'Whole Wheat Bread', 69, 41.0, 30, '곡물', 'https://example.com/images/whole-wheat-bread.jpg', 247),
('흰빵', 'White Bread', 75, 49.0, 30, '곡물', 'https://example.com/images/white-bread.jpg', 265),
('국수', 'Noodles', 47, 25.0, 200, '곡물', 'https://example.com/images/noodles.jpg', 138),
('스파게티', 'Spaghetti', 49, 31.0, 180, '곡물', 'https://example.com/images/spaghetti.jpg', 158),
('보리', 'Barley', 28, 73.0, 50, '곡물', 'https://example.com/images/barley.jpg', 352);

-- ============================================
-- 채소류 (10개)
-- ============================================
INSERT INTO foods (name_ko, name_en, glycemic_index, carbohydrates_per_100g, standard_serving_size, category, image_url, calories_per_100g) VALUES
('브로콜리', 'Broccoli', 15, 7.0, 100, '채소', 'https://example.com/images/broccoli.jpg', 34),
('당근', 'Carrot', 39, 10.0, 80, '채소', 'https://example.com/images/carrot.jpg', 41),
('감자', 'Potato', 78, 17.0, 150, '채소', 'https://example.com/images/potato.jpg', 77),
('고구마', 'Sweet Potato', 70, 20.0, 150, '채소', 'https://example.com/images/sweet-potato.jpg', 86),
('옥수수', 'Corn', 60, 19.0, 100, '채소', 'https://example.com/images/corn.jpg', 96),
('양파', 'Onion', 15, 9.0, 100, '채소', 'https://example.com/images/onion.jpg', 40),
('토마토', 'Tomato', 30, 4.0, 150, '채소', 'https://example.com/images/tomato.jpg', 18),
('시금치', 'Spinach', 15, 3.6, 100, '채소', 'https://example.com/images/spinach.jpg', 23),
('양배추', 'Cabbage', 10, 6.0, 100, '채소', 'https://example.com/images/cabbage.jpg', 25),
('상추', 'Lettuce', 15, 2.9, 100, '채소', 'https://example.com/images/lettuce.jpg', 15);

-- ============================================
-- 과일류 (10개)
-- ============================================
INSERT INTO foods (name_ko, name_en, glycemic_index, carbohydrates_per_100g, standard_serving_size, category, image_url, calories_per_100g) VALUES
('사과', 'Apple', 38, 14.0, 150, '과일', 'https://example.com/images/apple.jpg', 52),
('바나나', 'Banana', 51, 23.0, 120, '과일', 'https://example.com/images/banana.jpg', 89),
('딸기', 'Strawberry', 40, 8.0, 100, '과일', 'https://example.com/images/strawberry.jpg', 32),
('포도', 'Grape', 59, 16.0, 100, '과일', 'https://example.com/images/grape.jpg', 69),
('수박', 'Watermelon', 76, 8.0, 200, '과일', 'https://example.com/images/watermelon.jpg', 30),
('오렌지', 'Orange', 42, 12.0, 150, '과일', 'https://example.com/images/orange.jpg', 47),
('키위', 'Kiwi', 58, 15.0, 100, '과일', 'https://example.com/images/kiwi.jpg', 61),
('복숭아', 'Peach', 42, 10.0, 150, '과일', 'https://example.com/images/peach.jpg', 39),
('체리', 'Cherry', 22, 16.0, 100, '과일', 'https://example.com/images/cherry.jpg', 63),
('블루베리', 'Blueberry', 53, 14.0, 100, '과일', 'https://example.com/images/blueberry.jpg', 57);

-- ============================================
-- 육류 (5개)
-- ============================================
INSERT INTO foods (name_ko, name_en, glycemic_index, carbohydrates_per_100g, standard_serving_size, category, image_url, calories_per_100g) VALUES
('닭가슴살', 'Chicken Breast', 0, 0.0, 100, '육류', 'https://example.com/images/chicken-breast.jpg', 165),
('소고기', 'Beef', 0, 0.0, 100, '육류', 'https://example.com/images/beef.jpg', 250),
('돼지고기', 'Pork', 0, 0.0, 100, '육류', 'https://example.com/images/pork.jpg', 242),
('양고기', 'Lamb', 0, 0.0, 100, '육류', 'https://example.com/images/lamb.jpg', 294),
('오리고기', 'Duck', 0, 0.0, 100, '육류', 'https://example.com/images/duck.jpg', 337);

-- ============================================
-- 어류 (5개)
-- ============================================
INSERT INTO foods (name_ko, name_en, glycemic_index, carbohydrates_per_100g, standard_serving_size, category, image_url, calories_per_100g) VALUES
('연어', 'Salmon', 0, 0.0, 100, '어류', 'https://example.com/images/salmon.jpg', 208),
('참치', 'Tuna', 0, 0.0, 100, '어류', 'https://example.com/images/tuna.jpg', 144),
('고등어', 'Mackerel', 0, 0.0, 100, '어류', 'https://example.com/images/mackerel.jpg', 262),
('새우', 'Shrimp', 0, 0.0, 100, '어류', 'https://example.com/images/shrimp.jpg', 99),
('오징어', 'Squid', 0, 3.0, 100, '어류', 'https://example.com/images/squid.jpg', 92);

-- ============================================
-- 유제품 (5개)
-- ============================================
INSERT INTO foods (name_ko, name_en, glycemic_index, carbohydrates_per_100g, standard_serving_size, category, image_url, calories_per_100g) VALUES
('우유', 'Milk', 27, 5.0, 200, '유제품', 'https://example.com/images/milk.jpg', 42),
('그리스 요거트', 'Greek Yogurt', 12, 4.0, 150, '유제품', 'https://example.com/images/greek-yogurt.jpg', 59),
('치즈', 'Cheese', 0, 1.0, 30, '유제품', 'https://example.com/images/cheese.jpg', 113),
('아이스크림', 'Ice Cream', 61, 24.0, 100, '유제품', 'https://example.com/images/ice-cream.jpg', 207),
('요거트', 'Yogurt', 33, 10.0, 150, '유제품', 'https://example.com/images/yogurt.jpg', 59);

-- ============================================
-- 간식류 (5개)
-- ============================================
INSERT INTO foods (name_ko, name_en, glycemic_index, carbohydrates_per_100g, standard_serving_size, category, image_url, calories_per_100g) VALUES
('초콜릿', 'Chocolate', 40, 58.0, 30, '간식', 'https://example.com/images/chocolate.jpg', 546),
('케이크', 'Cake', 67, 52.0, 80, '간식', 'https://example.com/images/cake.jpg', 367),
('쿠키', 'Cookie', 60, 70.0, 20, '간식', 'https://example.com/images/cookie.jpg', 488),
('과자', 'Cracker', 74, 72.0, 30, '간식', 'https://example.com/images/cracker.jpg', 504),
('사탕', 'Candy', 78, 98.0, 15, '간식', 'https://example.com/images/candy.jpg', 394);

-- ============================================
-- 데이터 확인 쿼리
-- ============================================
-- SELECT 
--   name_ko,
--   name_en,
--   calculated_gl,
--   gl_classification,
--   category
-- FROM foods
-- ORDER BY calculated_gl DESC;

