import { useDispatch, useSelector } from "react-redux";

import classes from "./PerfMonitor.module.css";
import { selectEnablePerfMonitor, setEnablePerfMonitor } from "@/store/app";
import classNames from "classnames";

const PerfMonitor = () => {
  const dispatch = useDispatch();
  const enablePerfMonitor = useSelector(selectEnablePerfMonitor);

  return (
    <div className={classNames(classes["pf-container"], { [classes.hidden]: !enablePerfMonitor })}>
      <div id="perf-monitor"></div>
      <button onClick={() => dispatch(setEnablePerfMonitor(false))}>Close</button>
    </div>
  );
};

export default PerfMonitor;
