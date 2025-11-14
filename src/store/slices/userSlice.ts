import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {User} from '../../types';
import {backendService} from '../../services/backendService';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// 사용자 정보 조회 비동기 액션
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await backendService.getUser(userId);
    if (!response.success || !response.data) {
      throw new Error(response.error || '조회 실패');
    }
    return response.data;
  },
);

// 사용자 정보 업데이트 비동기 액션
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({userId, userData}: {userId: string; userData: Partial<User>}) => {
    const response = await backendService.updateUser(userId, userData);
    if (!response.success || !response.data) {
      throw new Error(response.error || '업데이트 실패');
    }
    return response.data;
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '조회 실패';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '업데이트 실패';
      });
  },
});

export const {setUser, clearUser} = userSlice.actions;
export default userSlice.reducer;

