import { createReducer } from "@reduxjs/toolkit";
import { loadProjects } from "../actions/projects";

const initialState = [];

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadProjects.fulfilled, (_state, action) => {
      return action.payload;
    })
    .addDefaultCase(() => {});
});

export default reducer;
