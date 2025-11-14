import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {MealRecord, DailyGLStats, PeriodStats} from '../../types';
import {mealRecordService} from '../../services/mealRecordService';
import {calculateTotalGL} from '../../utils/glCalculator';

// mealRecordService가 아직 없을 수 있으므로 임시로 처리
let mealRecordServiceInstance: any;
try {
  mealRecordServiceInstance = require('../../services/mealRecordService').mealRecordService;
} catch {
  // 서비스가 없으면 나중에 로드
}

interface MealState {
  records: MealRecord[];
  currentMeal: MealRecord | null;
  dailyStats: DailyGLStats | null;
  weeklyStats: PeriodStats | null;
  monthlyStats: PeriodStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: MealState = {
  records: [],
  currentMeal: null,
  dailyStats: null,
  weeklyStats: null,
  monthlyStats: null,
  loading: false,
  error: null,
};

// 모든 식사 기록 로드
export const loadAllMealRecords = createAsyncThunk(
  'meal/loadAll',
  async () => {
    const service = mealRecordServiceInstance || mealRecordService;
    return await service.getAllMealRecords();
  },
);

// 식사 기록 저장 비동기 액션
export const saveMealRecord = createAsyncThunk(
  'meal/saveRecord',
  async (mealData: Omit<MealRecord, 'id' | 'timestamp' | 'totalGL'>) => {
    const service = mealRecordServiceInstance || mealRecordService;
    const totalGL = calculateTotalGL(mealData.foods);
    const record = await service.saveMealRecord({
      ...mealData,
      totalGL,
    });
    return record;
  },
);

// 일일 통계 로드
export const loadDailyStats = createAsyncThunk(
  'meal/loadDailyStats',
  async (date: Date) => {
    const service = mealRecordServiceInstance || mealRecordService;
    return await service.getDailyGLStats(date);
  },
);

// 주간 통계 로드
export const loadWeeklyStats = createAsyncThunk(
  'meal/loadWeeklyStats',
  async (startDate: Date) => {
    const service = mealRecordServiceInstance || mealRecordService;
    return await service.getWeeklyStats(startDate);
  },
);

// 월간 통계 로드
export const loadMonthlyStats = createAsyncThunk(
  'meal/loadMonthlyStats',
  async ({year, month}: {year: number; month: number}) => {
    const service = mealRecordServiceInstance || mealRecordService;
    return await service.getMonthlyStats(year, month);
  },
);

// 식사 기록 삭제
export const deleteMealRecord = createAsyncThunk(
  'meal/deleteRecord',
  async (recordId: string) => {
    const service = mealRecordServiceInstance || mealRecordService;
    const success = await service.deleteMealRecord(recordId);
    if (!success) {
      throw new Error('삭제 실패');
    }
    return recordId;
  },
);

const mealSlice = createSlice({
  name: 'meal',
  initialState,
  reducers: {
    setCurrentMeal: (state, action: PayloadAction<MealRecord | null>) => {
      state.currentMeal = action.payload;
    },
    clearCurrentMeal: (state) => {
      state.currentMeal = null;
    },
    clearStats: (state) => {
      state.dailyStats = null;
      state.weeklyStats = null;
      state.monthlyStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 모든 기록 로드
      .addCase(loadAllMealRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAllMealRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(loadAllMealRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '로드 실패';
      })
      // 식사 기록 저장
      .addCase(saveMealRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveMealRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.push(action.payload);
        state.currentMeal = null;
      })
      .addCase(saveMealRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '저장 실패';
      })
      // 일일 통계
      .addCase(loadDailyStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDailyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyStats = action.payload;
      })
      .addCase(loadDailyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '통계 로드 실패';
      })
      // 주간 통계
      .addCase(loadWeeklyStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWeeklyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyStats = action.payload;
      })
      .addCase(loadWeeklyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '주간 통계 로드 실패';
      })
      // 월간 통계
      .addCase(loadMonthlyStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadMonthlyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyStats = action.payload;
      })
      .addCase(loadMonthlyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '월간 통계 로드 실패';
      })
      // 식사 기록 삭제
      .addCase(deleteMealRecord.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMealRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter(
          (record) => record.id !== action.payload,
        );
        // 통계도 다시 계산하도록 초기화
        state.dailyStats = null;
      })
      .addCase(deleteMealRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '삭제 실패';
      });
  },
});

export const {setCurrentMeal, clearCurrentMeal, clearStats} = mealSlice.actions;
export default mealSlice.reducer;

