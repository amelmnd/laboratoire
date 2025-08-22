import styles from './SkillTags.module.css';
import Tooltip from '../Tooltip/Tooltip';

export default function SkillTags({ skills = [] }) {
  if (skills.length === 0) return null;

  return (
    <div className={styles.skills}>
      {skills.map((skill, index) => (
        <div key={index} titre={skill.name}>
          {skill.link ? (
            <Tooltip key={skill.name} message={skill.name}>
              <img
                src={skill.link}
                alt={skill.name}
                className={styles.icon}
              />
            </Tooltip>
          ) : (
            <div className={styles.skill}>
              <span >{skill.name}</span>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}
