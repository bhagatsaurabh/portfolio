import { configureStore } from "@reduxjs/toolkit";

// import appReducer from "./store/reducers/app";
/* import portfolioReducer from "./store/reducers/portfolio-data";
import projectsProReducer from "./store/reducers/projects-professional";
import projectsIndReducer from "./store/reducers/projects-individual";
import achievementsReducer from "./store/reducers/achievements";
import skillsReducer from "./store/reducers/skills";
import projectReduer from "./store/reducers/project";
import contactReducer from "./store/reducers/contact";
import previewReducer from "./store/reducers/preview"; */
import preferencesReducer from "@/store/reducers/preferences";
import contactReducer from "@/store/reducers/contact";

export const store = configureStore({
  reducer: {
    // app: appReducer,
    preferences: preferencesReducer,
    contact: contactReducer,
    /* portfolio: portfolioReducer,
    projectsPro: projectsProReducer,
    projectsInd: projectsIndReducer,
    achievements: achievementsReducer,
    skills: skillsReducer,
    project: projectReduer,
    contact: contactReducer,
    preview: previewReducer, */
  },
});
