import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "@/index.css";
import store from "@/store";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/index.jsx";
import GlobalErrorBoundary from "./error/global.jsx";

document.documentElement.style.setProperty("--cdn", import.meta.env.VITE_SB_CDN_URL);

createRoot(document.getElementById("root")).render(
  <GlobalErrorBoundary>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </GlobalErrorBoundary>,
);
