'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './SkillSelector.module.css';

export default function SkillEditor({ selected = [], onChange }) {
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState(selected);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setSelectedSkills(selected);
  }, [selected]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    if (error) {
      alert('Erreur chargement compétences : ' + error.message);
      return;
    }
    setAllSkills(data || []);
  };

  const toggleSkill = (skill) => {
    let updated;
    if (selectedSkills.find((s) => s.id === skill.id)) {
      updated = selectedSkills.filter((s) => s.id !== skill.id);
    } else {
      updated = [...selectedSkills, skill];
    }
    setSelectedSkills(updated);
    onChange && onChange(updated);
  };

  const handleAddSkill = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // 🔍 Recherche insensible à la casse
    const existingSkill = allSkills.find(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );

    let skillToAdd;
    if (existingSkill) {
      skillToAdd = existingSkill;
    } else {
      // ➕ Création de la nouvelle skill
      const { data, error } = await supabase
        .from('skills')
        .insert([{ name: trimmed }])
        .select()
        .single();

      if (error) {
        alert('Erreur ajout compétence : ' + error.message);
        return;
      }
      skillToAdd = data;
      setAllSkills((prev) => [...prev, skillToAdd]);
    }

    // ✅ Ajout à la sélection
    if (!selectedSkills.find((s) => s.id === skillToAdd.id)) {
      const updated = [...selectedSkills, skillToAdd];
      setSelectedSkills(updated);
      onChange && onChange(updated);
    }

    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // 🔎 Suggestions filtrées
  const filteredSuggestions = allSkills.filter((s) =>
    s.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={styles.skillEditor}>
      {/* 🔹 Input d'ajout avec auto-complétion */}
      <div className={styles.skillInputContainer}>
        <input
          type="text"
          className={styles.skillInput}
          placeholder="Ajouter ou rechercher une compétence"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={styles.skillAddButton}
          onClick={handleAddSkill}
        >
          ➕
        </button>
      </div>


      {/* 🔹 Liste des suggestions */}
      {inputValue && filteredSuggestions.length > 0 && (
        <div className={styles.suggestions}>
          {filteredSuggestions.map((skill) => (
            <div
              key={skill.id}
              onClick={() => {
                toggleSkill(skill);
                setInputValue('');
              }}
            >
              {skill.name}
            </div>
          ))}
        </div>
      )}


      {/* 🔹 Boutons de sélection */}
      <div className={styles.skillButtons}>
        {allSkills.map((skill) => (
          <button
            type="button"
            key={skill.id}
            onClick={() => toggleSkill(skill)}
            className={
              selectedSkills.find((s) => s.id === skill.id)
                ? styles.selected
                : ''
            }
          >
            {skill.name}
          </button>
        ))}
      </div>
    </div>
  );
}
