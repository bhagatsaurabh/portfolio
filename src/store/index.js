import { configureStore } from "@reduxjs/toolkit";

import appReducer from "@/store/reducers/app";
import preferencesReducer from "@/store/reducers/preferences";
import contactReducer from "@/store/reducers/contact";
import projectsReducer from "@/store/reducers/projects";
import preloaderReducer from "@/store/reducers/preloader";

export const store = configureStore({
  reducer: {
    app: appReducer,
    preferences: preferencesReducer,
    contact: contactReducer,
    projects: projectsReducer,
    preloader: preloaderReducer,
  },
});
