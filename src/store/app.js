import { createSlice } from "@reduxjs/toolkit";

const initialState = { showScrollHint: true };

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setShowScrollHint: (state, action) => {
      state.showScrollHint = action.payload;
    },
  },
});

export const { setShowScrollHint } = appSlice.actions;

export const selectShowScrollHint = (state) => state.app.showScrollHint;

export default appSlice.reducer;
