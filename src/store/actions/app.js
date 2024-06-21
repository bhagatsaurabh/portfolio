import { createAction } from "@reduxjs/toolkit";

const setShowScrollHint = createAction("app/set-showscrollhint", (value) => ({
  payload: value,
}));

export { setShowScrollHint };
