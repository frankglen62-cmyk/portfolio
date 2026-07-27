import React from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { MasonryProjectGrid } from '../components/ui/masonry-project-grid';
import { VideoText } from '../components/ui/video-text';

const TITLE_VIDEO_POSITION = {
  offsetX: -3,
  offsetY: -8,
  zoom: 2.45,
} as const;

export const Portfolio: React.FC = () => {
  const videoSrc = `${import.meta.env.BASE_URL}projects/ugc-ads/pin-on-dine-pins.mp4`;

  return (
    <section id="portfolio" className="relative w-full overflow-hidden bg-black py-10 sm:py-14 md:py-16">
      {/* Gradient transition from previous section (#080808 to black) */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#080808] to-black pointer-events-none z-0" />

      <ScrollReveal blur={false} className="relative z-10 mx-auto mb-9 w-full max-w-6xl px-4 sm:mb-12 md:mb-16">
        <div className="relative h-[128px] w-full overflow-hidden sm:h-[150px] md:h-[250px]">
          <VideoText
            src={videoSrc}
            offsetX={TITLE_VIDEO_POSITION.offsetX}
            offsetY={TITLE_VIDEO_POSITION.offsetY}
            zoom={TITLE_VIDEO_POSITION.zoom}
          >
            My Project
          </VideoText>
        </div>

        <div className="mx-auto mt-5 flex max-w-3xl flex-col items-center text-center sm:mt-7">
          <p className="font-body text-sm leading-relaxed text-white/58 sm:text-base">
            A growing collection of ecommerce UGC ads and short-form product creatives,
            built to capture attention and present products clearly.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {['5 video creatives', 'Mobile-first ads', 'UGC for ecommerce'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 font-ui text-[8px] font-semibold uppercase tracking-[0.16em] text-white/48"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <MasonryProjectGrid />
      </div>
    </section>
  );
};
