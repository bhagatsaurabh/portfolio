import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CSSTransition } from "react-transition-group";
import PropTypes from "prop-types";

import classes from "./app.module.css";
import LiveBackground from "./components/common/LiveBackground/live-background";
import ScrollingBackground from "./components/common/ScrollingBackground/scrolling-background";
import ThemeSelector from "./components/common/ThemeSelector/theme-selector";
// import Preview from "./components/Preview/preview";
import { loadPreferences } from "./store/actions/preferences";
import { currTheme } from "./store/reducers/preferences";
import { routeOrder, routes } from "@/router/routes.jsx";
import usePrevious from "./hooks/usePrevious";
import { loadContact } from "./store/actions/contact";
import { clamp } from "./utils";
import { router } from "./router";

const App = (props) => {
  const { fetchData } = props;
  const dispatch = useDispatch();
  const [prefLoaded, setPrefLoaded] = useState(false);
  const theme = useSelector(currTheme);
  const [wind, setWind] = useState(null);
  const location = useLocation();
  const prevPath = usePrevious(location.pathname);
  const direction =
    routeOrder[location.pathname] - routeOrder[prevPath ?? location.pathname];

  let gesture = [];
  const preferences = useCallback(async () => {
    await dispatch(loadPreferences());
    dispatch(loadContact());
    setPrefLoaded(true);
  }, [dispatch]);

  useEffect(() => {
    preferences();
    // fetchData();

    return () => {};
  }, [fetchData, preferences]);

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
      setWind(true);
      router.navigate({
        pathname:
          routes[clamp(routeOrder[location.pathname] - 1, 0, routes.length - 1)]
            .path,
      });
    } else if (theta > 45 && theta < 135);
    else if (theta > 135 || theta < -135) {
      setWind(false);
      router.navigate({
        pathname:
          routes[clamp(routeOrder[location.pathname] + 1, 0, routes.length - 1)]
            .path,
      });
    } else;
    gesture = [];
  };

  return (
    <div
      className={[classes.App, theme].join(" ")}
      id="App"
      onTouchStart={touchStartHandler}
      onTouchEnd={touchEndHandler}
      onTouchMove={touchMoveHandler}
    >
      {prefLoaded && (
        <>
          <LiveBackground.Snow
            theme={theme}
            customStyle={{ zIndex: 1 }}
            windDirection={wind}
            onComplete={() => setWind(null)}
          />
          <LiveBackground.Tree
            theme={theme}
            customStyle={{ zIndex: 1 }}
            windDirection={wind}
            onComplete={() => setWind(null)}
          />

          {/* <Navigator navigations={routes} visited={state.visited} /> */}
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

          {/* <Preview /> */}
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
