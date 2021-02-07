import React from 'react';

import classes from './flip-button.module.css';

const FlipButton = (props) => {
  let frontIconClasses = [classes.FlipIcon];
  let backIconClasses = [classes.FlipIcon];
  if (props.flipped) {
    frontIconClasses.push(classes.Inactive);
    backIconClasses.push(classes.Active);
  }

  return (
    <div className={classes.FlipButton}>
      <div className={classes.ShadowBox}>
        <img
          className={frontIconClasses.join(' ')}
          onClick={props.onFlip}
          src={props.frontIcon} alt="Controls"
          style={{ opacity: 1, transform: 'perspective(5em) rotateX(0deg)' }}
        />
        <img
          className={backIconClasses.join(' ')}
          onClick={props.onFlip}
          src={props.backIcon} alt="Close"
          style={{ opacity: 0, transform: 'perspective(5em) rotateX(-180deg)', position: 'absolute' }}
        />
      </div>
    </div>
  );
};

export default FlipButton;