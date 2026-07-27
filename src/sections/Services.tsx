import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const services = [
  {
    title: 'Product Listing',
    desc: 'Accurate, optimized listings across leading marketplaces.',
    image: `${import.meta.env.BASE_URL}services-2026/product-listing-2026.png`,
    alt: 'Ecommerce virtual assistant building an optimized product listing at a modern workstation',
    objectPosition: '52% center',
  },
  {
    title: 'Product Research',
    desc: 'Clear product, competitor, and pricing insights.',
    image: `${import.meta.env.BASE_URL}services-2026/product-research-2026.png`,
    alt: 'Product samples and modern competitor research dashboards',
    objectPosition: '50% center',
  },
  {
    title: 'SEO & Optimization',
    desc: 'Search-ready titles and descriptions that improve visibility.',
    image: `${import.meta.env.BASE_URL}services-2026/seo-optimization-2026.png`,
    alt: 'Ecommerce SEO specialist reviewing keyword and search performance',
    objectPosition: '50% center',
  },
  {
    title: 'Inventory Management',
    desc: 'Accurate stock, pricing, and availability updates.',
    image: `${import.meta.env.BASE_URL}services-2026/inventory-management-2026.png`,
    alt: 'Inventory professional scanning ecommerce stock in an organized storeroom',
    objectPosition: '51% center',
  },
  {
    title: 'Order Fulfillment',
    desc: 'Reliable processing, tracking, and fulfillment support.',
    image: `${import.meta.env.BASE_URL}services-2026/order-fulfillment-2026.png`,
    alt: 'Hands preparing and labeling an ecommerce order for shipment',
    objectPosition: '50% center',
  },
  {
    title: 'Store Management',
    desc: 'Organized day-to-day support for smoother store operations.',
    image: `${import.meta.env.BASE_URL}services-2026/store-management-2026.png`,
    alt: 'Unified ecommerce store management dashboard with parcels and product samples',
    objectPosition: '50% center',
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
        left: '50%',
        x: '-50%',
        y: useTransform(yOffset, val => `calc(-50% + ${val}px)`),
        scale,
        opacity,
        filter,
        zIndex: index, // HIGHER index means it renders ON TOP of previous cards!
        transformOrigin: 'top center',
      }}
      className="absolute left-1/2 top-[58%] w-[calc(90*var(--vw))] max-w-[500px] overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] md:top-[60%] md:max-w-3xl"
    >
      <div className="flex aspect-[4/5] md:aspect-[16/10] w-full flex-col relative overflow-hidden h-full max-h-[calc(70*var(--vh))]">
         <img
           src={service.image}
           alt={service.alt}
           loading="lazy"
           decoding="async"
           className="absolute inset-0 h-full w-full object-cover"
           style={{ zIndex: 2, objectPosition: service.objectPosition }}
         />
         
         {/* Dark overlay at bottom for text */}
         <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/92 via-black/24 to-transparent" />
         
         {/* Text Content Overlay */}
         <div className="absolute bottom-0 z-20 flex w-full flex-col items-center justify-end p-6 pb-8 text-center md:p-10 md:pb-10">
           <h3 className="mb-2 font-display text-2xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl">
             {service.title}
           </h3>
           <p className="max-w-lg font-body text-sm leading-relaxed text-white/76 drop-shadow-md md:text-base">
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
      className="relative z-10 bg-black"
      // Canvas-space viewport heights — raw `vh` would be scaled twice by the
      // stage zoom and make the scroll track the wrong length.
      style={{ height: `calc(${services.length * 90} * var(--vh))` }}
    >

      <div className="sticky top-0 h-[calc(100*var(--vh))] w-full overflow-hidden">
        
        {/* Header - Positioned naturally in the flex flow so it never overlaps the cards */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[100] w-full pt-8 md:pt-12">
          <ScrollReveal className="text-center">
            <span className="mb-2 block font-ui text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow md:mb-3 md:text-[11px]">
              How I Help
            </span>
            <h2 className="font-serif-display text-[clamp(2.35rem,calc(5*var(--vw)),4.5rem)] font-bold leading-none tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
              My Services
            </h2>
          </ScrollReveal>
        </div>

        {/* Card Stack - Takes remaining space below header */}
        <div className="relative h-full w-full">
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
