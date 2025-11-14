import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {FoodItem, FoodAnalysisResult, DetectedFood} from '../../types';
import {openAIVisionService} from '../../services/openAIVisionService';
import {foodDatabaseService} from '../../services/foodDatabaseService';
import {imageProcessor} from '../../utils/imageProcessor';

interface FoodState {
  detectedFoods: FoodItem[];
  detectedFoodsRaw: DetectedFood[]; // AI가 인식한 원본 데이터
  analysisResult: FoodAnalysisResult | null;
  loading: boolean;
  error: string | null;
  pendingSelections: {
    detectedFood: DetectedFood;
    foodOptions: FoodItem[];
  }[]; // 선택 대기 중인 음식들
}

const initialState: FoodState = {
  detectedFoods: [],
  detectedFoodsRaw: [],
  analysisResult: null,
  loading: false,
  error: null,
  pendingSelections: [],
};

// 이미지 분석 비동기 액션
export const analyzeFoodImage = createAsyncThunk(
  'food/analyzeImage',
  async (imageData: string) => {
    // imageData는 base64 문자열이거나 이미지 URI일 수 있음
    // react-native-image-picker에서 base64를 직접 받은 경우 그대로 사용
    let imageBase64: string;
    
    // base64 형식인지 확인 (data:image로 시작하거나 base64 문자열)
    if (imageData.startsWith('data:image') || imageData.length > 1000) {
      // 이미 base64 형식
      imageBase64 = imageData.startsWith('data:image')
        ? imageData.split(',')[1] || imageData
        : imageData;
    } else {
      // URI인 경우 전처리 필요 (실제로는 react-native-fs 등 사용)
      // 임시로 URI 그대로 사용 (실제 구현 시 변환 필요)
      const processedImage = await imageProcessor.processImage(imageData);
      imageBase64 = processedImage.base64;
    }
    
    // 2. OpenAI Vision API로 음식 인식
    const aiResponse = await openAIVisionService.analyzeFoodImage(imageBase64);
    
    if (!aiResponse.success || !aiResponse.data) {
      throw new Error(aiResponse.error || '음식 인식 실패');
    }

    const detectedFoods = aiResponse.data;

    // 3. 인식된 각 음식에 대해 데이터베이스 검색
    const foodSearchPromises = detectedFoods.map(async (detected) => {
      const searchResult = await foodDatabaseService.getFoodNutritionInfo(
        detected.name,
        detected.nameKo,
        detected.nameEn,
      );
      
      return {
        detectedFood: detected,
        foodOptions: searchResult.success && searchResult.data 
          ? searchResult.data 
          : [],
      };
    });

    const searchResults = await Promise.all(foodSearchPromises);

    // 4. 결과 정리
    // 매칭되는 음식이 하나만 있는 경우 자동 선택
    const autoSelectedFoods: FoodItem[] = [];
    const pendingSelections: typeof searchResults = [];
    
    searchResults.forEach((result) => {
      if (result.foodOptions.length === 0) {
        // 매칭되는 음식이 없음 (무시)
        return;
      } else if (result.foodOptions.length === 1) {
        // 하나만 있으면 자동 선택
        autoSelectedFoods.push(result.foodOptions[0]);
      } else {
        // 여러 개 있으면 사용자 선택 필요
        pendingSelections.push(result);
      }
    });

    return {
      detectedFoodsRaw: detectedFoods,
      pendingSelections,
      autoSelectedFoods,
      analysisResult: {
        detectedFoods,
        confidence: detectedFoods.reduce((sum, f) => sum + f.confidence, 0) / detectedFoods.length,
        timestamp: new Date(),
      },
    };
  },
);

const foodSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    clearFoods: (state) => {
      state.detectedFoods = [];
      state.detectedFoodsRaw = [];
      state.analysisResult = null;
      state.error = null;
      state.pendingSelections = [];
    },
    addFood: (state, action: PayloadAction<FoodItem>) => {
      // 중복 체크
      if (!state.detectedFoods.find((f) => f.id === action.payload.id)) {
        state.detectedFoods.push(action.payload);
      }
    },
    removeFood: (state, action: PayloadAction<string>) => {
      state.detectedFoods = state.detectedFoods.filter(
        (food) => food.id !== action.payload,
      );
    },
    selectFoodForDetected: (
      state,
      action: PayloadAction<{
        detectedFoodName: string;
        selectedFood: FoodItem;
      }>,
    ) => {
      // 선택된 음식 추가
      if (!state.detectedFoods.find((f) => f.id === action.payload.selectedFood.id)) {
        state.detectedFoods.push(action.payload.selectedFood);
      }
      
      // pendingSelections에서 제거
      state.pendingSelections = state.pendingSelections.filter(
        (pending) => pending.detectedFood.name !== action.payload.detectedFoodName,
      );
    },
    clearPendingSelections: (state) => {
      state.pendingSelections = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeFoodImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.detectedFoods = [];
        state.pendingSelections = [];
      })
      .addCase(analyzeFoodImage.fulfilled, (state, action) => {
        state.loading = false;
        state.analysisResult = action.payload.analysisResult;
        state.detectedFoodsRaw = action.payload.detectedFoodsRaw;
        state.detectedFoods = action.payload.autoSelectedFoods;
        state.pendingSelections = action.payload.pendingSelections;
      })
      .addCase(analyzeFoodImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '분석 실패';
      });
  },
});

export const {
  clearFoods,
  addFood,
  removeFood,
  selectFoodForDetected,
  clearPendingSelections,
} = foodSlice.actions;
export default foodSlice.reducer;

