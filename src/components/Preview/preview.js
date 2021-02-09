import React, { Component } from 'react';

import classes from './preview.module.css';
import * as ActionTypes from '../../store/actions/action-types';
import { connect } from 'react-redux';
import Loading from '../Common/Loading/loading';
import Tooltip from '../Common/Tooltip/tooltip';
import SkillIcon from '../Common/SkillIcon/skill-icon';
import { withRouter } from 'react-router-dom';

class Preview extends Component {
  state = {
    show: false,
    style: null,
    loading: true
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.link === null && this.props.link !== null) {
      this.setState({ style: this.props.initialStyle, loading: true });
    }
    if (prevState.style === null && this.state.style !== null) {
      setTimeout(() => this.setState({ show: true }, () => {
        this.previewContainer.data = this.props.link;
      }), 50);
    }
    if (prevProps.location !== this.props.location && this.state.show) {
      this.closePreviewHandler();
    }
  }
  closePreviewHandler = () => {
    this.setState({ show: false }, () => {
      setTimeout(() => this.props.closePreview(), 500);
    });
  }
  transitionEndHandler = () => {
    if (!this.state.show && this.state.style !== null) {
      this.setState({ style: null });
    }
  }
  previewLoaded = () => {
    this.setState({ loading: false });
  }

  render() {
    let previewClasses = [classes.Preview];
    let containerClasses = [classes.Container];
    if (this.state.show) {
      previewClasses.push(classes.Show);
      if (!this.state.loading) {
        containerClasses.push(classes.Show);
      }
    }
    let preview = null;
    if (this.props.link) {
      preview = (
        <React.Fragment>
          <div className={classes.Background}></div>
          <object onLoad={this.previewLoaded} ref={element => this.previewContainer = element} className={containerClasses.join(' ')} aria-label="Preview"></object>
          <Loading customStyle={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} show={this.state.loading} />
          <div onClick={this.closePreviewHandler} className={classes.CloseButton}>
            <Tooltip direction="left" customStyle={{ padding: '.5rem' }} tip="End Preview">
              <SkillIcon name="close-small" />
            </Tooltip>
          </div>
        </React.Fragment>
      );
    }

    return (
      <div
        onTransitionEnd={event => event.propertyName === 'opacity' && this.transitionEndHandler()}
        className={previewClasses.join(' ')}
      >
        {preview}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    link: state.preview.link,
    initialStyle: state.preview.initialStyle
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closePreview: () => dispatch({ type: ActionTypes.SET_CLOSE_PREVIEW })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Preview));