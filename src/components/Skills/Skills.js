"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./Skills.module.css";
import Link from "next/link";
import Image from "next/image";

export default function Skills({ usage }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      const { data, error } = await supabase
        .rpc("get_skills_with_usage", { p_usage: usage });

      if (error) {
        console.error("Erreur chargement compétences :", error);
        setLoading(false);
        return;
      }

      // Filtrer uniquement les skills avec un type défini
      const filteredSkills = data.filter(skill => skill.type && skill.type.trim() !== "");

      setSkills(filteredSkills);
      setLoading(false);
    }

    fetchSkills();
  }, [usage]);

  if (loading) return <p>Chargement...</p>;

  // Regrouper par type
  const skillsByType = {};
  skills.forEach((skill) => {
    if (!skillsByType[skill.type]) skillsByType[skill.type] = [];
    skillsByType[skill.type].push(skill);
  });

  return (
    <section className={styles.skills} id='skills'>
      <div className={styles.text}>
        <h2 className={styles.title}>Mes compétences</h2>
        <p className={styles.subtitle}>
          Voici quelques compétences. Chacune provient d'une formation, d'une expérience professionnelle ou d'un projet présenté ici ou dans mon&nbsp;
          <Link href='/projects' className={styles.link}>
            bac à sable
          </Link>.
        </p>
      </div>
      <div className={styles.columnsContainer}>
        {Object.entries(skillsByType).map(([type, skills]) => (
          <div key={type} className={styles.column}>
            <h3 className={styles.typeTitle}>{type}</h3>
            {skills.map((skill, index) => {
              const iconName = skill.name
                .toLowerCase()
                + ".png";

              return (
                <div key={`${skill.id}-${index}`} className={styles.skillItem}>
                  <Image
                    src={`/techno-logo/${iconName}`}
                    alt={skill.name}
                    className={styles.skillIcon}
                    onError={(e) => (e.target.style.display = "none")}
					width={30}
					height={30}
                  />
                  <p className={styles.skillName}>{skill.name}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
