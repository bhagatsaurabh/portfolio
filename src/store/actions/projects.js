import { createAsyncThunk } from "@reduxjs/toolkit";

const loadProjects = createAsyncThunk("projects/load", async () => {
  try {
    return await (await fetch("/data/projects.json")).json();
  } catch (error) {
    console.log(error);
  }
});

export { loadProjects };
