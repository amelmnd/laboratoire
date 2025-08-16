'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import Carousel from '../Carousel/Carousel';
import styles from './Projects.module.css';
import { supabase } from '../../lib/supabaseClient';
import useMediaQuery from '../../hook/useMediaQuery';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Favoris avec skills (name + link)
        const { data: favProjects, error: favError } = await supabase
          .from('projects')
          .select(`
            *,
            project_skills:project_skills!project_skills_project_id_fkey (
              skills:skills!project_skills_skill_id_fkey ( name, link )
            )
          `)
          .eq('fav', true)
          .order('date', { ascending: false });

        if (favError) throw favError;

        let all = favProjects || [];

        // Compléter si < 4
        if (all.length < 4) {
          const { data: otherProjects, error: otherError } = await supabase
            .from('projects')
            .select(`
              *,
              project_skills:project_skills!project_skills_project_id_fkey (
                skills:skills!project_skills_skill_id_fkey ( name, link )
              )
            `)
            .eq('fav', false)
            .order('date', { ascending: false })
            .limit(4 - all.length);

          if (otherError) throw otherError;

          all = [...all, ...(otherProjects || [])];
        }

        setProjects(all);
      } catch (error) {
        alert('Erreur lors du chargement des projets : ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const renderCard = (project) => (
    <ProjectCard
      key={project.id}
      title={project.title}
      description={project.description}
      imgSrc={project.imglink}
      // ⬇️ Passe des objets { name, link } pour SkillTags
      skills={
        project.project_skills?.map((ps) => ({
          name: ps?.skills?.name || '',
          link: ps?.skills?.link || '',
        })) || []
      }
      repourl={project.repourl}
      demourl={project.demourl}
    />
  );

  return (
    <section className={styles.projects} id="projects">
      <div className={styles.text}>
        <h2 className={styles.title}>Mes projets préférés</h2>
        <p className={styles.subtitle}>
          Voici quelques projets sur lesquels j&apos;ai travaillé, chacun
          d&apos;eux fait partie de mes projets préférés et les plus aboutis.
        </p>
        <p className={styles.subtitle}>
          Mais ce ne sont pas les seuls. Pour en voir plus, rendez-vous dans&nbsp;
          <Link href="/projects" className={styles.link}>
            mon bac à sable.
          </Link>
          .
        </p>
      </div>

      {loading ? (
        <p>Chargement des projets...</p>
      ) : projects.length === 0 ? (
        <p>Aucun projet trouvé.</p>
      ) : isMobile ? (
        <Carousel items={projects} renderItem={renderCard} />
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => renderCard(project))}
        </div>
      )}
    </section>
  );
}
