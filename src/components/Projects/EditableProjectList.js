'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './EditableProjectList.module.css';
import SkillSelector from '../SkillSelector/SkillSelector';
import ProjectView from './ProjectView';
import ProjectEdit from './ProjectEdit';

export default function EditableProjectList() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState({});
  const [projectSkills, setProjectSkills] = useState({});

  const fetchProjects = async () => {
    setLoading(true);

    const { data: projectsData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false });

    if (projectError) {
      alert('Erreur : ' + projectError.message);
      setLoading(false);
      return;
    }

    const { data: links, error: skillsError } = await supabase
      .from('project_skills')
      .select('project_id, skills ( id, name )');

    if (skillsError) {
      alert('Erreur chargement skills : ' + skillsError.message);
      setLoading(false);
      return;
    }

    const skillMap = {};
    links?.forEach((link) => {
      const skill = link.skills;
      if (!skillMap[link.project_id]) skillMap[link.project_id] = [];
      skillMap[link.project_id].push(skill);
    });

    setProjectSkills(skillMap);
    setProjects(projectsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const handleSave = async (project) => {
    setSaving(true);

    const { error } = await supabase
      .from('projects')
      .update(project)
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
    <div className={styles.grid}>
      {projects.map((project) =>
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
            onEdit={() => setEditingId(project.id)}
            onDelete={() => handleDelete(project.id)}
          />
        )
      )}
    </div>
  );
}
