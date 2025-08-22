'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ReturnButton from '@/components/ReturnButton/ReturnButton';
import styles from './AddSkills.module.css';

const SKILL_TYPES = [
  'Frontend',
  'Backend',
  'Mobile',
  'Data',
  'Outil',
  'Logiciel',
  'Autre',
];

export default function AddSkillForm({ onAdded, existingSkill = null, onClose }) {
  const router = useRouter();

  const [name, setName] = useState(existingSkill?.name || '');
  const [type, setType] = useState(existingSkill?.type || '');
  const [imageFile, setImageFile] = useState(null);
  const [link, setLink] = useState(existingSkill?.link || '');
  const [loading, setLoading] = useState(false);

  async function handleUpload(file) {
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      let imageLink = link;
      if (imageFile) {
        imageLink = await handleUpload(imageFile);
      }

      if (existingSkill) {
        const { error } = await supabase
          .from('skills')
          .update({ name, type, link: imageLink })
          .eq('id', existingSkill.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([{ name, type, link: imageLink }]);
        if (error) throw error;
      }

      setName('');
      setType('');
      setImageFile(null);
      setLink('');

      onAdded?.();

      if (onClose) {
        onClose();
      } else {
        router.replace('/dashboard/skills');
      }
    } catch (err) {
      alert('Erreur : ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <ReturnButton routeName={'/dashboard/skills'} />
        <h2 className={styles.title}>
          {existingSkill ? 'Modifier une compétence' : 'Ajouter une compétence'}
        </h2>
      </div>

      <input
        type="text"
        placeholder="Nom de la compétence"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className={styles.input}
      >
        <option value="">-- Choisir type --</option>
        {SKILL_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className={styles.previewWrapper}>
        {imageFile ? (
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className={styles.preview}
          />
        ) : link ? (
          <img src={link} alt="preview" className={styles.preview} />
        ) : (
          <div className={styles.noPreview}>Pas d'image</div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className={styles.input}
      />

      <div className={styles.buttons}>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? '⏳...' : existingSkill ? '💾 Sauver' : '➕ Ajouter'}
        </button>
        {onClose && (
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
