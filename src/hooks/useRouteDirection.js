import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useRouteDirection = (routes) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevPath = useRef(null);
  const currPath = location.pathname;
  const routeMap = useMemo(() => new Map(routes.map((r) => [r.path, r])), [routes]);

  // eslint-disable-next-line react-hooks/refs
  const prevRoute = routeMap.get(prevPath.current);
  const currRoute = routeMap.get(currPath);
  const direction = currRoute.handle.routeOrder - (prevRoute ?? currRoute).handle.routeOrder;

  useEffect(() => {
    prevPath.current = currPath;
  }, [currPath]);

  return { currRoute, prevRoute, direction, navigate };
};

export default useRouteDirection;
