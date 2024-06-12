import * as ActionTypes from '../actions/action-types';

const initialState = {
  link: null,
  initialStyle: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_OPEN_PREVIEW:
      return {
        ...state,
        initialStyle: action.initialStyle,
        link: action.link
      };
    case ActionTypes.SET_CLOSE_PREVIEW:
      return {
        ...state,
        link: null
      }
    default: return state;
  }
};

export default reducer;