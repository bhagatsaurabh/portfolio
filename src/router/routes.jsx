import { lazy } from "react";

const Intro = lazy(() => import("@/components/Intro/intro"));
const About = lazy(() => import("@/components/About/about"));
const Projects = lazy(() => import("@/components/Projects/projects"));
const Skills = lazy(() => import("@/components/Skills/skills"));
const Experience = lazy(() => import("@/components/Experience/experience"));

export const routes = [
  {
    path: "/",
    Component: Intro,
    handle: {
      name: "Intro",
      title: "▢",
      globalBlur: false,
      routeOrder: 0,
    },
  },
  {
    path: "/projects",
    Component: Projects,
    handle: {
      name: "Projects",
      title: "Projects",
      globalBlur: true,
      routeOrder: 1,
    },
  },
  {
    path: "/skills",
    Component: Skills,
    handle: {
      name: "Skills",
      title: "Skills",
      globalBlur: true,
      routeOrder: 2,
    },
  },
  {
    path: "/work",
    Component: Experience,
    handle: {
      name: "Work",
      title: "Experience",
      globalBlur: true,
      routeOrder: 3,
    },
  },
  {
    path: "/about",
    Component: About,
    handle: {
      name: "About",
      title: "About",
      globalBlur: false,
      routeOrder: 4,
    },
  },
];
