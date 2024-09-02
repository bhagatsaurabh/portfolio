import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import styles from "./navigator.module.css";
import { clamp } from "@/utils";
import Icon from "../Icon/icon";
import { routes } from "@/router";

const Navigator = ({ checkpoints, index, onNavigate }) => {
  const sectionTitleListEl = useRef(null);
  const switchEl = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let handle = -1;
    if (isOpen) {
      handle = setTimeout(() => {
        sectionTitleListEl.current?.classList.remove(styles.open);
        switchEl.current?.classList.remove(styles.open);
        setIsOpen(false);
      }, 4000);
    }
    return () => clearTimeout(handle);
  }, [isOpen]);

  const handleClick = (newIdx, direction) => {
    if (direction) {
      const newIdx = clamp(index + direction, 0, routes.length - 1);
      if (newIdx === index) return;
      onNavigate(newIdx);
    } else {
      newIdx = clamp(newIdx, 0, routes.length - 1);
      if (newIdx === index) return;
      onNavigate(newIdx);
    }
  };

  return (
    <>
      <nav className={styles.Navigator}>
        <button
          ref={switchEl}
          className={[styles.Switch, isOpen ? styles.open : ""].join(" ")}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Icon name="menu" size={1.5} />
        </button>
        <div
          ref={sectionTitleListEl}
          className={[styles.SectionTitleList, isOpen ? styles.open : ""].join(
            " "
          )}
        >
          {checkpoints.map((checkpoint, idx) => (
            <span
              tabIndex={0}
              onClick={() => handleClick(idx)}
              key={checkpoint.name}
              className={[
                styles.SectionTitle,
                idx === index ? styles.titleactive : "",
              ].join(" ")}
            >
              {checkpoint.title}
            </span>
          ))}
        </div>
      </nav>
      <div className={styles.Titles}>
        {checkpoints.map((checkpoint) => (
          <h1
            key={checkpoint.name}
            className={[
              styles.Title,
              checkpoint.path === location.pathname ? styles.active : "",
            ].join(" ")}
          >
            {checkpoint.path === "/" ? "" : checkpoint.title}
          </h1>
        ))}
      </div>
      <div className={styles.NavigationButtons}>
        <button
          onClick={() => handleClick(0, -1)}
          className={[styles.Left, index === 0 ? styles.hidden : ""].join(" ")}
        >
          <Icon name="leftArrow" />
        </button>
        <button
          onClick={() => handleClick(0, 1)}
          className={[
            styles.Right,
            index === routes.length - 1 ? styles.hidden : "",
          ].join(" ")}
        >
          <Icon name="rightArrow" />
        </button>
      </div>
    </>
  );
};

Navigator.propTypes = {
  index: PropTypes.number,
  checkpoints: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
  onNavigate: PropTypes.func,
};

export default Navigator;
