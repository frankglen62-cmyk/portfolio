import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'INTRO', num: '00' },
  { id: 'about', label: 'BACKGROUND', num: '01' },
  { id: 'services', label: 'SERVICES', num: '02' },
  { id: 'skills', label: 'SKILLS', num: '03' },
  { id: 'ecommerce-platforms', label: 'ECOMMERCE', num: '04' },
  { id: 'portfolio', label: 'MY PROJECT', num: '05' },
  { id: 'contact', label: 'CONTACT', num: '06' },
];

export const SideNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Scroll visibility logic: Show only from Services section down to the bottom
  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        // Trigger visibility when scrolling near the Services section
        if (window.scrollY >= servicesSection.offsetTop - window.innerHeight * 0.6) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        // Fallback
        setIsVisible(window.scrollY > window.innerHeight * 0.8);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === 'home') {
      // Force scroll to absolute top for Intro
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('home');
      return;
    }
    
    const element = document.getElementById(id);
    if (element) {
      // Calculate exact position to scroll perfectly
      const y = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'smooth' });
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
          className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[60]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div 
            layout
            className="relative flex flex-col py-6 px-3 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden"
            animate={{
              width: isHovered ? [44, 280, 220] : (hasMounted.current ? [220, 120, 44] : 44),
              borderRadius: isHovered ? [30, 140, 30] : (hasMounted.current ? [30, 80, 30] : 30),
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
                  className="group relative flex items-center py-2 my-[2px] z-10 w-full outline-none"
                >
                  {/* Subtle Active Pill Background (Reference Style) */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-y-0 -left-1 -right-1 bg-dark/5 rounded-full z-0 pointer-events-none"
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
                    className="flex items-center absolute left-[20px] right-0 whitespace-nowrap overflow-hidden transition-opacity duration-300 z-10"
                    style={{ opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none' }}
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

