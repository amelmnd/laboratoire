'use client';

import styles from './SkillSelector.module.css';

export default function SkillSelector({ skills = [] }) {
  return (
    <div className={styles.skillDisplay}>
      {skills.map((skill) => (
        <span key={skill.id} className={styles.skillTag}>
          {skill.name}
        </span>
      ))}
    </div>
  );
}
