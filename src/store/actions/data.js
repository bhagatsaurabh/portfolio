import * as ActionTypes from './action-types';
import axios from 'axios';

export const getData = () => {
  return dispatch => {
    Promise.all([
      new Promise((resolve, reject) => {
        axios.get('/data/projects-professional.json').then((response) => {
          dispatch({ type: ActionTypes.SET_PROJECTS_PROFESSIONAL, projects: response.data });
          resolve();
        }, error => {
          dispatch({ type: ActionTypes.SET_PROJECTS_PROFESSIONAL_FAILED, error: error });
          reject(error);
        })
      }),
      new Promise((resolve, reject) => {
        axios.get('/data/projects-individual.json').then((response) => {
          dispatch({ type: ActionTypes.SET_PROJECTS_INDIVIDUAL, projects: response.data });
          resolve();
        }, error => {
          dispatch({ type: ActionTypes.SET_PROJECTS_INDIVIDUAL_FAILED, error: error });
          reject(error);
        })
      }),
      new Promise((resolve, reject) => {
        axios.get('/data/achievements.json').then((response) => {
          dispatch({ type: ActionTypes.SET_ACHIEVEMENTS, achievements: response.data });
          resolve();
        }, error => {
          dispatch({ type: ActionTypes.SET_ACHIEVEMENTS_FAILED, error: error });
          reject(error);
        })
      }),
      new Promise((resolve, reject) => {
        axios.get('/data/skills.json').then((response) => {
          dispatch({ type: ActionTypes.SET_SKILLS, skills: response.data });
          resolve();
        }, error => {
          dispatch({ type: ActionTypes.SET_SKILLS_FAILED, error: error });
          reject(error);
        })
      }),
      new Promise((resolve, reject) => {
        axios.get('/data/contact.json').then((response) => {
          dispatch({ type: ActionTypes.SET_CONTACT, contact: response.data });
          resolve();
        }, error => {
          dispatch({ type: ActionTypes.SET_CONTACT_FAILED, error: error });
          reject(error);
        })
      })
    ]).then(() => {
      dispatch({ type: ActionTypes.SET_PORTFOLIO_DATA });
    }).catch(error => {
      dispatch({ type: ActionTypes.SET_PORTFOLIO_DATA_FAILED, error: error });
    });
  };
};