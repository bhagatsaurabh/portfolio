import PropTypes from "prop-types";

import Icon from "../Icon/icon";
import styles from "./external-link.module.css";

const ExternalLink = ({ icon, url, size }) => {
  return (
    <a className={styles.ExternalLink} href={url} target="_blank">
      <Icon name={icon} size={size} />
    </a>
  );
};
ExternalLink.propTypes = {
  icon: PropTypes.string,
  url: PropTypes.string,
  size: PropTypes.number,
};

export default ExternalLink;
