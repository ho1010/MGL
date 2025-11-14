/**
 * 최적화된 음식 데이터베이스 서비스
 * 쿼리 최적화, 캐싱, 인덱싱 포함
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FoodItem, ApiResponse, DetectedFood} from '../types';
import {foodDatabaseService} from './foodDatabaseService';

const FOOD_CACHE_KEY = '@food_cache';
const SEARCH_CACHE_KEY = '@search_cache';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24시간
const MAX_SEARCH_CACHE_SIZE = 100; // 최대 검색 캐시 수

interface CachedFood {
  food: FoodItem;
  timestamp: number;
}

interface SearchCacheEntry {
  query: string;
  results: FoodItem[];
  timestamp: number;
}

/**
 * 최적화된 음식 데이터베이스 서비스
 */
class OptimizedFoodDatabaseService {
  private foodCache: Map<string, CachedFood> = new Map();
  private searchCache: Map<string, SearchCacheEntry> = new Map();

  /**
   * 초기화 - 캐시 로드
   */
  async initialize(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(FOOD_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        this.foodCache = new Map(data);
        await this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('음식 캐시 초기화 오류:', error);
    }
  }

  /**
   * 만료된 캐시 정리
   */
  private async cleanExpiredCache(): Promise<void> {
    const now = Date.now();
    const expired: string[] = [];

    this.foodCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_EXPIRY_TIME) {
        expired.push(key);
      }
    });

    expired.forEach((key) => this.foodCache.delete(key));

    // 검색 캐시도 정리
    this.searchCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_EXPIRY_TIME) {
        this.searchCache.delete(key);
      }
    });

    await this.saveCache();
  }

  /**
   * 캐시 저장
   */
  private async saveCache(): Promise<void> {
    try {
      const data = Array.from(this.foodCache.entries());
      await AsyncStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('캐시 저장 오류:', error);
    }
  }

  /**
   * 음식 ID로 조회 (캐시 우선)
   */
  async getFoodById(foodId: string): Promise<FoodItem | null> {
    // 캐시 확인
    const cached = this.foodCache.get(foodId);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME) {
      return cached.food;
    }

    // 캐시 미스 - API 호출
    try {
      const response = await foodDatabaseService.searchFood(foodId);
      if (response.success && response.data && response.data.length > 0) {
        const food = response.data[0];
        this.foodCache.set(foodId, {
          food,
          timestamp: Date.now(),
        });
        await this.saveCache();
        return food;
      }
    } catch (error) {
      console.error('음식 조회 오류:', error);
    }

    return null;
  }

  /**
   * 최적화된 음식 검색 (캐시 및 인덱싱 활용)
   */
  async searchFoodOptimized(
    query: string,
    limit: number = 20,
  ): Promise<FoodItem[]> {
    const normalizedQuery = query.toLowerCase().trim();

    // 검색 캐시 확인
    const cachedSearch = this.searchCache.get(normalizedQuery);
    if (cachedSearch && Date.now() - cachedSearch.timestamp < CACHE_EXPIRY_TIME) {
      return cachedSearch.results.slice(0, limit);
    }

    // 실제 검색 수행
    try {
      const response = await foodDatabaseService.searchFood(query);
      let results: FoodItem[] = [];

      if (response.success && response.data) {
        results = response.data;
      }

      // 검색 결과 캐싱
      if (this.searchCache.size >= MAX_SEARCH_CACHE_SIZE) {
        // 가장 오래된 항목 제거
        const oldestKey = Array.from(this.searchCache.keys())[0];
        this.searchCache.delete(oldestKey);
      }

      this.searchCache.set(normalizedQuery, {
        query: normalizedQuery,
        results,
        timestamp: Date.now(),
      });

      return results.slice(0, limit);
    } catch (error) {
      console.error('검색 오류:', error);
      return [];
    }
  }

  /**
   * 여러 음식 일괄 조회 (배치 최적화)
   */
  async getMultipleFoodsOptimized(
    detectedFoods: DetectedFood[],
  ): Promise<FoodItem[]> {
    const results: FoodItem[] = [];
    const uncachedFoods: DetectedFood[] = [];

    // 캐시에서 먼저 조회
    for (const detected of detectedFoods) {
      const searchQueries = [
        detected.nameKo,
        detected.nameEn,
        detected.name,
      ].filter(Boolean) as string[];

      let found = false;
      for (const query of searchQueries) {
        const cached = await this.searchFoodOptimized(query, 1);
        if (cached.length > 0) {
          results.push(cached[0]);
          found = true;
          break;
        }
      }

      if (!found) {
        uncachedFoods.push(detected);
      }
    }

    // 캐시에 없는 음식만 API 호출 (배치 처리)
    if (uncachedFoods.length > 0) {
      const apiPromises = uncachedFoods.map((detected) =>
        foodDatabaseService.getFoodNutritionInfo(
          detected.name,
          detected.nameKo,
          detected.nameEn,
        ),
      );

      const apiResults = await Promise.all(apiPromises);
      apiResults.forEach((result) => {
        if (result.success && result.data && result.data.length > 0) {
          const food = result.data[0];
          results.push(food);
          // 캐시에 저장
          this.foodCache.set(food.id, {
            food,
            timestamp: Date.now(),
          });
        }
      });

      await this.saveCache();
    }

    return results;
  }

  /**
   * 인덱스 기반 빠른 검색 (카테고리별)
   */
  async searchByCategory(
    category: string,
    limit: number = 50,
  ): Promise<FoodItem[]> {
    // 실제로는 데이터베이스 인덱스를 활용한 쿼리
    const query = `category:${category}`;
    return this.searchFoodOptimized(query, limit);
  }

  /**
   * GL 범위별 검색 최적화
   */
  async searchByGLRange(
    minGL: number,
    maxGL: number,
    limit: number = 50,
  ): Promise<FoodItem[]> {
    // 실제로는 데이터베이스 인덱스를 활용한 범위 쿼리
    const query = `gl:${minGL}-${maxGL}`;
    return this.searchFoodOptimized(query, limit);
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): {
    foodCacheSize: number;
    searchCacheSize: number;
  } {
    return {
      foodCacheSize: this.foodCache.size,
      searchCacheSize: this.searchCache.size,
    };
  }

  /**
   * 캐시 초기화
   */
  async clearCache(): Promise<void> {
    this.foodCache.clear();
    this.searchCache.clear();
    await AsyncStorage.removeItem(FOOD_CACHE_KEY);
    await AsyncStorage.removeItem(SEARCH_CACHE_KEY);
  }
}

export const optimizedFoodDatabaseService = new OptimizedFoodDatabaseService();

