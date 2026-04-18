import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import classes from "./project-card.module.css";
import Icon from "../Icon/icon";
import ExternalLink from "../ExternalLink/external-link";
import { preload } from "@/store/preloader";
import classNames from "classnames";

const ProjectCard = ({ project }) => {
  const mediaSource = useSelector((state) => state.preloader[project.mediaLink]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (project.mediaLink && !mediaSource) {
      dispatch(preload(project.mediaLink));
    }
  }, [dispatch, mediaSource, project.mediaLink]);

  const handleOpen = (e) => {
    if (
      (!e.key || (e.key && ["Enter", "Space"].includes(e.key))) &&
      (project.liveLink ?? project.githubLink)
    ) {
      window.open(project.liveLink ?? project.githubLink, "_blank");
    }
  };

  let cover;
  if (!mediaSource) {
    if (project.image?.startsWith("$")) {
      cover = (
        <div className={classes.Cover}>
          <div className={classes.CoverName}>
            <h3>{project.image.substring(1)}</h3>
          </div>
        </div>
      );
    } else if (project.image) {
      cover = (
        <div className={classes.Cover} style={{ backgroundImage: `url(${project.image})` }}></div>
      );
    }
  }

  return (
    <article className={classes.ProjectCard} tabIndex="0" onKeyUp={handleOpen} onClick={handleOpen}>
      {cover ?? (
        <video
          className={classNames([
            classes.Cover,
            { [classes.Self]: project.name === "My Portfolio" },
          ])}
          src={mediaSource}
          poster={project.image}
          autoPlay
          loop
          playsInline
          muted
        ></video>
      )}
      <div className={classes.Title}>
        <h3>{project.name}</h3>
        <div className={classes.Links}>
          {project.liveLink && <ExternalLink icon="external" url={project.liveLink} />}
          {project.githubLink && <ExternalLink icon="github" url={project.githubLink} />}
        </div>
      </div>
      <div className={classes.Footer}>
        <div className={classes.Tags}>
          {project.tags
            .filter((tag) => !tag.startsWith("#"))
            .map((tag) => (
              <Icon size={1} key={tag} name={tag} className={classes.Tag} />
            ))}
        </div>
      </div>
      <div className={classes.Info}>
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
