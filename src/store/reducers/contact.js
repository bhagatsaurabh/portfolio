import * as ActionTypes from '../actions/action-types';

const initialState = {
  data: null,
  error: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_CONTACT:
      return {
        ...state,
        data: action.contact
      }
    case ActionTypes.SET_CONTACT_FAILED:
      return {
        ...state,
        error: action.error
      }
    default: return state;
  }
};

export default reducer;