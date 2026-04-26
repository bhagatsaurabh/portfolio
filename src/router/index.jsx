import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { routes } from "./routes";
import App from "@/App";
import CrashBoard from "@/components/common/CrashBoard/CrashBoard";
const Resumé = lazy(() => import("@/components/Resumé/resumé"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <CrashBoard />,
    children: routes.map((route) => ({
      index: route.path === "/",
      path: route.path === "/" ? undefined : route.path,
      Component: route.Component,
      handle: route.handle,
    })),
  },
  {
    path: "/resumé",
    Component: Resumé,
    errorElement: <CrashBoard />,
  },
]);

export { routes } from "./routes";
