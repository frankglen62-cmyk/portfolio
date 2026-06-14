import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const services = [
  {
    title: 'Product Listing',
    desc: 'Accurate and optimized product listing and cross-listing across eBay, Poshmark, Amazon, and Shopify.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Product Research',
    desc: 'Research profitable and in-demand products for your store to ensure winning items.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'SEO & Optimization',
    desc: 'Create accurate, keyword-rich titles and descriptions to boost visibility and conversions.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Inventory Management',
    desc: 'Manage inventory, monitor product availability, and ensure listings are always up to date.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Order Fulfillment',
    desc: 'Assist with daily order processing, fulfillment tasks, and comprehensive dropshipping support.',
    image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Store Management',
    desc: 'Support your day-to-day eCommerce store operations including competitor analysis.',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80',
  },
];

/* 
  Card Component 
  Receives the global scroll progress of the entire section.
*/
const ServiceCard: React.FC<{
  service: typeof services[0];
  index: number;
  totalCards: number;
  progress: MotionValue<number>;
}> = ({ service, index, totalCards, progress }) => {
  
  // Calculate when this specific card should start shrinking.
  const startShrink = index / totalCards;
  
  // The card shrinks continuously as you scroll further down.
  const scale = useTransform(progress, [startShrink, 1], [1, 0.85]);

  return (
    <motion.div
      style={{
        position: 'sticky',
        // Smaller offset (12px) ensures the total accumulated offset across all cards 
        // doesn't exceed the top padding, preventing text from peeking out!
        top: `calc(15vh + ${index * 12}px)`,
        zIndex: index + 1,
        scale: index === totalCards - 1 ? 1 : scale,
        transformOrigin: 'top center',
      }}
      className="w-full max-w-6xl mx-auto flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-white/5"
    >
      {/* 
        Force the card to be WIDE and SHORT
        Added generous top padding (pt-14 md:pt-20) to ensure the text starts low enough 
        that it won't be visible in the exposed "tabs" when cards stack.
      */}
      <div className="flex-[0.45] px-10 md:px-16 pt-14 md:pt-20 pb-10 md:pb-16 flex flex-col justify-center bg-white min-h-[300px] md:h-[400px]">
        <h3 className="font-display font-bold text-3xl md:text-4xl lg:text-[2.5rem] text-dark mb-4 md:mb-6 tracking-tight leading-tight">
          {service.title}
        </h3>
        <p className="font-body text-base md:text-lg text-dark/70 leading-relaxed max-w-md">
          {service.desc}
        </p>
      </div>

      <div className="flex-[0.55] relative overflow-hidden group min-h-[250px] md:h-[400px]">
        <img
          src={service.image}
          alt={service.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </motion.div>
  );
};

/* ─── Services Section ─── */
export const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Track the scroll progress of the ENTIRE section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // "start end" means progress=0 when top of section hits bottom of screen
    // "end end" means progress=1 when bottom of section hits bottom of screen
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-24 md:py-40 bg-dark relative z-10"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <ScrollReveal className="text-center mb-16 md:mb-24">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow mb-4 block">
            How I Help
          </span>
          <h2 className="font-serif-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-white tracking-tight leading-none mb-6">
            My Services
          </h2>
        </ScrollReveal>

        {/* 
          Stacking Container 
          Normal gap (40px). Removed huge bottom padding so it transitions cleanly to the next page.
        */}
        <div className="flex flex-col gap-10 pb-10 relative">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={index}
              totalCards={services.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
