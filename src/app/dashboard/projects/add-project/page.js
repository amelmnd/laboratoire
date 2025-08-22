'use client';

import { useRouter } from 'next/navigation';
import AddProject from '@/components/ManageProjects/AddProject';
import ReturnButton from '@/components/ReturnButton/ReturnButton';

export default function AddProjectPage() {
  const router = useRouter();

  const handleProjectAdded = () => {
    router.push('/dashboard/projects');
  };

  return (
    <main style={{ padding: 20 }}>
      <ReturnButton routeName={'/dashboard/projects'} />
      <h1 style={{ marginBottom: '20px' }}>Ajouter un projet</h1>
      <AddProject onAdded={handleProjectAdded} />
    </main>
  );
}
