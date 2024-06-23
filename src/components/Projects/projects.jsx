import ProjectCard from "../common/ProjectCard/project-card";
import styles from "./projects.module.css";
import { useSelector } from "react-redux";

const Projects = () => {
  const projects = useSelector((state) => state.projects);

  return (
    <div className={styles.Projects}>
      <div
        onScroll={(e) => {
          e.preventDefault();
        }}
        className={styles.Container}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
