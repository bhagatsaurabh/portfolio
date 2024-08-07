import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CSSTransition } from "react-transition-group";
import PropTypes from "prop-types";

import classes from "./app.module.css";
import LiveBackground from "@/components/common/LiveBackground/live-background";
import ScrollingBackground from "./components/common/ScrollingBackground/scrolling-background";
import ThemeSelector from "./components/common/ThemeSelector/theme-selector";
import { loadPreferences } from "./store/actions/preferences";
import { currTheme } from "./store/reducers/preferences";
import { loadContact } from "./store/actions/contact";
import { router, routeOrder, routes } from "./router";
import { clamp } from "./utils";
import Navigator from "./components/common/Navigator/navigator";
import { loadProjects } from "./store/actions/projects";
import { cleanup } from "./store/actions/preloader";
import { setShowScrollHint } from "./store/actions/app";
import { init } from "./utils/phaser";
import { themes } from "./utils/constants";

const App = () => {
  const dispatch = useDispatch();
  const [prefLoaded, setPrefLoaded] = useState(false);
  const theme = useSelector(currTheme);
  const [wind, setWind] = useState(null);
  const location = useLocation();
  const prevPath = useRef(null);
  const game = useRef(null);
  const direction =
    routeOrder[location.pathname] -
    routeOrder[prevPath.current ?? location.pathname];
  const route = routes.find((route) => route.path === location.pathname);

  const initScene = useCallback(async (theme) => {
    game.current = init(theme);
  }, []);
  useEffect(() => {
    (async () => {
      initScene((await dispatch(loadPreferences())).payload.theme);
    })();
    dispatch(loadContact());
    dispatch(loadProjects());
    setPrefLoaded(true);

    return () => {
      dispatch(cleanup());
      game.current?.destroy(true);
    };
  }, []);
  useEffect(() => {
    const dir =
      routeOrder[location.pathname] -
      routeOrder[prevPath.current ?? location.pathname];
    if (dir !== 0) {
      setWind(dir < 0);
    }
  }, [location.pathname]);
  useEffect(() => {
    game.current?.scene?.keys.game?.enablePipeline(theme === themes.LIGHT);
  }, [theme]);

  let gesture = [];
  const touchStartHandler = (event) => {
    gesture = [{ x: event.touches[0].clientX, y: event.touches[0].clientY }];
  };
  const touchMoveHandler = (event) => {
    if (gesture.length >= 20) {
      gesture.shift();
      gesture.push({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    } else {
      gesture.push({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    }
  };
  const touchEndHandler = () => {
    if (gesture.length < 3) {
      gesture = [];
      return;
    }
    let first = gesture[0],
      last = gesture[gesture.length - 1];
    let theta =
      Math.atan2(last.y - first.y, last.x - first.x) * (180 / Math.PI);
    if (theta > -45 && theta < 45) {
      moveSection(false);
    } else if (theta > 45 && theta < 135);
    else if (theta > 135 || theta < -135) {
      moveSection(true);
    } else {
      if (routeOrder[location.pathname] === 0) moveSection(true);
    }
    gesture = [];
  };
  const moveSection = (forward) => {
    if (forward) {
      prevPath.current = location.pathname;
      dispatch(setShowScrollHint(false));
      router.navigate({
        pathname:
          routes[clamp(routeOrder[location.pathname] + 1, 0, routes.length - 1)]
            .path,
      });
    } else {
      prevPath.current = location.pathname;
      dispatch(setShowScrollHint(false));
      router.navigate({
        pathname:
          routes[clamp(routeOrder[location.pathname] - 1, 0, routes.length - 1)]
            .path,
      });
    }
  };
  const handleNavigate = (idx) => {
    prevPath.current = location.pathname;
    dispatch(setShowScrollHint(false));
    router.navigate(routes[idx].path);
  };
  const sectionClasses = (routPath) => {
    if (routeOrder[routPath] < routeOrder[location.pathname])
      return "preload-left";
    else if (routeOrder[routPath] > routeOrder[location.pathname])
      return "preload-right";
    return "";
  };

  return (
    <div
      className={[classes.App, theme].join(" ")}
      id="App"
      onTouchStart={touchStartHandler}
      onTouchMove={touchMoveHandler}
      onTouchEnd={touchEndHandler}
    >
      <div id="selfcover"></div>
      {prefLoaded && (
        <>
          <LiveBackground.Snow
            theme={theme}
            customStyle={{ zIndex: 1 }}
            windDirection={wind}
            blur={route?.globalBlur}
            onComplete={() => setWind(null)}
          />
          <LiveBackground.Tree
            theme={theme}
            customStyle={{ zIndex: 1 }}
            windDirection={wind}
            blur={route?.globalBlur}
            onComplete={() => setWind(null)}
          />

          <Navigator
            index={routeOrder[location.pathname]}
            checkpoints={routes}
            onNavigate={handleNavigate}
          />
          <ThemeSelector />
          <ScrollingBackground position={routeOrder[location.pathname]} />

          {routes.map((route) => (
            <CSSTransition
              key={route.name}
              in={location.pathname === route.path}
              timeout={750}
              classNames={
                direction >= 0 ? "section-forward" : "section-backward"
              }
              nodeRef={route.nodeRef}
              appear
            >
              <section
                ref={route.nodeRef}
                className={sectionClasses(route.path)}
              >
                <route.component />
              </section>
            </CSSTransition>
          ))}
        </>
      )}
    </div>
  );
};

App.propTypes = {
  location: PropTypes.any,
  fetchData: PropTypes.func,
  portfolioDataLoaded: PropTypes.bool,
  projectsPro: PropTypes.array,
  projectsInd: PropTypes.array,
  loadProjectImages: PropTypes.func,
  projectImagesLoaded: PropTypes.bool,
  portfolioDataErr: PropTypes.bool,
};

export default App;
