import React from 'react';

import classes from './scrolling-background.module.css';

const ScrollingBackground = (props) => {
  let classNames = [classes.ScrollingBackground, classes['Position' + props.position]];

  return (
    <div className={classNames.join(' ')}></div>
  );
};

export default ScrollingBackground;