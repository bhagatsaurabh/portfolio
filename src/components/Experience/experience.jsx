import styles from "./experience.module.css";

const Experience = () => {
  return (
    <div className={styles.Experience}>
      <ul>
        <h2>Technical Migration</h2>
        <li>Migrated a legacy Angular codebase to Vue.</li>
        <h2>Automation</h2>
        <li>
          Developed a set of automation tools to assist mainframe teams in
          migrating databases and automating documentation using Java and React.
        </li>
        <li>
          Created a functional test suite using TestCafe, significantly reducing
          manual regression testing effort.
        </li>
        <h2>Developer Experience</h2>
        <li>
          Built a common IaC library of generic Bicep modules to help other
          teams in cloud migration.
        </li>
        <li>
          Implemented an application monitoring process with automated alerts,
          incidents and a metrics dashboard.
        </li>
        <h2>Cloud Migration</h2>
        <li>Migrated two applications to Azure</li>
        <li>Developed an ETL Data Pipeline using Azure Function Apps.</li>
      </ul>
      <h4>
        Not all of my experiences are technical. Over the years, I have also
        been involved in coordinating User Acceptance Tests, creating screen
        mockups and static UI designs using Figma, participating in
        brainstorming sessions, drafting quarterly plans, and much more.
      </h4>
    </div>
  );
};

export default Experience;
