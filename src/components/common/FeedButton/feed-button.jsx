import PropTypes from "prop-types";

import classes from "./feed-button.module.css";
import Icon from "../Icon/icon";
import classNames from "classnames";

const FeedButton = ({ onClick, icon, iconRight, size = 1, children, ref }) => {
  return (
    <button
      ref={ref}
      className={classNames([
        classes.FeedButton,
        { [classes.FeedButtonReverse]: icon && iconRight },
      ])}
      onClick={onClick}
      style={{
        "--size": `${size}rem`,
        "--padding": `${0.25 * size}rem ${size}rem`,
      }}
    >
      {icon && <Icon className={classes.ButtonIcon} name={icon} size={size} />}
      <span className={classes.ButtonText}>{children}</span>
    </button>
  );
};

FeedButton.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.string,
  iconRight: PropTypes.bool,
  children: PropTypes.any,
  size: PropTypes.number,
};

export default FeedButton;
