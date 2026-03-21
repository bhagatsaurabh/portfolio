import { createRef, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import classes from "./lithosphere.module.css";
import useResizeObserver from "@/hooks/useResizeObserver";
import useThree from "@/hooks/useThree";

const Lithosphere = ({ theme, routeDirection, currRoute }) => {
  const containerEl = createRef();

  const { resize, pan } = useThree(containerEl, theme, currRoute.handle.routeOrder);
  useResizeObserver((width, height) => resize(width, height));

  useEffect(() => {
    if (routeDirection !== 0) {
      pan();
    }
  }, [pan, routeDirection]);

  return (
    <div
      className={classNames(classes.Lithosphere, { [classes.blur]: currRoute.handle?.globalBlur })}
      ref={containerEl}
    ></div>
  );
};

Lithosphere.propTypes = {
  routeDirection: PropTypes.bool,
  theme: PropTypes.string,
  blur: PropTypes.bool,
};

export default Lithosphere;
