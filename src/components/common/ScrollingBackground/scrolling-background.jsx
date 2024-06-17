import PropTypes from "prop-types";

import styles from "./scrolling-background.module.css";

const ScrollingBackground = (props) => {
  const { position = 0 } = props;

  let classNames = [styles.ScrollingBackground, styles["Position" + position]];

  return <div className={classNames.join(" ")}></div>;
};

ScrollingBackground.propTypes = {
  position: PropTypes.number,
};

export default ScrollingBackground;
