'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './ManageSkills.module.css';

const SKILL_TYPES = [
  'Frontend',
  'Backend',
  'Mobile',
  'Data',
  'Outil',
  'Logiciel',
  'Autre',
];

export default function SkillsGrid() {
  const [skills, setSkills] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    setLoading(true);
    const { data, error } = await supabase.from('skills').select('*').order('name');
    if (!error) setSkills(data || []);
    setLoading(false);
  }

  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  }

  async function saveSkill() {
    if (!editing) return;
    let imageLink = editing.link;

    if (editing.file) {
      imageLink = await uploadToCloudinary(editing.file);
    }

    await supabase
      .from('skills')
      .update({
        name: editing.name,
        type: editing.type,
        link: imageLink,
      })
      .eq('id', editing.id);

    setEditing(null);
    fetchSkills();
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {skills.map((sk) => (
          <div key={sk.id} className={styles.card}>
            {editing?.id === sk.id ? (
              <div className={styles.editForm}>
                <input
                  type="text"
                  className={styles.input}
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <select
                  className={styles.input}
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                >
                  <option value="">-- Choisir type --</option>
                  {SKILL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className={styles.previewWrapper}>
                  {editing.file ? (
                    <img
                      src={URL.createObjectURL(editing.file)}
                      alt="preview"
                      className={styles.image}
                    />
                  ) : editing.link ? (
                    <img src={editing.link} alt="preview" className={styles.image} />
                  ) : (
                    <div className={styles.noImage}>Pas d'image</div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className={styles.input}
                  onChange={(e) => setEditing({ ...editing, file: e.target.files[0] })}
                />

                <div className={styles.actions}>
                  <button onClick={saveSkill} className={styles.saveBtn}>
                    💾 Sauver
                  </button>
                  <button onClick={() => setEditing(null)} className={styles.cancelBtn}>
                    ✖ Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewCard}>
                <p className={styles.name}>{sk.name}</p>
                <p className={styles.type}>{sk.type || '—'}</p>
                {sk.link ? (
                  <img src={sk.link} alt={sk.name} className={styles.image} />
                ) : (
                  <div className={styles.noImage}>Pas d'image</div>
                )}
                <button
                  onClick={() =>
                    setEditing({
                      id: sk.id,
                      name: sk.name || '',
                      type: sk.type || '',
                      link: sk.link || '',
                      file: null,
                    })
                  }
                  className={styles.editBtn}
                >
                  ✏️ Éditer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
