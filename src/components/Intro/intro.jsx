import classes from "./intro.module.css";

const Intro = () => {
  let nameClasses = [classes.Float, classes.IntroFloat];
  let summaryClasses = [classes.Float, classes.SummaryFloat];

  return (
    <div className={classes.Intro}>
      <div className={nameClasses.join(" ")}>
        <div className={classes.Greeting}>{"Hi, I'm"}</div>
        <div className={classes.Name}>
          <div className={classes.First}>Saurabh</div>
          <div className={classes.Last}>bhagat</div>
        </div>
      </div>
      <div className={summaryClasses.join(" ")}>
        a front-end enthusiast, software engineer and UI/UX designer
      </div>
    </div>
  );
};

export default Intro;
