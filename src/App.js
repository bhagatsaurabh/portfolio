import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { connect } from 'react-redux';

import classes from './app.module.css';
import { routes, routeOrder } from './routes';
import Navigator from './components/Navigator/navigator';
import ScrollingBackground from './components/ScrollingBackground/scrolling-background';
import ThemeSelector from './components/ThemeSelector/theme-selector';
import * as ActionCreators from './store/actions/index';
import Modal from './components/Common/Modal/modal';
import projectBack1 from './assets/images/project-background-1.jpg';
import projectBack2 from './assets/images/project-background-2.jpg';
import projectBack3 from './assets/images/project-background-3.jpg';
import LiveBackground from './components/LiveBackground/live-background';

let fallbackBackgrounds = [projectBack1, projectBack2, projectBack3];

const primaryThemes = [
  { name: 'light', displayColor: '#ffffff' },
  { name: 'dark', displayColor: '#363537' }
];
const secondaryThemes = [
  { name: 'guava', displayColor: '#8bf8c0' },
  { name: 'blackberry', displayColor: '#c5a6dd' },
  { name: 'blueberry', displayColor: '#88e6fb' }
];

class App extends Component {
  state = {
    visited: new Set(),
    theme: 'light',
    showError: true
  }
  gesture = [];

  componentDidMount() {
    this.currPath = this.props.location.pathname;
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.portfolioDataLoaded !== this.props.portfolioDataLoaded) {
      this.props.projectsPro.forEach(project => {
        if (!project.image) {
          project.image = fallbackBackgrounds[Math.floor(Math.random() * 3)];
          project.isFallbackImage = true;
        }
      });
      this.props.projectsInd.forEach(project => {
        if (!project.image) {
          project.image = fallbackBackgrounds[Math.floor(Math.random() * 3)];
          project.isFallbackImage = true;
        }
      });
      let srcsPro = this.props.projectsPro.map(project => { return { src: project.image, id: project.id } });
      let srcsInd = this.props.projectsInd.map(project => { return { src: project.image, id: project.id } });
      this.props.loadProjectImages(srcsPro.concat(srcsInd));
    }
  }

  themeChangeHandler = (theme) => {
    this.setState({ theme });
  }

  touchStartHandler = (event) => {
    this.gesture = [{ x: event.touches[0].clientX, y: event.touches[0].clientY }];
  }
  touchMoveHandler = (event) => {
    if (this.gesture.length >= 20) {
      this.gesture.shift();
      this.gesture.push({ x: event.touches[0].clientX, y: event.touches[0].clientY });
    } else {
      this.gesture.push({ x: event.touches[0].clientX, y: event.touches[0].clientY });
    }
  }
  touchEndHandler = () => {
    if (this.gesture.length < 3) {
      this.gesture = [];
      return;
    }
    let first = this.gesture[0], last = this.gesture[this.gesture.length - 1];
    let theta = Math.atan2(last.y - first.y, last.x - first.x) * (180 / Math.PI);
    if (theta > -45 && theta < 45) {
      if (routeOrder[this.currPath] - 1 >= 0) this.props.history.push(routes[routeOrder[this.currPath] - 1].path);
    }
    else if (theta > 45 && theta < 135);
    else if (theta > 135 || theta < -135) {
      if (routeOrder[this.currPath] + 1 < Object.keys(routeOrder).length) this.props.history.push(routes[routeOrder[this.currPath] + 1].path);
    }
    else;
    this.gesture = [];
  }

  render() {
    let direction = routeOrder[this.props.location.pathname] - routeOrder[this.currPath];
    let tempCurrPath = this.currPath;
    this.currPath = this.props.location.pathname;
    this.state.visited.add(this.currPath);
    let app = 'Loading...';

    if (this.props.projectImagesLoaded) {
      app = (
        <div
          id="App"
          className={[classes.App, this.state.theme].join(' ')}
          onTouchStart={this.touchStartHandler}
          onTouchEnd={this.touchEndHandler}
          onTouchMove={this.touchMoveHandler}
        >
          <LiveBackground.Particles theme={this.state.theme} customStyle={{ zIndex: 1 }} navigationOccured={this.props.location.pathname !== tempCurrPath ? { direction } : null} />
          <LiveBackground.Tree theme={this.state.theme} customStyle={{ zIndex: 1 }} navigationOccured={this.props.location.pathname !== tempCurrPath ? { direction } : null} />

          <Navigator
            navigations={routes}
            visited={this.state.visited}
          />
          <ThemeSelector
            primary={primaryThemes}
            secondary={secondaryThemes}
            selected={this.state.selected}
            onSelect={this.themeChangeHandler}
          />
          <ScrollingBackground position={routeOrder[this.currPath]} />
          <Modal show={this.props.portfolioDataErr && this.state.showError} onDismiss={() => this.setState({ showError: false })}>
            <p>Portfolio data loading failed !</p>
          </Modal>
          {routes.map(route =>
            <Route key={route.path} exact path={route.path}>
              {({ match }) =>
                <CSSTransition
                  in={match !== null}
                  timeout={1000}
                  mountOnEnter
                  classNames={direction >= 0 ? 'section-forward' : 'section-backward'}
                >
                  <div className="section">
                    <route.component />
                  </div>
                </CSSTransition>
              }
            </Route>
          )}
        </div >
      );
    }
    return app;
  }
}

const mapStateToProps = (state) => {
  return {
    portfolioDataLoaded: state.portfolio.fetched,
    portfolioDataErr: state.portfolio.error,
    projectsPro: state.projectsPro.projects,
    projectsInd: state.projectsInd.projects,
    projectImagesLoaded: state.app.projectImagesLoaded
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => dispatch(ActionCreators.getData()),
    loadProjectImages: (srcs) => dispatch(ActionCreators.loadImages(srcs))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
