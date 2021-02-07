import React from 'react';

import classes from './tooltip.module.css';

const Tooltip = (props) => {
  return (
    <div className={classes.Tooltip} style={{ ...props.customStyle }}>
      <span className={classes.TooltipText}>{props.tip}</span>
      {props.children}
    </div>
  );
};

export default Tooltip;