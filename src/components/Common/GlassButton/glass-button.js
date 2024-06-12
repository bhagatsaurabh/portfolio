import React from 'react';

import classes from './glass-button.module.css';

const GlassButton = React.forwardRef((props, ref) => {
  let buttonClasses = [classes.GlassButton];
  if (props.icon) {
    if (props.iconPosition === 'right') buttonClasses.push(classes.GlassButtonReverse);
  }

  return (
    <div ref={ref} className={classes.GlassButton} onClick={props.clicked} style={{ ...props.customStyle }}>
      {props.icon ?
        <img className={classes.ButtonIcon} alt="Button Icon" src={props.icon} /> : null
      }
      <div className={classes.ButtonText}>{props.text}</div>
    </div>
  );
});

export default GlassButton;