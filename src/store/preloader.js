import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const preloaderSlice = createSlice({
  name: "preloader",
  initialState,
  reducers: {
    setLock: (state, action) => {
      state[action.payload] = null;
    },
    setPreloaded: (state, action) => {
      if (action.payload?.objectUrl) {
        state[action.payload.url] = action.payload.objectUrl;
      }
    },
    cleanup: (state) => {
      Object.values(state).forEach((objectUrl) =>
        URL.revokeObjectURL(objectUrl),
      );
      state = {};
    },
  },
});

export const preload = createAsyncThunk(
  "preloader/load",
  async (url, { getState, dispatch }) => {
    const state = getState();
    if (typeof state.preloader[url] !== "undefined") return;

    dispatch(setLock(url));
    if (state.preloader[url]) {
      return state.preloader[url];
    }

    try {
      const res = await fetch(url);
      const blob = await res.blob();

      dispatch(
        setPreloaded({
          url,
          objectUrl: URL.createObjectURL(blob),
        }),
      );
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  },
);

export const { setLock, setPreloaded, cleanup } = preloaderSlice.actions;

export default preloaderSlice.reducer;
