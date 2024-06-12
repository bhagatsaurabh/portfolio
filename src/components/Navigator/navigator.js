import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import classes from './navigator.module.css';
import Tooltip from '../Common/Tooltip/tooltip';

class Navigator extends Component {
  state = {
    hoverable: false
  }

  constructor(props) {
    super(props);
    this.titleElement = React.createRef();
  }

  componentDidMount() {
    this.media = window.matchMedia('(hover: hover)');
    this.setState({
      hoverable: this.media.matches
    });
    this.media.addEventListener('change', this.mediaChangeHandler);
  }
  componentWillUnmount() {
    this.media.removeEventListener('change', this.mediaChangeHandler);
  }
  mediaChangeHandler = (media) => {
    this.setState({ hoverable: media.matches });
  }

  getRouteIndex(route) {
    return this.props.navigations.map(route => route.path).indexOf(route);
  }
  getCurrRouteIndex() {
    return this.props.navigations.map(route => route.path).indexOf(this.props.location.pathname);
  }

  matchPath(currPath, path) {
    if (path === '/') {
      return currPath === path;
    } else {
      return currPath.includes(path);
    }
  }

  navigationHandler = (path) => {
    if (this.props.location.pathname !== path) this.props.history.push(path);
  }

  render() {
    return (
      <React.Fragment>
        <div className={classes.Navigator}>
          <div className={classes.CheckpointLane}>
            <div className={classes.Lane}>
              <div className={classes.Titles}>
                {this.props.navigations.map(navigation => {
                  let titleClasses = [classes.Title];
                  if (this.matchPath(this.props.location.pathname, navigation.path)) titleClasses.push(classes.TitleActive);
                  return <div key={navigation.path} className={titleClasses.join(' ')}>{navigation.title}</div>
                })}
              </div>
            </div>
            {this.props.navigations.map((navigation) => {
              let iconClasses = [classes.CheckpointIcon];
              let checkpointClasses = [classes.Checkpoint];
              if (this.props.visited.has(navigation.path)) iconClasses.push(classes.CheckpointIconVisited);
              else iconClasses.push(classes.CheckpointIconPending);
              if (this.matchPath(this.props.location.pathname, navigation.path)) {
                iconClasses.push(classes.CheckpointIconCurrent);
                checkpointClasses.push(classes.CheckpointCurrent);
              }

              return (
                <div
                  className={checkpointClasses.join(' ')}
                  key={navigation.path}
                  onMouseEnter={() => {
                    if (!this.state.hoverable) return;
                  }}
                  onMouseLeave={() => {
                    if (!this.state.hoverable) return;
                  }}
                  onClick={() => this.navigationHandler(navigation.path)}
                >
                  <Tooltip customStyle={{ fontSize: '.9rem' }} tip={navigation.title}>
                    <div className={iconClasses.join(' ')}></div>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
};

export default withRouter(Navigator);