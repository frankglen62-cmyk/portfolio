import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const checklistItems = [
  'Product title',
  'Product description',
  'Product category',
  'Keywords and tags',
  'Product images',
  'Pricing',
  'SKU and product details',
  'Inventory status',
  'Shipping and order details',
  'SEO and search visibility',
  'Formatting and consistency',
  'Final review'
];

export const Checklist: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="checklist" ref={sectionRef} className="py-12 md:py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ecedef 0%, #e2e4e8 50%, #d8dbdf 100%)' }}>
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        <ScrollReveal className="text-center mb-16 md:mb-20">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/50 mb-4 block">
            Quality Control
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold text-dark tracking-tight leading-none mb-6">
            Listing Quality Checklist
          </h2>
          <p className="text-dark/70 text-lg md:text-xl font-body max-w-2xl mx-auto leading-relaxed">
            Every product listing goes through a strict review process to ensure accuracy, search visibility, and maximum conversion potential.
          </p>
          <div className="w-12 h-[2px] bg-yellow mt-8 mx-auto" />
        </ScrollReveal>

        <ScrollReveal staggerChildren={0.05} amount={0.2} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
          {checklistItems.map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, x: -15 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="flex items-center gap-4 bg-dark/[0.03] rounded-2xl p-5 border border-dark/5 hover:border-yellow hover:bg-yellow/5 transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              <div className="w-6 h-6 rounded-full bg-yellow/20 text-yellow flex items-center justify-center flex-shrink-0 group-hover:bg-yellow group-hover:text-dark transition-colors duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="font-body font-medium text-dark/80 text-sm md:text-base group-hover:text-dark transition-colors duration-300">
                {item}
              </span>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
};
