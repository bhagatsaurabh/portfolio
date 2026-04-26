import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import classes from "./lithosphere.module.css";
import useResizeObserver from "@/hooks/useResizeObserver";
import useThree from "@/hooks/useThree";

const Lithosphere = ({ theme, routeDirection, currRoute, noOfRoutes, weather }) => {
  const containerEl = useRef();
  const perfEl = useRef(document.createElement("div"));

  const { resize, pan } = useThree(
    containerEl,
    theme,
    currRoute.handle.routeOrder,
    noOfRoutes,
    perfEl,
    weather,
  );
  useResizeObserver(document.body, (width, height) => resize(width, height), 500);

  useEffect(() => {
    if (routeDirection !== 0) {
      pan(routeDirection);
    }
  }, [pan, routeDirection]);

  return <div className={classes.Lithosphere} ref={containerEl}></div>;
};

Lithosphere.propTypes = {
  routeDirection: PropTypes.bool,
  theme: PropTypes.string,
  noOfRoutes: PropTypes.number,
};

export default Lithosphere;
