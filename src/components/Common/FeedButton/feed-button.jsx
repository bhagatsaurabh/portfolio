import { forwardRef } from "react";
import PropTypes from "prop-types";

import classes from "./feed-button.module.css";
import Icon from "../Icon/icon";

const FeedButton = forwardRef(
  ({ onClick, icon, iconRight, children, customStyle }, ref) => {
    let buttonClasses = [classes.FeedButton];
    if (icon) {
      if (iconRight) buttonClasses.push(classes.FeedButtonReverse);
    }

    return (
      <div
        ref={ref}
        className={classes.FeedButton}
        onClick={onClick}
        style={{ ...customStyle }}
      >
        {icon && <Icon className={classes.ButtonIcon} name={icon} size={1} />}
        <div className={classes.ButtonText}>{children}</div>
      </div>
    );
  }
);

FeedButton.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.string,
  iconRight: PropTypes.bool,
  children: PropTypes.any,
  customStyle: PropTypes.any,
};
FeedButton.displayName = "FeedButton";

export default FeedButton;
