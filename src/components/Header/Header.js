'use client';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import useMediaQuery from '../../hook/useMediaQuery';
import Image from 'next/image';
import SocialIcons from '../SocialIcons/SocialIcons';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div>
        <Link href={'/'}>
          <Image
            src={
              isDark ? '/img/logos/logoDark.png' : '/img/logos/logoLight.png'
            }
            alt='Logo'
            width={120} // adapte à la taille de ton image
            height={40}
            className={styles.logo}
          />
        </Link>
      </div>
      <div className={styles.actions}>
        <SocialIcons width={20} height={20} />
        <button
          aria-label='Toggle Dark Mode'
          onClick={toggleTheme}
          className={styles.toggleButton}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}