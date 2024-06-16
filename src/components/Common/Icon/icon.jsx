import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import styles from "./icon.module.css";
import * as icons from "@/assets/icons";
import { currTheme } from "@/store/reducers/preferences";
import { themes } from "@/utils/constants";

const Icon = ({ size, adaptive, name, className, onClick, focusable }) => {
  const theme = useSelector(currTheme);

  const iSize = size || 1;
  const icon = icons[name] ?? icons["warning"];
  const classes = [styles["icon"]];
  if (adaptive && theme === themes.DARK) {
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
