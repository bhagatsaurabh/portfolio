import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const experienceSlice = createSlice({
  name: "experiences",
  initialState,
  reducers: {
    setExperiences: (_, action) => {
      return action.payload;
    },
  },
});

export const loadExperiences = createAsyncThunk("experiences/load", async (_, { dispatch }) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_SB_CDN_URL}/data/experiences.json`);
    const experiencesData = await res.json();
    dispatch(setExperiences(experiencesData));
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
});

export const { setExperiences } = experienceSlice.actions;

export default experienceSlice.reducer;
