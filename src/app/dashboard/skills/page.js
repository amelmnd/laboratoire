'use client';

import { useRouter } from 'next/navigation';
import ReturnButton from '@/components/ReturnButton/ReturnButton';
import ManageSkills from './ManageSkills';
import styles from './ManageSkills.module.css';

export default function SkillsPage() {
  const router = useRouter();

  return (
    <main style={{ padding: 20 }}>
        <h2 className={styles.title}>Gestion des compétences</h2>
      <ReturnButton routeName={'/dashboard'} />
      <div>
        <button
          onClick={() => router.push('/dashboard/skills/add-skill')}
          style={buttonStyle}
        >
          ➕ Ajouter une compétence
        </button>
        <ManageSkills />
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  marginBottom: '20px',
  cursor: 'pointer',
};
