import { forwardRef } from "react";
import PropTypes from "prop-types";

import styles from "./feed-button.module.css";
import Icon from "../Icon/icon";

const FeedButton = forwardRef(
  ({ onClick, icon, iconRight, size = 1, children }, ref) => {
    let buttonClasses = [styles.FeedButton];
    if (icon) {
      if (iconRight) buttonClasses.push(styles.FeedButtonReverse);
    }

    return (
      <button
        ref={ref}
        className={buttonClasses.join(" ")}
        onClick={onClick}
        style={{
          "--size": `${size}rem`,
          "--padding": `${0.25 * size}rem ${size}rem`,
        }}
      >
        {icon && <Icon className={styles.ButtonIcon} name={icon} size={size} />}
        <div className={styles.ButtonText}>{children}</div>
      </button>
    );
  }
);

FeedButton.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.string,
  iconRight: PropTypes.bool,
  children: PropTypes.any,
  size: PropTypes.number,
};
FeedButton.displayName = "FeedButton";

export default FeedButton;
