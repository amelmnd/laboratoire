'use client';
import React from 'react';
import styles from './Loader.module.css';

function Paw({ style }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={styles.paw}
      style={style}
    >
      {/* Couleur héritée de color: #4d251e; via currentColor */}
      <g fill="currentColor">
        {/* empreinte simple: 4 coussinets + base */}
        <circle cx="18" cy="18" r="6" />
        <circle cx="32" cy="12" r="6" />
        <circle cx="46" cy="18" r="6" />
        <ellipse cx="32" cy="38" rx="16" ry="12" />
      </g>
    </svg>
  );
}

export default function Loader() {
  // mêmes 12 pattes, décalées dans le temps (0 -> 1100ms)
  const steps = [
    { x: 10, y: 65, r: 10, d: 0 },
    { x: 18, y: 60, r: 10, d: 100 },
    { x: 26, y: 55, r: 10, d: 200 },
    { x: 34, y: 50, r: 10, d: 300 },
    { x: 42, y: 45, r: -6, d: 400 },
    { x: 50, y: 40, r: 10, d: 500 },
    { x: 58, y: 35, r: -8, d: 600 },
    { x: 66, y: 30, r: 10, d: 700 },
    { x: 74, y: 25, r: -6, d: 800 },
    { x: 82, y: 20, r: 8, d: 900 },
    { x: 90, y: 15, r: -5, d: 1000 },
    { x: 98, y: 10, r: 6, d: 1100 },
  ];

  return (
    <div className={styles.colorPaw} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.stage}>
        {steps.map((s, i) => (
          <div
            key={i}
            className={styles.step}
            style={{
              '--x': `${s.x}%`,
              '--y': `${s.y}%`,
              '--rot': `${s.r}deg`,
              '--delay': `${s.d}ms`,
            }}
          >
            <Paw />
          </div>
        ))}
      </div>
    </div>
  );
}
