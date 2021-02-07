import React, { Component } from 'react';

import classes from './modal.module.css';
import Backdrop from '../Backdrop/backdrop';

class Modal extends Component {
  shouldComponentUpdate(nextProps) {
    return (nextProps.show !== this.props.show || nextProps.children !== this.props.children || nextProps.navigationOccured !== this.props.navigationOccured);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.navigationOccured !== this.props.navigationOccured) {
      this.props.onDismiss();
    }
  }

  render() {
    let modalClasses = [classes.Modal];
    if (this.props.show) modalClasses.push(classes.Show);

    return (
      <React.Fragment>
        <Backdrop customStyle={{ backdropFilter: 'blur(5px)' }} show={this.props.show} onDismiss={this.props.onDismiss}></Backdrop>
        <div className={modalClasses.join(' ')}>
          {this.props.children}
        </div>
      </React.Fragment>
    );
  }
}

export default Modal;