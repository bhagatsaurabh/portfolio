import * as ActionTypes from '../actions/action-types';

const initialState = {
  data: [],
  error: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_ACHIEVEMENTS:
      return {
        ...state,
        data: action.achievements
      }
    case ActionTypes.SET_ACHIEVEMENTS_FAILED:
      return {
        ...state,
        error: action.error
      }
    default: return state;
  }
};

export default reducer;