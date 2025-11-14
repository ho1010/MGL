import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserSettings, BloodSugarRecord} from '../types';

const SETTINGS_KEY = '@user_settings';
const BLOOD_SUGAR_RECORDS_KEY = '@blood_sugar_records';
const DEFAULT_DAILY_GL_TARGET = 80;

/**
 * 사용자 설정 서비스
 * 로컬 스토리지에 사용자 설정 저장 및 관리
 */
class UserSettingsService {
  /**
   * 기본 설정 생성
   */
  private createDefaultSettings(userId: string): UserSettings {
    return {
      userId,
      dailyGLTarget: DEFAULT_DAILY_GL_TARGET,
      notifications: {
        mealTimeReminder: true,
        glExceedAlert: true,
        enabled: true,
        mealTimes: {
          breakfast: '08:00',
          lunch: '12:30',
          dinner: '18:30',
        },
      },
      preferredFoods: [],
      avoidedFoods: [],
      bloodSugarTracking: {
        enabled: false,
        targetRange: {
          min: 80,
          max: 140,
        },
      },
      updatedAt: new Date(),
    };
  }

  /**
   * 사용자 설정 조회
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        const settings: UserSettings = JSON.parse(data);
        // 사용자 ID 확인
        if (settings.userId === userId) {
          return {
            ...settings,
            updatedAt: new Date(settings.updatedAt),
          };
        }
      }
      // 기본 설정 반환
      return this.createDefaultSettings(userId);
    } catch (error) {
      console.error('설정 조회 오류:', error);
      return this.createDefaultSettings(userId);
    }
  }

  /**
   * 사용자 설정 저장
   */
  async saveUserSettings(settings: UserSettings): Promise<boolean> {
    try {
      const updatedSettings = {
        ...settings,
        updatedAt: new Date(),
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('설정 저장 오류:', error);
      return false;
    }
  }

  /**
   * 목표 일일 GL 업데이트
   */
  async updateDailyGLTarget(userId: string, target: number): Promise<boolean> {
    const settings = await this.getUserSettings(userId);
    settings.dailyGLTarget = target;
    return await this.saveUserSettings(settings);
  }

  /**
   * 알림 설정 업데이트
   */
  async updateNotificationSettings(
    userId: string,
    notifications: Partial<UserSettings['notifications']>,
  ): Promise<boolean> {
    const settings = await this.getUserSettings(userId);
    settings.notifications = {
      ...settings.notifications,
      ...notifications,
    };
    return await this.saveUserSettings(settings);
  }

  /**
   * 선호 음식 추가/제거
   */
  async togglePreferredFood(userId: string, foodId: string): Promise<boolean> {
    const settings = await this.getUserSettings(userId);
    const index = settings.preferredFoods.indexOf(foodId);
    if (index > -1) {
      settings.preferredFoods.splice(index, 1);
    } else {
      settings.preferredFoods.push(foodId);
    }
    return await this.saveUserSettings(settings);
  }

  /**
   * 피해야 할 음식 추가/제거
   */
  async toggleAvoidedFood(userId: string, foodId: string): Promise<boolean> {
    const settings = await this.getUserSettings(userId);
    const index = settings.avoidedFoods.indexOf(foodId);
    if (index > -1) {
      settings.avoidedFoods.splice(index, 1);
    } else {
      settings.avoidedFoods.push(foodId);
    }
    return await this.saveUserSettings(settings);
  }

  /**
   * 혈당 기록 저장
   */
  async saveBloodSugarRecord(record: Omit<BloodSugarRecord, 'id'>): Promise<BloodSugarRecord> {
    try {
      const records = await this.getBloodSugarRecords(record.userId);
      const newRecord: BloodSugarRecord = {
        ...record,
        id: `bs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      records.push(newRecord);
      await AsyncStorage.setItem(
        `${BLOOD_SUGAR_RECORDS_KEY}_${record.userId}`,
        JSON.stringify(records),
      );
      return newRecord;
    } catch (error) {
      console.error('혈당 기록 저장 오류:', error);
      throw new Error('혈당 기록 저장에 실패했습니다.');
    }
  }

  /**
   * 혈당 기록 조회
   */
  async getBloodSugarRecords(userId: string): Promise<BloodSugarRecord[]> {
    try {
      const data = await AsyncStorage.getItem(`${BLOOD_SUGAR_RECORDS_KEY}_${userId}`);
      if (data) {
        const records: BloodSugarRecord[] = JSON.parse(data);
        return records.map((record) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('혈당 기록 조회 오류:', error);
      return [];
    }
  }

  /**
   * 혈당 기록 삭제
   */
  async deleteBloodSugarRecord(userId: string, recordId: string): Promise<boolean> {
    try {
      const records = await this.getBloodSugarRecords(userId);
      const filtered = records.filter((r) => r.id !== recordId);
      await AsyncStorage.setItem(
        `${BLOOD_SUGAR_RECORDS_KEY}_${userId}`,
        JSON.stringify(filtered),
      );
      return true;
    } catch (error) {
      console.error('혈당 기록 삭제 오류:', error);
      return false;
    }
  }

  /**
   * 모든 데이터 백업 (JSON 형식)
   */
  async backupAllData(userId: string): Promise<string> {
    try {
      const settings = await this.getUserSettings(userId);
      const bloodSugarRecords = await this.getBloodSugarRecords(userId);
      
      // 다른 서비스에서 데이터 가져오기
      const mealRecordService = (await import('./mealRecordService')).mealRecordService;
      const searchService = (await import('./searchService')).searchService;
      
      const mealRecords = await mealRecordService.getAllMealRecords();
      const favorites = await searchService.getFavorites();
      
      const backup = {
        userId,
        settings,
        mealRecords,
        bloodSugarRecords,
        favorites,
        backupDate: new Date().toISOString(),
        version: '1.0',
      };
      
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('백업 오류:', error);
      throw new Error('데이터 백업에 실패했습니다.');
    }
  }

  /**
   * 데이터 복원
   */
  async restoreData(userId: string, backupJson: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupJson);
      
      if (backup.userId !== userId) {
        throw new Error('다른 사용자의 백업 데이터입니다.');
      }
      
      // 설정 복원
      if (backup.settings) {
        await this.saveUserSettings(backup.settings);
      }
      
      // 식사 기록 복원
      if (backup.mealRecords) {
        const mealRecordService = (await import('./mealRecordService')).mealRecordService;
        // 기존 데이터는 유지하고 추가만 함
        for (const record of backup.mealRecords) {
          try {
            await mealRecordService.saveMealRecord(record);
          } catch {
            // 중복 무시
          }
        }
      }
      
      // 혈당 기록 복원
      if (backup.bloodSugarRecords) {
        for (const record of backup.bloodSugarRecords) {
          try {
            await this.saveBloodSugarRecord(record);
          } catch {
            // 중복 무시
          }
        }
      }
      
      // 즐겨찾기 복원
      if (backup.favorites) {
        const searchService = (await import('./searchService')).searchService;
        for (const foodId of backup.favorites) {
          await searchService.addFavorite(foodId);
        }
      }
      
      return true;
    } catch (error) {
      console.error('복원 오류:', error);
      throw new Error('데이터 복원에 실패했습니다.');
    }
  }
}

export const userSettingsService = new UserSettingsService();

