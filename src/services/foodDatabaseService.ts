import axios from 'axios';
import {FoodItem, ApiResponse, DetectedFood} from '../types';
import {API_ENDPOINTS} from '../constants';
import {config} from '../../config/api';
import {calculateGLForServing, getGLClassification} from '../utils/glCalculator';
import {handleError, handleFoodNotFoundError} from '../utils/errorHandler';

/**
 * 음식 데이터베이스 서비스
 * Supabase 또는 Firebase를 통한 음식 영양 정보 조회
 */
class FoodDatabaseService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.apiBaseURL || 'https://api.example.com';
  }

  /**
   * 음식 이름으로 검색
   */
  async searchFood(query: string): Promise<ApiResponse<FoodItem[]>> {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.SEARCH_FOOD}`,
        {
          params: {
            q: query,
          },
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      const appError = handleError(error, 'FoodSearch');
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  /**
   * AI로 인식된 음식 이름을 기반으로 영양 정보 조회
   * 여러 결과가 있을 수 있으므로 배열로 반환
   */
  async getFoodNutritionInfo(
    foodName: string,
    nameKo?: string,
    nameEn?: string,
  ): Promise<ApiResponse<FoodItem[]>> {
    try {
      const searchQueries = [
        nameKo,
        nameEn,
        foodName,
      ].filter(Boolean) as string[];

      // 모든 검색어로 검색 시도
      const searchPromises = searchQueries.map((query) => this.searchFood(query));
      const searchResults = await Promise.all(searchPromises);

      // 모든 결과를 합치고 중복 제거
      const allResults: FoodItem[] = [];
      searchResults.forEach((result) => {
        if (result.success && result.data) {
          result.data.forEach((food) => {
            // 중복 체크 (id 기준)
            if (!allResults.find((f) => f.id === food.id)) {
              allResults.push(food);
            }
          });
        }
      });

      if (allResults.length > 0) {
        // 유사도 순으로 정렬 (간단한 매칭)
        const sortedResults = this.sortByRelevance(allResults, foodName, nameKo, nameEn);
        return {
          success: true,
          data: sortedResults,
        };
      }

      // 검색 결과가 없으면 빈 배열 반환
      if (allResults.length === 0) {
        // 에러는 발생하지 않지만, 사용자에게 알림을 위해 로깅
        console.warn(`음식을 찾을 수 없습니다: ${foodName}`);
      }

      return {
        success: true,
        data: allResults.length > 0 ? sortedResults : [],
      };
    } catch (error: any) {
      const appError = handleError(error, 'FoodNutritionInfo');
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  /**
   * 검색 결과를 관련도 순으로 정렬
   */
  private sortByRelevance(
    foods: FoodItem[],
    searchTerm: string,
    nameKo?: string,
    nameEn?: string,
  ): FoodItem[] {
    return foods.sort((a, b) => {
      // 정확한 매칭 우선
      const aExactMatch =
        a.nameKo === nameKo ||
        a.nameEn === nameEn ||
        a.nameKo === searchTerm ||
        a.nameEn === searchTerm;
      const bExactMatch =
        b.nameKo === nameKo ||
        b.nameEn === nameEn ||
        b.nameKo === searchTerm ||
        b.nameEn === searchTerm;

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // 부분 매칭
      const aPartialMatch =
        a.nameKo.includes(searchTerm) ||
        a.nameEn.includes(searchTerm) ||
        (nameKo && a.nameKo.includes(nameKo)) ||
        (nameEn && a.nameEn.includes(nameEn));
      const bPartialMatch =
        b.nameKo.includes(searchTerm) ||
        b.nameEn.includes(searchTerm) ||
        (nameKo && b.nameKo.includes(nameKo)) ||
        (nameEn && b.nameEn.includes(nameEn));

      if (aPartialMatch && !bPartialMatch) return -1;
      if (!aPartialMatch && bPartialMatch) return 1;

      return 0;
    });
  }

  /**
   * 여러 음식의 영양 정보 일괄 조회
   * DetectedFood 배열을 받아서 처리
   */
  async getMultipleFoodNutritionInfo(
    detectedFoods: DetectedFood[],
  ): Promise<FoodItem[]> {
    const promises = detectedFoods.map((detected) =>
      this.getFoodNutritionInfo(detected.name, detected.nameKo, detected.nameEn),
    );
    const results = await Promise.all(promises);

    // 각 검색 결과에서 첫 번째 항목만 사용 (나중에 사용자가 선택할 수 있도록)
    const foods: FoodItem[] = [];
    results.forEach((result) => {
      if (result.success && result.data && result.data.length > 0) {
        // 첫 번째 결과만 추가 (나중에 선택 모달에서 처리)
        foods.push(result.data[0]);
      }
    });

    return foods;
  }

  /**
   * 인식된 음식에 대한 모든 검색 결과 조회
   * 여러 매칭 결과가 있을 경우를 대비
   */
  async getAllSearchResultsForDetectedFood(
    detectedFood: DetectedFood,
  ): Promise<FoodItem[]> {
    const result = await this.getFoodNutritionInfo(
      detectedFood.name,
      detectedFood.nameKo,
      detectedFood.nameEn,
    );

    if (result.success && result.data) {
      return result.data;
    }

    return [];
  }

  /**
   * 모든 음식 목록 조회 (대체 음식 추천용)
   */
  async getAllFoods(): Promise<ApiResponse<FoodItem[]>> {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.SEARCH_FOOD}`,
        {
          params: {
            all: true, // 모든 음식 조회
          },
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return {
        success: true,
        data: response.data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '음식 목록 조회 중 오류가 발생했습니다.',
        data: [],
      };
    }
  }

  /**
   * Supabase를 통한 음식 정보 검색
   */
  async searchFoodFromSupabase(
    query: string,
    nameKo?: string,
    nameEn?: string,
  ): Promise<FoodItem[]> {
    try {
      // Supabase 클라이언트 사용 예시
      // 실제 구현 시 @supabase/supabase-js 사용
      /*
      const {data, error} = await supabase
        .from('foods')
        .select('*')
        .or(`name_ko.ilike.%${query}%,name_en.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
      */

      // 임시 구현
      return [];
    } catch (error) {
      console.error('Supabase 검색 오류:', error);
      return [];
    }
  }

  /**
   * Supabase를 통한 음식 정보 조회
   */
  async getFoodFromSupabase(foodName: string): Promise<FoodItem | null> {
    try {
      // Supabase 클라이언트 사용 예시
      // const {data, error} = await supabase
      //   .from('foods')
      //   .select('*')
      //   .ilike('name', `%${foodName}%`)
      //   .limit(1)
      //   .single();

      // if (error) throw error;
      // return data;

      // 임시 구현
      return null;
    } catch (error) {
      console.error('Supabase 조회 오류:', error);
      return null;
    }
  }
}

export const foodDatabaseService = new FoodDatabaseService();
