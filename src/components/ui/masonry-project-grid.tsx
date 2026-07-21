import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type ProjectMedia = {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
  type: 'image' | 'video';
  aspectClass: string;
  objectPosition?: string;
};

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const projects: ProjectMedia[] = [
  {
    id: 'marketplace-dashboard',
    title: 'Multi-Marketplace Operations Dashboard',
    category: 'Store Operations',
    src: asset('ecommerce-skills-dashboard.png'),
    alt: 'Ecommerce marketplace operations dashboard for eBay, Shopify, Amazon, Walmart, and Etsy',
    type: 'image',
    aspectClass: 'aspect-[1.18/1]',
  },
  {
    id: 'marketplace-workflow',
    title: 'Marketplace Operations Workflow',
    category: 'Project Walkthrough',
    src: asset('projects/marketplace-operations/project-video-01.mp4'),
    alt: 'Portrait video walkthrough of a marketplace operations project',
    type: 'video',
    aspectClass: 'aspect-[9/14]',
  },
  {
    id: 'conversion-listings',
    title: 'Conversion-Ready Product Listings',
    category: 'Product Listing',
    src: asset('skills/product-listing.webp'),
    alt: 'Product photography and listing optimization workspace',
    type: 'image',
    aspectClass: 'aspect-[4/5]',
    objectPosition: '60% center',
  },
  {
    id: 'marketplace-seo',
    title: 'Marketplace SEO Optimization',
    category: 'Search Growth',
    src: asset('skills/seo-optimization.webp'),
    alt: 'Marketplace search optimization and ecommerce analytics dashboard',
    type: 'image',
    aspectClass: 'aspect-[1.22/1]',
    objectPosition: '63% center',
  },
  {
    id: 'product-research',
    title: 'Product and Competitor Research',
    category: 'Research',
    src: asset('skills/product-research.webp'),
    alt: 'Product research workspace with competitor analytics and market data',
    type: 'image',
    aspectClass: 'aspect-[4/5]',
    objectPosition: '58% center',
  },
  {
    id: 'store-platforms',
    title: 'Store Platform Management',
    category: 'Marketplace Support',
    src: asset('skills/platforms.webp'),
    alt: 'Ecommerce platform management workspace with store dashboards and order parcels',
    type: 'image',
    aspectClass: 'aspect-[1.1/1]',
    objectPosition: '64% center',
  },
  {
    id: 'inventory-orders',
    title: 'Inventory and Order Workflow',
    category: 'Fulfillment',
    src: asset('skills/inventory-orders.webp'),
    alt: 'Inventory and order management workspace with parcels and stock dashboard',
    type: 'image',
    aspectClass: 'aspect-[4/5]',
    objectPosition: '68% center',
  },
  {
    id: 'data-management',
    title: 'Ecommerce Data Management',
    category: 'Catalog Data',
    src: asset('skills/data-management.webp'),
    alt: 'Ecommerce spreadsheet and catalog data management workspace',
    type: 'image',
    aspectClass: 'aspect-[1.18/1]',
    objectPosition: '62% center',
  },
];

// A fixed shuffled order keeps the Framer-style random reveal consistent
// across React's development and production render cycles.
const revealOrder = [2, 6, 0, 4, 1, 7, 3, 5];

export function MasonryProjectGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectMedia | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  return (
    <>
      <div
        ref={gridRef}
        className="project-masonry columns-1 gap-[5px] sm:columns-2 lg:columns-3"
        aria-label="Selected ecommerce projects"
      >
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            className={`project-masonry-item group relative mb-[5px] block w-full break-inside-avoid overflow-hidden rounded-lg bg-[#171717] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${project.aspectClass}`}
            style={{
              opacity: hasEntered ? 1 : 0,
              transform: hasEntered ? 'translateY(0)' : 'translateY(20px)',
              animation: hasEntered
                ? `project-masonry-appear 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(revealOrder[index] / projects.length).toFixed(3)}s both`
                : undefined,
            }}
            onClick={() => setSelectedProject(project)}
            aria-label={`Open ${project.title}`}
          >
            {project.type === 'video' ? (
              <video
                src={project.src}
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                aria-label={project.alt}
                className="h-full w-full scale-100 object-cover transition-transform duration-[400ms] ease-in-out will-change-transform group-hover:scale-105 group-focus-visible:scale-105"
              />
            ) : (
              <img
                src={project.src}
                alt={project.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full scale-100 object-cover transition-transform duration-[400ms] ease-in-out will-change-transform group-hover:scale-105 group-focus-visible:scale-105"
                style={{ objectPosition: project.objectPosition }}
              />
            )}

            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pb-4 pt-14 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
              <span className="block font-ui text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65">
                {project.category}
              </span>
              <span className="mt-1 block font-heading text-lg font-semibold leading-tight text-white sm:text-xl">
                {project.title}
              </span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProject.title}
            onClick={() => setSelectedProject(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-8 sm:top-8"
              aria-label="Close project viewer"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>

            <motion.figure
              className="flex max-h-[90vh] max-w-[90vw] flex-col items-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              onClick={(event) => event.stopPropagation()}
            >
              {selectedProject.type === 'video' ? (
                <video
                  src={selectedProject.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
                  aria-label={selectedProject.alt}
                />
              ) : (
                <img
                  src={selectedProject.src}
                  alt={selectedProject.alt}
                  className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
                />
              )}
              <figcaption className="mt-4 text-center text-white">
                <span className="block font-ui text-[9px] font-semibold uppercase tracking-[0.22em] text-white/55">
                  {selectedProject.category}
                </span>
                <span className="mt-1 block font-heading text-xl font-semibold sm:text-2xl">
                  {selectedProject.title}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes project-masonry-appear {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .project-masonry-item {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .project-masonry-item > img,
          .project-masonry-item > video {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
