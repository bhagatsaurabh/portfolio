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
import { clamp, throttle } from "./utils";
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
  const direction =
    routeOrder[location.pathname] -
    routeOrder[prevPath.current ?? location.pathname];
  const route = routes.find((route) => route.path === location.pathname);
  const game = useRef(null);

  const initScene = useCallback(async (theme) => {
    game.current = init(theme);
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
    game.current?.scene?.keys.game?.enablePipeline(theme === themes.DARK);
  }, [theme]);

  let gesture = [];

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
    } else;
    gesture = [];
  };
  const throttledWheel = throttle((e) => {
    console.log(e.deltaY);
    if (e.deltaY > 0) moveSection(true);
    else moveSection(false);
  }, 1000);
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

  return (
    <div
      className={[classes.App, theme].join(" ")}
      id="App"
      onTouchStart={touchStartHandler}
      onTouchMove={touchMoveHandler}
      onTouchEnd={touchEndHandler}
      onWheel={(e) => throttledWheel(e)}
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
            checkpoints={[
              { name: "Intro", title: "Intro" },
              { name: "Projects", title: "Projects" },
              { name: "Work", title: "Experience" },
              { name: "Skills", title: "Skills" },
              { name: "About", title: "Me" },
            ]}
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
              mountOnEnter
              appear
            >
              <div ref={route.nodeRef} className="section">
                <route.component />
              </div>
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
