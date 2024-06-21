import { useSelector } from "react-redux";
import ScrollHint from "../common/ScrollHint/scroll-hint";
import classes from "./intro.module.css";

const Intro = () => {
  let nameClasses = [classes.Float, classes.IntroFloat];
  const showScrollHint = useSelector((state) => state.app.showScrollHint);

  return (
    <div className={classes.Intro}>
      <div className={nameClasses.join(" ")}>
        <div className={classes.Greeting}>{"Hi, I'm"}</div>
        <div className={classes.Name}>
          <div className={classes.First}>Saurabh</div>
          <div className={classes.Last}>bhagat</div>
        </div>
      </div>
      <ScrollHint show={showScrollHint} />
    </div>
  );
};

export default Intro;
