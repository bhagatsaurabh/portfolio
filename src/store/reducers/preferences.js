import { createReducer } from "@reduxjs/toolkit";
import { setTheme } from "../actions/preferences";
import { themes } from "@/utils/constants";
import { currSystemTheme, getThemeClass } from "@/utils";

const initialState = {
  userTheme: themes.SYSTEM,
  systemTheme: currSystemTheme(),
};

const currTheme = (state) =>
  state.preferences.userTheme === themes.SYSTEM
    ? currSystemTheme()
    : state.preferences.userTheme;

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setTheme, (state, action) => {
      const { theme, init } = action.payload;
      if (Object.values(themes).includes(theme)) {
        const themeClass = getThemeClass(
          theme === themes.SYSTEM ? currSystemTheme() : theme,
          state.userTheme
        );
        const docRoot = document.documentElement;
        docRoot.dataset.theme = themeClass;
        if (theme === themes.SYSTEM) {
          docRoot.className = themeClass;
          state.systemTheme = currSystemTheme();
        } else {
          if (docRoot.className === "") {
            docRoot.classList.add(themeClass);
          } else {
            docRoot.classList.replace(
              getThemeClass(null, state.userTheme),
              themeClass
            );
          }
        }
        if (state.userTheme !== theme) {
          state.userTheme = theme;
        }
        if (!init) {
          localStorage.setItem(
            "preferences",
            JSON.stringify({
              theme:
                state.userTheme === themes.SYSTEM
                  ? currSystemTheme()
                  : state.userTheme,
            })
          );
        }
      }
    })
    .addDefaultCase(() => {});
});

export { currTheme };
export default reducer;
