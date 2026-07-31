import React, { useEffect, useRef, useState } from 'react';
import { Film, Image as ImageIcon, Play } from 'lucide-react';
import {
  ProjectMediaViewer,
  type ProjectViewerData,
} from './project-media-viewer';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const ugcShowcase: ProjectViewerData = {
  id: 1,
  title: 'UGC Ad Creative Showcase',
  category: 'Ecommerce Ad Portfolio',
  description:
    'A curated collection of short-form UGC ad creatives produced for ecommerce products.',
  image: asset('projects/marketplace-operations/project-video-01.mp4'),
  gradient: 'from-white/10 to-black',
  media: [
    {
      id: 'ugc-ad-01',
      type: 'video',
      src: asset('projects/marketplace-operations/project-video-01.mp4'),
      alt: 'UGC ecommerce beauty product ad creative 1',
      label: 'Beauty UGC',
      orientation: 'portrait',
    },
    {
      id: 'ugc-ad-02',
      type: 'video',
      src: asset('projects/ugc-ads/ugc-ad-02.mp4'),
      alt: 'UGC ecommerce product ad creative 2',
      label: 'Product Demo',
      orientation: 'portrait',
    },
    {
      id: 'ugc-ad-03',
      type: 'video',
      src: asset('projects/ugc-ads/ugc-ad-03.mp4'),
      alt: 'UGC ecommerce product ad creative 3',
      label: 'Creative Cut 03',
      orientation: 'portrait',
    },
    {
      id: 'ugc-ad-04',
      type: 'video',
      src: asset('projects/ugc-ads/ugc-ad-04.mp4'),
      alt: 'UGC ecommerce product ad creative 4',
      label: 'Creative Cut 04',
      orientation: 'portrait',
    },
    {
      id: 'ugc-ad-05',
      type: 'video',
      src: asset('projects/ugc-ads/ugc-ad-05.mp4'),
      alt: 'UGC ecommerce product ad creative 5',
      label: 'Creative Cut 05',
      orientation: 'portrait',
    },
  ],
};

const placeholders = [
  { id: 2, aspect: 'aspect-[1.18/1]' },
  { id: 3, aspect: 'aspect-[4/5]' },
  { id: 4, aspect: 'aspect-[1.22/1]' },
  { id: 5, aspect: 'aspect-[4/5]' },
  { id: 6, aspect: 'aspect-[1.1/1]' },
  { id: 7, aspect: 'aspect-[4/5]' },
  { id: 8, aspect: 'aspect-[1.18/1]' },
];

const revealOrder = [1, 5, 0, 6, 2, 4, 3, 7];

export function MasonryProjectGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [hasEntered, setHasEntered] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [previewReady, setPreviewReady] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectViewerData | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    const video = previewVideoRef.current;
    if (!video) return;

    const attemptPlay = () => {
      video.muted = true;
      video.play().catch(() => undefined);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) attemptPlay();
        else video.pause();
      },
      { rootMargin: '180px 0px', threshold: 0.08 },
    );

    const handleVisibility = () => {
      if (!document.hidden) attemptPlay();
    };

    observer.observe(video);
    document.addEventListener('visibilitychange', handleVisibility);
    video.addEventListener('canplay', attemptPlay);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      video.removeEventListener('canplay', attemptPlay);
    };
  }, []);

  const revealStyle = (index: number): React.CSSProperties => ({
    opacity: hasEntered ? 1 : 0,
    transform: hasEntered ? 'translateY(0)' : 'translateY(20px)',
    animation: hasEntered
      ? `project-masonry-appear 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(revealOrder[index] / revealOrder.length).toFixed(3)}s both`
      : undefined,
  });

  return (
    <>
      <div
        ref={gridRef}
        className="project-masonry columns-1 gap-5 sm:columns-2 sm:gap-6 lg:columns-3"
        aria-label="Selected ecommerce creative projects"
      >
        <button
          type="button"
          className="project-masonry-item group relative mb-5 block aspect-[9/14] w-full break-inside-avoid overflow-hidden rounded-xl border border-white/[0.08] bg-[#090909] text-left shadow-[0_18px_50px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:mb-6"
          style={revealStyle(0)}
          onClick={(event) => {
            setOriginRect(event.currentTarget.getBoundingClientRect());
            setSelectedProject(ugcShowcase);
          }}
          aria-label="Open UGC Ad Creative Showcase"
        >
          <video
            ref={previewVideoRef}
            src={ugcShowcase.media[0].src}
            muted
            playsInline
            /* This tile is an animated thumbnail for a 5.7 MB clip, and it is
               below the fold — with `autoPlay` + `preload="auto"` the browser
               pulled all of it before the hero had finished painting. The
               observer below starts playback when the grid comes into view,
               which is what actually loads it. */
            preload="none"
            onLoadedMetadata={(event) => {
              if (event.currentTarget.currentTime < 0.8) {
                event.currentTarget.currentTime = 0.8;
              }
            }}
            onLoadedData={() => setPreviewReady(true)}
            onPlaying={() => setPreviewReady(true)}
            onEnded={(event) => {
              event.currentTarget.currentTime = 0.8;
              event.currentTarget.play().catch(() => undefined);
            }}
            className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.035] ${
              previewReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.09),transparent_48%)]" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/10" />
          <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-5 pt-20">
            <span className="mb-2 flex items-center gap-2 font-ui text-[9px] font-semibold uppercase tracking-[0.2em] text-white/58">
              <Film className="h-3.5 w-3.5" />
              5 video creatives
            </span>
            <span className="block max-w-[15ch] font-heading text-2xl font-semibold leading-[1.05] text-white sm:text-3xl">
              UGC Ad Creative Showcase
            </span>
            <span className="mt-2 block max-w-[28ch] font-body text-xs leading-relaxed text-white/62">
              Short-form ecommerce ads made to stop the scroll.
            </span>
          </span>
        </button>

        {placeholders.map((placeholder, index) => (
          <article
            key={placeholder.id}
            className={`project-masonry-item group relative mb-5 flex w-full break-inside-avoid items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#050505] shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:mb-6 ${placeholder.aspect}`}
            style={revealStyle(index + 1)}
            aria-label={`Project image placeholder ${placeholder.id}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.035),transparent_58%)]" />
            <div className="relative flex flex-col items-center text-center">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/24">
                <ImageIcon className="h-4 w-4" />
              </span>
              <span className="font-ui text-[8px] font-semibold uppercase tracking-[0.24em] text-white/24">
                Project holder {String(placeholder.id).padStart(2, '0')}
              </span>
              <span className="mt-1 font-body text-[10px] text-white/16">New work coming soon</span>
            </div>
          </article>
        ))}
      </div>

      <ProjectMediaViewer
        key={selectedProject?.id ?? 'closed'}
        project={selectedProject}
        originRect={originRect}
        onClose={() => {
          setSelectedProject(null);
          setOriginRect(null);
        }}
      />

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

          .project-masonry-item video {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
