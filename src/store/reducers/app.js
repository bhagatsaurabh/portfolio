import * as ActionTypes from '../actions/action-types';

const initialState = {
  projectImagesLoaded: false,
  srcs: null,
  error: null,
  navigationDirection: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECT_IMAGES_LOADED: {
      let sources = {};
      action.srcs.forEach(source => sources[source.id] = source.src);
      return {
        ...state,
        projectImagesLoaded: true,
        srcs: sources
      };
    }
    case ActionTypes.SET_PROJECT_IMAGES_LOAD_FAILED:
      return {
        ...state,
        projectImagesLoaded: false,
        error: action.error
      };
    default: return state;
  }
};

export default reducer;