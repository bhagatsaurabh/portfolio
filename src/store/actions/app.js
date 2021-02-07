import * as ActionTypes from './action-types';

export const loadImages = (srcs) => {
  return dispatch => {
    Promise.all(srcs.map((source) => {
      return new Promise((resolve, reject) => {
        let img = document.createElement('img');
        img.onload = () => resolve(source);
        img.onerror = (error) => reject(error);
        img.src = source.src;
      });
    })).then((srcs) => {
      dispatch({ type: ActionTypes.SET_PROJECT_IMAGES_LOADED, srcs });
    }, error => {
      dispatch({ type: ActionTypes.SET_PROJECT_IMAGES_LOAD_FAILED, error: error });
    });
  };
};