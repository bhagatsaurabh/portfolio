import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setSummary: (_, action) => {
      return action.payload;
    },
  },
});

export const loadSummary = createAsyncThunk("summary/load", async (_, { dispatch }) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_SB_CDN_URL}/data/summary.json`);
    const summaryData = await res.json();
    dispatch(setSummary(summaryData));
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
});

export const { setSummary } = summarySlice.actions;

export default summarySlice.reducer;
