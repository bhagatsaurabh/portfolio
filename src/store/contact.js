import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    setContactData: (state, action) => {
      state = action.payload;
    },
  },
});

export const loadContact = createAsyncThunk(
  "contact/load",
  async (_, { dispatch }) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SB_CDN_URL}/data/contact.json`,
      );
      const contactData = await res.json();
      dispatch(setContactData(contactData));
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  },
);

export const { setContactData } = contactSlice.actions;

export default contactSlice.reducer;
