'use client';
import React, { useState, useEffect } from 'react';
import styles from './Carousel.module.css';

export default function Carousel({
  items,
  interval = 6000,
  renderItem,
  classNames = {},
  loop = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prevIndex) => {
      if (loop) {
        return (prevIndex + 1) % items.length;
      }
      return prevIndex < items.length - 1 ? prevIndex + 1 : prevIndex;
    });
  };

  const prev = () => {
    setCurrentIndex((prevIndex) => {
      if (loop) {
        return prevIndex === 0 ? items.length - 1 : prevIndex - 1;
      }
      return prevIndex > 0 ? prevIndex - 1 : prevIndex;
    });
  };

  useEffect(() => {
    if (loop) {
      const timer = setInterval(next, interval);
      return () => clearInterval(timer);
    }
  }, [loop, interval]);

  if (!items || items.length === 0) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  return (
    <div
      className={`${styles.carouselContainer} ${classNames.container || ''}`}
    >
      <button
        className={`${styles.navButton} ${isFirst && !loop ? styles.disabled : ''} ${classNames.navButton || ''}`}
        onClick={prev}
        disabled={isFirst && !loop}
      >
        ‹
      </button>
      <div className={`${styles.quoteCard} ${classNames.card || ''}`}>
        {renderItem(items[currentIndex], currentIndex)}
      </div>
      <button
        className={`${styles.navButton} ${isLast && !loop ? styles.disabled : ''} ${classNames.navButton || ''}`}
        onClick={next}
        disabled={isLast && !loop}
      >
        ›
      </button>
    </div>
  );
}
