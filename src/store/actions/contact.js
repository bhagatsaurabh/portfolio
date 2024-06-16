import { createAsyncThunk } from "@reduxjs/toolkit";

const loadContact = createAsyncThunk("contact/load", async () => {
  try {
    return await (await fetch("/data/contact.json")).json();
  } catch (error) {
    console.log(error);
  }
});

export { loadContact };
