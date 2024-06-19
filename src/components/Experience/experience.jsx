import styles from "./experience.module.css";

const Experience = () => {
  return (
    <div className={styles.Experience}>
      <h4>
        Over the past 5 years of my work experience, I have been involved in a
        few different projects ranging from Risk Management, Automation,
        Regulatory Compliance, to DevOps.
      </h4>
      <h4>
        Across various domains, developing front-end & back-end systems,
        productivity tools, Infrastructure-as-Code and pipelines.
      </h4>
      <h5>Here are few of my Experiences:</h5>
      <ul>
        <li>Migrated a legacy Angular codebase to Vue.</li>
        <li>
          Developed a set of automation tools to assist mainframe teams in
          migrating databases and automating documentation using Java and React.
        </li>
        <li>
          Created a functional test suite using TestCafe, significantly reducing
          manual regression testing effort.
        </li>
        <li>
          Built a common IaC library of generic Bicep modules to help other
          teams in cloud migration.
        </li>
        <li>
          Implemented an application monitoring process with automated alerts,
          incidents and a metrics dashboard.
        </li>
        <li>Developed an ETL Data Pipeline using Azure Function Apps.</li>
        <li>Migrated two applications to Azure</li>
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
