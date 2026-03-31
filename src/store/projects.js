import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state = action.payload;
    },
  },
});

export const loadProjects = createAsyncThunk(
  "projects/load",
  async (_, { dispatch }) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SB_CDN_URL}/data/projects.json`,
      );
      const projectsData = await res.json();
      dispatch(setProjects(projectsData));
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  },
);

export const { setProjects } = projectSlice.actions;

export default projectSlice.reducer;
