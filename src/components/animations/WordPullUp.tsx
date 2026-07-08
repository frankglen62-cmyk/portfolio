import React from 'react';
import { motion, Variants } from 'framer-motion';

interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  wrapperFramerProps?: Variants;
  framerProps?: Variants;
  className?: string;
  style?: React.CSSProperties;
}

export function WordPullUp({
  words,
  wrapperFramerProps = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  },
  framerProps = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  },
  className = "",
  style,
}: WordPullUpProps) {
  return (
    <motion.div
      variants={wrapperFramerProps}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={className}
      style={style}
    >
      {words.split(" ").map((word, i) => (
        <motion.span
          key={i}
          variants={framerProps}
          style={{ display: "inline-block", paddingRight: "0.2em" }}
        >
          {word === "" ? <span>&nbsp;</span> : word}
        </motion.span>
      ))}
    </motion.div>
  );
}
