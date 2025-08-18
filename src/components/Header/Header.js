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

  const links = (
    <>
      <Link href='/' className={styles.link} onClick={closeMenu}>
        Accueil
      </Link>
      <Link href='/#projects' className={styles.link} onClick={closeMenu}>
        Projets
      </Link>
      <Link href='/#contact' className={styles.link} onClick={closeMenu}>
        Contact
      </Link>
    </>
  );

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
      {!isMobile && <nav className={styles.nav}>{links}</nav>}

      <div className={styles.actions}>
        {isMobile && (
          <button
            className={styles.hamburger}
            onClick={toggleMenu}
            aria-label='Menu'
          >
            {isMenuOpen ? '✖' : '☰'}
          </button>
        )}
        {isMobile && isMenuOpen && (
          <nav className={styles.mobileNav}>{links}</nav>
        )}
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