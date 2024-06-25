import { createBrowserRouter } from "react-router-dom";

import App from "@/App";
import { routes } from "./routes";
import Resume from "@/components/Resume/resume";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: routes.map((route) => ({
      index: route.path === "/",
      path: route.path === "/" ? undefined : route.path,
      element: route.element,
    })),
  },
  {
    path: "/resume",
    element: <Resume />,
    /* children: routes.map((route) => ({
      index: route.path === "/",
      path: route.path === "/" ? undefined : route.path,
      element: route.element,
    })), */
  },
]);

export * from "./routes";
