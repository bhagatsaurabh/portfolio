import { useMemo } from "react";
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

  const shuffledSklCtgrs = useMemo(() => {
    if (skillCtgrs.length) {
      return [
        ...shuffle(skillCtgrs.slice(0, skillCtgrs.length - 1)),
        skillCtgrs[skillCtgrs.length - 1],
      ];
    }
  }, [skillCtgrs]);

  return (
    <div className={classNames([classes.Skills, { [classes.animate]: animate }])}>
      <div className={classNames([classes.Wrapper, "scrollable", "tracked"])}>
        {shuffledSklCtgrs.map((skillCtgr) => (
          <div key={skillCtgr.id} className={classes.SkillSet}>
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
        ))}
      </div>
    </div>
  );
};

export default Skills;
