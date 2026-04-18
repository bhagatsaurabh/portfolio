import PropTypes from "prop-types";

import classes from "./skill-tag.module.css";
import Icon from "../Icon/icon";

const SkillTag = ({ icon, name, size = 1 }) => {
  return (
    <span className={classes.SkillTag} style={{ fontSize: `${size}rem` }}>
      <Icon name={icon} size={size} />
      <span className={classes.Name}>{name}</span>
    </span>
  );
};

SkillTag.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
};

export default SkillTag;
