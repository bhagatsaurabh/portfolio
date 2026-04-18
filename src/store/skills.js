import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const skillSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    setSkills: (_, action) => {
      return action.payload;
    },
  },
});

export const loadSkills = createAsyncThunk("skills/load", async (_, { dispatch }) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_SB_CDN_URL}/data/skills.json`);
    const skillsData = await res.json();
    dispatch(setSkills(skillsData));
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
});

export const { setSkills } = skillSlice.actions;

export default skillSlice.reducer;
