import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollReveal } from '../components/animations/ScrollReveal';

gsap.registerPlugin(ScrollTrigger);

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const stats = [
    { number: '3+', label: 'Years Experience' },
    { number: '50+', label: 'Clients Served' },
    { number: '100+', label: 'Projects Completed' },
    { number: '15+', label: 'Tools Mastered' },
  ];

  return (
    <section id="about" ref={sectionRef} className="py-28 md:py-40 bg-dark relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="mb-16 md:mb-20">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow mb-4 block">
            About
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold text-white tracking-wide uppercase">
            Get to Know Me
          </h2>
          <div className="w-12 h-[2px] bg-yellow mt-5" />
        </ScrollReveal>

        {/* Two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Left — Text */}
          <ScrollReveal delay={0.15}>
            <p className="text-base md:text-[17px] text-white/70 leading-[1.85] mb-6 font-body">
              Hi, I’m <span className="font-semibold text-white">Frank glen martin</span>, an eCommerce Virtual Assistant who helps online sellers manage and grow their stores through accurate product research, optimized listings, and efficient store support.
            </p>
            <p className="text-base md:text-[17px] text-white/70 leading-[1.85] mb-10 font-body">
              I specialize in product listing, competitor analysis, SEO title and description optimization, inventory management, and order fulfillment support across platforms like eBay, Shopify, Amazon, and Poshmark. My goal is to help store owners save time, improve product visibility, and keep store operations organized and efficient.
            </p>

            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-yellow text-dark font-ui font-bold text-[11px] uppercase tracking-wider rounded-full px-8 py-3.5 cursor-pointer hover:bg-yellow-soft transition-colors"
            >
              Let's Connect
            </motion.a>
          </ScrollReveal>

          {/* Right — Stats (Staggered ScrollReveal) */}
          <ScrollReveal staggerChildren={0.08} className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover={{ y: -5, borderColor: 'rgba(255, 255, 255, 0.15)' }}
                className="bg-dark-soft border border-white/5 rounded-2xl p-7 text-center transition-all duration-300 hover:shadow-lg"
              >
                <span className="block font-display font-black text-3xl md:text-4xl text-yellow mb-1">{stat.number}</span>
                <span className="font-ui text-[10px] font-semibold uppercase tracking-wider text-white/55">{stat.label}</span>
              </motion.div>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

