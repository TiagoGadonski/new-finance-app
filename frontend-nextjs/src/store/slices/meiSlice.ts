import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MeiDashboardDto, MeiAlertDto } from '@/types';

interface MeiState {
  dashboard: MeiDashboardDto | null;
  alerts: MeiAlertDto[];
  selectedYear: number;
  loading: boolean;
  error: string | null;
}

const initialState: MeiState = {
  dashboard: null,
  alerts: [],
  selectedYear: new Date().getFullYear(),
  loading: false,
  error: null,
};

const meiSlice = createSlice({
  name: 'mei',
  initialState,
  reducers: {
    setDashboard: (state, action: PayloadAction<MeiDashboardDto | null>) => {
      state.dashboard = action.payload;
    },
    setAlerts: (state, action: PayloadAction<MeiAlertDto[]>) => {
      state.alerts = action.payload;
    },
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setDashboard,
  setAlerts,
  setSelectedYear,
  setLoading,
  setError,
} = meiSlice.actions;

export default meiSlice.reducer;
