import classNames from "classnames";

import Icon from "../common/Icon/icon";
import classes from "./experience.module.css";
import { useSelector } from "react-redux";
import { parseText } from "@/utils/xp-parser";
import { useMemo } from "react";

const Experience = () => {
  const exps = useSelector((state) => state.experiences);
  const parsedExps = useMemo(() => {
    return exps.map((exp) => ({ ...exp, points: exp.points.map((point) => parseText(point)) }));
  }, [exps]);

  return (
    <div className={classes.Experience}>
      <div className={classNames([classes.Container, "scrollable", "tracked"])}>
        {parsedExps.map((exp) => (
          <div key={exp.id} className={classes.Set}>
            <div className={classes.Content}>
              <h2>{exp.name}</h2>
              <ul className={classes.XPList}>
                {exp.points.map((point, pIdx) => (
                  <li className={classes.XP} key={pIdx}>
                    {point.map((token, i) =>
                      token.type === "tag" ? (
                        <Icon key={i} name={token.value} />
                      ) : (
                        <span key={i}>{token.value}</span>
                      ),
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experience;
