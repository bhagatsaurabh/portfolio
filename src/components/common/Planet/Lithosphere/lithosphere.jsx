import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import classes from "./lithosphere.module.css";
import useResizeObserver from "@/hooks/useResizeObserver";
import useThree from "@/hooks/useThree";

const Lithosphere = ({ theme, routeDirection, currRoute, noOfRoutes }) => {
  const containerEl = useRef();
  const perfEl = useRef(document.createElement("div"));

  const { resize, pan } = useThree(
    containerEl,
    theme,
    currRoute.handle.routeOrder,
    noOfRoutes,
    perfEl,
  );
  useResizeObserver((width, height) => resize(width, height));

  useEffect(() => {
    if (routeDirection !== 0) {
      pan(routeDirection);
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
  noOfRoutes: PropTypes.number,
};

export default Lithosphere;
