import React from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { MasonryProjectGrid } from '../components/ui/masonry-project-grid';
import { VideoText } from '../components/ui/video-text';

export const Portfolio: React.FC = () => {
  return (
    <section id="portfolio" className="relative w-full overflow-hidden bg-black py-10 sm:py-14 md:py-16">
      <ScrollReveal blur={false} className="relative z-10 mx-auto mb-7 w-full max-w-6xl px-4 sm:mb-10 md:mb-14">
        <div className="relative h-[128px] w-full overflow-hidden sm:h-[150px] md:h-[250px]">
          <VideoText src="https://cdn.magicui.design/ocean-small.webm">
            My Project
          </VideoText>
        </div>
      </ScrollReveal>

      <div className="relative z-10 w-full px-[5px]">
        <MasonryProjectGrid />
      </div>
    </section>
  );
};

