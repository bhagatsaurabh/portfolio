import { createReducer } from "@reduxjs/toolkit";
import { cleanup, lock, preload } from "../actions/preloader";

const initialState = {};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(preload.fulfilled, (state, action) => {
      if (action.payload?.objectUrl) {
        state[action.payload.url] = action.payload.objectUrl;
      }
    })
    .addCase(lock, (state, action) => {
      state[action.payload] = null;
    })
    .addCase(cleanup, (state) => {
      Object.values(state).forEach((objectUrl) =>
        URL.revokeObjectURL(objectUrl)
      );
      return {};
    })
    .addDefaultCase(() => {});
});

export default reducer;
