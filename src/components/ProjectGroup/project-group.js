import React, { Component } from 'react';

import classes from './project-group.module.css';
import Project from './Project/project';

class ProjectGroup extends Component {
  render() {
    return (
      <div className={classes.ProjectGroup} >
        {this.props.projects.map(project =>
          <Project key={project.name} project={project} />
        )}
      </div>
    );
  }
};

export default ProjectGroup;