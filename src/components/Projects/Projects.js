'use client';

import { useEffect, useMemo, useState } from 'react';
import ProjectCard from './ProjectCard';
import Carousel from '../Carousel/Carousel';
import styles from './Projects.module.css';
import { supabase } from '../../lib/supabaseClient';
import useMediaQuery from '../../hook/useMediaQuery';
import { Icon } from '@iconify/react';
import Loader from '@/components/Loader/Loader';
import { useAuth } from '@/context/AuthProvider';

export default function Projects() {
  const { user } = useAuth(); // si tu veux refetch quand l’auth change
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data: allProjects, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_skills:project_skills!project_skills_project_id_fkey (
              skills:skills!project_skills_skill_id_fkey ( name, link )
            )
          `)
          .order('date', { ascending: false });

        if (error) throw error;
        if (!cancelled) setProjects(allProjects || []);
      } catch (error) {
        if (!cancelled) {
          console.error('Erreur lors du chargement des projets :', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjects();

    return () => {
      cancelled = true;
    };
    // si tu ne veux PAS refetch sur changement d’utilisateur, enlève `user` des deps
  }, [user]);

  const projectSkillSet = (p) =>
    new Set((p.project_skills || []).map(ps => ps?.skills?.name).filter(Boolean));

  const allSkills = useMemo(() => {
    const s = new Set();
    for (const p of projects) for (const n of projectSkillSet(p)) s.add(n);
    return [...s].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }, [projects]);

  const matchesAll = (p, arr) => {
    const ps = projectSkillSet(p);
    return arr.every(s => ps.has(s));
  };

  const visibleProjects = useMemo(() => {
    if (selectedSkills.length === 0) return projects;
    return projects.filter(p => matchesAll(p, selectedSkills));
  }, [projects, selectedSkills]);

  const baseCounts = useMemo(() => {
    const map = new Map();
    for (const name of allSkills) map.set(name, 0);
    for (const p of projects) for (const name of projectSkillSet(p)) {
      map.set(name, (map.get(name) || 0) + 1);
    }
    return map;
  }, [projects, allSkills]);

  const { chipsSelected, chipsAvailable } = useMemo(() => {
    if (selectedSkills.length === 0) {
      const avail = allSkills.map(name => ({ name, count: baseCounts.get(name) || 0 }));
      return { chipsSelected: [], chipsAvailable: avail };
    }

    const selected = selectedSkills.map(name => ({ name, count: visibleProjects.length }));
    const avail = [];
    const selectedSet = new Set(selectedSkills);

    for (const name of allSkills) {
      if (selectedSet.has(name)) continue;
      const nextSel = [...selectedSkills, name];
      const nextCount = projects.reduce((acc, p) => acc + (matchesAll(p, nextSel) ? 1 : 0), 0);
      if (nextCount > 0) avail.push({ name, count: nextCount });
    }

    selected.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    avail.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    return { chipsSelected: selected, chipsAvailable: avail };
  }, [allSkills, baseCounts, projects, selectedSkills, visibleProjects]);

  const toggleSkill = (name) => {
    setSelectedSkills(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };
  const clearAll = () => setSelectedSkills([]);

  const renderCard = (project) => (
    <ProjectCard
      key={project.id}
      title={project.title}
      description={project.description}
      imgSrc={project.imglink}
      skills={(project.project_skills || []).map(ps => ({
        name: ps?.skills?.name || '',
        link: ps?.skills?.link || '',
      }))}
      repourl={project.repourl}
      demourl={project.demourl}
      onSkillClick={(name) => toggleSkill(name)}
    />
  );

  return (
    <section className={styles.projects} id="projects">
      <div className={styles.text}>
        <h2 className={styles.title}>Bienvenue dans mon Laboratoire</h2>
        <p className={styles.subtitle}>
          Ici sont présentés tous mes projets, d'hier et d'aujourd'hui. Les tests, les expériences, tous mes projets finis et présentables.
        </p>
      </div>

      {/* BARRE FILTRES */}
      <div
        className={styles.filtersBar}
        role="toolbar"
        aria-label="Filtrer par compétences"
        data-has-selected={selectedSkills.length > 0 ? 'true' : 'false'}
      >
        <div className={styles.leftControls}>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              className={styles.clearIconBtn}
              onClick={clearAll}
              aria-label="Effacer tous les filtres"
              title="Effacer les filtres"
            >
              <Icon icon="uis:multiply" width="15" height="15" />
            </button>
          )}
        </div>

        <div className={styles.chipsScroller}>
          <button
            type="button"
            className={`${styles.chip} ${selectedSkills.length === 0 ? styles.chipActive : ''}`}
            aria-pressed={selectedSkills.length === 0}
            onClick={clearAll}
            title="Afficher tous les projets"
          >
            Tous
            <span className={styles.chipCount}>{projects.length}</span>
          </button>

          {chipsSelected.map(({ name, count }) => (
            <button
              key={`sel-${name}`}
              type="button"
              className={`${styles.chip} ${styles.chipActive}`}
              aria-pressed={true}
              onClick={() => toggleSkill(name)}
              title={`Retirer ${name}`}
            >
              {name}
              <span className={styles.chipCount}>{count}</span>
            </button>
          ))}

          {chipsAvailable.map(({ name, count }) => (
            <button
              key={`avail-${name}`}
              type="button"
              className={styles.chip}
              aria-pressed={false}
              onClick={() => toggleSkill(name)}
              title={`Ajouter ${name}`}
            >
              {name}
              <span className={styles.chipCount}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 👇 ICI : même Loader global que pour l’auth */}
      {loading ? (
        <Loader />
      ) : visibleProjects.length === 0 ? (
        <p>Aucun projet trouvé.</p>
      ) : (
        <div className={styles.grid}>
          {visibleProjects.map((project) => renderCard(project))}
        </div>
      )}
    </section>
  );
}
