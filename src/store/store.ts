import {configureStore} from '@reduxjs/toolkit';
import foodReducer from './slices/foodSlice';
import mealReducer from './slices/mealSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    food: foodReducer,
    meal: mealReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

