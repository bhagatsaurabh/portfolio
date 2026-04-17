import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ScrollHint from "../common/ScrollHint/scroll-hint";
import classes from "./intro.module.css";
import classNames from "classnames";
import { introTitles } from "@/utils/constants";
import { rand } from "@/utils";

const Intro = () => {
  const showScrollHint = useSelector((state) => state.app.showScrollHint);
  const [activeIdx, setActiveIdx] = useState(Math.round(rand(0, introTitles.length - 1)));

  useEffect(() => {
    const handle = setInterval(
      () => setActiveIdx((prevIdx) => (prevIdx + 1) % introTitles.length),
      4100,
    );
    return () => clearInterval(handle);
  }, []);

  return (
    <div className={classes.Intro}>
      <div className={classNames(classes.Float, classes.IntroFloat)}>
        <div className={classes.Greeting}>
          <span>Hi</span>
          <span>, I'm</span>
        </div>
        <div className={classes.Name}>
          <span className={classes.First}>Saurabh</span>
          <span className={classes.Last}>bhagat</span>
        </div>
        <div className={classes.Title}>
          <h5>
            <span>a </span>
            <div className={classes.Titles}>
              {introTitles.map((title, idx) => (
                <span
                  key={title}
                  className={classNames({
                    [classes.active]: activeIdx === idx,
                    [classes.relative]: idx === 0,
                  })}
                >
                  {title}
                </span>
              ))}
            </div>
          </h5>
        </div>
      </div>
      <ScrollHint show={showScrollHint} />
    </div>
  );
};

export default Intro;
