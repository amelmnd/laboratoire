// components/SocialIcons.js
'use client'

import Link from 'next/link'
import styles from './SocialIcons.module.css'
import { Icon } from '@iconify/react'
import CodingameIcon from '../../assets/codingameIcon.png';
import Image from 'next/image';
import Tooltip from '../Tooltip/Tooltip';

export default function SocialIcons({ width = 32, height = 32 }) {
  const socialLinks = [
    {
      title: 'Portfolio',
      icon: 'streamline-ultimate:browser-com',
      href: 'https://amelmennad.netlify.app/',
      isCustom: false,
      active: true,
    },
    {
      title: 'Email',
      icon: 'wpf:message',
      href: 'mailto:amelmnd.dev@gmail.com',
      isCustom: false,
      active: true,
    },
    {
      title: 'LinkedIn',
      icon: 'simple-icons:linkedin',
      href: 'https://www.linkedin.com/in/amel-mennad/',
      isCustom: false,
      active: true,
    },
    {
      title: 'GitHub',
      icon: 'simple-icons:github',
      href: 'https://github.com/amelmnd',
      active: true,
    },
    {
      title: 'CodePen',
      icon: 'simple-icons:codepen',
      href: 'https://codepen.io/amel_dev',
      isCustom: false,
      active: false,
    },
    {
      title: 'Freecodecamp',
      icon: 'cib:freecodecamp',
      href: 'https://www.freecodecamp.org/amel_dev',
      isCustom: false,
      active: false,
    },
    {
      title: 'Codingame',
      icon: CodingameIcon,
      href: 'https://www.codingame.com/profile/3eb108f7afc5d60d15c961e2bef3ed4c7207735',
      isCustom: true,
      active: false,
    },
    {
      title: 'Hackerrank',
      icon: 'cib:hackerrank',
      href: 'https://www.hackerrank.com/profile/amel_dev',
      isCustom: false,
      active: false,
    },
  ];

  return (
    <div className={styles.iconsContainer}>
      {socialLinks
        .filter((item) => item.active)
        .map(({ title, icon, href, isCustom }) => (
          <Tooltip key={title} message={title}>
            <Link
              href={href}
              target='_blank'
              rel='nofollow noreferrer noopener'
              className={`${styles.iconLink} ${styles[title]}`}
            >
              {isCustom ? (
                <Image
                  src={CodingameIcon}
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
