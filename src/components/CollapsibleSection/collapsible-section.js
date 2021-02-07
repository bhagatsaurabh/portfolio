import React, { Component } from 'react';

import classes from './collapsible-section.module.css';
import collapsibleIcon from '../../assets/images/collapsible.png';

class CollapsibleSection extends Component {
  state = {
    isExpanded: true
  }

  componentDidMount() {
    if (this.state.isExpanded) {
      this.updateCollapsible(this.content.scrollHeight + 'px', 1);
    }

    this.mediaListeners = [window.matchMedia('(min-width: 550px)'), window.matchMedia('(min-width: 1000px)')];
    this.mediaListeners.forEach(mediaListener => mediaListener.addEventListener('change', () => {
      if (this.state.isExpanded) this.updateCollapsible(this.content.scrollHeight + 'px', 1);
    }));
  }
  componentDidUpdate() {
    if (this.state.isExpanded) {
      this.updateCollapsible(this.content.scrollHeight + 'px', 1);
    }
  }
  componentWillUnmount() {
    this.mediaListeners.forEach(mediaListener => mediaListener.removeEventListener('change', this.updateCollapsible));
  }

  updateCollapsible(maxHeight, opacity) {
    this.content.style.maxHeight = maxHeight;
    this.content.style.opacity = opacity;
  }
  headerClickHandler = () => {
    if (this.content.style.maxHeight) {
      this.setState({ isExpanded: false }, () => {
        this.updateCollapsible(null, 0);
      });
    } else {
      this.setState({ isExpanded: true }, () => {
        this.updateCollapsible(this.content.scrollHeight + 'px', 1);
      });
    }
  }

  render() {
    let headerTextClasses = [classes.HeaderText];
    if (this.state.isExpanded) headerTextClasses.push(classes.HeaderTextCentered);
    let indicatorClasses = [classes.Indicator];
    let detailsClasses = [classes.Details];
    if (this.state.isExpanded) {
      indicatorClasses.push(classes.IndicatorExpanded);
      detailsClasses.push(classes.DetailsHidden);
    } else {
      indicatorClasses.push(classes.IndicatorCollapsed);
    }

    return (
      <div
        className={classes.CollapsibleSection}
      >
        <div className={classes.Header} onClick={this.headerClickHandler}>
          <div className={headerTextClasses.join(' ')}>
            {this.props.heading}
          </div>
          <div className={detailsClasses.join(' ')}>
            {this.props.size} {this.props.size > 1 ? 'projects' : 'project'}
          </div>
          <div className={indicatorClasses.join(' ')}>
            <img src={collapsibleIcon} alt='Indicator' />
          </div>
        </div>
        <div className={classes.Content} ref={element => element && (this.content = element)}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default CollapsibleSection;