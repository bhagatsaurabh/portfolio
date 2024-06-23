import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import { sanitizePrefs } from "@/utils";

const setTheme = createAction("preferences/set-theme", (payload) => ({
  payload,
}));

const loadPreferences = createAsyncThunk(
  "preferences/load",
  async (_, { dispatch }) => {
    const prefs = JSON.parse(localStorage.getItem("preferences")) ?? {};
    await dispatch(setTheme({ theme: sanitizePrefs(prefs).theme, init: true }));
    return sanitizePrefs(prefs);
  }
);

export { loadPreferences, setTheme };
