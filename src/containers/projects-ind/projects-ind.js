import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import classes from './projects-ind.module.css';
import CollapsibleSection from '../../components/CollapsibleSection/collapsible-section';
import FlipButton from '../../components/Common/FlipButton/flip-button';
import FloatingProject from '../../components/FloatingProject/floating-project';
import ProjectGroup from '../../components/ProjectGroup/project-group';
import SearchAndFilter from '../../components/SearchAndFilter/search-filter';
import SearchNotFound from '../../components/SearchNotFound/search-notfound';
import Tags from '../../components/Tags/tags';
import * as ActionTypes from '../../store/actions/action-types';
import controlsIcon from '../../assets/images/controls.png';
import closeIcon from '../../assets/images/close.png';
import { applyTagToProjects, filterProjectsBySearch, sortTags } from '../../utils/utils';

class ProjectsInd extends Component {
  state = {
    tags: {},
    groupBy: null,
    sortDir: true,
    searchQuery: '',
    controlsExpanded: false
  }

  componentDidMount() {
    this.setState({ tags: this.getAllTagsFromGroup('date'), groupBy: 'date' });
    this.props.closeProject();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.projectMeta !== this.props.projectMeta) {
      this.setState({ tags: this.getAllTagsFromGroup('date') });
    }
  }
  filterChange = (config) => {
    let tags;
    if (config.filterBy.includes('all')) {
      tags = this.getAllTagsFromGroup(config.groupBy);
    } else {
      tags = { ...this.state.tags };
      Object.keys(tags).forEach(tag => {
        tags[tag] = config.filterBy.includes(tag);
      });
    }
    this.setState({ tags, groupBy: config.groupBy, sortDir: config.sortDir, searchQuery: config.searchQuery });
  }
  getAllTagsFromGroup(group) {
    let tags = {};
    this.props.projectMeta[group + 'Tags'].forEach(tag => tags[tag] = true);
    return tags;
  }
  tagClickHandler = (tag) => {
    let activeTags = Object.keys(this.state.tags).filter(key => this.state.tags[key]);
    if (activeTags.length !== 1 || activeTags[0] !== tag) {
      let newTags = { ...this.state.tags };
      newTags[tag] = !newTags[tag];
      this.setState({ tags: newTags });
    }
  }

  render() {
    let filteredTags = Object.keys(this.state.tags).filter(tag => this.state.tags[tag]);
    let sortedTags = filteredTags.sort((a, b) => sortTags(a, b, this.state.sortDir, this.state.groupBy));
    let groupedSortedProjects = sortedTags.map(tag => {
      return { tag, projects: applyTagToProjects(tag, this.state.groupBy, this.props.projects) }
    });
    if (this.state.searchQuery !== '') {
      groupedSortedProjects = filterProjectsBySearch(this.state.searchQuery, groupedSortedProjects);
    }

    let transitionGroupClasses = [classes.TransitionGroup];
    if (groupedSortedProjects.length === 0) transitionGroupClasses.push(classes.ClearBoxShadow);

    let controlItemsClasses = [classes.ControlItems];
    if (!this.state.controlsExpanded) controlItemsClasses.push(classes.ControlItemsCollapsed);
    else transitionGroupClasses.push(classes.TransitionGroupSpacing);

    return (
      <div className={classes.ProjectsInd}>
        <div className={classes.Controls}>
          <div className={classes.ControlsHeader}>
            <FlipButton
              frontIcon={controlsIcon} backIcon={closeIcon}
              flipped={this.state.controlsExpanded}
              onFlip={() => this.setState({ controlsExpanded: !this.state.controlsExpanded })}
            />
          </div>
          <div ref={(element) => this.controlItems = element} className={controlItemsClasses.join(' ')}>
            <div style={{ marginTop: '.5rem' }} className={classes.Float}>
              <SearchAndFilter
                groupby={['date', 'name', 'technology', 'type']}
                filterby={[this.props.projectMeta.dateTags, this.props.projectMeta.nameTags, this.props.projectMeta.technologyTags, this.props.projectMeta.typeTags]}
                tags={this.state.tags}
                onChange={this.filterChange}
              />
            </div>
            <div className={classes.Float} style={{ boxShadow: 'none', marginTop: '.6rem' }}>
              <Tags tags={this.state.tags} tagClicked={this.tagClickHandler} />
            </div>
          </div>
        </div>
        <SearchNotFound show={groupedSortedProjects.length === 0 && this.state.groupBy !== null} />
        <TransitionGroup className={transitionGroupClasses.join(' ')}>
          {groupedSortedProjects.map(section => {
            return (
              <CSSTransition
                key={section.tag}
                timeout={200}
                mountOnEnter unmountOnExit
                classNames={{
                  enter: classes.CollapsibleEnter,
                  enterActive: classes.CollapsibleEnterActive,
                  exit: classes.CollapsibleExit,
                  exitActive: classes.CollapsibleExitActive
                }}
              >
                <CollapsibleSection heading={section.tag} size={section.projects.length}>
                  <ProjectGroup projects={section.projects} />
                </CollapsibleSection>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
        <FloatingProject />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    projectMeta: state.projectsInd.projectMeta,
    projects: state.projectsInd.projects
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closeProject: () => dispatch({ type: ActionTypes.SET_CLOSE_PROJECT })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsInd);