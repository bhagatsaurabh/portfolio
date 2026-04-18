import { configureStore } from "@reduxjs/toolkit";

import appReducer from "@/store/app";
import preferencesReducer from "@/store/preferences";
import contactReducer from "@/store/contact";
import projectsReducer from "@/store/projects";
import skillsReducer from "@/store/skills";
import preloaderReducer from "@/store/preloader";

const store = configureStore({
  reducer: {
    app: appReducer,
    preferences: preferencesReducer,
    contact: contactReducer,
    projects: projectsReducer,
    preloader: preloaderReducer,
    skills: skillsReducer,
  },
});

export default store;
