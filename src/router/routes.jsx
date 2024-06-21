import Intro from "@/components/Intro/intro";
import About from "@/components/About/about";
import { createRef } from "react";
import Projects from "@/components/Projects/projects";
import Skills from "@/components/Skills/skills";
import Experience from "@/components/Experience/experience";

export const routes = [
  {
    path: "/",
    name: "Intro",
    element: <Intro />,
    nodeRef: createRef(),
    component: Intro,
  },
  {
    path: "/projects",
    name: "Projects",
    element: <Projects />,
    nodeRef: createRef(),
    component: Projects,
  },
  {
    path: "/work",
    name: "Work",
    element: <Experience />,
    nodeRef: createRef(),
    component: Experience,
  },
  {
    path: "/skills",
    name: "Skills",
    element: <Skills />,
    nodeRef: createRef(),
    component: Skills,
  },
  {
    path: "/about",
    name: "About",
    element: <About />,
    nodeRef: createRef(),
    component: About,
  },
];

export const routeOrder = {
  "/": 0,
  "/projects": 1,
  "/work": 2,
  "/skills": 3,
  "/about": 4,
};
