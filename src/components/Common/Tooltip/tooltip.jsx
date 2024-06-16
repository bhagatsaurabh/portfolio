import PropTypes from "prop-types";

import classes from "./tooltip.module.css";

const Tooltip = ({ direction, children, tip, customStyle }) => {
  let tooltipTextClasses = [classes.TooltipText];
  if (direction) {
    tooltipTextClasses.push(
      classes[direction.charAt(0).toUpperCase() + direction.slice(1)]
    );
  } else {
    tooltipTextClasses.push(classes.Bottom);
  }
  return (
    <div className={classes.Tooltip} style={{ ...customStyle }}>
      <span className={tooltipTextClasses.join(" ")}>{tip}</span>
      {children}
    </div>
  );
};

Tooltip.propTypes = {
  direction: PropTypes.string,
  tip: PropTypes.string,
  children: PropTypes.any,
  customStyle: PropTypes.any,
};

export default Tooltip;
