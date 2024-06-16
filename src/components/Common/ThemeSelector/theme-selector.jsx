import { useDispatch, useSelector } from "react-redux";

import classes from "./theme-selector.module.css";
import { currTheme } from "@/store/reducers/preferences";
import { themes } from "@/utils/constants";
import Icon from "../Icon/icon";

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
      <Icon name="themeLight" size={2} className={lightClasses.join(" ")} />
      <Icon name="themeDark" size={2} className={darkClasses.join(" ")} />
    </button>
  );
};

export default ThemeSelector;
