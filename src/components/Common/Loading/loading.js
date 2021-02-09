import React from 'react';

import classes from './loading.module.css';

const Loading = (props) => {
  let loadingClasses = [classes.Loading];
  if (props.show) {
    loadingClasses.push(classes.Show);
  }
  return (
    <div style={{ ...props.customStyle }} className={loadingClasses.join(' ')}>
      Loading...
    </div>
  );
};

export default Loading;