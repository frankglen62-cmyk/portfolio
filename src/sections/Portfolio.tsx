import React, { useRef } from 'react';
import { InteractiveCardGallery } from '../components/ui/interactive-card-gallery';

export const Portfolio: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="portfolio" ref={sectionRef} className="relative overflow-hidden w-full">
      <InteractiveCardGallery />
    </section>
  );
};

