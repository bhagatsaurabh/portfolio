import React, { Component } from 'react';

import classes from './skill-icon.module.css';

class SkillIcon extends Component {
  state = {
    loading: true
  }

  componentDidUpdate(prevProps) {
    if (prevProps.name !== this.props.name) this.importIcon();
  }

  componentDidMount() {
    this.importIcon();
  }

  importIcon = async () => {
    try {
      const { default: namedImport } = await import('../../../assets/images/' + this.props.name + '.png');
      this.icon = namedImport;
    } catch (err) {
      throw err;
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      this.state.loading ? null : <img className={classes.SkillIcon} src={this.icon} alt={this.props.name} />
    )
  }
}

export default SkillIcon;