import React, { Component } from 'react';

import classes from './search-filter.module.css';
import searchIcon from '../../assets/images/search.png';
import groupIcon from '../../assets/images/group.png';
import filterIcon from '../../assets/images/filter.png';
import filterFillIcon from '../../assets/images/filter-filled.png';
import sortForwardIcon from '../../assets/images/sort-forward.png';
import sortBackwardIcon from '../../assets/images/sort-backward.png';
import Backdrop from '../Common/Backdrop/backdrop';

class SearchAndFilter extends Component {
  state = {
    groupBy: null,
    filterBy: [],
    sortDir: null,
    searchQuery: '',
    openedMenu: null
  }

  componentDidMount() {
    this.setState({ groupBy: this.props.groupby[0], filterBy: ['all'], sortDir: true });
  }
  componentDidUpdate(prevProps) {
    if (this.props.tags !== prevProps.tags) {
      let keys = Object.keys(this.props.tags);
      let activeTags = keys.filter(key => this.props.tags[key]);
      if (activeTags.length === keys.length) this.setState({ filterBy: ['all'] });
      else {
        let newFilterBy = [];
        activeTags.forEach(tag => newFilterBy.push(tag));
        this.setState({ filterBy: newFilterBy });
      }
    }
  }

  groupByChanged = (groupName) => {
    this.setState({ groupBy: groupName, openedMenu: null, filterBy: ['all'] }, () => {
      this.configChanged();
    });
  }
  filterByChanged = (filterName) => {
    if (filterName === 'all') {
      this.setState({ filterBy: ['all'] }, () => {
        this.configChanged();
      });
    } else {
      let filters = [...this.state.filterBy];
      if (filters.includes('all')) filters.splice(filters.indexOf('all'), 1);
      if (!filters.includes(filterName)) filters.push(filterName);
      else {
        filters.splice(filters.indexOf(filterName), 1);
        if (filters.length === 0) filters.push('all');
      }
      this.setState({ filterBy: filters }, () => {
        this.configChanged();
      });
    }
  }
  sortChanged = () => {
    this.setState({ sortDir: !this.state.sortDir }, () => {
      this.configChanged();
    });
  }
  configChanged = () => {
    this.props.onChange({
      groupBy: this.state.groupBy,
      filterBy: this.state.filterBy,
      sortDir: this.state.sortDir,
      searchQuery: this.state.searchQuery
    });
  }

  render() {
    let searchIconClasses = [classes.Icon, classes.SearchIcon];
    let openedMenuClasses = [classes.NavMenu, classes.Open]
    let filterBy = (this.state.groupBy ? this.props.filterby[this.props.groupby.indexOf(this.state.groupBy)] : []);
    let activeNavItemClasses = [classes.NavItem, classes.ActiveNavItem];
    let filterByAllClasses = [classes.SelectionIcon];
    if (this.state.filterBy.includes('all')) filterByAllClasses.push(classes.Selected);

    return (
      <div className={classes.SearchAndFilter}>
        <Backdrop show={this.state.openedMenu} onDismiss={() => this.setState({ openedMenu: null })} />
        <div className={classes.ShadowBox}>
          <img src={searchIcon} className={searchIconClasses.join(' ')} alt="Search" />
        </div>
        <input
          value={this.state.searchQuery}
          onChange={(event) => this.setState({ searchQuery: event.target.value }, () => this.configChanged())}
          className={classes.SearchInput}
          type="text"
          spellCheck="false"
          placeholder="Find"
        />
        <div className={this.state.openedMenu === 'group' ? activeNavItemClasses.join(' ') : classes.NavItem}>
          <img
            src={groupIcon}
            className={this.state.openedMenu === 'group' ? [classes.Icon, classes.GroupActive].join(' ') : classes.Icon}
            alt="Group By"
            onClick={() => this.state.openedMenu === 'group' ? this.setState({ openedMenu: null }) : this.setState({ openedMenu: 'group' })}
          />
          <div className={(this.state.openedMenu === 'group' ? openedMenuClasses.join(' ') : classes.NavMenu)}>
            <div className={classes.MenuTitle}>Group By</div>
            <div className={classes.MenuDivider}></div>
            {this.props.groupby.map(groupName => {
              let selectedClasses = [classes.SelectionIcon];
              if (this.state.groupBy === groupName) selectedClasses.push(classes.Selected);
              return (
                <div key={groupName} className={classes.NavMenuItem} onClick={() => this.groupByChanged(groupName)}>
                  <div className={selectedClasses.join(' ')}></div>
                  {groupName}
                </div>
              );
            })}
          </div>
        </div>
        <div className={this.state.openedMenu === 'filter' ? activeNavItemClasses.join(' ') : classes.NavItem}>
          <img
            style={{
              position: 'absolute', zIndex: -1, pointerEvents: 'none', transition: 'transform .15s linear',
              transform: this.state.openedMenu === 'filter' ? 'scale(0)' : 'scale(1)'
            }}
            src={filterFillIcon}
            className={classes.Icon}
            alt="Filter Fill"
          />
          <img
            src={filterIcon}
            className={classes.Icon}
            alt="Filter"
            onClick={() => this.state.openedMenu === 'filter' ? this.setState({ openedMenu: null }) : this.setState({ openedMenu: 'filter' })}
          />
          <div className={(this.state.openedMenu === 'filter' ? openedMenuClasses.join(' ') : classes.NavMenu)}>
            <div className={classes.MenuTitle}>Filter By</div>
            <div className={classes.MenuDivider}></div>
            <div className={classes.NavMenuItem} onClick={() => this.filterByChanged('all')}>
              <div className={filterByAllClasses.join(' ')}></div>
              All
            </div>
            {filterBy.map(filterName => {
              let selectedClasses = [classes.SelectionIcon];
              if (!this.state.filterBy.includes('all') && this.state.filterBy.includes(filterName)) selectedClasses.push(classes.Selected);
              return (
                <div key={filterName} className={classes.NavMenuItem} onClick={() => this.filterByChanged(filterName)}>
                  <div className={selectedClasses.join(' ')}></div>
                  {filterName}
                </div>
              );
            })}
          </div>
        </div>
        <div className={classes.SortIcons}>
          <img
            style={{
              transition: 'opacity .15s linear',
              opacity: this.state.sortDir ? 1 : 0,
              pointerEvents: this.state.sortDir ? 'all' : 'none'
            }}
            src={sortForwardIcon}
            className={classes.Icon}
            alt="Sort Up"
            onClick={this.sortChanged}
          />
          <img
            style={{
              transition: 'opacity .15s linear',
              pointerEvents: this.state.sortDir ? 'none' : 'all',
              position: 'absolute',
              opacity: this.state.sortDir ? 0 : 1
            }}
            src={sortBackwardIcon}
            className={classes.Icon}
            alt="Sort Down"
            onClick={this.sortChanged}
          />
        </div>
      </div>
    );
  }
}

export default SearchAndFilter;