'use client';

import { useAuth } from '../../context/AuthProvider';
import styles from './Login.module.css';

export default function Login() {
  const { signInWithOAuth } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Connexion</h1>
      <button
        className={styles.button}
        onClick={() => signInWithOAuth('github')}
      >
        Se connecter avec GitHub
      </button>
    </div>
  );
}
