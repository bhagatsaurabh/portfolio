import React from 'react';

import classes from './search-notfound.module.css';
import notFoundIcon from '../../assets/images/search-not-found.png';
import notFoundInnerIcon from '../../assets/images/search-not-found-inner.png';
import { CSSTransition } from 'react-transition-group';

const SearchNotFound = (props) => {
  return (
    <CSSTransition
      in={props.show}
      timeout={200}
      classNames={{
        enter: classes.Enter,
        enterActive: classes.EnterActive,
        enterDone: classes.EnterDone,
        exit: classes.Exit,
        exitActive: classes.ExitActive,
        exitDone: classes.ExitDone
      }}
    >
      <div className={classes.NoResults}>
        <div style={{ display: 'flex' }}>
          <img src={notFoundIcon} className={classes.NotFound} alt="Search Not Found" />
          <img src={notFoundInnerIcon} className={classes.NotFoundInner} style={{ position: 'absolute' }} alt="Search Not Found" />
        </div>
        <div className={classes.NotFoundText}>
          Couldn't find any projects for your search
        </div>
      </div>
    </CSSTransition>
  );
};

export default SearchNotFound;