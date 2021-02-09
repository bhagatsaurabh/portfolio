import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import appReducer from './store/reducers/app';
import portfolioReducer from './store/reducers/portfolio-data';
import projectsProReducer from './store/reducers/projects-professional';
import projectsIndReducer from './store/reducers/projects-individual';
import achievementsReducer from './store/reducers/achievements';
import skillsReducer from './store/reducers/skills';
import projectReduer from './store/reducers/project';
import contactReducer from './store/reducers/contact';
import Resume from './containers/resume/resume';
import { CSSTransition } from 'react-transition-group';
import previewReducer from './store/reducers/preview';

const rootReducer = combineReducers({
  app: appReducer,
  portfolio: portfolioReducer,
  projectsPro: projectsProReducer,
  projectsInd: projectsIndReducer,
  achievements: achievementsReducer,
  skills: skillsReducer,
  project: projectReduer,
  contact: contactReducer,
  preview: previewReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk))

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/">
        {route => <CSSTransition
          in={route.location.pathname !== '/resume'}
          timeout={500}
          mountOnEnter
          classNames="context"
        >
          <div className="context">
            <App />
          </div>
        </CSSTransition>}
      </Route>
      <Route exact path="/resume">
        {({ match }) => <CSSTransition
          in={match !== null}
          timeout={500}
          mountOnEnter
          classNames="context"
        >
          <div className="context">
            <Resume />
          </div>
        </CSSTransition>}
      </Route>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
