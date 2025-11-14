/**
 * AI 인식 실패 시 대체 방안 서비스
 * 수동 입력, 유사 음식 제안, 기본값 제공
 */
import {FoodItem, DetectedFood} from '../types';
import {optimizedFoodDatabaseService} from './optimizedFoodDatabaseService';
import {calculateGLForServing, getGLClassification} from '../utils/glCalculator';

/**
 * AI 인식 실패 시 대체 방안
 */
export class FallbackFoodService {
  /**
   * 유사 음식 검색 (부분 매칭)
   */
  async findSimilarFoods(
    detectedFood: DetectedFood,
    limit: number = 5,
  ): Promise<FoodItem[]> {
    const searchQueries = [
      detectedFood.nameKo,
      detectedFood.nameEn,
      detectedFood.name,
    ].filter(Boolean) as string[];

    const allResults: FoodItem[] = [];

    for (const query of searchQueries) {
      if (query.length < 2) continue;

      // 부분 검색 (첫 글자부터)
      for (let i = 2; i <= query.length; i++) {
        const partialQuery = query.substring(0, i);
        const results = await optimizedFoodDatabaseService.searchFoodOptimized(
          partialQuery,
          limit,
        );
        allResults.push(...results);
      }
    }

    // 중복 제거 및 정렬
    const uniqueResults = Array.from(
      new Map(allResults.map((food) => [food.id, food])).values(),
    );

    // 유사도 순 정렬 (간단한 구현)
    return uniqueResults
      .slice(0, limit)
      .sort((a, b) => {
        const aMatch = this.calculateSimilarity(a, detectedFood);
        const bMatch = this.calculateSimilarity(b, detectedFood);
        return bMatch - aMatch;
      });
  }

  /**
   * 유사도 계산 (간단한 구현)
   */
  private calculateSimilarity(food: FoodItem, detected: DetectedFood): number {
    let score = 0;

    if (detected.nameKo && food.nameKo.includes(detected.nameKo)) {
      score += 10;
    }
    if (detected.nameEn && food.nameEn.includes(detected.nameEn)) {
      score += 10;
    }
    if (detected.name && food.nameKo.includes(detected.name)) {
      score += 5;
    }
    if (detected.name && food.nameEn.includes(detected.name)) {
      score += 5;
    }

    return score;
  }

  /**
   * 기본 음식 데이터 생성 (임시)
   */
  createDefaultFood(
    detectedFood: DetectedFood,
    category: string = '기타',
  ): FoodItem {
    // 평균값 사용 (실제로는 카테고리별 평균값 사용 권장)
    const defaultGI = 50;
    const defaultCarbs = 20;
    const defaultServing = 100;

    const calculatedGL = calculateGLForServing(
      defaultGI,
      defaultCarbs,
      defaultServing,
    );

    return {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nameKo: detectedFood.nameKo || detectedFood.name,
      nameEn: detectedFood.nameEn || detectedFood.name,
      glycemicIndex: defaultGI,
      carbohydratesPer100g: defaultCarbs,
      standardServingSize: defaultServing,
      calculatedGL,
      category: category as any,
      glClassification: getGLClassification(calculatedGL),
    };
  }

  /**
   * 카테고리별 평균값 조회
   */
  async getCategoryAverage(category: string): Promise<{
    avgGI: number;
    avgCarbs: number;
  }> {
    try {
      const foods = await optimizedFoodDatabaseService.searchByCategory(
        category,
        100,
      );

      if (foods.length === 0) {
        return {avgGI: 50, avgCarbs: 20}; // 기본값
      }

      const avgGI =
        foods.reduce((sum, food) => sum + food.glycemicIndex, 0) / foods.length;
      const avgCarbs =
        foods.reduce((sum, food) => sum + food.carbohydratesPer100g, 0) /
        foods.length;

      return {
        avgGI: Math.round(avgGI),
        avgCarbs: Math.round(avgCarbs),
      };
    } catch (error) {
      console.error('카테고리 평균 조회 오류:', error);
      return {avgGI: 50, avgCarbs: 20};
    }
  }

  /**
   * 수동 입력을 위한 음식 템플릿 생성
   */
  createFoodTemplate(detectedFood: DetectedFood): Partial<FoodItem> {
    return {
      nameKo: detectedFood.nameKo || detectedFood.name,
      nameEn: detectedFood.nameEn || detectedFood.name,
      glycemicIndex: 0, // 사용자 입력 필요
      carbohydratesPer100g: 0, // 사용자 입력 필요
      standardServingSize: 100, // 기본값
      category: '기타',
    };
  }

  /**
   * 인기 음식 제안 (대체 방안)
   */
  async getPopularFoods(limit: number = 10): Promise<FoodItem[]> {
    // 실제로는 사용 빈도 기반으로 정렬
    // 여기서는 GL이 낮은 음식 우선 제안
    try {
      const safeFoods = await optimizedFoodDatabaseService.searchByGLRange(
        0,
        10,
        limit,
      );
      return safeFoods;
    } catch (error) {
      console.error('인기 음식 조회 오류:', error);
      return [];
    }
  }
}

export const fallbackFoodService = new FallbackFoodService();

