import { useEffect, useState } from "react";
import classes from "./PerfControl.module.css";
import { useDispatch } from "react-redux";
import { setEnablePerfMonitor } from "@/store/app";

const PerfControl = () => {
  const [clicks, setClicks] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (clicks >= 3) {
      dispatch(setEnablePerfMonitor(true));
    }
  }, [clicks, dispatch]);

  return (
    <span className={classes.Silly} onClick={() => setClicks((c) => c + 1)}>
      🎶
    </span>
  );
};

export default PerfControl;
