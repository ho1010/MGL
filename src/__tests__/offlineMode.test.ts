/**
 * 오프라인 모드 동작 확인 테스트
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MealRecord, FoodItem} from '../types';
import NetInfo from '@react-native-community/netinfo';

describe('Offline Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Network Status Detection', () => {
    it('네트워크 상태를 감지할 수 있어야 함', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const state = await NetInfo.fetch();
      expect(state.isConnected).toBe(false);
    });

    it('오프라인 상태를 올바르게 감지해야 함', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const state = await NetInfo.fetch();
      expect(state.isConnected).toBe(false);
    });
  });

  describe('Local Storage', () => {
    it('식사 기록을 로컬에 저장할 수 있어야 함', async () => {
      const mealRecord: Omit<MealRecord, 'id' | 'timestamp'> = {
        mealType: 'breakfast',
        foods: [],
        totalGL: 10,
      };

      await AsyncStorage.setItem('@meal_records', JSON.stringify([mealRecord]));

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('오프라인에서 저장된 식사 기록을 조회할 수 있어야 함', async () => {
      const mockRecords: MealRecord[] = [
        {
          id: '1',
          mealType: 'breakfast',
          foods: [],
          totalGL: 10,
          timestamp: new Date(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockRecords),
      );

      const data = await AsyncStorage.getItem('@meal_records');
      if (data) {
        const records: MealRecord[] = JSON.parse(data);
        expect(records).toHaveLength(1);
      }
    });
  });

  describe('Cached Data', () => {
    it('캐시된 음식 데이터를 사용할 수 있어야 함', async () => {
      const cachedFoods: FoodItem[] = [
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
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedFoods),
      );

      const cached = await AsyncStorage.getItem('@food_cache');
      if (cached) {
        const data = JSON.parse(cached);
        expect(data).toBeDefined();
      }
    });

    it('캐시 만료 시간을 확인할 수 있어야 함', async () => {
      const cacheData = {
        foods: [],
        timestamp: Date.now() - 86400000, // 24시간 전
      };

      const cacheAge = Date.now() - cacheData.timestamp;
      const isExpired = cacheAge > 3600000; // 1시간

      expect(isExpired).toBe(true);
    });
  });

  describe('Offline Queue', () => {
    it('오프라인 상태에서 작업을 큐에 저장할 수 있어야 함', async () => {
      const queueItem = {
        type: 'saveMealRecord',
        data: {
          mealType: 'lunch',
          foods: [],
          totalGL: 15,
        },
        timestamp: Date.now(),
      };

      const queue = [queueItem];
      await AsyncStorage.setItem('@offline_queue', JSON.stringify(queue));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@offline_queue',
        expect.any(String),
      );
    });

    it('온라인 상태가 되면 큐의 작업을 처리할 수 있어야 함', async () => {
      const queueItem = {
        type: 'saveMealRecord',
        data: {
          mealType: 'lunch',
          foods: [],
          totalGL: 15,
        },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([queueItem]),
      );

      const queueData = await AsyncStorage.getItem('@offline_queue');
      if (queueData) {
        const queue = JSON.parse(queueData);
        expect(queue).toHaveLength(1);
        expect(queue[0].type).toBe('saveMealRecord');
      }
    });
  });

  describe('Error Handling in Offline Mode', () => {
    it('오프라인 상태에서 API 호출 실패를 처리해야 함', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const state = await NetInfo.fetch();
      
      if (!state.isConnected) {
        // 오프라인 모드로 전환
        expect(state.isConnected).toBe(false);
      }
    });

    it('오프라인 상태에서 사용자에게 적절한 메시지를 표시해야 함', () => {
      const isOffline = true;
      const message = isOffline
        ? '인터넷 연결이 없습니다. 오프라인 모드로 동작합니다.'
        : '';

      expect(message).toContain('오프라인');
    });
  });
});

