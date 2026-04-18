import PropTypes from "prop-types";
import classNames from "classnames";

import classes from "./scroll-hint.module.css";

const ScrollHint = ({ show }) => {
  return <div className={classNames(classes.scrollhint, { [classes.hide]: !show })}></div>;
};

ScrollHint.propTypes = {
  show: PropTypes.bool,
};

export default ScrollHint;
