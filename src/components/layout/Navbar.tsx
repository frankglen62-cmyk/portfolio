import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'My Project', href: '#portfolio' },
  { label: 'Skills', href: '#skills' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        data-hero-nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          scrolled ? 'glass-dark py-3 shadow-md text-white' : 'py-5 bg-transparent text-dark'
        }`}
      >
        <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between">
          <a
            href="#home"
            className={`font-heading italic text-2xl md:text-[26px] transition-colors duration-300 ${scrolled ? 'text-white' : 'text-dark'}`}
          >
            Frank.
          </a>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`font-body text-[14px] font-medium transition-colors duration-300 ${scrolled ? 'text-white/70 hover:text-white' : 'text-dark/70 hover:text-dark'}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`hidden md:inline-flex font-body font-semibold text-[14px] rounded-full px-7 py-2.5 cursor-pointer transition-colors duration-300 ${scrolled ? 'bg-white text-dark hover:bg-white/90' : 'bg-dark text-white hover:bg-black'}`}
          >
            Contact
          </motion.a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className={`w-6 h-[2px] block transition-colors duration-300 ${scrolled ? 'bg-white' : 'bg-dark'}`}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className={`w-6 h-[2px] block transition-colors duration-300 ${scrolled ? 'bg-white' : 'bg-dark'}`}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className={`w-6 h-[2px] block transition-colors duration-300 ${scrolled ? 'bg-white' : 'bg-dark'}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-dark pt-24 px-8 flex flex-col justify-between pb-10"
          >
            <nav className="flex flex-col gap-2 mt-8">
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
