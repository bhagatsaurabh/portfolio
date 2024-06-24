import { useSelector } from "react-redux";
import ScrollHint from "../common/ScrollHint/scroll-hint";
import classes from "./intro.module.css";
import { useEffect, useState } from "react";
import { rand } from "@/utils/graphics";

const Intro = () => {
  let nameClasses = [classes.Float, classes.IntroFloat];
  const showScrollHint = useSelector((state) => state.app.showScrollHint);
  const [activeTitle, setActiveTitle] = useState(Math.round(rand(0, 2)));

  const titles = [
    "frontend enthusiast",
    "software engineer",
    "UI/UX designer",
    "creative developer",
  ];
  useEffect(() => {
    const handle = setInterval(
      () => setActiveTitle((activeTitle + 1) % titles.length),
      3500
    );
    return () => clearInterval(handle);
  }, [activeTitle]);

  return (
    <div className={classes.Intro}>
      <div className={nameClasses.join(" ")}>
        <div className={classes.Greeting}>
          <span>Hi</span>
          <span>{", I'm"}</span>
        </div>
        <div className={classes.Name}>
          <span className={classes.First}>Saurabh</span>
          <span className={classes.Last}>bhagat</span>
        </div>
        <div className={classes.Title}>
          <h5>
            <span>a </span>
            <div>
              {titles.map((title, idx) => (
                <span
                  key={title}
                  className={[
                    classes.One,
                    activeTitle === idx ? classes.active : "",
                  ].join(" ")}
                  style={{
                    position: idx === 0 ? "relative" : "absolute",
                    left: 0,
                  }}
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
