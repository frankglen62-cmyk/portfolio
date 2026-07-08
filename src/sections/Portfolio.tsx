import React, { useRef } from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { BlurFade } from '../components/animations/BlurFade';
import { VideoText } from '../components/ui/video-text';

const portfolioSlides = [
  {
    title: "Social Media Post Design",
    button: "Explore Design",
    src: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "E-Commerce Shopify Setup",
    button: "Explore Project",
    src: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Business Card Design",
    button: "Explore Identity",
    src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Email Newsletter Templates",
    button: "Explore Campaign",
    src: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "WordPress Landing Page",
    button: "Explore Site",
    src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "TikTok Content Creative",
    button: "Explore Content",
    src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
  }
];

export const Portfolio: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="portfolio" ref={sectionRef} className="py-28 md:py-40 relative overflow-hidden" style={{ background: '#000000' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <ScrollReveal className="w-full mb-16 md:mb-24 px-2 md:px-0">
          <div className="w-full h-[180px] md:h-[250px] relative overflow-hidden">
            <VideoText src="https://cdn.magicui.design/ocean-small.webm">
              My Project
            </VideoText>
          </div>
        </ScrollReveal>

        {/* Masonry Grid Component */}
        <div className="w-full columns-1 gap-4 sm:columns-2 lg:columns-3 mt-12">
          {portfolioSlides.map((slide, idx) => (
            <BlurFade key={idx} delay={0.25 + idx * 0.05} inView>
              <div className="mb-4 relative group overflow-hidden rounded-2xl bg-white shadow-md cursor-pointer inline-block w-full break-inside-avoid">
                <img
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  src={slide.src}
                  alt={slide.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{slide.title}</h3>
                  <span className="text-yellow text-sm font-semibold uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{slide.button}</span>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
};

