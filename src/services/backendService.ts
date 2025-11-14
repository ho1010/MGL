import {MealRecord, ApiResponse, User} from '../types';
import {API_ENDPOINTS} from '../constants';
import {config} from '../../config/api';
import axios from 'axios';

/**
 * 백엔드 서비스
 * Firebase 또는 Supabase를 통한 데이터 저장/조회
 */
class BackendService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.apiBaseURL || 'https://api.example.com';
  }

  /**
   * 식사 기록 저장
   */
  async saveMealRecord(
    mealRecord: Omit<MealRecord, 'id' | 'timestamp'>,
  ): Promise<ApiResponse<MealRecord>> {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.MEAL_RECORDS}`,
        {
          ...mealRecord,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '식사 기록 저장 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 식사 기록 조회
   */
  async getMealRecords(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ApiResponse<MealRecord[]>> {
    try {
      const params: any = {userId};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.MEAL_RECORDS}`,
        {
          params,
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
      return {
        success: false,
        error: error.message || '식사 기록 조회 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 사용자 정보 조회
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await axios.get(`${this.baseURL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '사용자 정보 조회 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(
    userId: string,
    userData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    try {
      const response = await axios.put(
        `${this.baseURL}/api/users/${userId}`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '사용자 정보 업데이트 중 오류가 발생했습니다.',
      };
    }
  }
}

export const backendService = new BackendService();

