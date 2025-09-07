'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './EditableProjectList.module.css';
import ProjectView from './ProjectView';
import ProjectEdit from './ProjectEdit';

export default function EditableProjectList() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState({});
  const [projectSkills, setProjectSkills] = useState({});

  // 🔹 Filtres
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const getEducationLabel = (edu) => {
    if (!edu) return null;
    if (edu.institution) return edu.institution;
    if (edu.studytype && edu.area) return `${edu.studytype} en ${edu.area}`;
    if (edu.area) return edu.area;
    return 'Formation';
  };

  // 🔹 Fetch projets avec éducation et skills
  const fetchProjects = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        education(id, institution, area, studytype),
        project_skills(skill_id, skills(id, name))
      `)
      .order('date', { ascending: false });

    if (error) {
      alert('Erreur fetch projets : ' + error.message);
      setLoading(false);
      return;
    }

    const skillMap = {};
    data.forEach((p) => {
      skillMap[p.id] = p.project_skills?.map((ps) => ps.skills) || [];
    });

    setProjectSkills(skillMap);
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const projectSkillSet = (p) =>
    new Set((projectSkills[p.id] || []).map((s) => s.name));

  const matchesAll = (p, arr) => arr.every((s) => projectSkillSet(p).has(s));

  // 🔹 Toutes les educations
  const allEducations = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      const label = getEducationLabel(p.education);
      if (label) set.add(label);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }, [projects]);

  // 🔹 Projets visibles selon filtres
  const visibleProjects = useMemo(() => {
    let filtered = projects;

    if (selectedEducation) {
      filtered = filtered.filter((p) => getEducationLabel(p.education) === selectedEducation);
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter((p) => matchesAll(p, selectedSkills));
    }

    return filtered;
  }, [projects, selectedEducation, selectedSkills, projectSkills]);

  // 🔹 Compétences disponibles dynamiquement
  const availableSkills = useMemo(() => {
    const set = new Set();
    visibleProjects.forEach((p) => projectSkillSet(p).forEach((s) => set.add(s)));
    return [...set].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }, [visibleProjects, projectSkills]);

  // 🔹 Gestion filtres
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleEducationChange = (e) => {
    const value = e.target.value || null;
    setSelectedEducation(value);
    setSelectedSkills([]); // reset compétences
  };

  const clearAll = () => {
    setSelectedEducation(null);
    setSelectedSkills([]);
  };

  // 🔹 Gestion édition/suppression reste identique
  const handleInputChange = (id, field, value) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSkillChange = (projectId, skills) => {
    setProjectSkills((prev) => ({ ...prev, [projectId]: skills }));
  };

  const handleSave = async (project) => {
    setSaving(true);

    const { error } = await supabase
      .from('projects')
      .update({
        title: project.title,
        description: project.description,
        imglink: project.imglink,
        repourl: project.repourl,
        demourl: project.demourl,
        date: project.date,
        fav: project.fav,
        education_id: project.education_id,
      })
      .eq('id', project.id);

    if (error) {
      alert('Erreur projet : ' + error.message);
      setSaving(false);
      return;
    }

    await supabase.from('project_skills').delete().eq('project_id', project.id);
    const currentSkills = projectSkills[project.id] || [];
    for (const skill of currentSkills) {
      await supabase.from('project_skills').insert({
        project_id: project.id,
        skill_id: skill.id,
      });
    }

    setEditingId(null);
    await fetchProjects();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) alert('Erreur : ' + error.message);
    else fetchProjects();
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      {/* 🔹 Barre de filtrage */}
      <div className={styles.filtersBar}>
        <div className={styles.leftControls}>
          {(selectedEducation || selectedSkills.length > 0) && (
            <button type="button" onClick={clearAll} title="Effacer tous les filtres">
              ✕
            </button>
          )}
        </div>

        {/* Filtres compétences dynamiques */}
        <div className={styles.chipsScroller}>
          {availableSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              className={`${styles.chip} ${
                selectedSkills.includes(skill) ? styles.chipActive : ''
              }`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Filtre éducation */}
        <div className={styles.educationFilter}>
          <select value={selectedEducation || ''} onChange={handleEducationChange}>
            <option value="">Toutes les formations</option>
            {allEducations.map((edu) => (
              <option key={edu} value={edu}>
                {edu}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 Liste éditable des projets */}
      {visibleProjects.length === 0 ? (
        <p>Aucun projet trouvé.</p>
      ) : (
        <div className={styles.grid}>
          {visibleProjects.map((project) =>
            editingId === project.id ? (
              <ProjectEdit
                key={project.id}
                project={project}
                skills={projectSkills[project.id] || []}
                onChange={handleInputChange}
                onSkillChange={(skills) => handleSkillChange(project.id, skills)}
                onImageChange={(file) => console.log(file)}
                onSave={() => handleSave(project)}
                onCancel={() => setEditingId(null)}
                saving={saving}
                preview={previews[project.id]}
              />
            ) : (
              <ProjectView
                key={project.id}
                project={project}
                skills={projectSkills[project.id] || []}
                education={project.education}
                onEdit={() => setEditingId(project.id)}
                onDelete={() => handleDelete(project.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
