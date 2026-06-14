import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const reasons = [
  { title: 'Reliable & Responsive', desc: 'I prioritize timely delivery and clear communication — you can always count on me.', icon: '⚡' },
  { title: 'Detail-Oriented', desc: 'I pay attention to every detail, ensuring nothing falls through the cracks.', icon: '🔍' },
  { title: 'Adaptable & Fast Learner', desc: 'I quickly learn new tools, processes, and workflows to match your business needs.', icon: '🚀' },
  { title: 'Results-Driven', desc: 'I focus on outcomes that matter — efficiency, growth, and your peace of mind.', icon: '🎯' },
];

export const WhyHireMe: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="why-hire-me" ref={sectionRef} className="py-28 md:py-40 bg-yellow relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header — matching Prolific style */}
        <ScrollReveal className="text-center mb-16 md:mb-20">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/60 mb-4 block">
            Why Choose Me
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold text-dark tracking-wide uppercase">
            Why Hire Me
          </h2>
          <div className="w-12 h-[2px] bg-dark/20 mt-5 mx-auto" />
        </ScrollReveal>

        {/* 2x2 Grid — Prolific-style cards (Staggered ScrollReveal) */}
        <ScrollReveal
          staggerChildren={0.1}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
              className="bg-cream rounded-2xl p-8 md:p-10 border border-dark/5 hover:border-dark/10 hover:bg-white transition-colors duration-300 shadow-sm"
            >
              <div className="text-3xl mb-5">{reason.icon}</div>
              <h3 className="font-display font-bold text-lg text-dark mb-3 tracking-tight">{reason.title}</h3>
              <p className="text-sm text-dark/70 leading-relaxed font-body">{reason.desc}</p>
            </motion.div>
          ))}
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.2} className="text-center mt-14">
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-dark text-yellow font-ui font-bold text-[11px] uppercase tracking-wider rounded-full px-10 py-4 shadow-sm cursor-pointer hover:bg-black transition-colors"
          >
            Get in Touch
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
};

