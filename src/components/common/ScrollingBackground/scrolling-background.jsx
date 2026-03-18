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
      style={{
        background: `url("${import.meta.env.VITE_SB_CDN_URL}/textures/cardboard-flat.webp") var(--background-0)`,
      }}
    />
  );
};

ScrollingBackground.propTypes = {
  activeRoute: PropTypes.object,
};

export default ScrollingBackground;
