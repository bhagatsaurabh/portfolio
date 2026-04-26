import { createSlice } from "@reduxjs/toolkit";

const initialState = { showScrollHint: true, enablePerfMonitor: false };

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setShowScrollHint: (state, action) => {
      state.showScrollHint = action.payload;
    },
    setEnablePerfMonitor: (state, action) => {
      state.enablePerfMonitor = action.payload;
    },
  },
});

export const { setShowScrollHint, setEnablePerfMonitor } = appSlice.actions;

export const selectShowScrollHint = (state) => state.app.showScrollHint;
export const selectEnablePerfMonitor = (state) => state.app.enablePerfMonitor;

export default appSlice.reducer;
