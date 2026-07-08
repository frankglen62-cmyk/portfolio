import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
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
  Scroll-Linked Card Component 
*/
const ScrollLinkedCard: React.FC<{
  service: typeof services[0];
  index: number;
  currentIndex: MotionValue<number>;
}> = ({ service, index, currentIndex }) => {
  const offsetIndex = useTransform(currentIndex, (current) => index - current);

  // yOffset: 
  // If offset > 0 (future cards), they wait at the bottom of the screen.
  // If offset < 0 (past cards), they move up slightly to stack behind.
  const yOffset = useTransform(offsetIndex, (offset) => {
    if (offset > 0) return offset * 1200; // Slide smoothly from far below screen
    return offset * 40; // Move up (negative offset = negative Y) to form a stack
  });

  const scale = useTransform(offsetIndex, (offset) => {
    if (offset > 0) return 1; // Stay full size while sliding up
    return Math.max(1 + (offset * 0.05), 0.8); // Shrink as it gets pushed back
  });

  const opacity = useTransform(offsetIndex, (offset) => {
    // Fade out slightly if it goes too far back, but keep mostly visible
    if (offset < -3) return Math.max(1 + ((offset + 3) * 0.5), 0);
    return 1;
  });

  const blurAmount = useTransform(offsetIndex, (offset) => {
    if (offset < 0) return Math.abs(offset) * 2; // Blur background cards
    return 0;
  });
  
  const filter = useTransform(blurAmount, (b) => `blur(${b}px)`);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        x: '-50%',
        y: useTransform(yOffset, val => `calc(-50% + ${val}px)`),
        scale,
        opacity,
        filter,
        zIndex: index, // HIGHER index means it renders ON TOP of previous cards!
        transformOrigin: 'top center',
      }}
      className="w-[90vw] max-w-[500px] md:max-w-3xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-[#1a1a1a]"
    >
      <div className="flex aspect-[4/5] md:aspect-[16/10] w-full flex-col relative overflow-hidden h-full max-h-[70vh]">
         {/* Blurred background image layer for smooth UI feel */}
         <img
           src={service.image}
           className="absolute inset-0 h-full w-full object-cover scale-110"
           style={{ filter: "blur(20px)", zIndex: 1, opacity: 0.6 }}
         />
         {/* Main image */}
         <img
           src={service.image}
           className="absolute inset-0 h-full w-full object-cover"
           style={{ zIndex: 2 }}
         />
         
         {/* Dark overlay at bottom for text */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
         
         {/* Text Content Overlay */}
         <div className="absolute bottom-0 w-full flex flex-col items-center justify-end p-6 md:p-10 text-center z-20 pb-10">
           <h3 className="font-display font-bold text-white text-2xl md:text-4xl leading-tight mb-2 drop-shadow-lg">
             {service.title}
           </h3>
           <p className="font-body text-white/80 text-sm md:text-lg max-w-lg line-clamp-3 md:line-clamp-none drop-shadow-md">
             {service.desc}
           </p>
         </div>
      </div>
    </motion.div>
  );
};

/* ─── Services Section ─── */
export const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Apply a spring to the scroll progress to make the movement buttery smooth
  // even if the user uses a stepped mouse wheel.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.5,
    restDelta: 0.001
  });

  // We add a small buffer at the start (0.1) so the first card doesn't fly away instantly
  // when the user arrives at the section. We also add a buffer at the end (0.9).
  const currentIndex = useTransform(
    smoothProgress, 
    [0, 0.1, 0.9, 1], 
    [0, 0, services.length - 1, services.length - 1]
  );

  return (
    <section
      id="services"
      ref={sectionRef}
      className="bg-dark relative z-10"
      style={{ height: `${services.length * 90}vh` }} // Taller container to account for the buffers
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center overflow-hidden">
        
        {/* Header - Positioned naturally in the flex flow so it never overlaps the cards */}
        <div className="w-full flex-shrink-0 pt-20 md:pt-32 pb-4 z-50 pointer-events-none">
          <ScrollReveal className="text-center">
            <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow mb-2 md:mb-4 block">
              How I Help
            </span>
            <h2 className="font-serif-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-white tracking-tight leading-none">
              My Services
            </h2>
          </ScrollReveal>
        </div>

        {/* Card Stack - Takes remaining space below header */}
        <div className="relative flex-1 w-full flex items-center justify-center">
          {services.map((service, index) => (
            <ScrollLinkedCard
              key={service.title}
              service={service}
              index={index}
              currentIndex={currentIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
