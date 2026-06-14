import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-white text-dark py-16 relative overflow-hidden border-t border-dark/5">
      <ScrollReveal className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-3 text-dark">Frank Glen Martin</h3>
            <p className="text-sm text-dark/60 leading-relaxed max-w-xs font-body">
              Freelance Virtual Assistant helping businesses stay organized, efficient, and scalable.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-ui text-[10px] font-bold uppercase tracking-[0.3em] text-dark/40 mb-5">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              {['About', 'Services', 'Portfolio', 'Skills', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-sm text-dark/70 hover:text-yellow transition-colors font-body"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-ui text-[10px] font-bold uppercase tracking-[0.3em] text-dark/40 mb-5">Work With Me</h4>
            <p className="text-sm text-dark/60 leading-relaxed mb-5 font-body">
              Ready to take your business to the next level? Let's connect.
            </p>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-dark text-white font-ui font-bold text-[10px] uppercase tracking-wider rounded-full px-6 py-3 cursor-pointer hover:bg-black transition-colors"
            >
              Get Started
            </motion.a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark/40 font-ui">
            © {currentYear} Frank Glen Martin. All rights reserved.
          </p>
          <p className="text-xs text-dark/30 font-ui">
            Designed with ❤️
          </p>
        </div>
      </ScrollReveal>
    </footer>
  );
};

