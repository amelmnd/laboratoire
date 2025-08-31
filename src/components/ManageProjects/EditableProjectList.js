'use client';

import { useEffect, useState } from 'react';
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

  // Fetch projets avec éducation et skills
  const fetchProjects = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        education(id, institution),
        project_skills(skill_id, skills(name))
      `)
      .order('date', { ascending: false });

    if (error) {
      alert('Erreur fetch projets : ' + error.message);
      setLoading(false);
      return;
    }

    // Transforme les skills pour chaque projet
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

  // Gérer changement des inputs
  const handleInputChange = (id, field, value) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSkillChange = (projectId, skills) => {
    setProjectSkills((prev) => ({
      ...prev,
      [projectId]: skills,
    }));
  };

  // Gestion upload image
  const handleImageChange = async (id, file) => {
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [id]: previewURL }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();

      if (data.secure_url) {
        handleInputChange(id, 'imglink', data.secure_url);
        setPreviews((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      } else {
        alert(
          'Échec upload image : ' +
            (data.error?.message || JSON.stringify(data))
        );
      }
    } catch (err) {
      alert('Erreur Cloudinary : ' + err.message);
    }
  };

  // Sauvegarde projet
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

    // Mettre à jour compétences
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

  // Grouper par éducation
  const grouped = {};
  projects.forEach((project) => {
    const eduName = project.education?.institution || 'Sans formation';
    if (!grouped[eduName]) grouped[eduName] = [];
    grouped[eduName].push(project);
  });

  return (
    <div>
      {Object.entries(grouped).map(([eduName, eduProjects]) => (
        <div key={eduName}>
          <h2>{eduName}</h2>
          <div className={styles.grid}>
            {eduProjects.map((project) =>
              editingId === project.id ? (
                <ProjectEdit
                  key={project.id}
                  project={project}
                  skills={projectSkills[project.id] || []}
                  onChange={handleInputChange}
                  onSkillChange={(skills) => handleSkillChange(project.id, skills)}
                  onImageChange={handleImageChange}
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
        </div>
      ))}
    </div>
  );
}
