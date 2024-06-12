import React from 'react';

import classes from './tooltip.module.css';

const Tooltip = (props) => {
  let tooltipTextClasses = [classes.TooltipText];
  if (props.direction) {
    tooltipTextClasses.push(classes[props.direction.charAt(0).toUpperCase() + props.direction.slice(1)]);
  } else {
    tooltipTextClasses.push(classes.Bottom);
  }
  return (
    <div className={classes.Tooltip} style={{ ...props.customStyle }}>
      <span className={tooltipTextClasses.join(' ')}>{props.tip}</span>
      {props.children}
    </div>
  );
};

export default Tooltip;