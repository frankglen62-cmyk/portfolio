import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-dark py-3 shadow-md text-white' : 'py-5 bg-transparent text-dark'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className={`font-heading text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-white' : 'text-dark'}`}>
            Frank Glen Martin
          </a>

          {/* Desktop Nav — center pill like Prolific */}
          <nav className={`hidden md:flex items-center rounded-full px-2 py-1.5 gap-1 transition-colors duration-300 ${scrolled ? 'bg-white/5' : 'bg-dark/5'}`}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`font-ui text-[11px] font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 ${
                  scrolled 
                    ? 'text-white/70 hover:text-white hover:bg-white/10' 
                    : 'text-dark/70 hover:text-dark hover:bg-dark/5'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`hidden md:inline-flex font-ui font-bold text-[10px] uppercase tracking-wider rounded-full px-6 py-2.5 cursor-pointer transition-colors duration-300 ${
              scrolled 
                ? 'bg-yellow text-dark hover:bg-yellow-soft' 
                : 'bg-dark text-white hover:bg-black'
            }`}
          >
            Hire Me
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
      </motion.header>

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
                  className="font-display font-bold text-3xl text-white hover:text-yellow py-3 border-b border-white/5 transition-colors"
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
              className="mt-10 inline-flex items-center justify-center bg-yellow text-dark font-ui font-bold text-xs uppercase tracking-wider rounded-full py-4 cursor-pointer hover:bg-yellow-soft transition-colors w-full text-center"
            >
              Hire Me
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
