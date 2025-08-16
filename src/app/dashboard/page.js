'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthProvider';
import styles from './Dashboard.module.css';
import Loader from '@/components/Loader/Loader';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <p>Non connecté</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.welcome}>Bienvenue, {user.email}</p>

      <button onClick={signOut} className={styles.signOutBtn}>
        Déconnexion
      </button>

      <hr className={styles.divider} />

      <nav className={styles.navLinks}>
        <Link href='/dashboard/projects' className={styles.navLink}>
          Projets
        </Link>
        <Link href='/dashboard/skills' className={styles.navLink}>
          Skills
        </Link>
      </nav>
    </div>
  );
}
