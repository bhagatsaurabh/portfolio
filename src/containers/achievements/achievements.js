import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './achievements.module.css';
import projectIcon from '../../assets/images/rocket.png';

class Achievements extends Component {
  elements = {};

  componentDidMount() {
    this.scrollHandler();
  }

  scrollHandler = () => {
    for (let key in this.elements) {
      let rect = this.elements[key].getBoundingClientRect();
      if ((rect.y + rect.height / 2) < window.innerHeight * .8 && (rect.y + rect.height / 2) > window.innerHeight * .25) {
        this.elements[key].classList.add(classes.YearEnter);
      } else {
        this.elements[key].classList.remove(classes.YearEnter);
      }
    }
  }

  render() {
    return (
      <div className={classes.Achievements}>
        <div className={classes.Timeline}>
          <div className={classes.ConveyerBelt}>
          </div>
          <div onScroll={this.scrollHandler} className={classes.EventStrip}>
            {this.props.achievements.map(achievement =>
              <div className={classes.Year} ref={element => this.elements[achievement.year] = element} key={achievement.year}>
                <div className={classes.Line}></div>
                <div className={classes.YearText}>{achievement.year}</div>
                <div className={classes.Blip}></div>
                <div className={classes.Events}>
                  {achievement.events.map(event =>
                    <div key={event.heading} className={classes.EventCard}>
                      <div className={classes.EventCardHeading}>{event.heading}</div>
                      <div className={classes.Note}>{event.outcome}</div>
                      {event.project ?
                        <div className={classes.Project}>
                          <div className={classes.ProjectHeading}>
                            <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}>
                              <img className={classes.Icon} src={projectIcon} alt="Project Icon" />&nbsp;&nbsp;Project -&nbsp;
                                </div>
                            <div>{event.project.title}</div>
                          </div>
                          <div className={classes.ProjectDesc}>{event.project.description}</div>
                        </div> : null
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    achievements: state.achievements.data
  };
};

export default connect(mapStateToProps)(Achievements);
