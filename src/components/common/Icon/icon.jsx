import PropTypes from "prop-types";
import classNames from "classnames";

import classes from "./icon.module.css";

const Icon = ({ size, name, className, onClick, focusable, adaptive = true }) => {
  const iSize = size || 1;
  const handleClick = (e) => onClick?.(e);

  return (
    <svg
      draggable="false"
      width={`${iSize}rem`}
      height={`${iSize}rem`}
      aria-hidden={!focusable}
      role={focusable ? "button" : undefined}
      onClick={handleClick}
      className={classNames(classes.icon, className, { [classes.adaptive]: adaptive })}
      tabIndex={focusable ? 0 : undefined}
    >
      <use href={`${import.meta.env.VITE_SB_CDN_URL_ICONS}/spritesheets/icons.svg#${name}`} />
    </svg>
  );
};

Icon.propTypes = {
  size: PropTypes.number,
  name: PropTypes.string,
  adaptive: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  focusable: PropTypes.bool,
};
export default Icon;
