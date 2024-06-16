import Intro from "@/components/Intro/intro";
import Contact from "@/components/Contact/contact";
import { createRef } from "react";
/* import ProjectsPro from "./containers/projects-pro/projects-pro";
import ProjectsInd from "./containers/projects-ind/projects-ind";
import Achievements from "./containers/achievements/achievements";
import Skills from "./containers/skills/skills";
import Contact from "./containers/contact/contact"; */

export const routes = [
  {
    path: "/",
    name: "Intro",
    element: <Intro />,
    nodeRef: createRef(),
    component: Intro,
  },
  /* {
    path: "/projects-professional",
    component: ProjectsPro,
    title: "Projects - Professional",
  }, */
  /* {
    path: "/projects-individual",
    component: ProjectsInd,
    title: "Projects - Individual",
  }, */
  // { path: "/achievements", component: Achievements, title: "Achievements" },
  // { path: "/skills", component: Skills, title: "Skills" },
  {
    path: "/contact",
    name: "Contact",
    element: <Contact />,
    nodeRef: createRef(),
    component: Contact,
  },
];

export const routeOrder = {
  "/": 0,
  // "/projects-professional": 1,
  // "/projects-individual": 2,
  // "/achievements": 3,
  // "/skills": 4,
  "/contact": 1,
};
