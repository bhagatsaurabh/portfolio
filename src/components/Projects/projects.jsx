import { useSelector } from "react-redux";
import classNames from "classnames";

import ProjectCard from "../common/ProjectCard/project-card";
import classes from "./projects.module.css";

const Projects = () => {
  const projects = useSelector((state) => state.projects);

  return (
    <div className={classNames([classes.Projects, "scrollable", "tracked"])}>
      <div className={classes.Container} onScroll={(e) => e.preventDefault()}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
