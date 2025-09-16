import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './AddProject.module.css';
import SkillSelector from '../SkillSelector/SkillSelector';
import SkillEditor from '../SkillSelector/SkillEditor';

export default function AddProject({ onAdded, onBack }) {
  const maxChars = 200; // Limite de caractères pour la description
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charCount, setCharCount] = useState(0); // compteur de caractères
  const [imgFile, setImgFile] = useState(null);
  const [imgLink, setImgLink] = useState('');
  const [repourl, setRepourl] = useState('');
  const [demourl, setDemourl] = useState('');
  const [date, setDate] = useState('');
  const [fav, setFav] = useState(false);
  const [skills, setSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [educations, setEducations] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState('');

  // Récupérer toutes les éducation au montage
  useEffect(() => {
    const fetchEducation = async () => {
      const { data, error } = await supabase.from('education').select('id, institution');
      if (error) {
        console.error('Erreur récupération éducation :', error.message);
      } else {
        setEducations(data);
        if (data.length > 0) setSelectedEducation(data[0].id);
      }
    };
    fetchEducation();
  }, []);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setDescription(value);
      setCharCount(value.length);
    } else {
      alert(`Limite de ${maxChars} caractères atteinte !`);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();

    if (data.secure_url) return data.secure_url;
    alert('Échec upload image : ' + (data.error?.message || JSON.stringify(data)));
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let uploadedImg = imgLink;
    if (imgFile) {
      uploadedImg = await uploadImage(imgFile);
      if (!uploadedImg) {
        setSaving(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          imglink: uploadedImg,
          repourl,
          demourl,
          date,
          fav,
          education_id: selectedEducation,
        },
      ])
      .select()
      .single();

    if (error) {
      alert('Erreur ajout projet : ' + error.message);
      setSaving(false);
      return;
    }

    if (skills.length) {
      for (const skill of skills) {
        await supabase.from('project_skills').insert({
          project_id: data.id,
          skill_id: skill.id,
        });
      }
    }

    setSaving(false);
    onAdded && onAdded();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Ajouter un projet</h2>

      <label className={styles.label}>
        Titre :
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label className={styles.label}>
        Description :
        <textarea
          className={styles.textarea}
          value={description}
          onChange={handleDescriptionChange}
          maxLength={maxChars}
        />
        <div
          className={`${styles.charCounter} ${
            charCount >= maxChars ? styles.charLimitReached : ''
          }`}
        >
          {charCount}/{maxChars} caractères
        </div>
      </label>

      <label className={styles.label}>
        Éducation :
        <select
          className={styles.input}
          value={selectedEducation}
          onChange={(e) => setSelectedEducation(e.target.value)}
        >
          {educations.map((edu) => (
            <option key={edu.id} value={edu.id}>
              {edu.institution}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Image :
        {imgFile && (
          <img
            src={URL.createObjectURL(imgFile)}
            alt='Preview'
            className={styles.previewImage}
          />
        )}
        <input
          className={styles.fileInput}
          type='file'
          accept='image/*'
          onChange={(e) => setImgFile(e.target.files[0])}
        />
      </label>

      <label className={styles.label}>
        Repo URL :
        <input
          className={styles.input}
          value={repourl}
          onChange={(e) => setRepourl(e.target.value)}
        />
      </label>

      <label className={styles.label}>
        Démo URL :
        <input
          className={styles.input}
          value={demourl}
          onChange={(e) => setDemourl(e.target.value)}
        />
      </label>

      <label className={styles.label}>
        Date :
        <input
          className={styles.input}
          type='date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <label className={styles.labelCheckbox}>
        Favori :
        <input
          type='checkbox'
          checked={fav}
          onChange={(e) => setFav(e.target.checked)}
          className={styles.checkbox}
        />
      </label>

      <label className={styles.label}>
        Compétences :
        <SkillEditor selected={skills} onChange={setSkills} />
      </label>

      <div className={styles.buttons}>
        <button type='submit' disabled={saving} className={styles.submitBtn}>
          {saving ? 'Enregistrement...' : 'Ajouter'}
        </button>
        <button
          type='button'
          onClick={onBack}
          disabled={saving}
          className={styles.cancelBtn}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
