import React, { useRef } from 'react';
import { motion } from 'framer-motion';
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
    <section id="ecommerce-platforms" ref={sectionRef} className="overflow-hidden" style={{ background: '#d8dbdf' }}>
      <div className="relative z-10 w-full mx-auto">

        {/* Infinite Marquee Section */}
        <div className="w-full relative py-4 md:py-5 border-y border-dark/10 bg-white/30 backdrop-blur-sm overflow-hidden flex flex-col items-center">
          
          <span className="font-ui text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-dark/40 mb-3 z-20 relative">
            E-Commerce Experience
          </span>
          
          <div className="relative w-full flex items-center">
            {/* Edge Gradients for SaaS look */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-[#d8dbdf] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-[#d8dbdf] to-transparent z-10 pointer-events-none" />

          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 35 
            }}
            className="flex items-center gap-10 md:gap-20 px-4 w-max"
          >
            {marqueeItems.map((platform, idx) => (
              <div 
                key={`${platform.name}-${idx}`} 
                className="flex flex-col items-center gap-2 cursor-default group min-w-[100px]"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-500">
                  <CustomIcon 
                    src={`/icons/ecommerce/${platform.id}`} 
                    alt={platform.name} 
                    className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-sm grayscale group-hover:grayscale-0"
                  />
                </div>
                <span className="font-ui text-xs font-semibold text-dark/60 tracking-wider group-hover:text-dark transition-colors duration-300">
                  {platform.name}
                </span>
              </div>
            ))}
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
