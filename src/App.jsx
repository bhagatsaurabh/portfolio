import { useCallback, useEffect, useState } from "react";
// import { Route } from "react-router-dom";
// import { CSSTransition } from "react-transition-group";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import classes from "./app.module.css";
// import { routes } from "@/router/routes";
// import ThemeSelector from "./components/ThemeSelector/theme-selector";
import LiveBackground from "./components/LiveBackground/live-background";
// import Preview from "./components/Preview/preview";
import { loadPreferences } from "./store/actions/preferences";
import { currTheme } from "./store/reducers/preferences";
import ScrollingBackground from "./components/ScrollingBackground/scrolling-background";
import ThemeSelector from "./components/ThemeSelector/theme-selector";

const App = (props) => {
  const { fetchData } = props;
  const dispatch = useDispatch();
  const [prefLoaded, setPrefLoaded] = useState(false);
  const theme = useSelector(currTheme);
  const [wind, setWind] = useState(null);

  let gesture = [];
  const preferences = useCallback(async () => {
    await dispatch(loadPreferences());
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
    } else if (theta > 45 && theta < 135);
    else if (theta > 135 || theta < -135) {
      setWind(false);
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
          <ScrollingBackground position={/* routeOrder[currPath] */ 0} />
          {/* {routes.map((route) => (
            <Route key={route.path} exact path={route.path}>
              {({ match }) => (
                <CSSTransition
                  in={match !== null}
                  timeout={1000}
                  mountOnEnter
                  classNames={"section-forward"}
                >
                  <div className="section">
                    <route.component />
                  </div>
                </CSSTransition>
              )}
            </Route>
          ))} */}
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
