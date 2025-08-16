'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ProjectList from '../../../components/Projects/EditableProjectList';
import ReturnButton from '@/components/ReturnButton/ReturnButton';

export default function ProjectsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  return (
    <main style={{ padding: 20 }}>
      <ReturnButton routeName={'/dashboard'} />
      <div>
        <button
          onClick={() => router.push('/dashboard/projects/add-project')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
        >
          ➕ Ajouter un projet
        </button>
        <ProjectList key={refreshKey} />
      </div>
    </main>
  );
}
