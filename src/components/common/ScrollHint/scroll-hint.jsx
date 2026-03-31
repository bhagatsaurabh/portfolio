import PropTypes from "prop-types";

import classes from "./scroll-hint.module.css";
import classNames from "classnames";

const ScrollHint = ({ show }) => {
  return <div className={classNames(classes.scrollhint, { [classes.hide]: !show })}></div>;
};

ScrollHint.propTypes = {
  show: PropTypes.bool,
};

export default ScrollHint;
