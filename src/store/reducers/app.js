import { createReducer } from "@reduxjs/toolkit";
import { setShowScrollHint } from "../actions/app";

const initialState = { showScrollHint: true };

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setShowScrollHint, (state, action) => {
      state.showScrollHint = action.payload;
    })
    .addDefaultCase(() => {});
});

export default reducer;
