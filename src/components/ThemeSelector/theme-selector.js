import React, { Component } from 'react';

import classes from './theme-selector.module.css';

class ThemeSelector extends Component {
  state = {
    primary: null,
    secondary: null,
    isExpanded: false
  }

  componentDidMount() {
    if (this.props.selected) {
      let selectedThemes = this.props.selected.split('-');
      this.setState({ primary: selectedThemes[0] });
      if (selectedThemes.length > 1) this.setState({ secondary: selectedThemes[1] });
    } else {
      this.setState({ primary: this.props.primary[0].name });
    }

    this.themeIconHeight = 2.3;
    this.dividerMargin = 1.5;
  }

  expandToggle = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  onPrimaryChange = (name) => {
    this.setState({ primary: name }, () => {
      this.props.onSelect(this.getTheme());
      this.expandToggle();
    });
  }
  onSecondaryChange = (name) => {
    this.setState({ secondary: this.state.secondary === name ? null : name }, () => {
      this.props.onSelect(this.getTheme());
    });
  }

  getTheme() {
    return (this.state.secondary ? (this.state.secondary + '-') : '') + this.state.primary;
  }

  render() {
    let themesClasses = [classes.Themes];
    let selectorClasses = [classes.ThemeSelector];
    if (this.state.isExpanded) {
      themesClasses.push(classes.ThemesExpanded);
      selectorClasses.push(classes.ThemeSelectorActive);
    }

    return (
      <div className={selectorClasses.join(' ')}>
        <div className={classes.ThemeButton}>
          <div className={classes.ThemeButtonIcon} onClick={this.expandToggle}></div>
          <div className={classes.ThemeButtonEllipsis}></div>
          <div className={classes.ThemeButtonEllipsis}></div>
          <div className={classes.ThemeButtonEllipsis}></div>
        </div>
        <div className={themesClasses.join(' ')}>
          {this.props.primary.map((theme, index) => {
            let themeIconClasses = [classes.ThemeIcon];
            let themeCheckMarkClasses = [classes.ThemeCheckMark];
            if (this.state.primary === theme.name) {
              themeIconClasses.push(classes.ThemeIconSelected);
              themeCheckMarkClasses.push(classes.ThemeCheckMarkSelected);
            }

            return (
              <div
                className={classes.Theme}
                style={{ top: (this.state.isExpanded ? (this.themeIconHeight * (index + 1)) : 0) + 'rem' }}
                key={theme.name}
              >
                <div
                  className={themeIconClasses.join(' ')}
                  style={{ backgroundColor: theme.displayColor }}
                  onClick={() => this.onPrimaryChange(theme.name)}
                ></div>
                <div className={themeCheckMarkClasses.join(' ')}>&#10003;</div>
              </div>
            );
          })}
          <div
            className={classes.Divider}
            style={{ top: (this.state.isExpanded ? (this.themeIconHeight * this.props.primary.length + this.dividerMargin) : 0) + 'rem' }}
          ></div>
          {this.props.secondary.map((theme, index) => {
            let themeIconClasses = [classes.ThemeIcon];
            let themeCheckMarkClasses = [classes.ThemeCheckMark];
            if (this.state.secondary === theme.name) {
              themeIconClasses.push(classes.ThemeIconSelected);
              themeCheckMarkClasses.push(classes.ThemeCheckMarkSelected);
            }

            return (
              <div
                className={classes.Theme}
                style={{ top: (this.state.isExpanded ? (this.themeIconHeight * (this.props.primary.length + index) + this.dividerMargin * 2) : 0) + 'rem' }}
                key={theme.name}
              >
                <div
                  className={themeIconClasses.join(' ')}
                  style={{ backgroundColor: theme.displayColor }}
                  onClick={() => this.onSecondaryChange(theme.name)}
                ></div>
                <div className={themeCheckMarkClasses.join(' ')}>&#10003;</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};

export default ThemeSelector;
