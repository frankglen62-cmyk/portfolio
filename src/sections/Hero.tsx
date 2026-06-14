import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTypewriter } from '../hooks/useTypewriter';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  isLoaded: boolean;
}

const icons = {
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="currentColor">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="currentColor">
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
    </svg>
  ),
  store: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="currentColor">
      <path d="M3 9h18v2H3z"></path>
      <path d="M3 9l2-5h14l2 5"></path>
      <path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path>
      <path d="M10 22v-5h4v5"></path>
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
};

import { AmazonLogo, ShopifyLogo, EbayLogo, WalmartLogo, EtsyLogo } from '../components/LogoComponents';

export const Hero: React.FC<HeroProps> = ({ isLoaded }) => {
  const sectionRef = useRef<HTMLElement>(null);

  const typedRole = useTypewriter([
    "E-commerce Virtual Assistant",
    "eBay Dropshipping/Lister",
    "Cross Posting",
    "Poshmark Lister",
    "Product Researcher",
    "Shopify Product Lister/Researcher",
    "Amazon Lister/Product Researcher",
    "Product Listing Optimization"
  ]);

  const ease = [0.16, 1, 0.3, 1] as const;

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
  };

  // Marquee brand elements rendered as styled text + icons
  const marqueeLogoBrands = [
    { type: 'brand', key: 'amazon', element: <AmazonLogo monochrome={true} className="h-6 w-auto object-contain text-dark" /> },
    { type: 'dot', key: 'd1' },
    { type: 'brand', key: 'shopify', element: <ShopifyLogo monochrome={true} className="h-7 w-auto object-contain text-dark" /> },
    { type: 'dot', key: 'd2' },
    { type: 'brand', key: 'ebay', element: <EbayLogo monochrome={true} className="h-8 w-auto object-contain text-dark" /> },
    { type: 'dot', key: 'd3' },
    { type: 'brand', key: 'walmart', element: <WalmartLogo monochrome={true} className="h-6 w-auto object-contain text-dark" /> },
    { type: 'dot', key: 'd4' },
    { type: 'brand', key: 'etsy', element: <EtsyLogo monochrome={true} className="h-6 w-auto object-contain text-dark" /> },
    { type: 'dot', key: 'd5' },
    { type: 'text', key: 'pr', label: 'Product Research', icon: icons.search },
    { type: 'dot', key: 'd6' },
    { type: 'text', key: 'pl', label: 'Product Listing', icon: icons.list },
    { type: 'dot', key: 'd7' },
    { type: 'text', key: 'sm', label: 'Store Management', icon: icons.store },
    { type: 'dot', key: 'd8' },
  ];

  const repeatedMarquee = [...marqueeLogoBrands, ...marqueeLogoBrands, ...marqueeLogoBrands, ...marqueeLogoBrands];

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen bg-[#f6df6b] overflow-hidden flex flex-col justify-between"
    >
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">

          {/* LEFT SIDE — Text Content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            className="flex flex-col items-start text-left z-20 relative"
          >
            {/* The White Burst Background (Intro Animation Only) */}
            <div className="absolute top-[25%] -left-[10%] md:top-[38%] md:-left-[15%] -z-10 pointer-events-none">
              <motion.div 
                initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                animate={isLoaded ? { rotate: 0, scale: 1, opacity: 1 } : { rotate: -180, scale: 0.5, opacity: 0 }} 
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="relative w-[380px] h-[380px] md:w-[520px] md:h-[520px] flex items-center justify-center"
              >
                {/* 
                  Perfect smooth wavy badge using an SVG path generated by polar coordinates 
                  r(theta) = baseRadius + amplitude * sin(points * theta)
                */}
                <svg viewBox="0 0 500 500" className="w-full h-full text-white fill-current">
                  <path d={(() => {
                    const points = 15; // Number of scallops (15 waves)
                    const baseRadius = 220;
                    const amplitude = 10; // Softer spike
                    const center = 250;
                    const resolution = 360;
                    let path = "";
                    for (let i = 0; i <= resolution; i++) {
                      const theta = (i * Math.PI * 2) / resolution;
                      const r = baseRadius + amplitude * Math.sin(points * theta);
                      const x = center + r * Math.cos(theta);
                      const y = center + r * Math.sin(theta);
                      if (i === 0) path += `M ${x} ${y} `;
                      else path += `L ${x} ${y} `;
                    }
                    path += "Z";
                    return path;
                  })()} />
                </svg>
              </motion.div>
            </div>

            {/* Small uppercase tagline with dot */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2 font-ui font-bold text-[11px] tracking-[0.15em] uppercase text-dark mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-dark block"></span>
              AVAILABLE FOR FREELANCE PROJECTS
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-[clamp(3.5rem,7vw,6.5rem)] leading-[1] tracking-tight text-dark mb-5"
            >
              Hi, I’m <br />Frank Glen Martin
            </motion.h1>

            <motion.h2
              variants={fadeUp}
              className="font-display font-semibold text-[22px] md:text-3xl text-dark mb-8 flex items-center tracking-tight h-[36px] md:h-[40px]"
            >
              {typedRole} <span className="ml-1 animate-pulse font-light text-dark">|</span>
            </motion.h2>

            {/* Subtext paragraph */}
            <motion.p
              variants={fadeUp}
              className="font-body text-base md:text-[17px] text-dark/80 max-w-[460px] mb-10 leading-relaxed font-medium"
            >
              With 2 years of experience helping online sellers, I specialize in product research, product listing, store management, and marketplace support across multiple platforms.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-8">
              <motion.a
                href="#portfolio"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-dark text-white font-ui font-bold text-[13px] rounded-full px-8 py-4 shadow-lg cursor-pointer hover:bg-black transition-colors tracking-wide"
              >
                View My Work <span>→</span>
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-transparent border-[1.5px] border-dark text-dark font-ui font-bold text-[13px] rounded-full px-8 py-4 cursor-pointer hover:bg-dark/5 transition-colors tracking-wide"
              >
                Let's Work Together <span>→</span>
              </motion.a>
            </motion.div>

            {/* Download Resume */}
            <motion.a
              variants={fadeUp}
              href="#"
              className="inline-flex items-center gap-2 font-ui font-semibold text-[13px] text-dark hover:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Resume
            </motion.a>
          </motion.div>

          {/* RIGHT SIDE — Image and Floating Badges */}
          <motion.div
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1, transition: { duration: 1, ease, delay: 0.35 } }
            }}
            className="relative flex items-center justify-center lg:justify-end mt-12 lg:mt-0 w-full"
          >
            {/* Container for the image and attached badges */}
            <div className="relative w-full max-w-[380px] mx-auto lg:mr-16 z-10">
              
              {/* The photo container */}
              <div className="relative w-full aspect-[3/4.5] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center overflow-hidden">
                <img 
                  src="/frank-profile.jpg" 
                  alt="Frank Glen Martin" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* FLOATING BADGES (Attached to the container via absolute positioning) */}
              
              {/* Amazon */}
              <motion.div 
                animate={{ y: [-4, 4, -4] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[12%] -left-12 md:-left-16 bg-white px-5 py-3 rounded-[1rem] shadow-xl border border-dark/5 z-20 flex items-center"
              >
                <AmazonLogo monochrome={false} className="h-5 md:h-6 w-auto object-contain" />
              </motion.div>
              
              {/* Shopify */}
              <motion.div 
                animate={{ y: [4, -4, 4] }} transition={{ duration: 5.1, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[42%] -left-16 md:-left-20 bg-white px-5 py-3 rounded-[1rem] shadow-xl border border-dark/5 z-20 flex items-center"
              >
                <ShopifyLogo monochrome={false} className="h-6 md:h-7 w-auto object-contain" />
              </motion.div>

              {/* eBay */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[72%] -left-10 md:-left-14 bg-white px-5 py-3 rounded-[1rem] shadow-xl border border-dark/5 z-20 flex items-center"
              >
                <EbayLogo monochrome={false} className="h-6 md:h-8 w-auto object-contain" />
              </motion.div>

              {/* Product Research */}
              <motion.div 
                animate={{ y: [5, -5, 5] }} transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[8%] -right-16 md:-right-24 bg-white p-2 pr-6 rounded-full shadow-xl border border-dark/5 z-20 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#f6df6b] flex items-center justify-center text-dark">
                  {icons.search}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">Product</span>
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">Research</span>
                </div>
              </motion.div>

              {/* Product Listing */}
              <motion.div 
                animate={{ y: [-4, 4, -4] }} transition={{ duration: 4.3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[32%] -right-14 md:-right-20 bg-white p-2 pr-6 rounded-full shadow-xl border border-dark/5 z-20 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#f6df6b] flex items-center justify-center text-dark">
                  {icons.list}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">Product</span>
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">Listing</span>
                </div>
              </motion.div>

              {/* Store Management */}
              <motion.div 
                animate={{ y: [4, -4, 4] }} transition={{ duration: 4.9, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[56%] -right-20 md:-right-28 bg-white p-2 pr-6 rounded-full shadow-xl border border-dark/5 z-20 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#f6df6b] flex items-center justify-center text-dark">
                  {icons.store}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">Store</span>
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">Management</span>
                </div>
              </motion.div>

              {/* 2+ Years Experience */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }} transition={{ duration: 5.3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[80%] -right-16 md:-right-24 bg-white p-2 pr-6 rounded-full shadow-xl border border-dark/5 z-20 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#f6df6b] flex items-center justify-center text-dark">
                  {icons.star}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">2+ Years</span>
                  <span className="font-ui font-semibold text-dark text-[11px] leading-tight">Experience</span>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom Marquee Banner */}
      <div className="w-full relative py-5 border-y border-dark/10 overflow-hidden flex items-center bg-[#f6df6b]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 40 
          }}
          className="flex items-center gap-8 md:gap-10 w-max"
        >
          {repeatedMarquee.map((item, idx) => (
            <div key={idx} className="flex items-center justify-center shrink-0">
              {item.type === 'brand' && item.element}
              {item.type === 'text' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark text-[#f6df6b] flex items-center justify-center">
                    <div className="scale-75">{item.icon}</div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-ui font-bold text-dark text-[10px] uppercase tracking-widest leading-none mb-0.5">{item.label?.split(' ')[0]}</span>
                    <span className="font-ui font-bold text-dark text-[10px] uppercase tracking-widest leading-none">{item.label?.split(' ').slice(1).join(' ')}</span>
                  </div>
                </div>
              )}
              {item.type === 'dot' && (
                <div className="w-1.5 h-1.5 rounded-full bg-dark mx-4 md:mx-6"></div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
