import { createReducer } from "@reduxjs/toolkit";
import { loadContact } from "../actions/contact";

const initialState = {};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadContact.fulfilled, (_state, action) => {
      return action.payload;
    })
    .addDefaultCase(() => {});
});

export default reducer;
