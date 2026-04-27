import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import classes from "./lithosphere.module.css";
import useResizeObserver from "@/hooks/useResizeObserver";
import useThree from "@/hooks/useThree";
import { useSelector } from "react-redux";
import { selectEnablePerfMonitor } from "@/store/app";

const Lithosphere = ({
  theme,
  routeDirection,
  currRoute,
  noOfRoutes,
  weather,
  onReady = () => {},
}) => {
  const containerEl = useRef();
  const perfEl = useRef(document.createElement("div"));
  const enablePerfMonitor = useSelector(selectEnablePerfMonitor);

  const { resize, pan } = useThree(
    containerEl,
    theme,
    currRoute.handle.routeOrder,
    noOfRoutes,
    perfEl,
    weather,
    enablePerfMonitor,
    onReady,
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
