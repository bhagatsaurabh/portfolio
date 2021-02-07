import { extractProjectTags } from '../../utils/utils';
import * as ActionTypes from '../actions/action-types';

const initialState = {
  projects: [],
  projectMeta: {
    dateTags: [],
    nameTags: [],
    technologyTags: [],
    typeTags: []
  },
  error: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS_PROFESSIONAL:
      return {
        ...state,
        projects: action.projects,
        projectMeta: extractProjectTags(action.projects)
      }
    case ActionTypes.SET_PROJECTS_PROFESSIONAL_FAILED:
      return {
        ...state,
        error: action.error
      }
    default: return state;
  }
};

export default reducer;