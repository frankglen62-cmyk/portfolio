import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'My Project', href: '#portfolio' },
  { label: 'Skills', href: '#skills' },
];

interface NavbarProps {
  isVisible: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isVisible }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const timer = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        data-hero-nav
        aria-hidden={!isVisible}
        className={`fixed top-0 left-0 right-0 z-50 py-5 bg-transparent text-dark transition-[opacity,transform] duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 md:px-10 lg:px-12">
          <a
            href="#home"
            className="font-heading italic text-2xl md:text-[26px] text-dark"
          >
            Frank.
          </a>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-2 font-body text-[14px] font-medium text-dark/70 transition-colors duration-300 hover:text-dark"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:inline-flex font-body font-semibold text-[14px] rounded-full px-7 py-2.5 cursor-pointer bg-dark text-white hover:bg-black transition-colors duration-300"
          >
            Contact
          </motion.a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-6 h-[2px] block bg-dark"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-6 h-[2px] block bg-dark"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-6 h-[2px] block bg-dark"
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && isVisible && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-dark pt-24 px-8 flex flex-col justify-between pb-10"
          >
            <nav className="flex flex-col gap-2 mt-8" aria-label="Mobile navigation">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="font-display font-bold text-3xl text-white hover:text-gray-light py-3 border-b border-white/5 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 inline-flex items-center justify-center bg-white text-dark font-body font-semibold text-sm rounded-full py-4 cursor-pointer hover:bg-white/90 transition-colors w-full text-center"
            >
              Contact
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
