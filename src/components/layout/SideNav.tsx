import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'INTRO', num: '00' },
  { id: 'about', label: 'BACKGROUND', num: '01' },
  { id: 'services', label: 'SERVICES', num: '02' },
  { id: 'skills', label: 'SKILLS', num: '03' },
  { id: 'tools', label: 'TOOLS', num: '04' },
  { id: 'portfolio', label: 'MY PROJECT', num: '05' },
  { id: 'contact', label: 'CONTACT', num: '06' },
];

interface SideNavProps {
  isVisible: boolean;
}

export const SideNav: React.FC<SideNavProps> = ({ isVisible }) => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 809px)').matches : false
  ));
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 809px)');
    const sync = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    // Set up intersection observer to highlight active section
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', // Trigger when section is in upper middle of screen
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all nav targets
    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Re-run observer setup after a short delay to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      navItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element && observerRef.current) {
          observerRef.current.observe(element);
        }
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToPosition = (targetY: number) => {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === 'home') {
      scrollToPosition(0);
      setActiveSection('home');
      return;
    }
    
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY;
      scrollToPosition(y);
      setActiveSection(id);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mobile-side-nav fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 md:bottom-auto md:left-8 md:top-1/2 md:-translate-x-0 md:-translate-y-1/2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div 
            layout
            className="relative flex flex-row items-center gap-1 px-3 py-2 max-[360px]:gap-0 max-[360px]:px-2 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden md:flex-col md:items-stretch md:gap-0 md:px-3 md:py-6"
            role="navigation"
            aria-label="Section navigation"
            animate={{
              width: isMobile ? 'auto' : isHovered ? [44, 280, 220] : 44,
              borderRadius: isMobile ? 999 : isHovered ? [30, 140, 30] : 30,
            }}
            transition={{
              duration: 0.75,
              times: [0, 0.4, 1],
              ease: ["easeInOut", "backOut"]
            }}
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  aria-label={`Go to ${item.label.toLowerCase()}`}
                  aria-current={isActive ? 'page' : undefined}
                  className="group relative z-10 flex h-10 w-9 items-center justify-center outline-none max-[360px]:w-8 md:my-[2px] md:h-auto md:w-full md:justify-start md:py-2"
                >
                  {/* Subtle Active Pill Background (Reference Style) */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 md:inset-y-0 md:-left-1 md:-right-1 bg-dark/5 rounded-full z-0 pointer-events-none"
                  />

                  {/* Number - Fixed Width Container to keep aligned when thin */}
                  <div className="min-w-[20px] flex justify-center flex-shrink-0 z-10">
                    <span
                      style={{ fontFamily: '"Archivo", sans-serif', fontSize: '10.5px', letterSpacing: '2.31px' }}
                      className={`transition-all duration-300 font-normal ${
                        isActive ? 'text-dark group-hover:font-bold' : 'text-dark/40 group-hover:text-dark/80 group-hover:font-bold'
                      }`}
                    >
                      {item.num}
                    </span>
                  </div>

                  {/* Expanded Content (Line + Title) - Only visible on hover */}
                  <div
                    className="hidden md:flex items-center absolute left-[20px] right-0 whitespace-nowrap overflow-hidden transition-opacity duration-300 z-10"
                    style={{ opacity: !isMobile && isHovered ? 1 : 0, pointerEvents: !isMobile && isHovered ? 'auto' : 'none' }}
                  >
                    {/* Connecting Line - Kept thin (h-[1px]) */}
                    <span
                      className={`h-[1px] mx-3 transition-all duration-300 rounded-full flex-shrink-0 ${
                        isActive ? 'bg-dark/80 w-6 group-hover:bg-dark' : 'bg-dark/20 w-4 group-hover:bg-dark/40 group-hover:w-5'
                      }`}
                    />
                    
                    {/* Title */}
                    <span
                      style={{ fontFamily: '"Archivo", sans-serif', fontSize: '10.5px', letterSpacing: '2.31px' }}
                      className={`uppercase transition-all duration-300 origin-left font-normal ${
                        isActive ? 'text-dark group-hover:font-bold' : 'text-dark/40 group-hover:text-dark/80 group-hover:font-bold'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </a>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
