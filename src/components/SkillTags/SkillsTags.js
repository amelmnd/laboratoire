// components/SkillTags.jsx
import styles from './SkillTags.module.css';

export default function SkillTags({ skills = [] }) {
  if (skills.length === 0) return null;

  return (
    <div className={styles.skills}>
      {skills.map((skill, index) => (
        <div key={index} >
          {skill.link ? (
            <img
              src={skill.link}
              alt={skill.name}
              className={styles.icon}
            />
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
