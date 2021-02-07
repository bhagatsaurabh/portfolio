import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './project.module.css';
import { withRouter } from 'react-router-dom';
import * as ActionTypes from '../../../store/actions/action-types';

class Project extends Component {
  state = {
    background: null
  };

  projectClickHandler = () => {
    let rect = this.projectElement.getBoundingClientRect();

    let marginTop = window.getComputedStyle(this.projectElement).getPropertyValue('margin-top');
    let top = rect.top - parseInt(marginTop.replace('px', ''));

    this.props.openProject(this.props.project, {
      left: rect.left.toFixed(2) + 'px',
      top: top.toFixed(2) + 'px',
      width: rect.width.toFixed(2) + 'px',
      height: rect.height.toFixed(2) + 'px',
      marginTop: marginTop
    });
  }

  render() {
    let projectClasses = [classes.Project];
    if (this.props.openedProject && (this.props.openedProject.id === this.props.project.id))
      projectClasses.push(classes.ProjectExpanded);

    return (
      <React.Fragment>
        <div
          onClick={this.projectClickHandler}
          ref={element => this.projectElement = element}
          className={projectClasses.join(' ')}
        >
          <div className={classes.ProjectCard}>
            <div className={classes.CardHeader}>
              <div className={classes.CardTitle}>{this.props.project.name}</div>
            </div>
            <img
              style={{
                backgroundImage: 'url(' + this.props.srcs[this.props.project.id] + ')',
                backgroundBlendMode: this.props.project.isFallbackImage ? 'multiply' : 'unset'
              }}
              className={classes.ProjectBackground}
              src={this.props.srcs[this.props.project.id]} alt="ProjectBackground"
            />
            <div className={classes.CardDetails}>
              <div style={{ marginTop: '.5rem' }}>
                <div className={classes.ProjectDuration}>{this.props.project.start} - {this.props.project.end}</div>
                <div className={classes.ProjectType}>{this.props.project.type}</div>
              </div>
              <div className={classes.CardDescription}>{this.props.project.description}</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    srcs: state.app.srcs,
    openedProject: state.project.openedProject
  }
};

const mapDispatchToProps = dispatch => {
  return {
    openProject: (project, initialStyle) => dispatch({ type: ActionTypes.SET_OPEN_PROJECT, project, initialStyle })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Project));