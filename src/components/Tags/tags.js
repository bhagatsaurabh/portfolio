import React, { Component } from 'react';

import classes from './tags.module.css';
import leftIcon from '../../assets/images/left.png';
import rightIcon from '../../assets/images/right.png';
import { isNear } from '../../utils/utils';

class Tags extends Component {
  constructor(props) {
    super(props);
    this.tags = React.createRef();
  }
  rightNavHandler = (event) => {
    for (let node of this.tags.current.childNodes) {
      if (node.getBoundingClientRect().left + node.clientWidth - this.tags.current.getBoundingClientRect().left > this.tags.current.clientWidth) {
        node.scrollIntoView({ behavior: 'smooth', inline: 'start' });
        break;
      }
    }
    if (isNear(this.tags.current.scrollWidth - this.tags.current.clientWidth, Math.floor(this.tags.current.scrollLeft))) {
      event.target.classList.add(classes.NavRightDisabledAnimating);
      event.target.addEventListener('animationend', () => this.navRightAnimationEnd(event.target, true));
    } else {
      event.target.classList.add(classes.NavRightAnimating);
      event.target.addEventListener('animationend', () => this.navRightAnimationEnd(event.target, false));
    }
  }
  leftNavHandler = (event) => {
    let parentLeftOffset = this.tags.current.getBoundingClientRect().left;
    for (let index = this.tags.current.childNodes.length - 1; index >= 0; index -= 1) {
      if (this.tags.current.childNodes[index].getBoundingClientRect().left - parentLeftOffset < -1) {
        this.tags.current.childNodes[index].scrollIntoView({ behavior: 'smooth', inline: 'end' });
        break;
      }
    }
    if (this.tags.current.scrollLeft === 0) {
      event.target.classList.add(classes.NavLeftDisabledAnimating);
      event.target.addEventListener('animationend', () => this.navLeftAnimationEnd(event.target, true));
    }
    else {
      event.target.classList.add(classes.NavLeftAnimating);
      event.target.addEventListener('animationend', () => this.navLeftAnimationEnd(event.target, false));
    }
  }
  navLeftAnimationEnd(element, isDisabled) {
    if (isDisabled) element.classList.remove(classes.NavLeftDisabledAnimating);
    else element.classList.remove(classes.NavLeftAnimating);
    element.removeEventListener('animationend', this.navLeftAnimationEnd);
  }
  navRightAnimationEnd(element, isDisabled) {
    if (isDisabled) element.classList.remove(classes.NavRightDisabledAnimating);
    else element.classList.remove(classes.NavRightAnimating);
    element.removeEventListener('animationend', this.navRightAnimationEnd);
  }

  render() {
    return (
      <div className={classes.Tags}>
        <div onClick={this.leftNavHandler} className={classes.TagNavigation}>
          <img className={classes.TagNavigationIcon} src={leftIcon} alt="Left" />
        </div>
        <div
          className={classes.TagItems}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          onTouchEnd={(event) => event.stopPropagation()}
          ref={this.tags}
          onScroll={this.calculateNavState}
        >
          {Object.keys(this.props.tags).map(tag => {
            let tagClasses = [classes.TagItem];
            if (this.props.tags[tag]) tagClasses.push(classes.TagActive);
            else tagClasses.push(classes.TagInactive);

            return (
              <div key={tag} className={tagClasses.join(' ')} onClick={() => this.props.tagClicked(tag)}>{tag}</div>
            );
          })}
        </div>
        <div onClick={this.rightNavHandler} className={classes.TagNavigation}>
          <img className={classes.TagNavigationIcon} src={rightIcon} alt="Right" />
        </div>
      </div>
    );
  }
}

export default Tags;