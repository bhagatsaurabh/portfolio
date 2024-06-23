import PropTypes from "prop-types";

import styles from "./icon.module.css";
import * as icons from "@/assets/icons";

const Icon = ({
  size,
  adaptive = true,
  name,
  className,
  onClick,
  focusable,
}) => {
  const iSize = size || 1;
  const icon = icons[name] ?? icons["warning"];
  const classes = [styles["icon"]];
  if (adaptive) {
    classes.push(styles["adaptive"]);
  }
  if (className) {
    classes.push(className);
  }
  const handleClick = (e) => onClick?.(e);

  return (
    <img
      onClick={handleClick}
      style={{ width: `${iSize}rem` }}
      src={icon}
      className={classes.join(" ")}
      alt={`${name}-icon`}
      tabIndex={focusable ? 0 : null}
    />
  );
};

Icon.propTypes = {
  size: PropTypes.number,
  accent: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  focusable: PropTypes.bool,
  adaptive: PropTypes.bool,
};
export default Icon;
