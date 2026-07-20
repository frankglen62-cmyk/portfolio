import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoText } from './video-text';
import { ScrollReveal } from '../animations/ScrollReveal';
import { ProjectMediaViewer, type ProjectViewerData } from './project-media-viewer';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const cards: ProjectViewerData[] = [
  {
    id: 1,
    title: 'Marketplace Operations',
    description: 'A practical workflow for managing listings, orders, and daily store activity across ecommerce channels.',
    image: asset('skills/platforms.webp'),
    gradient: 'from-amber-400 via-slate-700 to-emerald-500',
    category: 'Store Support',
    media: [
      {
        id: 'marketplace-video-01',
        type: 'video',
        src: asset('projects/marketplace-operations/project-video-01.mp4'),
        alt: 'Marketplace operations project video',
        orientation: 'portrait',
      },
      {
        id: 'marketplace-overview',
        type: 'image',
        src: asset('skills/platforms.webp'),
        alt: 'Marketplace operations dashboard overview',
        orientation: 'landscape',
      },
    ],
  },
  {
    id: 2,
    title: 'Conversion-Ready Listings',
    description: 'Clear product titles, structured attributes, polished images, and organized variations built to convert.',
    image: asset('skills/product-listing.webp'),
    gradient: 'from-orange-400 via-slate-700 to-blue-600',
    category: 'Product Listing',
    media: [
      {
        id: 'listing-overview',
        type: 'image',
        src: asset('skills/product-listing.webp'),
        alt: 'Conversion-ready product listing sample',
        orientation: 'landscape',
      },
    ],
  },
  {
    id: 3,
    title: 'Marketplace SEO Refresh',
    description: 'Search-focused content improvements that make product pages easier to discover and easier to understand.',
    image: asset('skills/seo-optimization.webp'),
    gradient: 'from-teal-400 via-slate-800 to-yellow-400',
    category: 'Search Growth',
    media: [
      {
        id: 'seo-overview',
        type: 'image',
        src: asset('skills/seo-optimization.webp'),
        alt: 'Marketplace SEO optimization sample',
        orientation: 'landscape',
      },
    ],
  },
  {
    id: 4,
    title: 'Product Research Brief',
    description: 'Competitor, pricing, demand, and supplier insights distilled into confident product decisions.',
    image: asset('skills/product-research.webp'),
    gradient: 'from-amber-500 via-stone-700 to-emerald-700',
    category: 'Research',
    media: [
      {
        id: 'research-overview',
        type: 'image',
        src: asset('skills/product-research.webp'),
        alt: 'Product and competitor research sample',
        orientation: 'landscape',
      },
    ],
  },
  {
    id: 5,
    title: 'Inventory & Order Workflow',
    description: 'A dependable system for stock checks, order processing, tracking updates, and fulfillment support.',
    image: asset('skills/inventory-orders.webp'),
    gradient: 'from-blue-500 via-slate-800 to-orange-500',
    category: 'Fulfillment',
    media: [
      {
        id: 'fulfillment-overview',
        type: 'image',
        src: asset('skills/inventory-orders.webp'),
        alt: 'Inventory and order workflow sample',
        orientation: 'landscape',
      },
    ],
  },
];

const particles = Array.from({ length: 20 }, (_, index) => {
  const seed = index + 1;
  return {
    width: `${(seed * 7) % 10 + 2}px`,
    height: `${(seed * 11) % 10 + 2}px`,
    top: `${(seed * 17) % 100}%`,
    left: `${(seed * 23) % 100}%`,
    animation: `float ${(seed * 3) % 10 + 20}s linear infinite`,
    animationDelay: `${(seed * 5) % 20}s`,
  };
});

