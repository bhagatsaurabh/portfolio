import * as ActionTypes from '../actions/action-types';

const initialState = {
  fetched: false,
  error: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_PORTFOLIO_DATA:
      return {
        ...state,
        fetched: true,
        error: null
      }
    case ActionTypes.SET_PORTFOLIO_DATA_FAILED:
      return {
        ...state,
        fetched: false,
        error: action.error
      }
    default: return state;
  }
};

export default reducer;