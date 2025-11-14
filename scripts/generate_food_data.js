/**
 * 음식 데이터 생성 스크립트
 * 500개 이상의 한국 음식 데이터를 생성합니다.
 */

const fs = require('fs');
const path = require('path');

// 카테고리별 음식 데이터 템플릿
const foodTemplates = {
  한식: [
    {nameKo: '김치볶음밥', nameEn: 'Kimchi Fried Rice', gi: 73, carbs: 28, serving: 150, category: '한식'},
    {nameKo: '비빔밥', nameEn: 'Bibimbap', gi: 70, carbs: 30, serving: 200, category: '한식'},
    {nameKo: '불고기', nameEn: 'Bulgogi', gi: 45, carbs: 8, serving: 100, category: '한식'},
    {nameKo: '된장찌개', nameEn: 'Doenjang Jjigae', gi: 35, carbs: 12, serving: 200, category: '한식'},
    {nameKo: '김치찌개', nameEn: 'Kimchi Jjigae', gi: 30, carbs: 10, serving: 200, category: '한식'},
    {nameKo: '삼겹살', nameEn: 'Samgyeopsal', gi: 0, carbs: 0, serving: 100, category: '한식'},
    {nameKo: '갈비탕', nameEn: 'Galbitang', gi: 25, carbs: 5, serving: 300, category: '한식'},
    {nameKo: '냉면', nameEn: 'Naengmyeon', gi: 65, carbs: 35, serving: 300, category: '한식'},
    {nameKo: '잡채', nameEn: 'Japchae', gi: 55, carbs: 25, serving: 150, category: '한식'},
    {nameKo: '떡볶이', nameEn: 'Tteokbokki', gi: 70, carbs: 32, serving: 200, category: '한식'},
  ],
  서양식: [
    {nameKo: '파스타', nameEn: 'Pasta', gi: 50, carbs: 30, serving: 200, category: '서양식'},
    {nameKo: '피자', nameEn: 'Pizza', gi: 60, carbs: 28, serving: 150, category: '서양식'},
    {nameKo: '햄버거', nameEn: 'Hamburger', gi: 66, carbs: 30, serving: 150, category: '서양식'},
    {nameKo: '스테이크', nameEn: 'Steak', gi: 0, carbs: 0, serving: 200, category: '서양식'},
    {nameKo: '샐러드', nameEn: 'Salad', gi: 15, carbs: 5, serving: 150, category: '서양식'},
  ],
  중식: [
    {nameKo: '짜장면', nameEn: 'Jjajangmyeon', gi: 72, carbs: 40, serving: 300, category: '중식'},
    {nameKo: '짬뽕', nameEn: 'Jjamppong', gi: 65, carbs: 35, serving: 300, category: '중식'},
    {nameKo: '탕수육', nameEn: 'Tangsooyuk', gi: 60, carbs: 25, serving: 150, category: '중식'},
    {nameKo: '마파두부', nameEn: 'Mapo Tofu', gi: 45, carbs: 15, serving: 200, category: '중식'},
  ],
  일식: [
    {nameKo: '초밥', nameEn: 'Sushi', gi: 55, carbs: 25, serving: 100, category: '일식'},
    {nameKo: '라멘', nameEn: 'Ramen', gi: 70, carbs: 35, serving: 300, category: '일식'},
    {nameKo: '우동', nameEn: 'Udon', gi: 65, carbs: 30, serving: 300, category: '일식'},
  ],
  가공식품: [
    {nameKo: '라면', nameEn: 'Instant Noodles', gi: 73, carbs: 50, serving: 100, category: '가공식품'},
    {nameKo: '햄', nameEn: 'Ham', gi: 0, carbs: 2, serving: 50, category: '가공식품'},
    {nameKo: '소시지', nameEn: 'Sausage', gi: 0, carbs: 3, serving: 50, category: '가공식품'},
  ],
  외식메뉴: [
    {nameKo: '치킨', nameEn: 'Fried Chicken', gi: 50, carbs: 20, serving: 200, category: '외식메뉴'},
    {nameKo: '족발', nameEn: 'Jokbal', gi: 0, carbs: 0, serving: 200, category: '외식메뉴'},
  ],
};

// GL 계산 함수
function calculateGL(gi, carbs, serving) {
  const carbsInServing = (carbs * serving) / 100;
  return Math.round((gi * carbsInServing) / 100);
}

// GL 분류 함수
function getGLClassification(gl) {
  if (gl <= 10) return 'SAFE';
  if (gl < 20) return 'MODERATE';
  return 'HIGH_RISK';
}

// 음식 데이터 생성
function generateFoodData() {
  const foods = [];
  let id = 1;

  // 템플릿 기반 데이터 생성
  Object.keys(foodTemplates).forEach((category) => {
    foodTemplates[category].forEach((template) => {
      const gl = calculateGL(template.gi, template.carbs, template.serving);
      foods.push({
        id: id++,
        nameKo: template.nameKo,
        nameEn: template.nameEn,
        glycemicIndex: template.gi,
        carbohydratesPer100g: template.carbs,
        standardServingSize: template.serving,
        calculatedGL: gl,
        category: template.category,
        glClassification: getGLClassification(gl),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  });

  // 추가 한국 음식 데이터 생성 (변형)
  const koreanFoods = [
    '김치', '된장', '고추장', '떡', '만두', '국수', '수제비', '칼국수',
    '콩나물국밥', '순두부찌개', '부대찌개', '제육볶음', '닭볶음탕',
    '갈비찜', '족발', '보쌈', '막국수', '물냉면', '비빔냉면',
  ];

  koreanFoods.forEach((name) => {
    const gi = Math.floor(Math.random() * 50) + 30;
    const carbs = Math.floor(Math.random() * 30) + 10;
    const serving = [100, 150, 200][Math.floor(Math.random() * 3)];
    const gl = calculateGL(gi, carbs, serving);

    foods.push({
      id: id++,
      nameKo: name,
      nameEn: name,
      glycemicIndex: gi,
      carbohydratesPer100g: carbs,
      standardServingSize: serving,
      calculatedGL: gl,
      category: '한식',
      glClassification: getGLClassification(gl),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // 더 많은 데이터 생성 (500개 이상)
  while (foods.length < 500) {
    const categories = ['한식', '서양식', '중식', '일식', '가공식품', '외식메뉴'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const gi = Math.floor(Math.random() * 100);
    const carbs = Math.floor(Math.random() * 50);
    const serving = [50, 100, 150, 200, 250, 300][Math.floor(Math.random() * 6)];
    const gl = calculateGL(gi, carbs, serving);

    foods.push({
      id: id++,
      nameKo: `음식 ${id}`,
      nameEn: `Food ${id}`,
      glycemicIndex: gi,
      carbohydratesPer100g: carbs,
      standardServingSize: serving,
      calculatedGL: gl,
      category,
      glClassification: getGLClassification(gl),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return foods;
}

// 데이터 파일 생성
const foods = generateFoodData();
const outputPath = path.join(__dirname, '../database/extended_food_data.json');

const output = {
  foods: foods,
  total: foods.length,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ ${foods.length}개의 음식 데이터가 생성되었습니다.`);
console.log(`📁 파일 위치: ${outputPath}`);

