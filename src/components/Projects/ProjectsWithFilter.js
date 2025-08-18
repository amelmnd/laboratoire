// Exemple d’assemblage : components/Projects/ProjectsWithFilter.jsx
'use client';

import { useState } from 'react';
import SkillsFilter from '@/components/SkillsFilter/SkillsFilter';
import Projects from '@/components/Projects/Projects';

export default function ProjectsWithFilter() {
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  return (
    <>
      <SkillsFilter usage="projects" onChange={setSelectedSkillIds} />
      <Projects filterSkillIds={selectedSkillIds} />
    </>
  );
}
