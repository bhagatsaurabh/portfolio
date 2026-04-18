import { useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import classes from "./navigator.module.css";
import { clamp } from "@/utils";
import Icon from "../Icon/icon";

const Navigator = ({ routes, activeRoute, onNavigate }) => {
  const navigatorEl = useRef(null);

  const handleClick = (newRoute, direction = 0) => {
    if (!newRoute) {
      const newRouteOrder = clamp(activeRoute.handle.routeOrder + direction, 0, routes.length - 1);
      newRoute = routes.find((r) => r.handle.routeOrder === newRouteOrder);
    }
    if (newRoute.path === activeRoute.path) return;
    document.activeElement?.blur?.();
    onNavigate(newRoute);
  };

  return (
    <>
      <nav className={classes.Navigator} ref={navigatorEl}>
        <button className={classes.Switch}>
          <Icon name="menu" size={1.5} />
        </button>
        <div className={classes.SectionTitleList}>
          {routes.map((route) => (
            <button
              key={route.handle.name}
              onKeyDown={(e) => e.key === "Enter" && handleClick(route)}
              onClick={() => handleClick(route)}
              className={classNames(classes.SectionTitle, {
                [classes.titleactive]: route.handle.routeOrder === activeRoute.handle.routeOrder,
              })}
            >
              {route.handle.title}
            </button>
          ))}
        </div>
      </nav>
      <div className={classes.Titles}>
        {routes.map((route) => (
          <h1
            key={route.handle.name}
            className={classNames(classes.Title, {
              [classes.active]: route.path === activeRoute.path,
            })}
          >
            {route.path === "/" ? "" : route.handle.title}
          </h1>
        ))}
      </div>
      <div className={classes.NavigationButtons}>
        <button
          onClick={() => handleClick(null, -1)}
          className={classNames(classes.Left, {
            [classes.hidden]: activeRoute.handle.routeOrder === 0,
          })}
        >
          <Icon name="left-arrow" size={1.25} />
        </button>
        <button
          onClick={() => handleClick(null, 1)}
          className={classNames(classes.Right, {
            [classes.hidden]: activeRoute.handle.routeOrder === routes.length - 1,
          })}
        >
          <Icon name="right-arrow" size={1.25} />
        </button>
      </div>
    </>
  );
};

Navigator.propTypes = {
  activeRoute: PropTypes.shape({ name: PropTypes.string }),
  routes: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
  onNavigate: PropTypes.func,
};

export default Navigator;
