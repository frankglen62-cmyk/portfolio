import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const supportWords = [
  'Product listings',
  'Marketplace SEO',
  'Product research',
  'Store management',
];

interface BlurredTextTickerProps {
  isMobile: boolean;
}

export function BlurredTextTicker({ isMobile }: BlurredTextTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % supportWords.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div
      className={`hero-specialization-copy ${isMobile ? 'hero-specialization-copy-mobile' : ''}`}
      aria-label={`Ecommerce support: ${supportWords.join(', ')}`}
    >
      <strong>Ecommerce support</strong>
      <span className="hero-ticker-window" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={supportWords[activeIndex]}
            className="hero-ticker-word"
            initial={reduceMotion ? false : { opacity: 0, y: 9, filter: 'blur(9px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -9, filter: 'blur(9px)' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {supportWords[activeIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
