import {FoodItem, GLSafetyLevel, GLClassification} from '../types';
import {GL_THRESHOLD} from '../constants';

/**
 * 혈당부하지수(GL) 계산
 * GL = (GI × 탄수화물(g)) / 100
 */
export const calculateGL = (gi: number, carbs: number): number => {
  return Math.round((gi * carbs) / 100);
};

/**
 * 표준 섭취량 기준 GL 계산
 * GL = (GI × (100g당 탄수화물 × 표준섭취량/100)) / 100
 * 또는
 * GL = (GI × 1회 섭취량의 탄수화물 g) ÷ 100
 */
export const calculateGLForServing = (
  gi: number,
  carbsPer100g: number,
  servingSize: number,
): number => {
  const carbsInServing = (carbsPer100g * servingSize) / 100;
  return Math.round(calculateGL(gi, carbsInServing));
};

/**
 * 음식의 GL 안전성 레벨 판단
 */
export const getGLSafetyLevel = (gl: number): GLSafetyLevel => {
  if (gl <= GL_THRESHOLD.SAFE) {
    return GLSafetyLevel.SAFE;
  } else if (gl < GL_THRESHOLD.HIGH_RISK) {
    return GLSafetyLevel.MODERATE;
  } else {
    return GLSafetyLevel.HIGH_RISK;
  }
};

/**
 * GL 분류 반환 (문자열)
 */
export const getGLClassification = (gl: number): GLClassification => {
  if (gl <= GL_THRESHOLD.SAFE) {
    return 'SAFE';
  } else if (gl < GL_THRESHOLD.HIGH_RISK) {
    return 'MODERATE';
  } else {
    return 'HIGH_RISK';
  }
};

/**
 * 여러 음식의 총 GL 계산
 */
export const calculateTotalGL = (foods: FoodItem[]): number => {
  return foods.reduce((total, food) => total + food.calculatedGL, 0);
};

/**
 * GL 값에 따른 안전성 메시지 반환
 */
export const getGLSafetyMessage = (gl: number): string => {
  const level = getGLSafetyLevel(gl);
  switch (level) {
    case GLSafetyLevel.SAFE:
      return '안전한 수준입니다. (저혈당부하)';
    case GLSafetyLevel.MODERATE:
      return '주의가 필요합니다. (중혈당부하)';
    case GLSafetyLevel.HIGH_RISK:
      return '매우 위험합니다. (고혈당부하)';
    default:
      return '';
  }
};
