import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import classes from './floating-project.module.css';
import * as ActionTypes from '../../store/actions/action-types';
import { connect } from 'react-redux';
import calendarIcon from '../../assets/images/calendar.png';
import companyIcon from '../../assets/images/building.png';
import githubIcon from '../../assets/images/github.png';
import linkIcon from '../../assets/images/link.png';
import GlassButton from '../Common/GlassButton/glass-button';
import leftArrowIcon from '../../assets/images/left-arrow.png';
import eyeIcon from '../../assets/images/eye.png';

class FloatingProject extends Component {
  state = {
    fullscreen: false,
    style: null
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.project === null && this.props.project !== null) {
      this.setState({ style: this.props.initialStyle });
    }
    if (prevState.style === null && this.state.style !== null) {
      setTimeout(() => this.setState({ fullscreen: true }), 50);
    }
    if (prevProps.location !== this.props.location && this.state.fullscreen) {
      this.closeProjectHandler();
    }
  }
  closeProjectHandler = () => {
    this.setState({ fullscreen: false }, () => {
      this.props.closeProject();
    });
  }
  transitionEndHandler = () => {
    if (!this.state.fullscreen && this.state.style !== null) {
      this.setState({ style: null });
    }
  }

  previewClickHandler = () => {
    let rect = this.previewElement.getBoundingClientRect();

    this.props.openPreview(this.props.project.liveLink, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
  }

  render() {
    let floatingProjectClasses = [classes.FloatingProject];
    if (this.state.fullscreen) {
      floatingProjectClasses.push(classes.Fullscreen);
    }
    let project = null;
    if (this.props.project) {
      project = (
        <React.Fragment>
          <div className={classes.CardHeader}>
            <div className={classes.CardTitle}>{this.props.project.name}</div>
          </div>
          <div className={classes.Scrollable}>
            <img
              style={{
                backgroundImage: 'url(' + this.props.srcs[this.props.project.id] + ')',
                backgroundBlendMode: this.props.project.isFallbackImage ? 'multiply' : 'unset'
              }}
              className={classes.ProjectBackground}
              src={this.props.srcs[this.props.project.id]} alt="ProjectBackground"
            />
            {this.props.project.organization ?
              <div className={classes.Organizations}>
                <img style={{ marginRight: '.5rem' }} className={classes.Icon} src={companyIcon} alt="Organization" />
                {this.props.project.organization.map(organization =>
                  <div key={organization} className={classes.Organization}>{organization}</div>
                )}
              </div> : null
            }
            <div className={classes.HashTags} style={!this.props.project.organization ? { marginTop: '1rem' } : null}>
              {this.props.project.technology.map(technology => <div key={technology} className={classes.HashTag}>#{technology}</div>)}
            </div>
            <div className={classes.CardDetails}>
              <div style={{ marginTop: '.5rem' }}>
                <div className={classes.ProjectDuration}>
                  <img style={{ marginRight: '.5rem' }} className={classes.Icon} src={calendarIcon} alt="Duration" />
                  {this.props.project.start} - {this.props.project.end}
                </div>
                <div className={classes.ProjectType}>{this.props.project.type}</div>
              </div>
              <div className={classes.CardDescription}>{this.props.project.description}</div>
            </div>
          </div>
          <div className={classes.LinksAndControls}>
            <div className={classes.Links}>
              {this.props.project.githubLink ?
                <a target="_blank" rel="noreferrer" href={this.props.project.githubLink} className={classes.Link}>
                  <img className={classes.Icon} alt="Github" src={githubIcon} />
                </a> : null
              }
              {this.props.project.liveLink ?
                <a target="_blank" rel="noreferrer" href={this.props.project.liveLink} className={classes.Link}>
                  <img className={classes.Icon} alt="Link" src={linkIcon} />
                </a> : null
              }
            </div>
            <div className={classes.Controls}>
              <GlassButton icon={leftArrowIcon} iconPosition="left" text="Back" clicked={this.closeProjectHandler} />
              {this.props.project.liveLink ?
                <GlassButton ref={element => this.previewElement = element} icon={eyeIcon} iconPosition="left" text="Preview" clicked={this.previewClickHandler} /> : null
              }
            </div>
          </div>
        </React.Fragment>
      );
    }

    return (
      <div
        onTransitionEnd={event => event.propertyName === 'opacity' && this.transitionEndHandler()}
        style={{ ...this.state.style }}
        className={floatingProjectClasses.join(' ')}
      >
        {project}
      </div>
    );
  }
};

const mapStateToProps = state => {
  return {
    project: state.project.openedProject,
    initialStyle: state.project.initialStyle,
    srcs: state.app.srcs,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    closeProject: () => dispatch({ type: ActionTypes.SET_CLOSE_PROJECT }),
    openPreview: (link, initialStyle) => dispatch({ type: ActionTypes.SET_OPEN_PREVIEW, link, initialStyle })
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FloatingProject));