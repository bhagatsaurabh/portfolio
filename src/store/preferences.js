import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { themes } from "@/utils/constants";
import { currSystemTheme, getThemeClass, sanitizePrefs } from "@/utils";

const initialState = {
  userTheme: themes.SYSTEM,
  systemTheme: currSystemTheme(),
  prefsLoaded: false,
};

export const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const { theme, init } = action.payload;
      if (!Object.values(themes).includes(theme)) {
        return;
      }

      const themeClass = getThemeClass(
        theme === themes.SYSTEM ? currSystemTheme() : theme,
        state.userTheme,
      );
      const docRoot = document.documentElement;
      docRoot.dataset.theme = themeClass;

      if (theme === themes.SYSTEM) {
        docRoot.className = themeClass;
        state.systemTheme = currSystemTheme();
      } else if (docRoot.className === "") {
        docRoot.classList.add(themeClass);
      } else {
        docRoot.classList.replace(
          getThemeClass(null, state.userTheme),
          themeClass,
        );
      }

      if (state.userTheme !== theme) {
        state.userTheme = theme;
      }

      if (init) return;

      localStorage.setItem(
        "preferences",
        JSON.stringify({
          theme:
            state.userTheme === themes.SYSTEM
              ? currSystemTheme()
              : state.userTheme,
        }),
      );
    },
    setPrefsLoaded: (state, action) => {
      state.prefsLoaded = action.payload;
    },
  },
});

export const loadPreferences = createAsyncThunk(
  "preferences/load",
  async (_, { dispatch }) => {
    const prefs = JSON.parse(localStorage.getItem("preferences")) ?? {};
    dispatch(setTheme({ theme: sanitizePrefs(prefs).theme, init: true }));
    return sanitizePrefs(prefs);
  },
);

export const { setTheme, setPrefsLoaded } = preferencesSlice.actions;

export const selectCurrTheme = (state) =>
  state.preferences.userTheme === themes.SYSTEM
    ? currSystemTheme()
    : state.preferences.userTheme;
export const selectPrefsLoaded = (state) => state.preferences.prefsLoaded;

export default preferencesSlice.reducer;
