import React from 'react';

import classes from './backdrop.module.css';

const Backdrop = (props) => {
  let backdropClasses = [classes.Backdrop];
  if (props.show) backdropClasses.push(classes.Show);

  return (
    (props.show) ? <div style={{ ...props.customStyle }} onClick={props.onDismiss} className={backdropClasses.join(' ')}></div> : null
  );
};

export default Backdrop;