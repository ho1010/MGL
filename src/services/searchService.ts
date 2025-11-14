import AsyncStorage from '@react-native-async-storage/async-storage';
import {FoodItem, FoodSearchFilter, FoodCategory} from '../types';
import {foodDatabaseService} from './foodDatabaseService';
import {getGLClassification} from '../utils/glCalculator';

const RECENT_SEARCHES_KEY = '@recent_searches';
const FAVORITES_KEY = '@favorite_foods';
const MAX_RECENT_SEARCHES = 20;

/**
 * 검색 서비스
 * 자동완성, 필터링, 즐겨찾기, 최근 조회 기능 제공
 */
class SearchService {
  /**
   * 음식 검색 (필터 적용)
   */
  async searchFoods(filter: FoodSearchFilter): Promise<FoodItem[]> {
    try {
      // 모든 음식 로드 (실제로는 페이지네이션 필요)
      const allFoodsResponse = await foodDatabaseService.getAllFoods();
      let foods: FoodItem[] = [];

      if (allFoodsResponse.success && allFoodsResponse.data) {
        foods = allFoodsResponse.data;
      } else {
        // Mock 데이터 사용
        foods = await this.getMockFoods();
      }

      // 필터 적용
      return this.applyFilters(foods, filter);
    } catch (error) {
      console.error('검색 오류:', error);
      return [];
    }
  }

  /**
   * 자동완성 검색
   */
  async getAutocompleteSuggestions(query: string, limit: number = 10): Promise<FoodItem[]> {
    if (!query || query.length < 1) {
      return [];
    }

    try {
      const allFoodsResponse = await foodDatabaseService.getAllFoods();
      let foods: FoodItem[] = [];

      if (allFoodsResponse.success && allFoodsResponse.data) {
        foods = allFoodsResponse.data;
      } else {
        foods = await this.getMockFoods();
      }

      const lowerQuery = query.toLowerCase();

      // 한글명 또는 영문명으로 검색
      const matches = foods.filter(
        (food) =>
          food.nameKo.toLowerCase().includes(lowerQuery) ||
          food.nameEn.toLowerCase().includes(lowerQuery),
      );

      // 관련도 순으로 정렬
      const sorted = matches.sort((a, b) => {
        const aStarts = a.nameKo.toLowerCase().startsWith(lowerQuery) || 
                       a.nameEn.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.nameKo.toLowerCase().startsWith(lowerQuery) || 
                       b.nameEn.toLowerCase().startsWith(lowerQuery);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return a.nameKo.localeCompare(b.nameKo);
      });

      return sorted.slice(0, limit);
    } catch (error) {
      console.error('자동완성 오류:', error);
      return [];
    }
  }

  /**
   * 필터 적용
   */
  private applyFilters(foods: FoodItem[], filter: FoodSearchFilter): FoodItem[] {
    let filtered = [...foods];

    // 검색어 필터
    if (filter.query && filter.query.trim()) {
      const query = filter.query.toLowerCase().trim();
      filtered = filtered.filter(
        (food) =>
          food.nameKo.toLowerCase().includes(query) ||
          food.nameEn.toLowerCase().includes(query),
      );
    }

    // 카테고리 필터
    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter((food) =>
        filter.categories!.includes(food.category),
      );
    }

    // GI 범위 필터
    if (filter.giRange) {
      if (filter.giRange.min !== undefined) {
        filtered = filtered.filter((food) => food.glycemicIndex >= filter.giRange!.min!);
      }
      if (filter.giRange.max !== undefined) {
        filtered = filtered.filter((food) => food.glycemicIndex <= filter.giRange!.max!);
      }
    }

    // GL 범위 필터
    if (filter.glRange) {
      if (filter.glRange.min !== undefined) {
        filtered = filtered.filter((food) => food.calculatedGL >= filter.glRange!.min!);
      }
      if (filter.glRange.max !== undefined) {
        filtered = filtered.filter((food) => food.calculatedGL <= filter.glRange!.max!);
      }
    }

    // GL 분류 필터
    if (filter.glClassification && filter.glClassification.length > 0) {
      filtered = filtered.filter((food) =>
        filter.glClassification!.includes(food.glClassification),
      );
    }

    return filtered;
  }

  /**
   * 최근 검색어 저장
   */
  async saveRecentSearch(query: string): Promise<void> {
    try {
      const recent = await this.getRecentSearches();
      const updated = [query, ...recent.filter((q) => q !== query)].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('최근 검색어 저장 오류:', error);
    }
  }

  /**
   * 최근 검색어 조회
   */
  async getRecentSearches(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('최근 검색어 조회 오류:', error);
      return [];
    }
  }

  /**
   * 최근 검색어 삭제
   */
  async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('최근 검색어 삭제 오류:', error);
    }
  }

  /**
   * 즐겨찾기 추가
   */
  async addFavorite(foodId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(foodId)) {
        favorites.push(foodId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
      return true;
    } catch (error) {
      console.error('즐겨찾기 추가 오류:', error);
      return false;
    }
  }

  /**
   * 즐겨찾기 제거
   */
  async removeFavorite(foodId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const updated = favorites.filter((id) => id !== foodId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('즐겨찾기 제거 오류:', error);
      return false;
    }
  }

  /**
   * 즐겨찾기 목록 조회
   */
  async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('즐겨찾기 조회 오류:', error);
      return [];
    }
  }

  /**
   * 즐겨찾기 여부 확인
   */
  async isFavorite(foodId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(foodId);
  }

  /**
   * 최근 조회 음식 저장
   */
  async saveRecentFood(foodId: string): Promise<void> {
    try {
      const recent = await this.getRecentFoods();
      const updated = [foodId, ...recent.filter((id) => id !== foodId)].slice(0, 50);
      await AsyncStorage.setItem('@recent_foods', JSON.stringify(updated));
    } catch (error) {
      console.error('최근 조회 음식 저장 오류:', error);
    }
  }

  /**
   * 최근 조회 음식 목록 조회
   */
  async getRecentFoods(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem('@recent_foods');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('최근 조회 음식 조회 오류:', error);
      return [];
    }
  }

  /**
   * Mock 데이터 (개발용)
   */
  private async getMockFoods(): Promise<FoodItem[]> {
    try {
      // 확장된 데이터 시도
      const extendedFoods = await import('../../database/extended_food_data.json');
      return extendedFoods.default.foods.map((food: any) => ({
        ...food,
        id: food.id.toString(),
        createdAt: new Date(food.createdAt),
        updatedAt: new Date(food.updatedAt),
      }));
    } catch {
      // 기본 샘플 데이터 사용
      try {
        const sampleFoods = await import('../../database/firestore_sample_data.json');
        return sampleFoods.default.foods.map((food: any) => ({
          ...food,
          id: food.id.toString(),
          createdAt: new Date(food.createdAt),
          updatedAt: new Date(food.updatedAt),
        }));
      } catch (error) {
        console.error('Mock 데이터 로드 오류:', error);
        return [];
      }
    }
  }
}

export const searchService = new SearchService();

