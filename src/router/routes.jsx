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
    title: "▢",
    element: <Intro />,
    nodeRef: createRef(),
    component: Intro,
    globalBlur: false,
  },
  {
    path: "/projects",
    name: "Projects",
    title: "Projects",
    element: <Projects />,
    nodeRef: createRef(),
    component: Projects,
    globalBlur: true,
  },
  {
    path: "/skills",
    name: "Skills",
    title: "Skills",
    element: <Skills />,
    nodeRef: createRef(),
    component: Skills,
    globalBlur: true,
  },
  {
    path: "/work",
    name: "Work",
    title: "Experience",
    element: <Experience />,
    nodeRef: createRef(),
    component: Experience,
    globalBlur: true,
  },
  {
    path: "/about",
    name: "About",
    title: "About",
    element: <About />,
    nodeRef: createRef(),
    component: About,
    globalBlur: true,
  },
];

export const routeOrder = {
  "/": 0,
  "/projects": 1,
  "/skills": 2,
  "/work": 3,
  "/about": 4,
};
