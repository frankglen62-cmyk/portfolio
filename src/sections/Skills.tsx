import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const skillCategories = [
  {
    title: 'Product & Market Research',
    items: ['Product Research', 'Online Research', 'Competitor Analysis'],
  },
  {
    title: 'Listing Optimization',
    items: ['Title Building and SEO Optimization', 'Product Title and Description Optimization', 'SEO Keyword Research', 'Description Writing'],
  },
  {
    title: 'Store & Order Management',
    items: ['Store Management', 'Inventory Management', 'Order Fulfillment', 'eCommerce Marketing Support'],
  },
  {
    title: 'Platform Expertise',
    items: ['Amazon Product Listing', 'Shopify Store Setup', 'eBay Dropshipping Support', 'Poshmark Product Listing', 'Cross Posting', 'Product Listing'],
  },
];

// Helper to animate words sequentially
const StaggeredText: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(' ');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <span ref={ref} className="inline-flex flex-wrap gap-x-[0.3em]">
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            initial={{ y: '100%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export const Skills: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="skills" ref={sectionRef} className="py-28 md:py-40 bg-white relative overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/60 mb-4 block"
          >
            What I Do Best
          </motion.span>
          <h2 className="font-serif-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-dark tracking-tight leading-none mb-6">
            <StaggeredText text="Personal Skills" />
          </h2>
        </div>

        {/* Minimalist Editorial List */}
        <div className="flex flex-col border-t border-dark/10">
          {skillCategories.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
              className="py-12 md:py-16 border-b border-dark/10 group flex flex-col md:flex-row md:items-start gap-6 md:gap-12 transition-colors duration-500 hover:bg-dark/[0.02]"
            >
              {/* Index Number */}
              <div className="font-ui text-sm font-medium text-dark/30 w-12 hidden md:block">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              
              {/* Category Title */}
              <div className="flex-1">
                <h3 className="font-serif-display font-bold text-3xl md:text-5xl text-dark tracking-tight group-hover:pl-4 transition-all duration-500 ease-out">
                  {cat.title}
                </h3>
              </div>

              {/* Skills Items */}
              <div className="flex-1 md:max-w-md pt-2">
                <ul className="flex flex-wrap gap-2">
                  {cat.items.map((item, i) => (
                    <motion.li 
                      key={item}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + (i * 0.05), duration: 0.5 }}
                      className="px-4 py-2 bg-cream text-dark/80 text-sm font-medium rounded-full border border-dark/5"
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
