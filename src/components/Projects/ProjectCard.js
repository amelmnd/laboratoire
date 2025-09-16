'use client';

import Link from 'next/link';
import styles from './ProjectCard.module.css';
import SkillTags from '../SkillTags/SkillsTags';

export default function ProjectCard({
  title,
  description,
  imgSrc,
  skills = [], 
  repourl,
  demourl,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {imgSrc ? (
          <img src={imgSrc} alt={title} className={styles.image} />
        ) : (
          <img
            src="/img/imageNotFound.png"
            alt="image non trouvé"
            className={styles.image}
          />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.boxTitle}>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <div className={styles.boxDescrit}>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.boxSkills}>
          <SkillTags skills={skills} />
        </div>

        {(repourl || demourl) && (
          <div className={styles.boxLink}>
            {repourl && (
              <Link
                href={repourl}
                target="_blank"
                rel="noreferrer"
                className={styles.button}
              >
                Code
              </Link>
            )}
            {demourl && (
              <Link
                href={demourl}
                target="_blank"
                rel="noreferrer"
                className={styles.button}
              >
                Demo
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
