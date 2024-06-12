import * as ActionTypes from '../actions/action-types';

const initialState = {
  data: [],
  error: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_SKILLS:
      return {
        ...state,
        data: action.skills
      }
    case ActionTypes.SET_SKILLS_FAILED:
      return {
        ...state,
        error: action.error
      }
    default: return state;
  }
};

export default reducer;