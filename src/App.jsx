import { Suspense, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";

import classes from "./app.module.css";
import ScrollingBackground from "@/components/common/ScrollingBackground/scrolling-background";
import ThemeSelector from "@/components/common/ThemeSelector/theme-selector";
import Navigator from "@/components/common/Navigator/navigator";
import { routes } from "@/router";
import { clamp } from "@/utils";
import {
  loadPreferences,
  selectCurrTheme,
  selectPrefsLoaded,
  setPrefsLoaded,
} from "@/store/preferences";
import { setShowScrollHint } from "./store/app";
import { cleanup } from "@/store/preloader";
import { loadContact } from "@/store/contact";
import { loadProjects } from "@/store/projects";
import useRouteDirection from "@/hooks/useRouteDirection";
import { useHorizontalSwipe } from "@/hooks/useHorizontalSwipe";
import Planet from "@/components/common/Planet/planet";
import useIdlePreload from "./hooks/useIdlePreload";

const App = () => {
  const [worldWeather, setWorldWeather] = useState("");
  const dispatch = useDispatch();
  const theme = useSelector(selectCurrTheme);
  const prefsLoaded = useSelector(selectPrefsLoaded);
  const { currRoute, direction, navigate } = useRouteDirection(routes);
  const moveSection = (forward) => {
    const nextRouteIdx = clamp(
      currRoute.handle.routeOrder + (forward ? 1 : -1),
      0,
      routes.length - 1,
    );
    handleNavigate(nextRouteIdx);
  };
  const swipeHandlers = useHorizontalSwipe({ onSwipe: moveSection });
  const preloads = useMemo(
    () => [
      () => import("@/components/Projects/projects"),
      () => import("@/components/Skills/skills"),
      () => import("@/components/Experience/experience"),
      () => import("@/components/About/about"),
    ],
    [],
  );
  useIdlePreload(preloads);

  useEffect(() => {
    const appInit = async () => {
      const tasks = [];
      tasks.push(dispatch(loadPreferences()).unwrap());
      tasks.push(dispatch(loadContact()).unwrap());
      tasks.push(dispatch(loadProjects()).unwrap());
      await Promise.all(tasks);
      dispatch(setPrefsLoaded(true));
    };
    appInit();

    return () => dispatch(cleanup());
  }, [dispatch]);

  const handleNavigate = (route) => {
    dispatch(setShowScrollHint(false));
    navigate(route.path);
  };
  const mapRoute = (route) => {
    const active = location.pathname === route.path;
    const routeIdx = route.handle.routeOrder;

    let x;
    if (active) {
      x = "0%";
    } else if (routeIdx < currentIdx) {
      x = direction >= 0 ? "-30%" : "-40%";
    } else {
      x = direction >= 0 ? "40%" : "40%";
    }

    const MotionSection = motion.section;
    const animate = {
      x,
      opacity: active ? 1 : 0,
      zIndex: active ? 2 : 0,
      pointerEvents: active ? "auto" : "none",
    };
    const transition = {
      duration: 0.75,
      ease: [0.33, 0.03, 0.35, 0.97],
    };
    return (
      <MotionSection
        key={route.path}
        className="section"
        initial={false}
        animate={animate}
        transition={transition}
        inert={currRoute.path === route.path ? undefined : true}
      >
        <route.Component />
      </MotionSection>
    );
  };

  const currentIdx = currRoute.handle.routeOrder;

  return (
    <div className={[classes.App, theme].join(" ")} id="App" {...swipeHandlers}>
      {prefsLoaded && (
        <>
          <Planet.Atmosphere
            theme={theme}
            routeDirection={direction}
            currRoute={currRoute}
            onWorldWeatherChange={(type) => setWorldWeather(type)}
          />
          <Planet.Lithosphere
            theme={theme}
            routeDirection={direction}
            currRoute={currRoute}
            noOfRoutes={routes.length}
            weather={worldWeather}
          />
          <Navigator activeRoute={currRoute} routes={routes} onNavigate={handleNavigate} />
          <ThemeSelector />
          <ScrollingBackground activeRoute={currRoute} disabled={false} />
          <Suspense fallback={<span>{"..."}</span>}>{routes.map(mapRoute)}</Suspense>
        </>
      )}
    </div>
  );
};

export default App;
