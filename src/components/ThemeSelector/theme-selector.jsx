import { useDispatch, useSelector } from "react-redux";

import classes from "./theme-selector.module.css";
import { lightIcon, darkIcon } from "@/assets/icons";
import { currTheme } from "@/store/reducers/preferences";
import { themes } from "@/utils/constants";

const ThemeSelector = () => {
  const theme = useSelector(currTheme);
  const dispatch = useDispatch();

  const [lightClasses, darkClasses] = [
    [classes["theme-icon"]],
    [classes["theme-icon"]],
  ];
  if (theme === themes.LIGHT) lightClasses.push(classes["active"]);
  else darkClasses.push(classes["active"]);

  const handleClick = () => {
    dispatch({
      type: "preferences/set-theme",
      payload: theme === themes.LIGHT ? themes.DARK : themes.LIGHT,
    });
  };

  return (
    <button onClick={handleClick} className={classes["theme-button"]}>
      <img
        draggable="false"
        className={lightClasses.join(" ")}
        src={lightIcon}
        alt="Light theme icon"
      />
      <img
        draggable="false"
        className={darkClasses.join(" ")}
        src={darkIcon}
        alt="Dark theme icon"
      />
    </button>
  );
};

export default ThemeSelector;
