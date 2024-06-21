import PropTypes from "prop-types";

import styles from "./skill-tag.module.css";
import Icon from "../Icon/icon";

const SkillTag = ({ icon, name, size = 1 }) => {
  return (
    <span className={styles.SkillTag} style={{ fontSize: `${size}rem` }}>
      <Icon name={icon} size={size} />
      {name}
    </span>
  );
};

SkillTag.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
};

export default SkillTag;
