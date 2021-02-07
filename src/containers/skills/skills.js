import React, { Component } from 'react';
import { connect } from 'react-redux';
import SkillIcon from '../../components/Common/SkillIcon/skill-icon';
import { computeExperience } from '../../utils/utils';

import classes from './skills.module.css';
import Modal from '../../components/Common/Modal/modal';
import helpIcon from '../../assets/images/help.png';
import GlassButton from '../../components/Common/GlassButton/glass-button';
import backIcon from '../../assets/images/left-arrow.png';
import { withRouter } from 'react-router-dom';

class Skills extends Component {
  vowels = ['a', 'e', 'i', 'o', 'u'];

  state = {
    isModalOpened: false,
    selectedSkill: null,
    tipOpened: false
  }

  componentDidMount() {
    computeExperience(this.props.skills, this.props.projects);
  }

  render() {
    let collapsibleTipClasses = [classes.CollapsibleTip];
    let helpIconClasses = [classes.HelpIcon];
    if (this.state.tipOpened) {
      collapsibleTipClasses.push(classes.CollapsibleTipOpen);
      helpIconClasses.push(classes.Flip);
    }

    return (
      <div className={classes.Skills}>
        <div className={classes.Roles}>
          {this.props.skills.map((role, index) =>
            <div key={role.name} className={classes.Role} data-delay={index + 1}>
              <div className={classes.RoleHeading}>
                <div className={classes.PrePhrase}>I'm {this.vowels.includes(role.name.charAt(0).toLowerCase()) ? 'an' : 'a'}</div>
                <div className={classes.RoleText}>{role.name}</div>
              </div>
              <div className={classes.Line}></div>
              <div className={classes.SkillsBox}>
                {role.skills.map(skill =>
                  <div key={skill.tag} className={classes.SkillItem} onClick={() => this.setState({ selectedSkill: skill, isModalOpened: true })}>
                    <SkillIcon name={skill.tag.replaceAll('/', '-').toLowerCase()} />
                    {skill.skillTitle}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Modal navigationOccured={this.props.location.pathname} show={this.state.selectedSkill && this.state.isModalOpened} onDismiss={() => this.setState({ isModalOpened: false })}>
          {this.state.selectedSkill ?
            <div className={classes.SkillDetails}>
              <div className={classes.SkillCard}>
                <SkillIcon name={this.state.selectedSkill.tag.replaceAll('/', '-').toLowerCase()} />
                {this.state.selectedSkill.skillTitle}
              </div>
              <div className={classes.Experience}>
                Experience
                <div className={helpIconClasses.join(' ')} onClick={() => this.setState({ tipOpened: !this.state.tipOpened })}>
                  <img alt="Help" src={helpIcon} style={{ margin: '0 .3rem' }} />
                </div>:&nbsp;
                {this.state.selectedSkill.years} years
              </div>
              <div className={collapsibleTipClasses.join(' ')}>Experience calculated using actual duration spent on each project</div>
              <div className={classes.NoOfProjects}>Projects: {this.state.selectedSkill.noOfProjects}</div>
              <GlassButton customStyle={{ marginTop: '1rem', alignSelf: 'center' }} icon={backIcon} text="Back" iconPosition='left' clicked={() => this.setState({ isModalOpened: false })} />
            </div> : null
          }
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    skills: state.skills.data,
    projects: state.projectsPro.projects.concat(state.projectsInd.projects)
  }
};

export default connect(mapStateToProps)(withRouter(Skills));