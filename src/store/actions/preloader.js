import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

const cleanup = createAction("preloader/cleanup");
const lock = createAction("preloader/set-semaphore", (url) => ({
  payload: url,
}));

const preload = createAsyncThunk(
  "preloader/load",
  async (url, { getState, dispatch }) => {
    const state = getState();
    if (typeof state.preloader[url] !== "undefined") return;

    await dispatch(lock(url));
    if (state.preloader[url]) {
      return state.preloader[url];
    }

    try {
      return {
        url,
        objectUrl: URL.createObjectURL(await (await fetch(url)).blob()),
      };
    } catch (error) {
      console.log(error);
    }
  }
);

export { preload, cleanup, lock };
