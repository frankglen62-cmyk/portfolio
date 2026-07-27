import React from 'react';
import { Camera, Play, Send } from 'lucide-react';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const navigation = [
  ['Home', '#home'],
  ['About', '#about'],
  ['Services', '#services'],
  ['My Project', '#portfolio'],
  ['Skills', '#skills'],
  ['Contact', '#contact'],
];

const expertise = ['Product Listings', 'Marketplace SEO', 'Store Operations'];

const socials = [
  ['Instagram', 'https://www.instagram.com/fnkgln/?hl=en', Camera],
  ['TikTok', 'https://www.tiktok.com/@itzyearl', Send],
  ['YouTube', 'https://www.youtube.com/@TunogTriviaPH', Play],
] as const;

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="mobile-safe-footer relative overflow-hidden bg-black pt-12 pb-28 text-white md:py-16">
      {/* Gradient transition from previous section (#0c0c0c to black) */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#0c0c0c] to-black pointer-events-none z-0" />
      <ScrollReveal className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.25fr_0.8fr_0.9fr] md:gap-16">
          <div>
            <a href="#home" className="font-serif-display text-3xl font-semibold leading-none tracking-normal text-white">
              Frank.
            </a>
            <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-white/46">
              Ecommerce virtual assistance for organized, conversion-ready stores.
            </p>
            <div className="mt-6 flex gap-4">
              {socials.map(([name, href, Icon]) => (
                <a key={name} href={href} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/48 transition-colors hover:border-white/25 hover:text-white" aria-label={name} title={name}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-white/24 pt-4">
            <h3 className="mb-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78">Navigate</h3>
            <nav className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-1">
              {navigation.map(([label, href]) => (
                <a key={label} href={href} className="font-body text-sm text-white/48 transition-colors hover:text-white">
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/24 pt-4">
            <h3 className="mb-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78">Expertise</h3>
            <ul className="space-y-2">
              {expertise.map((item) => (
                <li key={item} className="font-body text-sm text-white/48">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/20 pt-5 font-body text-xs text-white/36 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Frank Glen Martin. All rights reserved.</p>
          <p>Ecommerce Virtual Assistant · Philippines</p>
        </div>
      </ScrollReveal>
    </footer>
  );
};
