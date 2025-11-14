import AsyncStorage from '@react-native-async-storage/async-storage';
import {FoodSuggestion, FoodItem, FoodCategory} from '../types';

const SUGGESTIONS_KEY = '@food_suggestions';

/**
 * 음식 제안 서비스
 * 사용자가 새로운 음식 정보를 제안할 수 있도록 함
 */
class FoodSuggestionService {
  /**
   * 음식 제안 저장
   */
  async submitSuggestion(suggestion: Omit<FoodSuggestion, 'id' | 'status' | 'createdAt'>): Promise<FoodSuggestion> {
    try {
      const suggestions = await this.getAllSuggestions();
      
      const newSuggestion: FoodSuggestion = {
        ...suggestion,
        id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date(),
      };

      suggestions.push(newSuggestion);
      await AsyncStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));

      return newSuggestion;
    } catch (error) {
      console.error('제안 저장 오류:', error);
      throw new Error('음식 제안 저장에 실패했습니다.');
    }
  }

  /**
   * 모든 제안 조회
   */
  async getAllSuggestions(): Promise<FoodSuggestion[]> {
    try {
      const data = await AsyncStorage.getItem(SUGGESTIONS_KEY);
      if (data) {
        const suggestions: FoodSuggestion[] = JSON.parse(data);
        return suggestions.map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('제안 조회 오류:', error);
      return [];
    }
  }

  /**
   * 사용자의 제안 조회
   */
  async getUserSuggestions(userId?: string): Promise<FoodSuggestion[]> {
    const all = await this.getAllSuggestions();
    if (!userId) return all;
    return all.filter((s) => s.suggestedBy === userId);
  }

  /**
   * 대기 중인 제안 조회 (관리자용)
   */
  async getPendingSuggestions(): Promise<FoodSuggestion[]> {
    const all = await this.getAllSuggestions();
    return all.filter((s) => s.status === 'pending');
  }

  /**
   * 제안 승인 (관리자용)
   */
  async approveSuggestion(suggestionId: string, reviewedBy: string): Promise<boolean> {
    try {
      const suggestions = await this.getAllSuggestions();
      const index = suggestions.findIndex((s) => s.id === suggestionId);
      
      if (index === -1) return false;

      suggestions[index] = {
        ...suggestions[index],
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy,
      };

      await AsyncStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
      return true;
    } catch (error) {
      console.error('제안 승인 오류:', error);
      return false;
    }
  }

  /**
   * 제안 거부 (관리자용)
   */
  async rejectSuggestion(suggestionId: string, reviewedBy: string): Promise<boolean> {
    try {
      const suggestions = await this.getAllSuggestions();
      const index = suggestions.findIndex((s) => s.id === suggestionId);
      
      if (index === -1) return false;

      suggestions[index] = {
        ...suggestions[index],
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy,
      };

      await AsyncStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
      return true;
    } catch (error) {
      console.error('제안 거부 오류:', error);
      return false;
    }
  }

  /**
   * 제안을 FoodItem으로 변환
   */
  convertSuggestionToFoodItem(suggestion: FoodSuggestion): FoodItem {
    return {
      id: suggestion.id,
      nameKo: suggestion.nameKo,
      nameEn: suggestion.nameEn || '',
      glycemicIndex: suggestion.glycemicIndex || 0,
      carbohydratesPer100g: suggestion.carbohydratesPer100g || 0,
      standardServingSize: suggestion.standardServingSize || 100,
      calculatedGL: suggestion.glycemicIndex && suggestion.carbohydratesPer100g
        ? Math.round((suggestion.glycemicIndex * suggestion.carbohydratesPer100g) / 100)
        : 0,
      category: suggestion.category || '기타',
      imageUrl: suggestion.imageUrl,
      glClassification: suggestion.glycemicIndex && suggestion.carbohydratesPer100g
        ? (Math.round((suggestion.glycemicIndex * suggestion.carbohydratesPer100g) / 100) <= 10
            ? 'SAFE'
            : Math.round((suggestion.glycemicIndex * suggestion.carbohydratesPer100g) / 100) < 20
            ? 'MODERATE'
            : 'HIGH_RISK')
        : 'SAFE',
      createdAt: suggestion.createdAt,
      updatedAt: suggestion.reviewedAt,
    };
  }
}

export const foodSuggestionService = new FoodSuggestionService();

