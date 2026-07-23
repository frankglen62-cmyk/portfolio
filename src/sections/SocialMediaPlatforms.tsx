import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

import { CustomIcon } from '../components/CustomIcon';

const platforms = [
  { name: 'Facebook', id: 'facebook.svg', url: 'https://www.facebook.com/itsmeyow11/' },
  { name: 'Instagram', id: 'instagram.svg', url: 'https://www.instagram.com/fnkgln/?hl=en' },
  { name: 'TikTok', id: 'tiktok.svg', url: 'https://www.tiktok.com/@itzyearl' },
  { name: 'LinkedIn', id: 'linkedin.svg' },
  { name: 'Pinterest', id: 'pinterest.svg' },
  { name: 'Threads', id: 'threads.svg' },
  { name: 'YouTube', id: 'youtube.svg', url: 'https://www.youtube.com/@TunogTriviaPH' },
  { name: 'X (Twitter)', id: 'x.svg' },
];

export const SocialMediaPlatforms: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="social-platforms" ref={sectionRef} className="overflow-hidden bg-[#d8dbdf] pb-12 pt-28 md:pb-16 md:pt-40">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16 md:mb-20">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/50 mb-4 block">
            Platforms I Manage
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold text-dark tracking-wide uppercase">
            Social Media Platforms
          </h2>
          <div className="w-12 h-[2px] bg-dark/20 mt-5 mx-auto" />
        </ScrollReveal>

        {/* Platforms Grid — branded circles (Staggered ScrollReveal) */}
        <ScrollReveal
          staggerChildren={0.06}
          className="grid grid-cols-2 sm:grid-cols-4 gap-10 max-w-3xl mx-auto"
        >
          {platforms.map((platform) => {
            const PlatformItem = platform.url ? motion.a : motion.div;

            return (
            <PlatformItem
              key={platform.name}
              {...(platform.url
                ? { href: platform.url, target: '_blank', rel: 'noreferrer' }
                : { 'aria-label': `${platform.name} profile coming soon` })}
              variants={{
                hidden: { opacity: 0, scale: 0.5, y: 50 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.5, duration: 0.8 } },
              }}
              whileHover={{ y: -8, scale: 1.08 }}
              className={`group flex flex-col items-center gap-4 ${platform.url ? 'cursor-pointer' : 'cursor-default opacity-75'}`}
            >
              <div className="w-20 h-20 md:w-[88px] md:h-[88px] flex items-center justify-center transition-all duration-300">
                <CustomIcon src={`${import.meta.env.BASE_URL}icons/social/${platform.id}`} alt={platform.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-125" />
              </div>
              <span className="font-ui text-[11px] font-semibold uppercase tracking-wider text-dark/50 transition-colors group-hover:text-dark">
                {platform.name}
              </span>
            </PlatformItem>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
};

