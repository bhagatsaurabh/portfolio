import PropTypes from "prop-types";

import classes from "./scrolling-background.module.css";
import classNames from "classnames";

const ScrollingBackground = ({ activeRoute }) => {
  return (
    <div
      className={classNames(
        classes.ScrollingBackground,
        classes[`Position${activeRoute.handle.routeOrder}`],
      )}
    />
  );
};

ScrollingBackground.propTypes = {
  activeRoute: PropTypes.object,
};

export default ScrollingBackground;
