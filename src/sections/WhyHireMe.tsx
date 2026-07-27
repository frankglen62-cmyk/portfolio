import React, { useRef } from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { siteData } from '../data/siteData';

export const WhyHireMe: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="why-hire-me" ref={sectionRef} className="relative overflow-hidden bg-black py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[0.85fr_1.15fr] md:px-12">
        <ScrollReveal blur={false}>
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60 mb-4 block">
            Why hire me
          </span>
          <h2 className="font-serif-display text-[clamp(2.4rem,calc(5*var(--vw)),4.5rem)] font-bold leading-none text-white">
            Reliable support for busy ecommerce sellers
          </h2>
        </ScrollReveal>

        <div className="grid gap-3">
          {siteData.whyHireMe.points.map((point, index) => (
            <ScrollReveal key={point} blur={false} delay={index * 0.04}>
              <div className="flex gap-4 border-b border-white/10 py-4">
                <span className="font-heading text-2xl font-bold leading-none text-white/35">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-body text-base font-medium leading-relaxed text-white/80 md:text-lg">
                  {point}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
