import classNames from "classnames";

import Icon from "../common/Icon/icon";
import classes from "./experience.module.css";
import { useSelector } from "react-redux";
import { parseText } from "@/utils/xp-parser";
import { useEffect, useMemo, useRef, useState } from "react";
import { shuffle } from "@/utils";

const Experience = () => {
  const exps = useSelector((state) => state.experiences);
  const parsedExps = useMemo(() => {
    return shuffle(
      exps.map((exp) => ({ ...exp, points: exp.points.map((point) => parseText(point)) })),
    );
  }, [exps]);
  const expSetEl = useRef([]);
  const containerEl = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStep([...expSetEl.current].indexOf(entry.target));
          }
        });
      },
      {
        root: containerEl.current,
        threshold: 0.6,
        rootMargin: "-22% 0px -22% 0px",
      },
    );
    expSetEl.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={classes.Experience}>
      <div className={classNames([classes.Container, "scrollable", "tracked"])} ref={containerEl}>
        <div>
          {parsedExps.map((exp, idx) => (
            <div key={exp.id} className={classes.Set}>
              <div className={classes.Content} ref={(el) => el && (expSetEl.current[idx] = el)}>
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
        <div className={classes.Stepper} data-step={step} data-steps={exps.length}>
          <div className={classes.Thumb} style={{ "--steps": exps.length, "--step": step }}></div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
