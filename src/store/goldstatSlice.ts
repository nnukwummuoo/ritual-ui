/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { URL } from '@/api/config';

interface Transaction {
  id: string;
  created_at: string;
  amount: string;
  description: string;
  status?: 'completed' | 'pending' | 'failed';
}

interface MonthlySummary {
  month: string;
  total: number;
  data: {
    year: number;
    earning: Transaction[];
  };
}

interface GoldstatState {
  earnings: MonthlySummary[];
  history: Transaction[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: GoldstatState = {
  earnings: [],
  history: [],
  transactions: [],
  loading: false,
  error: null,
};

export const get_monthly_history = createAsyncThunk(
  'goldstat/get_monthly_history',
  async ({ userId, token }: { userId: string; token: string }, { rejectWithValue }) => {
    try {
      // API expects "userid" key (lowercase), map from our arg userId
      const response = await axios.post(`${URL}/statistics/monthly`, { userid: userId, token });
      // Adjust response.data as per backend structure
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch monthly history');
    }
  }
);

export const get_my_history = createAsyncThunk(
  'goldstat/get_my_history',
  async ({ userId, token }: { userId: string; token: string }, { rejectWithValue }) => {
    try {
      // API expects "userid" key (lowercase), map from our arg userId
      const response = await axios.post(`${URL}/statistics`, { userid: userId, token });
      // Adjust response.data as per backend structure
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const get_transaction_history = createAsyncThunk(
  'goldstat/get_transaction_history',
  async ({ userId, token }: { userId: string; token: string }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${URL}/transaction_history`, { userid: userId, token });
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

const goldstatSlice = createSlice({
  name: 'goldstat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(get_monthly_history.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(get_monthly_history.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Extract Month array from backend response
        state.earnings = action.payload.Month || action.payload;
      })
      .addCase(get_monthly_history.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(get_my_history.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(get_my_history.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(get_my_history.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(get_transaction_history.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(get_transaction_history.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.transactions = action.payload.transactions || [];
      })
      .addCase(get_transaction_history.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default goldstatSlice.reducer;
