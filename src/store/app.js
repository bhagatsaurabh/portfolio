import { createSlice } from "@reduxjs/toolkit";

const initialState = { showScrollHint: true, enablePerfMonitor: false, countryCode: "" };

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
    setCountryCode: (state, action) => {
      state.countryCode = action.payload;
    },
  },
});

export const { setShowScrollHint, setEnablePerfMonitor, setCountryCode } = appSlice.actions;

export const selectShowScrollHint = (state) => state.app.showScrollHint;
export const selectEnablePerfMonitor = (state) => state.app.enablePerfMonitor;
export const selectCountryCode = (state) => state.app.countryCode;

export default appSlice.reducer;
