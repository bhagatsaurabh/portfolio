import Intro from "@/components/Intro/intro";
import About from "@/components/About/about";
import { createRef } from "react";
import Projects from "@/components/Projects/projects";
import Highlights from "@/components/Highlights/highlights";
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
    path: "/highlights",
    name: "Highlights",
    element: <Highlights />,
    nodeRef: createRef(),
    component: Highlights,
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
  "/highlights": 3,
  "/skills": 4,
  "/about": 5,
};