export const InteractiveCardGallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectViewerData | null>(null);
  const [viewerOrigin, setViewerOrigin] = useState<DOMRect | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;

    const rect = galleryRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMousePosition({ x, y });
  };

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const openProject = (project: ProjectViewerData, element: Element | null) => {
    setViewerOrigin(element?.getBoundingClientRect() ?? null);
    setSelectedProject(project);
  };

  const handleCardClick = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (index === activeIndex) {
      openProject(cards[index], event.currentTarget);
      return;
    }
    setActiveIndex(index);
  };

  const calculateCardStyles = (index: number) => {
    const diff = index - activeIndex;

    if (windowWidth < 768) {
      return {
        zIndex: cards.length - Math.abs(diff),
        transform: diff === 0
          ? 'translateY(0) scale(1)'
          : `translateY(${diff * 20}px) scale(${1 - Math.abs(diff) * 0.1})`,
        opacity: 1 - Math.abs(diff) * 0.2,
      };
    }

    return {
      zIndex: cards.length - Math.abs(diff),
      transform: diff === 0
        ? 'translateX(0) scale(1)'
        : `translateX(${diff * 60}%) scale(${1 - Math.abs(diff) * 0.2})`,
      opacity: 1 - Math.abs(diff) * 0.3,
      filter: diff === 0 ? 'blur(0px)' : 'blur(2px)',
    };
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-black py-6 sm:py-10 md:min-h-[100vh] md:py-16">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(50, 50, 150, 0.3), transparent 40%)`,
        }}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="absolute inset-0 hidden overflow-hidden pointer-events-none md:block">
        {particles.map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white opacity-10"
            style={particle}
          />
        ))}
      </div>

      <div
        ref={galleryRef}
        className="relative z-10 flex min-h-[calc(100svh-3rem)] w-full flex-col items-center justify-center px-3 sm:min-h-[calc(100svh-5rem)] sm:px-6 md:min-h-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <ScrollReveal blur={false} className="z-20 mx-auto mb-2 w-full max-w-6xl px-1 sm:mb-4 sm:px-2 md:mb-16 md:px-0">
          <div className="relative h-[128px] w-full overflow-hidden sm:h-[150px] md:h-[250px]">
            <VideoText src="https://cdn.magicui.design/ocean-small.webm">
              My Project
            </VideoText>
          </div>
        </ScrollReveal>

        <div className="relative mt-0 flex h-[360px] w-full max-w-[1400px] items-center justify-center sm:h-[450px] md:mt-4 md:h-[550px]">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              data-project-card={card.id}
              className="absolute w-[94vw] max-w-4xl cursor-pointer rounded-2xl transition-all duration-300 ease-out sm:w-[90vw]"
              style={{
                ...calculateCardStyles(index),
                transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
              }}
              whileHover={{
                scale: index === activeIndex ? 1.02 : 1,
                transition: { duration: 0.2 },
              }}
              onClick={(event) => handleCardClick(index, event)}
            >
              {index === activeIndex && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-20"
                  style={{
                    transform: isHovering ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)` : 'none',
                    transition: 'transform 0.2s ease-out',
                    background: 'linear-gradient(135deg, #ffffff10 0%, #ffffff01 100%)',
                  }}
                />
              )}

              <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                  transform: index === activeIndex && isHovering ? `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)` : 'none',
                  transition: 'transform 0.2s ease-out',
                }}
              >
                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20 mix-blend-overlay z-10`} />

                  <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
                    <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase text-white shadow-lg backdrop-blur-md sm:px-3 sm:text-xs">
                      {card.category}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col p-5 sm:p-8">
                    <h3 className="mb-1.5 text-xl font-bold text-white drop-shadow-md sm:mb-2 sm:text-3xl">{card.title}</h3>
                    <p className="mb-4 max-w-2xl text-xs leading-relaxed text-gray-200 drop-shadow-md sm:mb-6 sm:text-base">{card.description}</p>

                    {index === activeIndex && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex space-x-2">
                          {cards.map((_, dotIndex) => (
                            <div
                              key={dotIndex}
                              className={`w-2 h-2 rounded-full shadow-sm ${dotIndex === activeIndex ? 'bg-white' : 'bg-white/40'}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProject(card, event.currentTarget.closest('[data-project-card]'));
                          }}
                          className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 sm:px-5 sm:py-2 sm:text-sm"
                        >
                          View Project
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="z-20 mt-2 flex items-center justify-center space-x-4 sm:mt-4 sm:space-x-6 md:mt-10 md:space-x-8">
          <button
            onClick={prevCard}
            className="group rounded-full bg-white/10 p-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 md:p-3"
            aria-label="Previous project"
          >
            <ChevronLeft className="h-5 w-5 text-white transition-transform group-hover:scale-110 md:h-6 md:w-6" />
          </button>

          <div className="flex space-x-1.5 sm:space-x-2">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-200 md:h-3 md:w-3 ${
                  index === activeIndex
                    ? 'w-5 bg-white md:w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            className="group rounded-full bg-white/10 p-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 md:p-3"
            aria-label="Next project"
          >
            <ChevronRight className="h-5 w-5 text-white transition-transform group-hover:scale-110 md:h-6 md:w-6" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-100px) translateX(100px);
          }
          100% {
            transform: translateY(-200px) translateX(0);
            opacity: 0;
          }
        }
      `}</style>

      <ProjectMediaViewer
        project={selectedProject}
        originRect={viewerOrigin}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};
