/**
 * GL 계산 정확성 테스트
 */
import {
  calculateGL,
  calculateGLForServing,
  getGLSafetyLevel,
  getGLClassification,
  calculateTotalGL,
  getGLSafetyMessage,
} from '../utils/glCalculator';
import {GLSafetyLevel} from '../constants';
import {FoodItem} from '../types';

describe('GL Calculator', () => {
  describe('calculateGL', () => {
    it('기본 GL 계산이 정확해야 함', () => {
      // GL = (GI × 탄수화물(g)) / 100
      expect(calculateGL(50, 20)).toBe(10); // (50 × 20) / 100 = 10
      expect(calculateGL(70, 30)).toBe(21); // (70 × 30) / 100 = 21
      expect(calculateGL(100, 15)).toBe(15); // (100 × 15) / 100 = 15
    });

    it('소수점 반올림이 정확해야 함', () => {
      expect(calculateGL(33, 30)).toBe(10); // (33 × 30) / 100 = 9.9 → 10
      expect(calculateGL(66, 15)).toBe(10); // (66 × 15) / 100 = 9.9 → 10
    });

    it('0 값 처리', () => {
      expect(calculateGL(0, 20)).toBe(0);
      expect(calculateGL(50, 0)).toBe(0);
      expect(calculateGL(0, 0)).toBe(0);
    });
  });

  describe('calculateGLForServing', () => {
    it('표준 섭취량 기준 GL 계산이 정확해야 함', () => {
      // GL = (GI × (100g당 탄수화물 × 표준섭취량/100)) / 100
      // GI: 50, 100g당 탄수화물: 20g, 섭취량: 100g
      // 탄수화물 = (20 × 100) / 100 = 20g
      // GL = (50 × 20) / 100 = 10
      expect(calculateGLForServing(50, 20, 100)).toBe(10);

      // GI: 70, 100g당 탄수화물: 30g, 섭취량: 50g
      // 탄수화물 = (30 × 50) / 100 = 15g
      // GL = (70 × 15) / 100 = 10.5 → 11
      expect(calculateGLForServing(70, 30, 50)).toBe(11);
    });

    it('다양한 섭취량에 대해 정확하게 계산해야 함', () => {
      expect(calculateGLForServing(60, 25, 80)).toBe(12); // (60 × 20) / 100 = 12
      expect(calculateGLForServing(40, 15, 200)).toBe(12); // (40 × 30) / 100 = 12
    });
  });

  describe('getGLSafetyLevel', () => {
    it('안전한 GL 값 (≤10)을 올바르게 판단해야 함', () => {
      expect(getGLSafetyLevel(0)).toBe(GLSafetyLevel.SAFE);
      expect(getGLSafetyLevel(5)).toBe(GLSafetyLevel.SAFE);
      expect(getGLSafetyLevel(10)).toBe(GLSafetyLevel.SAFE);
    });

    it('중간 GL 값 (11-19)을 올바르게 판단해야 함', () => {
      expect(getGLSafetyLevel(11)).toBe(GLSafetyLevel.MODERATE);
      expect(getGLSafetyLevel(15)).toBe(GLSafetyLevel.MODERATE);
      expect(getGLSafetyLevel(19)).toBe(GLSafetyLevel.MODERATE);
    });

    it('위험한 GL 값 (≥20)을 올바르게 판단해야 함', () => {
      expect(getGLSafetyLevel(20)).toBe(GLSafetyLevel.HIGH_RISK);
      expect(getGLSafetyLevel(25)).toBe(GLSafetyLevel.HIGH_RISK);
      expect(getGLSafetyLevel(50)).toBe(GLSafetyLevel.HIGH_RISK);
    });
  });

  describe('getGLClassification', () => {
    it('GL 분류가 정확해야 함', () => {
      expect(getGLClassification(5)).toBe('SAFE');
      expect(getGLClassification(15)).toBe('MODERATE');
      expect(getGLClassification(25)).toBe('HIGH_RISK');
    });
  });

  describe('calculateTotalGL', () => {
    it('여러 음식의 총 GL을 정확하게 계산해야 함', () => {
      const foods: FoodItem[] = [
        {
          id: '1',
          nameKo: '사과',
          nameEn: 'Apple',
          glycemicIndex: 36,
          carbohydratesPer100g: 14,
          standardServingSize: 100,
          calculatedGL: 5,
          category: '과일',
          glClassification: 'SAFE',
        },
        {
          id: '2',
          nameKo: '바나나',
          nameEn: 'Banana',
          glycemicIndex: 51,
          carbohydratesPer100g: 23,
          standardServingSize: 100,
          calculatedGL: 12,
          category: '과일',
          glClassification: 'MODERATE',
        },
        {
          id: '3',
          nameKo: '흰쌀밥',
          nameEn: 'White Rice',
          glycemicIndex: 73,
          carbohydratesPer100g: 28,
          standardServingSize: 100,
          calculatedGL: 20,
          category: '곡물',
          glClassification: 'HIGH_RISK',
        },
      ];

      expect(calculateTotalGL(foods)).toBe(37); // 5 + 12 + 20
    });

    it('빈 배열의 총 GL은 0이어야 함', () => {
      expect(calculateTotalGL([])).toBe(0);
    });
  });

  describe('getGLSafetyMessage', () => {
    it('각 GL 레벨에 맞는 메시지를 반환해야 함', () => {
      expect(getGLSafetyMessage(5)).toContain('안전한 수준');
      expect(getGLSafetyMessage(15)).toContain('주의가 필요');
      expect(getGLSafetyMessage(25)).toContain('매우 위험');
    });
  });

  describe('엣지 케이스', () => {
    it('매우 큰 값 처리', () => {
      expect(calculateGL(100, 100)).toBe(100);
      expect(getGLSafetyLevel(100)).toBe(GLSafetyLevel.HIGH_RISK);
    });

    it('음수 값 처리 (방어 코드)', () => {
      // 실제로는 음수가 들어오지 않아야 하지만 방어 코드 테스트
      expect(() => calculateGL(-10, 20)).not.toThrow();
    });
  });
});

