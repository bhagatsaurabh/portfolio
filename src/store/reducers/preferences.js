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
      const newTheme = action.payload;
      if (Object.values(themes).includes(newTheme)) {
        const themeClass = getThemeClass(
          newTheme === themes.SYSTEM ? currSystemTheme() : newTheme,
          state.userTheme
        );
        const docRoot = document.documentElement;
        docRoot.dataset.theme = themeClass;
        if (newTheme === themes.SYSTEM) {
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
        state.userTheme = newTheme;
        localStorage.setItem("preferences", JSON.stringify(state));
      }
    })
    .addDefaultCase(() => {});
});

export { currTheme };
export default reducer;
