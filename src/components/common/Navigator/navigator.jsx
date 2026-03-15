import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import classes from "./navigator.module.css";
import { clamp } from "@/utils";
import Icon from "../Icon/icon";
import classNames from "classnames";

const Navigator = ({ routes, activeRoute, onNavigate }) => {
  const sectionTitleListEl = useRef(null);
  const switchEl = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let handle;
    if (isOpen) {
      handle = setTimeout(() => {
        sectionTitleListEl.current?.classList.remove(classes.open);
        switchEl.current?.classList.remove(classes.open);
        setIsOpen(false);
      }, 4000);
    }
    return () => clearTimeout(handle);
  }, [isOpen]);

  const handleClick = (newRoute, direction = 0) => {
    if (!newRoute) {
      const newRouteOrder = clamp(activeRoute.handle.routeOrder + direction, 0, routes.length - 1);
      newRoute = routes.find((r) => r.routeOrder === newRouteOrder);
    }
    if (newRoute.path === activeRoute.path) return;
    onNavigate(newRoute);
  };

  return (
    <>
      <nav className={classes.Navigator}>
        <button
          ref={switchEl}
          className={classNames(classes.Switch, { [classes.open]: isOpen })}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Icon name="menu" size={1.5} />
        </button>
        <div
          ref={sectionTitleListEl}
          className={classNames(classes.SectionTitleList, { [classes.open]: isOpen })}
        >
          {routes.map((route) => (
            <span
              key={route.name}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleClick(route)}
              onClick={() => handleClick(route)}
              className={classNames(classes.SectionTitle, {
                [classes.titleactive]: route.handle.routeOrder === activeRoute.handle.routeOrder,
              })}
            >
              {route.title}
            </span>
          ))}
        </div>
      </nav>
      <div className={classes.Titles}>
        {routes.map((route) => (
          <h1
            key={route.name}
            className={classNames(classes.Title, {
              [classes.active]: route.path === activeRoute.path,
            })}
          >
            {route.path === "/" ? "" : route.title}
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
          <Icon name="left-arrow" />
        </button>
        <button
          onClick={() => handleClick(null, 1)}
          className={classNames(classes.Right, {
            [classes.hidden]: activeRoute.handle.routeOrder === routes.length - 1,
          })}
        >
          <Icon name="right-arrow" />
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
