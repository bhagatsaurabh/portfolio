import SkillTag from "../common/SkillTag/skill-tag";
import styles from "./skills.module.css";

const Skills = () => {
  return (
    <div className={styles.Skills}>
      <div className={styles.Wrapper}>
        <h1>
          <span>I</span> am a
        </h1>
        <div className={styles.SkillSet}>
          <div className={styles.Upper}>
            <div className={styles.UpperContent}>
              <h3>Frontend Engineer</h3>
            </div>
          </div>
          <div className={styles.Divider}></div>
          <div className={styles.Lower}>
            <div className={styles.LowerContent}>
              <SkillTag icon="react" name="React" size={1.2} />
              <SkillTag icon="vue" name="Vue" size={1.2} />
              <SkillTag icon="nodejs" name="NodeJS" size={1.2} />
              <SkillTag icon="typescript" name="TypeScript" size={1.2} />
              <SkillTag icon="npm" name="NPM" size={1.2} />
              <SkillTag icon="javascript" name="JavaScript" size={1.2} />
            </div>
          </div>
        </div>
        <div className={styles.SkillSet}>
          <div className={styles.Upper}>
            <div className={styles.UpperContent}>
              <h3>DevOps Practitioner</h3>
            </div>
          </div>
          <div className={styles.Divider}></div>
          <div className={styles.Lower}>
            <div className={styles.LowerContent}>
              <SkillTag icon="azure" name="Azure" size={1.2} />
              <SkillTag icon="firebase" name="Firebase" size={1.2} />
              <SkillTag icon="bicep" name="Bicep" size={1.2} />
            </div>
          </div>
        </div>
        <div className={styles.SkillSet}>
          <div className={styles.Upper}>
            <div className={styles.UpperContent}>
              <h3>Creative Developer</h3>
            </div>
          </div>
          <div className={styles.Divider}></div>
          <div className={styles.Lower}>
            <div className={styles.LowerContent}>
              <SkillTag icon="figma" name="Figma" size={1.2} />
              <SkillTag icon="blender" name="Blender" size={1.2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
