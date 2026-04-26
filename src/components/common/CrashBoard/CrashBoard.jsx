import classes from "./CrashBoard.module.css";

const CrashBoard = () => {
  return (
    <div className={classes.CrashBoard}>
      <h2>Something went wrong</h2>
      <div className={classes.Controls}>
        <a href="/resumé">
          <button>📝 Resumé</button>
        </a>
        <a href="/">
          <button onClick={() => location.reload()}>⭮ Reload</button>
        </a>
        <a href="https://github.com/bhagatsaurabh/portfolio/issues" target="_blank">
          <button>🐞 Report</button>
        </a>
      </div>
    </div>
  );
};

export default CrashBoard;
