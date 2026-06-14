import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { CustomIcon } from '../components/CustomIcon';

const platforms = [
  { name: 'Amazon', id: 'amazon.png' },
  { name: 'eBay', id: 'ebay.png' },
  { name: 'Shopify', id: 'shopify.svg' },
  { name: 'Walmart', id: 'walmart.png' },
  { name: 'Etsy', id: 'etsy.png' },
  { name: 'AliExpress', id: 'aliexpress.png' },
];

export const EcommercePlatforms: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Duplicate platforms to ensure a seamless infinite loop that spans ultra-wide screens
  const marqueeItems = [...platforms, ...platforms, ...platforms, ...platforms];

  return (
    <section id="ecommerce-platforms" ref={sectionRef} className="pt-20 md:pt-32 pb-0 bg-white relative overflow-hidden">
      <div className="relative z-10 w-full mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16 md:mb-24 px-6 max-w-6xl mx-auto">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/50 mb-4 block">
            E-Commerce Experience
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold text-dark tracking-wide uppercase">
            E-commerce Platforms
          </h2>
          <div className="w-12 h-[2px] bg-yellow mt-5 mx-auto" />
        </ScrollReveal>

        {/* Infinite Marquee Section */}
        <div className="w-full relative py-12 md:py-16 border-y border-dark/10 bg-white/50 overflow-hidden flex items-center">
          
          {/* Edge Gradients for SaaS look */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 35 
            }}
            className="flex items-center gap-16 md:gap-28 px-8 w-max"
          >
            {marqueeItems.map((platform, idx) => (
              <div 
                key={`${platform.name}-${idx}`} 
                className="flex flex-col items-center gap-6 cursor-default group min-w-[120px]"
              >
                <div className="w-20 h-20 md:w-[90px] md:h-[90px] flex items-center justify-center transition-all duration-500">
                  <CustomIcon 
                    src={`/icons/ecommerce/${platform.id}`} 
                    alt={platform.name} 
                    className="w-full h-full object-contain transition-all duration-500 group-hover:scale-125 drop-shadow-sm"
                  />
                </div>
                <span className="font-ui text-[11px] font-bold uppercase tracking-[0.2em] text-dark/30 transition-colors duration-300 group-hover:text-dark text-center whitespace-nowrap">
                  {platform.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
