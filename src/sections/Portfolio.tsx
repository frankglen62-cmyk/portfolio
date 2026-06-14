import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const portfolioCategories = ['All', 'Social Media', 'Business Cards', 'Websites', 'Email Marketing'];

const portfolioItems = [
  { id: 1, title: 'Social Media Post Design', category: 'Social Media', desc: 'Branded social media content for Instagram and Facebook' },
  { id: 2, title: 'Business Card Design', category: 'Business Cards', desc: 'Professional business and thank you card designs' },
  { id: 3, title: 'E-Commerce Website', category: 'Websites', desc: 'Shopify store setup and management' },
  { id: 4, title: 'Instagram Stories', category: 'Social Media', desc: 'Engaging story templates for client brands' },
  { id: 5, title: 'Email Newsletter', category: 'Email Marketing', desc: 'MailChimp email campaign designs' },
  { id: 6, title: 'Thank You Cards', category: 'Business Cards', desc: 'Custom thank you card designs for small businesses' },
  { id: 7, title: 'Facebook Ads', category: 'Social Media', desc: 'High-converting Facebook ad creatives' },
  { id: 8, title: 'Landing Page', category: 'Websites', desc: 'WordPress landing page design and development' },
  { id: 9, title: 'TikTok Content', category: 'Social Media', desc: 'Short-form video content and thumbnails' },
];

const gradients = [
  'from-yellow/30 to-orange/20',
  'from-cream-dark/50 to-cream/80',
  'from-yellow-soft/60 to-white',
  'from-cream/60 to-yellow/20',
  'from-orange/15 to-cream-dark/40',
  'from-yellow-pale/60 to-cream/80',
  'from-cream-dark/40 to-yellow/15',
  'from-yellow-soft/40 to-cream/60',
  'from-cream/50 to-orange/10',
];

export const Portfolio: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? portfolioItems : portfolioItems.filter(i => i.category === active);

  return (
    <section id="portfolio" ref={sectionRef} className="py-28 md:py-40 bg-cream relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <ScrollReveal className="text-center mb-12">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/50 mb-4 block">
            My Work
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold text-dark tracking-wide uppercase">
            Portfolio
          </h2>
          <div className="w-12 h-[2px] bg-dark/20 mt-5 mx-auto" />
        </ScrollReveal>

        {/* Filter Tabs */}
        <ScrollReveal delay={0.1} className="flex flex-wrap justify-center gap-2.5 mb-14">
          {portfolioCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-ui text-[11px] font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full border transition-all duration-300 ${
                active === cat
                  ? 'bg-dark text-white border-dark'
                  : 'bg-transparent text-dark/60 border-dark/10 hover:border-dark/30 hover:text-dark'
              }`}
            >
              {cat}
            </button>
          ))}
        </ScrollReveal>

        {/* Grid (Staggered ScrollReveal) */}
        <ScrollReveal staggerChildren={0.05} amount={0.08}>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, scale: 0.92, y: 25 },
                    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  whileHover={{ y: -6 }}
                  className="group cursor-pointer"
                >
                  <div className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} border border-dark/5 overflow-hidden relative shadow-sm group-hover:shadow-lg transition-all duration-300`}>
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-xl bg-white/80 border border-dark/5 backdrop-blur-sm mx-auto mb-3 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                          {item.category === 'Social Media' ? '📱' : item.category === 'Business Cards' ? '💼' : item.category === 'Websites' ? '🌐' : '📧'}
                        </div>
                        <p className="font-ui text-[10px] font-semibold uppercase tracking-wider text-dark/50">{item.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 px-1">
                    <h3 className="font-display font-bold text-[15px] text-dark transition-colors group-hover:text-dark/80">{item.title}</h3>
                    <p className="text-sm text-dark/60 mt-1 font-body">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

