import { useEffect, useRef, useState } from "react";

import Icon from "../common/Icon/icon";
import styles from "./experience.module.css";
import FeedButton from "../common/FeedButton/feed-button";

const Experience = () => {
  const maxHeights = useRef([]);
  const refs = useRef([]);
  const cRefs = useRef([]);
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    refs.current.forEach((el, idx) => {
      maxHeights.current[idx] = el.getBoundingClientRect().height;
      cRefs.current[idx]?.style.setProperty(
        "--max-height",
        `${maxHeights.current[idx]}px`
      );
    });

    return () => {};
  }, []);

  return (
    <div className={styles.Experience}>
      <div className={styles.Container}>
        <div
          onClick={() => setExpand(true)}
          ref={(el) => el && (cRefs.current[0] = el)}
          className={[styles.Set, expand ? styles.Expand : ""].join(" ")}
        >
          <div
            ref={(el) => el && (refs.current[0] = el)}
            className={styles.Content}
          >
            <h2>Modernization</h2>
            <span>
              Led the migration of a legacy codebase to <Icon name="vue" /> Vue,
              complete with a functional test suite and over 95% code coverage.
            </span>
            <span>
              Fixed tree-shaking issues, introduced code-splitting, and moved to
              gzip compression, resulting in bundle size reduction from 1374 kb
              to just 550 kb and ~20% improvement in initial load time.
            </span>
            <span>
              Upgraded build tooling to Vite, resulting in faster{" "}
              <Icon name="speed" /> build times.
            </span>
          </div>
        </div>
        <div
          onClick={() => setExpand(true)}
          ref={(el) => el && (cRefs.current[2] = el)}
          className={[styles.Set, expand ? styles.Expand : ""].join(" ")}
        >
          <div
            ref={(el) => el && (refs.current[2] = el)}
            className={styles.Content}
          >
            <h2>Automation</h2>
            <span>
              Created a functional test suite using <Icon name="testcafe" />{" "}
              TestCafe with CICD integration, significantly reducing regression
              testing effort.
            </span>
          </div>
        </div>
        <div
          onClick={() => setExpand(true)}
          ref={(el) => el && (cRefs.current[3] = el)}
          className={[styles.Set, expand ? styles.Expand : ""].join(" ")}
        >
          <div
            ref={(el) => el && (refs.current[3] = el)}
            className={styles.Content}
          >
            <h2>Developer Experience</h2>
            <span>
              Contributed improvements and fixes to Lit components of the common
              design system library <Icon name="library" />.
            </span>
            <span>
              Developed automation tools to assist in database migration using{" "}
              <Icon name="react" />
              React and <Icon name="java" /> Java.
            </span>
          </div>
        </div>
        <div
          onClick={() => setExpand(true)}
          ref={(el) => el && (cRefs.current[4] = el)}
          className={[styles.Set, expand ? styles.Expand : ""].join(" ")}
        >
          <div
            ref={(el) => el && (refs.current[4] = el)}
            className={styles.Content}
          >
            <h2>UI/UX Development</h2>
            <span>
              Created both simple and complex screen mock-ups and static designs
              with <Icon name="figma" /> Figma while maintaining continuous
              feedback.
            </span>
          </div>
        </div>
        <div
          onClick={() => setExpand(true)}
          ref={(el) => el && (cRefs.current[5] = el)}
          className={[styles.Set, expand ? styles.Expand : ""].join(" ")}
        >
          <div
            ref={(el) => el && (refs.current[5] = el)}
            className={styles.Content}
          >
            <h2>DevOps</h2>
            <span>
              Built a common IaC library of generic <Icon name="bicep" /> Bicep
              modules with auto-publishing pipelines.
            </span>
            <span>
              Implemented an <Icon name="monitor" /> application monitoring
              process with alerts, incidents and a metrics dashboard.
            </span>
            <span>
              Built pipelines for automated network provisioning on{" "}
              <Icon name="azure" /> Azure.
            </span>
            <span>
              Reduced infrastructure costs by 50% by evaluating application load
              trends and SKUs.
            </span>
          </div>
        </div>
        <div
          onClick={() => setExpand(true)}
          ref={(el) => el && (cRefs.current[6] = el)}
          className={[styles.Set, expand ? styles.Expand : ""].join(" ")}
        >
          <div
            ref={(el) => el && (refs.current[6] = el)}
            className={styles.Content}
          >
            <h2>Cloud Migration</h2>
            <span>
              Migrated two applications from on-premises to{" "}
              <Icon name="azure" /> Azure.
            </span>
            <span>
              Developed an ETL Data Pipeline using <Icon name="nodejs" /> NodeJS
              and Serverless <Icon name="function" /> Function Apps.
            </span>
          </div>
        </div>

        <FeedButton onClick={() => setExpand(!expand)} icon="info" size={0.8}>
          {!expand ? "Know More" : "Hide"}
        </FeedButton>
      </div>
    </div>
  );
};

export default Experience;
