import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

export const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="contact" ref={sectionRef} className="py-24 md:py-36 bg-dark relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16 md:mb-24">
          <span className="font-ui text-[10px] font-bold uppercase tracking-[0.3em] text-yellow mb-3 block">
            Get in Touch
          </span>
          <h2 className="font-serif-display text-[clamp(2rem,4vw,3.5rem)] font-bold text-white tracking-wide uppercase">
            LET'S WORK TOGETHER
          </h2>
          <div className="w-16 h-[2px] bg-yellow mt-4 mx-auto" />
        </ScrollReveal>

        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          {/* Contact Info */}
          <ScrollReveal delay={0.1}>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-6">
              Ready to streamline your business?
            </h3>
            <p className="text-base text-white/60 leading-relaxed mb-12 font-body max-w-xl mx-auto">
              Whether you need help with admin tasks, social media, or full virtual assistant support — I'm here to help you scale efficiently.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-dark-soft border border-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📧</div>
                <div>
                  <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Email</p>
                  <p className="font-body text-white font-medium text-lg">agnesann.va@gmail.com</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-dark-soft border border-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📍</div>
                <div>
                  <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Location</p>
                  <p className="font-body text-white font-medium text-lg">Philippines (Remote)</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-dark-soft border border-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-sm">⏰</div>
                <div>
                  <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Availability</p>
                  <p className="font-body text-white font-medium text-lg">Mon – Sat, Flexible Hours</p>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="flex justify-center gap-4 mt-16">
              {[
                { name: 'Facebook', url: 'https://www.facebook.com/itsmeyow11/' },
                { name: 'Instagram', url: 'https://www.instagram.com/fnkgln/?hl=en' },
                { name: 'LinkedIn', url: '#' },
                { name: 'TikTok', url: 'https://www.tiktok.com/@itzyearl' },
                { name: 'YouTube', url: 'https://www.youtube.com/@TunogTriviaPH' }
              ].map((s) => (
                <motion.a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-12 h-12 bg-dark-soft text-white border border-white/5 rounded-full flex items-center justify-center font-ui text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-yellow hover:text-dark transition-all duration-300"
                  title={s.name}
                >
                  {s.name[0]}
                </motion.a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

