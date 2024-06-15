import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import { sanitizePrefs } from "@/utils";

const setTheme = createAction("preferences/set-theme", (theme) => ({
  payload: theme,
}));

const loadPreferences = createAsyncThunk(
  "preferences/load",
  async (_, { dispatch }) => {
    const prefs = JSON.parse(localStorage.getItem("preferences")) ?? {};
    dispatch(setTheme(sanitizePrefs(prefs).theme));
  }
);

export { loadPreferences, setTheme };
