import {FoodItem, GLSafetyLevel, FoodCategory} from '../types';
import {GL_THRESHOLD} from '../constants';
import {calculateGLForServing, getGLSafetyLevel} from './glCalculator';

export interface ConsumptionRecommendation {
  message: string;
  recommendedServingSize?: number; // g
  alternativeFoods?: FoodItem[];
  tips: string[];
  warningLevel: 'safe' | 'moderate' | 'high';
}

/**
 * 안전한 섭취량 계산
 * GL이 10 이하가 되는 섭취량을 계산
 */
export const calculateSafeServingSize = (
  gi: number,
  carbsPer100g: number,
  targetGL: number = GL_THRESHOLD.SAFE,
): number => {
  // GL = (GI × (carbsPer100g × servingSize / 100)) / 100
  // targetGL = (GI × carbsPer100g × servingSize) / 10000
  // servingSize = (targetGL × 10000) / (GI × carbsPer100g)
  
  if (gi === 0 || carbsPer100g === 0) {
    return 100; // 기본값
  }

  const safeServingSize = (targetGL * 10000) / (gi * carbsPer100g);
  return Math.round(safeServingSize / 10) * 10; // 10g 단위로 반올림
};

/**
 * 같은 카테고리의 저GL 음식 찾기
 */
export const findAlternativeFoods = (
  currentFood: FoodItem,
  allFoods: FoodItem[],
  maxResults: number = 3,
): FoodItem[] => {
  return allFoods
    .filter(
      (food) =>
        food.category === currentFood.category &&
        food.id !== currentFood.id &&
        food.calculatedGL <= GL_THRESHOLD.SAFE,
    )
    .sort((a, b) => a.calculatedGL - b.calculatedGL)
    .slice(0, maxResults);
};

/**
 * 섭취 제안 생성
 */
export const generateConsumptionRecommendation = (
  food: FoodItem,
  currentServingSize: number,
  allFoods?: FoodItem[],
): ConsumptionRecommendation => {
  const currentGL = calculateGLForServing(
    food.glycemicIndex,
    food.carbohydratesPer100g,
    currentServingSize,
  );
  const safetyLevel = getGLSafetyLevel(currentGL);

  switch (safetyLevel) {
    case GLSafetyLevel.SAFE:
      return {
        message: '안심하고 드셔도 좋습니다',
        recommendedServingSize: currentServingSize,
        tips: [
          '식이섬유가 풍부한 채소와 함께 섭취하세요',
          '단백질이나 지방과 조합하여 섭취하면 혈당 상승을 더욱 완만하게 할 수 있습니다',
          '식후 가벼운 걷기 운동을 권장합니다',
        ],
        warningLevel: 'safe',
      };

    case GLSafetyLevel.MODERATE:
      const safeServingSize = calculateSafeServingSize(
        food.glycemicIndex,
        food.carbohydratesPer100g,
        GL_THRESHOLD.SAFE,
      );

      return {
        message: '절반 정도만 드시는 것을 권장합니다',
        recommendedServingSize: safeServingSize,
        tips: [
          `권장 섭취량: 약 ${safeServingSize}g (현재 ${currentServingSize}g)`,
          '채소, 단백질과 함께 드세요',
          '식이섬유가 풍부한 채소를 먼저 드시면 혈당 상승을 완만하게 할 수 있습니다',
          '식후 30분 후 가벼운 걷기 운동을 권장합니다',
        ],
        warningLevel: 'moderate',
      };

    case GLSafetyLevel.HIGH_RISK:
      const alternativeFoods = allFoods
        ? findAlternativeFoods(food, allFoods)
        : [];

      return {
        message: '혈당을 크게 올릴 수 있어 주의가 필요합니다',
        recommendedServingSize: calculateSafeServingSize(
          food.glycemicIndex,
          food.carbohydratesPer100g,
          GL_THRESHOLD.SAFE,
        ),
        alternativeFoods,
        tips: [
          '소량만 드시거나 다른 음식을 선택하세요',
          alternativeFoods.length > 0
            ? `같은 카테고리의 저GL 대체 음식: ${alternativeFoods.map((f) => f.nameKo).join(', ')}`
            : '식이섬유가 풍부한 채소와 함께 소량만 섭취하세요',
          '단백질과 지방을 함께 섭취하여 혈당 상승을 완화하세요',
          '식후 30분~1시간 후 운동을 권장합니다',
        ],
        warningLevel: 'high',
      };

    default:
      return {
        message: '섭취 시 주의가 필요합니다',
        tips: ['식이섬유가 풍부한 채소와 함께 섭취하세요'],
        warningLevel: 'moderate',
      };
  }
};

/**
 * 카테고리별 대체 음식 추천 메시지 생성
 */
export const getCategoryAlternativeMessage = (
  category: FoodCategory,
): string => {
  const categoryMessages: Record<FoodCategory, string> = {
    곡물: '현미, 보리, 귀리 등 저GL 곡물을 선택하세요',
    채소: '당근, 브로콜리, 양배추 등 저GL 채소를 선택하세요',
    과일: '사과, 딸기, 체리 등 저GL 과일을 선택하세요',
    육류: '육류는 탄수화물이 적어 GL이 낮습니다',
    어류: '어류는 탄수화물이 적어 GL이 낮습니다',
    유제품: '그리스 요거트, 치즈 등 저GL 유제품을 선택하세요',
    견과류: '견과류는 탄수화물이 적어 GL이 낮습니다',
    음료: '무설탕 음료나 물을 선택하세요',
    간식: '저GL 간식을 선택하거나 소량만 섭취하세요',
    기타: '저GL 음식을 선택하세요',
  };

  return categoryMessages[category] || '저GL 음식을 선택하세요';
};

