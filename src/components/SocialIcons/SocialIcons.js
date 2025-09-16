'use client';
import Link from 'next/link';
import styles from './SocialIcons.module.css';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Tooltip from '../Tooltip/Tooltip';

import socialLinks from '@/data/socialLinks';

export default function SocialIcons({ width = 32, height = 32 }) {
  return (
    <div className={styles.iconsContainer}>
      {socialLinks
        .filter((item) => item.active)
        .map(({ title, icon, href, isCustom }) => (
          <Tooltip key={title} message={title}>
            <Link
              href={href}
              target="_blank"
              rel="nofollow noreferrer noopener"
              className={`${styles.iconLink} ${styles[title]}`}
            >
              {isCustom ? (
                <Image
                  src={icon}
                  alt={title}
                  width={width}
                  height={height}
                />
              ) : (
                <Icon
                  icon={icon}
                  width={width}
                  height={height}
                  className={styles.skillIcon}
                />
              )}
            </Link>
          </Tooltip>
        ))}
    </div>
  );
}
