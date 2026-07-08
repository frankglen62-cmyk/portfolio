import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  amount?: number;
  staggerChildren?: number;
  blur?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  className = '',
  amount = 0.15,
  staggerChildren = 0,
  blur = true,
}) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'right' ? -30 : direction === 'left' ? 30 : 0,
      scale: direction === 'scale' ? 0.96 : 1,
      ...(blur ? { filter: 'blur(10px)' } : {}),
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      ...(blur ? { filter: 'blur(0px)' } : {}),
      transition: {
        duration,
        delay,
        ease: [0.25, 1, 0.5, 1], // Very snappy easeOutQuart
        when: staggerChildren ? 'beforeChildren' : undefined,
        staggerChildren: staggerChildren || undefined,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
