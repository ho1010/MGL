import {DailyGLStats, PeriodStats, MealRecord} from '../types';
import {GLSafetyLevel} from '../constants';
import {getGLSafetyLevel} from './glCalculator';

/**
 * 통계 계산 유틸리티
 */

/**
 * 일일 목표 GL 대비 진행률 계산
 */
export const calculateDailyProgress = (
  currentGL: number,
  targetGL: number = 80,
): {
  percentage: number;
  remaining: number;
  isOverTarget: boolean;
} => {
  const percentage = Math.min((currentGL / targetGL) * 100, 100);
  const remaining = Math.max(targetGL - currentGL, 0);
  const isOverTarget = currentGL > targetGL;

  return {
    percentage,
    remaining,
    isOverTarget,
  };
};

/**
 * 안전도별 음식 비율 계산
 */
export const calculateSafetyRatio = (stats: DailyGLStats) => {
  const total = stats.safetyBreakdown.safe +
    stats.safetyBreakdown.moderate +
    stats.safetyBreakdown.highRisk;

  if (total === 0) {
    return {
      safe: 0,
      moderate: 0,
      highRisk: 0,
    };
  }

  return {
    safe: (stats.safetyBreakdown.safe / total) * 100,
    moderate: (stats.safetyBreakdown.moderate / total) * 100,
    highRisk: (stats.safetyBreakdown.highRisk / total) * 100,
  };
};

/**
 * 주간/월간 GL 추이 데이터 생성 (차트용)
 */
export const generateGLTrendData = (
  periodStats: PeriodStats,
): Array<{date: string; gl: number; label: string}> => {
  return periodStats.dailyStats.map((daily) => ({
    date: daily.date,
    gl: daily.totalGL,
    label: `${daily.date.split('-')[2]}일`,
  }));
};

/**
 * 안전도 비율 차트 데이터 생성
 */
export const generateSafetyRatioData = (stats: DailyGLStats) => {
  const ratio = calculateSafetyRatio(stats);
  return [
    {
      x: '안전',
      y: ratio.safe,
      color: '#50C878',
    },
    {
      x: '위험',
      y: ratio.moderate,
      color: '#FFA500',
    },
    {
      x: '매우 위험',
      y: ratio.highRisk,
      color: '#FF4444',
    },
  ].filter((item) => item.y > 0); // 0인 항목 제외
};

/**
 * 식사 타입별 GL 합계 계산
 */
export const calculateGLByMealType = (
  records: MealRecord[],
): {
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
} => {
  const result = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };

  records.forEach((record) => {
    result[record.mealType] += record.totalGL;
  });

  return result;
};

/**
 * 주간 평균 GL 계산
 */
export const calculateWeeklyAverage = (weeklyStats: PeriodStats): number => {
  return weeklyStats.averageGL;
};

/**
 * 월간 평균 GL 계산
 */
export const calculateMonthlyAverage = (monthlyStats: PeriodStats): number => {
  return monthlyStats.averageGL;
};

/**
 * 목표 달성 일수 계산
 */
export const calculateTargetAchievementDays = (
  periodStats: PeriodStats,
  targetGL: number = 80,
): number => {
  return periodStats.dailyStats.filter(
    (daily) => daily.totalGL <= targetGL,
  ).length;
};

