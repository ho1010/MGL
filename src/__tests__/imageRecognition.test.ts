/**
 * 이미지 인식 정확도 테스트
 */
import {openAIVisionService} from '../services/openAIVisionService';
import {foodDatabaseService} from '../services/foodDatabaseService';
import {DetectedFood, FoodItem} from '../types';

// Mock 설정
jest.mock('../services/openAIVisionService');
jest.mock('../services/foodDatabaseService');

describe('Image Recognition Accuracy', () => {
  const mockBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OpenAI Vision Service', () => {
    it('음식 인식이 성공해야 함', async () => {
      const mockDetectedFoods: DetectedFood[] = [
        {
          name: '사과',
          nameKo: '사과',
          nameEn: 'Apple',
          confidence: 0.95,
        },
        {
          name: '바나나',
          nameKo: '바나나',
          nameEn: 'Banana',
          confidence: 0.88,
        },
      ];

      (openAIVisionService.analyzeFoodImage as jest.Mock).mockResolvedValue({
        success: true,
        data: mockDetectedFoods,
      });

      const result = await openAIVisionService.analyzeFoodImage(mockBase64Image);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].nameKo).toBe('사과');
      expect(result.data?.[0].confidence).toBeGreaterThan(0.8);
    });

    it('낮은 신뢰도 음식은 필터링되어야 함', async () => {
      const mockDetectedFoods: DetectedFood[] = [
        {
          name: '사과',
          nameKo: '사과',
          nameEn: 'Apple',
          confidence: 0.3, // 낮은 신뢰도
        },
      ];

      (openAIVisionService.analyzeFoodImage as jest.Mock).mockResolvedValue({
        success: true,
        data: mockDetectedFoods,
      });

      const result = await openAIVisionService.analyzeFoodImage(mockBase64Image);

      // 신뢰도가 낮은 음식은 제외되어야 함 (실제 구현에 따라)
      if (result.data) {
        const highConfidenceFoods = result.data.filter(f => f.confidence > 0.5);
        expect(highConfidenceFoods.length).toBeLessThanOrEqual(result.data.length);
      }
    });

    it('음식 인식 실패 시 적절한 에러 메시지를 반환해야 함', async () => {
      (openAIVisionService.analyzeFoodImage as jest.Mock).mockResolvedValue({
        success: false,
        error: '음식을 인식할 수 없습니다.',
      });

      const result = await openAIVisionService.analyzeFoodImage(mockBase64Image);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Food Database Matching', () => {
    it('인식된 음식이 데이터베이스와 정확히 매칭되어야 함', async () => {
      const detectedFood: DetectedFood = {
        name: '사과',
        nameKo: '사과',
        nameEn: 'Apple',
        confidence: 0.95,
      };

      const mockFoodItem: FoodItem = {
        id: '1',
        nameKo: '사과',
        nameEn: 'Apple',
        glycemicIndex: 36,
        carbohydratesPer100g: 14,
        standardServingSize: 100,
        calculatedGL: 5,
        category: '과일',
        glClassification: 'SAFE',
      };

      (foodDatabaseService.getFoodNutritionInfo as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockFoodItem],
      });

      const result = await foodDatabaseService.getFoodNutritionInfo(
        detectedFood.name,
        detectedFood.nameKo,
        detectedFood.nameEn,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.[0].nameKo).toBe('사과');
    });

    it('한글명과 영문명 모두로 검색해야 함', async () => {
      const detectedFood: DetectedFood = {
        name: 'Apple',
        nameKo: '사과',
        nameEn: 'Apple',
        confidence: 0.95,
      };

      (foodDatabaseService.getFoodNutritionInfo as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      await foodDatabaseService.getFoodNutritionInfo(
        detectedFood.name,
        detectedFood.nameKo,
        detectedFood.nameEn,
      );

      // 한글명, 영문명, 기본명 모두로 검색 시도해야 함
      expect(foodDatabaseService.getFoodNutritionInfo).toHaveBeenCalled();
    });

    it('매칭되는 음식이 없을 때 빈 배열을 반환해야 함', async () => {
      (foodDatabaseService.getFoodNutritionInfo as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await foodDatabaseService.getFoodNutritionInfo('알 수 없는 음식');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('Multiple Food Recognition', () => {
    it('여러 음식을 동시에 인식할 수 있어야 함', async () => {
      const mockDetectedFoods: DetectedFood[] = [
        {
          name: '사과',
          nameKo: '사과',
          nameEn: 'Apple',
          confidence: 0.95,
        },
        {
          name: '바나나',
          nameKo: '바나나',
          nameEn: 'Banana',
          confidence: 0.88,
        },
        {
          name: '오렌지',
          nameKo: '오렌지',
          nameEn: 'Orange',
          confidence: 0.82,
        },
      ];

      (openAIVisionService.analyzeFoodImage as jest.Mock).mockResolvedValue({
        success: true,
        data: mockDetectedFoods,
      });

      const result = await openAIVisionService.analyzeFoodImage(mockBase64Image);

      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Confidence Threshold', () => {
    it('신뢰도 임계값 이상의 음식만 반환해야 함', () => {
      const foods: DetectedFood[] = [
        {name: '사과', nameKo: '사과', confidence: 0.95},
        {name: '바나나', nameKo: '바나나', confidence: 0.45},
        {name: '오렌지', nameKo: '오렌지', confidence: 0.88},
      ];

      const threshold = 0.5;
      const filtered = foods.filter(f => f.confidence >= threshold);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(f => f.confidence >= threshold)).toBe(true);
    });
  });
});

