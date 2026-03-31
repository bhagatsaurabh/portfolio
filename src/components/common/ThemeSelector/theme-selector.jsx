import { useDispatch, useSelector } from "react-redux";

import classes from "./theme-selector.module.css";
import { selectCurrTheme, setTheme } from "@/store/preferences";
import { themes } from "@/utils/constants";
import Icon from "@/components/common/Icon/icon";

const ThemeSelector = () => {
  const theme = useSelector(selectCurrTheme);
  const dispatch = useDispatch();

  const [lightClasses, darkClasses] = [[classes["theme-icon"]], [classes["theme-icon"]]];
  if (theme === themes.LIGHT) lightClasses.push(classes.active);
  else darkClasses.push(classes.active);

  const handleClick = () => {
    dispatch(setTheme({ theme: theme === themes.LIGHT ? themes.DARK : themes.LIGHT }));
  };

  return (
    <button onClick={handleClick} className={classes["theme-button"]} aria-label="Toggle theme">
      <Icon adaptive={false} name="theme-light" size={1.5} className={lightClasses.join(" ")} />
      <Icon adaptive={false} name="theme-dark" size={1.5} className={darkClasses.join(" ")} />
    </button>
  );
};

export default ThemeSelector;
