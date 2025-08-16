'use client';

import { useRouter } from 'next/navigation';

export default function ReturnButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#2563eb',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '600',
      }}
    >
      ← Retour
    </button>
  );
}

