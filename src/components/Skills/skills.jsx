import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";

import SkillTag from "../common/SkillTag/skill-tag";
import classes from "./skills.module.css";
import { shuffle } from "@/utils";

const Skills = () => {
  const skillCtgrs = useSelector((state) => state.skills);
  const location = useLocation();
  const animate = location.pathname === "/skills";
  const sklSetEls = useRef([]);
  const wrapperEl = useRef(null);
  const shuffledSklCtgrs = useMemo(() => {
    if (skillCtgrs.length) {
      return [
        ...shuffle(skillCtgrs.slice(0, skillCtgrs.length - 1)),
        skillCtgrs[skillCtgrs.length - 1],
      ];
    }
  }, [skillCtgrs]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStep([...sklSetEls.current].indexOf(entry.target));
          }
        });
      },
      {
        root: wrapperEl.current,
        threshold: 0.6,
        rootMargin: "-30% 0px -30% 0px",
      },
    );
    sklSetEls.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={classNames([classes.Skills, { [classes.animate]: animate }])}>
      <div className={classNames([classes.Wrapper, "scrollable", "tracked"])} ref={wrapperEl}>
        <div>
          {shuffledSklCtgrs.map((skillCtgr, idx) => (
            <div key={skillCtgr.id} className={classes.SkillSet}>
              <div ref={(el) => el && (sklSetEls.current[idx] = el)}>
                <div className={classes.Upper}>
                  <div className={classes.UpperContent}>
                    <h3>{skillCtgr.name}</h3>
                  </div>
                </div>
                <div className={classes.Lower}>
                  <div className={classes.LowerContent}>
                    {skillCtgr.skills.map((skill) => (
                      <SkillTag key={skill} icon={skill.toLowerCase()} name={skill} size={1.1} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={classes.Stepper} data-step={step} data-steps={skillCtgrs.length}>
          <div
            className={classes.Thumb}
            style={{ "--steps": skillCtgrs.length, "--step": step }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
