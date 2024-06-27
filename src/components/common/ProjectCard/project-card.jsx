import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import styles from "./project-card.module.css";
import Icon from "../Icon/icon";
import ExternalLink from "../ExternalLink/external-link";
import { preload } from "@/store/actions/preloader";
import SelfCover from "../SelfCover/self-cover";

const ProjectCard = ({ project }) => {
  const mediaSource = useSelector(
    (state) => state.preloader[project.mediaLink]
  );
  const dispatch = useDispatch();

  useEffect(() => {
    project.mediaLink &&
      typeof mediaSource === "undefined" &&
      dispatch(preload(project.mediaLink));
    return () => {};
  }, []);

  const handleOpen = (e) => {
    if (
      (!e.key || (e.key && ["Enter", "Space"].includes(e.key))) &&
      (project.liveLink || project.githubLink)
    ) {
      window.open(project.liveLink || project.githubLink, "_blank");
    }
  };

  return (
    <article
      className={styles.ProjectCard}
      tabIndex="0"
      onKeyUp={handleOpen}
      onClick={handleOpen}
    >
      {typeof mediaSource === "undefined" ? (
        <div
          className={styles.Cover}
          style={{ backgroundImage: `url(${project.image})` }}
        >
          {project.name === "My Portfolio" && <SelfCover />}
        </div>
      ) : (
        <video
          className={styles.Cover}
          src={mediaSource}
          poster={project.image}
          autoPlay
          loop
          playsInline
          muted
        ></video>
      )}
      <div className={styles.Title}>
        <h3>{project.name}</h3>
        <div className={styles.Links}>
          {project.liveLink && (
            <ExternalLink icon="external" url={project.liveLink} />
          )}
          {project.githubLink && (
            <ExternalLink icon="github" url={project.githubLink} />
          )}
        </div>
      </div>
      <div className={styles.Footer}>
        <div className={styles.Tags}>
          {project.tags
            .filter((tag) => !tag.startsWith("#"))
            .map((tag) => (
              <Icon size={1} key={tag} name={tag} className={styles.Tag} />
            ))}
        </div>
      </div>
      <div className={styles.Info}>
        <span>{project.description}</span>
      </div>
    </article>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    descriptionLong: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    githubLink: PropTypes.string,
    liveLink: PropTypes.string,
    mediaLink: PropTypes.string,
  }),
};

export default ProjectCard;
