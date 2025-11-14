import AsyncStorage from '@react-native-async-storage/async-storage';
import {MealRecord, DailyGLStats, PeriodStats} from '../types';
import {calculateTotalGL} from '../utils/glCalculator';
import {getGLSafetyLevel} from '../utils/glCalculator';
import {GLSafetyLevel} from '../constants';

const MEAL_RECORDS_KEY = '@meal_records';
const DAILY_GL_TARGET = 80;

/**
 * 식사 기록 서비스
 * AsyncStorage를 사용한 로컬 저장
 */
class MealRecordService {
  /**
   * 모든 식사 기록 조회
   */
  async getAllMealRecords(): Promise<MealRecord[]> {
    try {
      const data = await AsyncStorage.getItem(MEAL_RECORDS_KEY);
      if (data) {
        const records: MealRecord[] = JSON.parse(data);
        // Date 객체 복원
        return records.map((record) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('식사 기록 조회 오류:', error);
      return [];
    }
  }

  /**
   * 식사 기록 저장
   */
  async saveMealRecord(
    mealData: Omit<MealRecord, 'id' | 'timestamp'> & {
      timestamp?: Date;
    },
  ): Promise<MealRecord> {
    try {
      const records = await this.getAllMealRecords();

      const newRecord: MealRecord = {
        id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...mealData,
        timestamp: mealData.timestamp || new Date(),
        totalGL: calculateTotalGL(mealData.foods),
      };

      records.push(newRecord);
      await AsyncStorage.setItem(MEAL_RECORDS_KEY, JSON.stringify(records));

      return newRecord;
    } catch (error) {
      console.error('식사 기록 저장 오류:', error);
      throw new Error('식사 기록 저장에 실패했습니다.');
    }
  }

  /**
   * 특정 날짜의 식사 기록 조회
   */
  async getMealRecordsByDate(date: Date): Promise<MealRecord[]> {
    try {
      const records = await this.getAllMealRecords();
      const dateStr = this.formatDate(date);

      return records.filter((record) => {
        const recordDateStr = this.formatDate(record.timestamp);
        return recordDateStr === dateStr;
      });
    } catch (error) {
      console.error('날짜별 식사 기록 조회 오류:', error);
      return [];
    }
  }

  /**
   * 일일 GL 통계 계산
   */
  async getDailyGLStats(date: Date): Promise<DailyGLStats> {
    try {
      const records = await this.getMealRecordsByDate(date);
      const totalGL = records.reduce((sum, record) => sum + record.totalGL, 0);

      const safetyBreakdown = {
        safe: 0,
        moderate: 0,
        highRisk: 0,
      };

      records.forEach((record) => {
        record.foods.forEach((food) => {
          const level = getGLSafetyLevel(food.calculatedGL);
          if (level === GLSafetyLevel.SAFE) {
            safetyBreakdown.safe++;
          } else if (level === GLSafetyLevel.MODERATE) {
            safetyBreakdown.moderate++;
          } else {
            safetyBreakdown.highRisk++;
          }
        });
      });

      return {
        date: this.formatDate(date),
        totalGL,
        mealCount: records.length,
        meals: records,
        safetyBreakdown,
      };
    } catch (error) {
      console.error('일일 통계 계산 오류:', error);
      return {
        date: this.formatDate(date),
        totalGL: 0,
        mealCount: 0,
        meals: [],
        safetyBreakdown: {safe: 0, moderate: 0, highRisk: 0},
      };
    }
  }

  /**
   * 주간 통계 계산
   */
  async getWeeklyStats(startDate: Date): Promise<PeriodStats> {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const dailyStats: DailyGLStats[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const stats = await this.getDailyGLStats(new Date(currentDate));
        dailyStats.push(stats);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const totalGL = dailyStats.reduce((sum, stat) => sum + stat.totalGL, 0);
      const totalMeals = dailyStats.reduce(
        (sum, stat) => sum + stat.mealCount,
        0,
      );

      return {
        period: 'week',
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        dailyStats,
        averageGL: dailyStats.length > 0 ? totalGL / dailyStats.length : 0,
        totalMeals,
      };
    } catch (error) {
      console.error('주간 통계 계산 오류:', error);
      throw error;
    }
  }

  /**
   * 월간 통계 계산
   */
  async getMonthlyStats(year: number, month: number): Promise<PeriodStats> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // 해당 월의 마지막 날

      const dailyStats: DailyGLStats[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const stats = await this.getDailyGLStats(new Date(currentDate));
        dailyStats.push(stats);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const totalGL = dailyStats.reduce((sum, stat) => sum + stat.totalGL, 0);
      const totalMeals = dailyStats.reduce(
        (sum, stat) => sum + stat.mealCount,
        0,
      );

      return {
        period: 'month',
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        dailyStats,
        averageGL: dailyStats.length > 0 ? totalGL / dailyStats.length : 0,
        totalMeals,
      };
    } catch (error) {
      console.error('월간 통계 계산 오류:', error);
      throw error;
    }
  }

  /**
   * 식사 기록 삭제
   */
  async deleteMealRecord(recordId: string): Promise<boolean> {
    try {
      const records = await this.getAllMealRecords();
      const filteredRecords = records.filter(
        (record) => record.id !== recordId,
      );

      await AsyncStorage.setItem(
        MEAL_RECORDS_KEY,
        JSON.stringify(filteredRecords),
      );

      return true;
    } catch (error) {
      console.error('식사 기록 삭제 오류:', error);
      return false;
    }
  }

  /**
   * 모든 식사 기록 삭제 (초기화)
   */
  async clearAllMealRecords(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(MEAL_RECORDS_KEY);
      return true;
    } catch (error) {
      console.error('식사 기록 초기화 오류:', error);
      return false;
    }
  }

  /**
   * 날짜 포맷팅 (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 목표 GL 가져오기
   */
  getDailyGLTarget(): number {
    return DAILY_GL_TARGET;
  }

  /**
   * 식사 타입 레이블 가져오기
   */
  getMealTypeLabel(mealType: string): string {
    const labels: {[key: string]: string} = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
      snack: '간식',
    };
    return labels[mealType] || mealType;
  }
}

export const mealRecordService = new MealRecordService();
