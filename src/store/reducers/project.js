import * as ActionTypes from '../actions/action-types';

const initialState = {
  openedProject: null,
  initialStyle: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_OPEN_PROJECT:
      return {
        ...state,
        initialStyle: action.initialStyle,
        openedProject: action.project
      };
    case ActionTypes.SET_CLOSE_PROJECT:
      return {
        ...state,
        openedProject: null
      }
    default: return state;
  }
};

export default reducer;