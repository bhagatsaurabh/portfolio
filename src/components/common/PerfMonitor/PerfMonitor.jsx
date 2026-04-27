import { useDispatch, useSelector } from "react-redux";

import classes from "./PerfMonitor.module.css";
import { selectEnablePerfMonitor, setEnablePerfMonitor } from "@/store/app";
import classNames from "classnames";
import { useEffect, useState } from "react";

const PerfMonitor = ({ world }) => {
  const dispatch = useDispatch();
  const enablePerfMonitor = useSelector(selectEnablePerfMonitor);
  const [perfSnapshot, setPerfSnapshot] = useState([]);

  useEffect(() => {
    let offHandle = () => {};
    if (world) {
      offHandle = world.events.on("perf", (pfSnap) => setPerfSnapshot(pfSnap));
    }

    return offHandle;
  }, [world]);

  return (
    <div className={classNames(classes["pf-container"], { [classes.hidden]: !enablePerfMonitor })}>
      <div id="perf-monitor" className={classes.Monitor}>
        <div className={classes.Keys}>
          {perfSnapshot.map((entry, idx) => (
            <span key={idx}>{entry.name}</span>
          ))}
        </div>
        <div className={classes.Values}>
          {perfSnapshot.map((entry, idx) => (
            <span key={idx}>{entry.value}</span>
          ))}
        </div>
      </div>
      <button onClick={() => dispatch(setEnablePerfMonitor(false))}>Close</button>
    </div>
  );
};

export default PerfMonitor;
