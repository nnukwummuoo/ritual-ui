import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { URL } from '../api/config';

// VIP Status Interface
export interface VipStatus {
  isVip: boolean;
  vipStartDate?: string;
  vipEndDate?: string;
  daysRemaining: number;
  autoRenewal?: boolean;
  goldBalance?: number;
}

// VIP State Interface
interface VipState {
  vipStatus: VipStatus | null;
  loading: boolean;
  error: string | null;
  upgradeLoading: boolean;
  upgradeError: string | null;
}

const initialState: VipState = {
  vipStatus: null,
  loading: false,
  error: null,
  upgradeLoading: false,
  upgradeError: null,
};

// Async thunk to check VIP status
export const checkVipStatus = createAsyncThunk(
  'vip/checkStatus',
  async (userid: string) => {
    try {
      const response = await axios.post(`${URL}/vip/status`, { userid });
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ [VIP STORE] Error checking VIP status:`, error);
      
      // Handle 404 specifically - user is not VIP
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          return { vipStatus: null };
        }
      }
      
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to check VIP status';
      throw errorMessage || 'Failed to check VIP status';
    }
  }
);

// Async thunk to upgrade to VIP
export const upgradeToVip = createAsyncThunk(
  'vip/upgrade',
  async ({ userid, duration = 30 }: { userid: string; duration?: number }) => {
    try {
      const response = await axios.post(`${URL}/vip/upgrade`, { 
        userid, 
        duration 
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to upgrade to VIP';
      throw errorMessage || 'Failed to upgrade to VIP';
    }
  }
);

// Async thunk to cancel VIP
export const cancelVip = createAsyncThunk(
  'vip/cancel',
  async (userid: string) => {
    try {
      const response = await axios.post(`${URL}/vip/cancel`, { userid });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to cancel VIP';
      throw errorMessage || 'Failed to cancel VIP';
    }
  }
);

const vipSlice = createSlice({
  name: 'vip',
  initialState,
  reducers: {
    clearVipError: (state) => {
      state.error = null;
      state.upgradeError = null;
    },
    resetVipStatus: (state) => {
      state.vipStatus = null;
      state.loading = false;
      state.error = null;
      state.upgradeLoading = false;
      state.upgradeError = null;
    },
  },
  extraReducers: (builder) => {
    // Check VIP Status
    builder
      .addCase(checkVipStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVipStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.vipStatus = action.payload.vipStatus;
        state.error = null;
        
        // Log VIP status for debugging
      })
      .addCase(checkVipStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to check VIP status';
        // Clear VIP status on error to prevent showing VIP when user is not VIP
        state.vipStatus = null;
      });

    // Upgrade to VIP
    builder
      .addCase(upgradeToVip.pending, (state) => {
        state.upgradeLoading = true;
        state.upgradeError = null;
      })
      .addCase(upgradeToVip.fulfilled, (state, action) => {
        state.upgradeLoading = false;
        state.vipStatus = action.payload.vipStatus;
        state.upgradeError = null;
      })
      .addCase(upgradeToVip.rejected, (state, action) => {
        state.upgradeLoading = false;
        state.upgradeError = action.error.message || 'Failed to upgrade to VIP';
      });

    // Cancel VIP
    builder
      .addCase(cancelVip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelVip.fulfilled, (state) => {
        state.loading = false;
        state.vipStatus = null;
        state.error = null;
      })
      .addCase(cancelVip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel VIP';
      });
  },
});

export const { clearVipError, resetVipStatus } = vipSlice.actions;
export default vipSlice.reducer;
