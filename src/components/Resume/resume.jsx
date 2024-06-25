import FeedButton from "../common/FeedButton/feed-button";
import Icon from "../common/Icon/icon";
import SkillTag from "../common/SkillTag/skill-tag";
import styles from "./resume.module.css";

const Resume = () => {
  return (
    <div className={styles.Resume}>
      <a
        className={styles.Download}
        href="/data/Resume_SaurabhBhagat.pdf"
        download
      >
        <FeedButton icon="download">Download PDF</FeedButton>
      </a>
      <div className={styles.Container}>
        <header>
          <section className={styles.Left}>
            <h1>Saurabh Bhagat</h1>
            <a
              className={styles.Email}
              href="mailto:saurabhbhagat98die@gmail.com"
            >
              <Icon name="email" />
              <span>saurabhbhagat98die@gmail.com</span>
            </a>
            <a href="https://saurabhagat.me" target="_blank">
              <Icon name="web" />
              <span>saurabhagat.me</span>
            </a>
            <a href="tel:+31620374487">
              <Icon name="phone" />
              <span>+31 620374487</span>
            </a>
          </section>
          <section className={styles.Right}>
            <a href="https://linkedin.com/in/saurabh-bhagat/" target="_blank">
              <Icon name="linkedin" />
              <span>/in/saurabh-bhagat</span>
            </a>
            <a href="https://github.com/bhagatsaurabh" target="_blank">
              <Icon name="github" />
              <span>/bhagatsaurabh</span>
            </a>
          </section>
        </header>
        <section className={styles.Summary}>
          <p>
            I am Saurabh, a Frontend Heavy - Fullstack Software Engineer and
            UI/UX Developer.
          </p>
          <p>
            Over the past 5+ years of professional work experience, my journey
            has taken me through various business domains, including Financial
            Risk Management, Regulatory Compliance, and Automation.
          </p>
          <p>
            I have enjoyed creating both frontend and backend systems, enhancing
            productivity with innovative tools, and streamlining workflows with
            DevOps.
          </p>
        </section>
        <section className={styles.Formal}>
          <section className={styles.EdSkills}>
            <section className={styles.Education}>
              <h5>Education</h5>
              <div className={styles.EdContainer}>
                <div>
                  <Icon name="education" />
                </div>
                <div>
                  <span>Bachelor of Engineering in Computer Science</span>
                  <span>Mumbai University</span>
                  <span>Year 2019</span>
                </div>
              </div>
            </section>
            <section className={styles.Skills}>
              <h5>Skills</h5>
              <div className={styles.SkillList}>
                <SkillTag icon="azure" name="Azure" />
                <SkillTag icon="firebase" name="Firebase" />
                <SkillTag icon="bicep" name="Bicep" />
                <SkillTag icon="react" name="React" />
                <SkillTag icon="vue" name="Vue" />
                <SkillTag icon="nodejs" name="NodeJS" />
                <SkillTag icon="typescript" name="TypeScript" />
                <SkillTag icon="npm" name="NPM" />
                <SkillTag icon="javascript" name="JavaScript" />
                <SkillTag icon="figma" name="Figma" />
              </div>
            </section>
            <section className={styles.Achievements}>
              <h5>Achievements</h5>
              <div className={styles.AchievementsList}>
                <div className={styles.AchievementSect}>
                  <div className={styles.Achievement}>
                    <span>2016</span>
                    <div>
                      <span>CodeVita Contest</span>
                      <span>Top 1%</span>
                    </div>
                  </div>
                  <div
                    className={styles.Achievement}
                    style={{ marginTop: "4rem" }}
                  >
                    <span>2017</span>
                    <div>
                      <span>Texas Instruments IICDC</span>
                      <span>Participation</span>
                    </div>
                  </div>
                </div>
                <div
                  className={styles.AchievementSect}
                  style={{ paddingTop: "4rem" }}
                >
                  <div className={styles.Achievement}>
                    <span>2018</span>
                    <div>
                      <span>Rajasthan Hackathon</span>
                      <span>Merit</span>
                    </div>
                  </div>
                  <div
                    className={styles.Achievement}
                    style={{ marginTop: "4rem" }}
                  >
                    <span>2019</span>
                    <div>
                      <span>Smart India Hackathon</span>
                      <span className={styles.Extra}>Amadeus IT Group</span>
                      <span>Finalist</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
          <div className={styles.Divider}></div>
          <section className={styles.WorkExp}>
            <h5>Work Experience</h5>
            <div className={styles.ExpContainer}>
              <div className={styles.Org}>
                <Icon name="tcs" size={2} />
                <Icon name="abnamro" size={2} />
              </div>
              <div className={styles.ExpList}>
                <div className={styles.OrgDetails}>
                  <span>
                    Frontend Engineer, Tata Consultancy Services with ABN AMRO
                    Bank
                  </span>
                  <span>June 2019 - Present</span>
                </div>
                <div>
                  <h3>Modernization</h3>
                  <ul>
                    <li>
                      Migrated a legacy Angular codebase to Vue with complete
                      functional test suite and over 95% code coverage.
                    </li>
                  </ul>
                  <h3>Developer Experience</h3>
                  <ul>
                    <li>
                      Built a common IaC library of generic Bicep modules to
                      help others in infrastructure setup as part of cloud
                      migration.
                    </li>
                    <li>
                      Implemented an application monitoring process with
                      automated alerts, incidents and a metrics dashboard.
                    </li>
                  </ul>
                  <h3>Automation</h3>
                  <ul>
                    <li>
                      Developed automation tools to assist in mainframe database
                      migration and COBOL documentation.
                    </li>
                    <li>
                      Created a functional test suite using TestCafe,
                      significantly reducing manual regression testing effort.
                    </li>
                  </ul>
                  <h3>Cloud Migration</h3>
                  <ul>
                    <li>
                      Migrated two applications from on-premises to Azure.
                    </li>
                    <li>
                      Developed an ETL Data Pipeline using Serverless Function
                      Apps.
                    </li>
                  </ul>
                  <h3>UI/UX Development</h3>
                  <ul>
                    <li>
                      Created both simple and complex screen mockups and static
                      designs maintaining continuous feedback.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </section>
        <section className={styles.Projects}>
          <h5>Projects</h5>
          <div className={styles.ProjectsContainer}>
            <div className={styles.Project}>
              <h3>FlowConnect</h3>
              <div>TypeScript, Vue, NPM</div>
              <p>
                A highly customizable library for creating node-based editors,
                graphs, and diagrams.
              </p>
            </div>
            <div className={styles.Project}>
              <h3>OpenChat</h3>
              <div>Vue, Firebase, NodeJS</div>
              <p>End-to-end encrypted messaging solution for the web.</p>
            </div>
            <div className={styles.Project}>
              <h3>Percept</h3>
              <div>React, TypeScript, Web Canvas, NPM</div>
              <p>An HTML5 Canvas rendering engine.</p>
            </div>
            <div className={styles.Project}>
              <h3>vAP</h3>
              <div>React, Web Audio</div>
              <p>
                An easy-to-use webapp to create visual programs for audio
                synthesis, processing, and visualization.
              </p>
            </div>
            <div className={styles.Project}>
              <h3>TankMe</h3>
              <div>TypeScript, Vue, Firebase, Networking, NodeJS</div>
              <p>Multiplayer online cross-platform PvP tank battle!</p>
            </div>
            <div className={styles.Project}>
              <h3>HiDE</h3>
              <div>Angular, TypeScript, NodeJS, Web RTC</div>
              <p>
                A cloud-based platform for project development in teams with
                real-time collaborative tools.
              </p>
            </div>
          </div>
        </section>
        <footer>
          For the full list of my work, check out my portfolio{" "}
          <a
            className={styles.Simple}
            href="https://saurabhagat.me"
            target="_blank"
          >
            saurabhagat.me
          </a>{" "}
          and my GitHub{" "}
          <a
            className={styles.Simple}
            href="https://github.com/bhagatsaurabh"
            target="_blank"
          >
            github.com/bhagatsaurabh
          </a>
          .
        </footer>
      </div>
    </div>
  );
};

export default Resume;
