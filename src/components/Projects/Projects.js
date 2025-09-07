'use client';

import { useEffect, useMemo, useState } from 'react';
import ProjectCard from './ProjectCard';
import styles from './Projects.module.css';
import { supabase } from '../../lib/supabaseClient';
import Loader from '@/components/Loader/Loader';
import { useAuth } from '@/context/AuthProvider';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState(null);

  // 🔹 Formate l'affichage de l'éducation
  const getEducationLabel = (edu) => {
    if (!edu) return null;
    if (edu.institution) return edu.institution;
    if (edu.studytype && edu.area) return `${edu.studytype} en ${edu.area}`;
    if (edu.area) return edu.area;
    return 'Formation';
  };

  // 🔹 Fetch projets Supabase
  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            education:education_id (id, institution, area, studytype),
            project_skills:project_skills!project_skills_project_id_fkey (
              skills:skills!project_skills_skill_id_fkey (name, link)
            )
          `)
          .order('date', { ascending: false, nullsFirst: false });

        if (error) throw error;
        if (!cancelled) setProjects(data || []);
      } catch (error) {
        if (!cancelled) console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjects();
    return () => { cancelled = true; };
  }, [user]);

  // 🔹 Gestion des compétences
  const projectSkillSet = (p) =>
    new Set((p.project_skills || []).map(ps => ps.skills?.name).filter(Boolean));

  const matchesAll = (p, arr) => arr.every(s => projectSkillSet(p).has(s));

  // 🔹 Extraire toutes les formations
  const allEducations = useMemo(() => {
    const set = new Set();
    projects.forEach(p => {
      const label = getEducationLabel(p.education);
      if (label) set.add(label);
    });
    return [...set].sort((a,b) => a.localeCompare(b,'fr',{sensitivity:'base'}));
  }, [projects]);

  // 🔹 Filtrer projets visibles selon education et skills
  const visibleProjects = useMemo(() => {
    let filtered = projects;

    if (selectedEducation) {
      filtered = filtered.filter(p => getEducationLabel(p.education) === selectedEducation);
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter(p => matchesAll(p, selectedSkills));
    }

    return filtered;
  }, [projects, selectedEducation, selectedSkills]);

  // 🔹 Compétences disponibles dynamiquement selon l'éducation sélectionnée
  const availableSkills = useMemo(() => {
    const skillsSet = new Set();
    visibleProjects.forEach(p => projectSkillSet(p).forEach(s => skillsSet.add(s)));
    return [...skillsSet].sort((a,b) => a.localeCompare(b,'fr',{sensitivity:'base'}));
  }, [visibleProjects]);

  // 🔹 Gestion des filtres
  const toggleSkill = (name) => setSelectedSkills(prev =>
    prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
  );

  const handleEducationChange = (e) => {
    const value = e.target.value || null;
    setSelectedEducation(value);
    setSelectedSkills([]); // 🔹 Reset skills quand une éducation est choisie
  };

  const clearAll = () => {
    setSelectedSkills([]);
    setSelectedEducation(null);
  };

  // 🔹 Rendu carte projet
  const renderCard = (project) => (
    <ProjectCard
      key={project.id}
      title={project.title}
      description={project.description}
      imgSrc={project.imglink}
      skills={(project.project_skills || []).map(ps => ({
        name: ps.skills?.name || '',
        link: ps.skills?.link || '',
      }))}
      repourl={project.repourl}
      demourl={project.demourl}
      education={getEducationLabel(project.education)}
      onSkillClick={toggleSkill}
    />
  );

  return (
    <section className={styles.projects} id="projects">
      <div className={styles.text}>
        <h2 className={styles.title}>Bienvenue dans mon Laboratoire</h2>
        <p className={styles.subtitle}>
          Ici sont présentés tous mes projets, d'hier et d'aujourd'hui.
        </p>
      </div>

      {/* 🔹 Filtres */}
      <div className={styles.filtersBar}>
        <div className={styles.leftControls}>
          {(selectedSkills.length > 0 || selectedEducation) && (
            <button
              type="button"
              className={styles.clearIconBtn}
              onClick={clearAll}
              title="Effacer tous les filtres"
            >
              ✕
            </button>
          )}
        </div>

        {/* 🔹 Chips compétences dynamiques */}
        <div className={styles.chipsScroller}>
          {availableSkills.map(skill => (
            <button
              key={skill}
              type="button"
              className={`${styles.chip} ${selectedSkills.includes(skill) ? styles.chipActive : ''}`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* 🔹 Filtre éducation */}
        <div className={styles.educationFilter}>
          <select value={selectedEducation || ''} onChange={handleEducationChange}>
            <option value="">Toutes les formations</option>
            {allEducations.map(edu => (
              <option key={edu} value={edu}>{edu}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 Grille projets */}
      {loading ? <Loader /> :
        visibleProjects.length === 0 ? <p>Aucun projet trouvé.</p> :
        <div className={styles.grid}>
          {visibleProjects.map(renderCard)}
        </div>
      }
    </section>
  );
}
