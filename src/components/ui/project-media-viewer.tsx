import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Pause, Play, Video, X } from 'lucide-react';

export interface ProjectMedia {
  id: string;
  type: 'video' | 'image';
  src: string;
  alt: string;
  orientation: 'portrait' | 'landscape';
}

export interface ProjectViewerData {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  gradient: string;
  media: ProjectMedia[];
}

interface ProjectMediaViewerProps {
  project: ProjectViewerData | null;
  originRect: DOMRect | null;
  onClose: () => void;
}

export const ProjectMediaViewer: React.FC<ProjectMediaViewerProps> = ({ project, originRect, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);

  const requestClose = React.useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 560);
  }, [onClose]);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!project) return;
    setActiveIndex(0);
    setIsPlaying(false);
    setIsClosing(false);
    closingRef.current = false;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + project.media.length) % project.media.length);
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current + 1) % project.media.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, requestClose]);

  useEffect(() => {
    setIsPlaying(false);
    videoRef.current?.pause();
  }, [activeIndex]);

  if (typeof document === 'undefined') return null;

  const activeMedia = project?.media[activeIndex];

  const getTargetSize = (media: ProjectMedia) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const horizontalInset = viewportWidth < 640 ? 24 : 128;
    const availableWidth = viewportWidth - horizontalInset;
    const availableHeight = Math.min(viewportHeight * 0.72, viewportHeight - 170);

    if (media.orientation === 'portrait') {
      let height = availableHeight;
      let width = height * 9 / 16;
      if (width > availableWidth) {
        width = availableWidth;
        height = width * 16 / 9;
      }
      return { width, height };
    }

    let width = Math.min(availableWidth, 1152);
    let height = width * 10 / 16;
    if (height > availableHeight) {
      height = availableHeight;
      width = height * 16 / 10;
    }
    return { width, height };
  };

  const targetSize = activeMedia ? getTargetSize(activeMedia) : { width: 0, height: 0 };

  const getOriginTransform = () => {
    if (!activeMedia || !originRect) {
      return { x: 0, y: 0, scaleX: 0.88, scaleY: 0.88 };
    }

    const viewportHeight = window.innerHeight;
    const targetCenterY = 68 + (viewportHeight - 68 - 82) / 2;
    const targetCenterX = window.innerWidth / 2;

    return {
      x: originRect.left + originRect.width / 2 - targetCenterX,
      y: originRect.top + originRect.height / 2 - targetCenterY,
      scaleX: originRect.width / targetSize.width,
      scaleY: originRect.height / targetSize.height,
    };
  };

  const origin = getOriginTransform();

  const selectMedia = (index: number) => {
    setActiveIndex(index);
  };

  const showPrevious = () => {
    if (!project) return;
    selectMedia((activeIndex - 1 + project.media.length) % project.media.length);
  };

  const showNext = () => {
    if (!project) return;
    selectMedia((activeIndex + 1) % project.media.length);
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {project && activeMedia && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col overflow-hidden bg-black/94 text-white backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0.35 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} project gallery`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-7 sm:py-4">
            <div className="min-w-0">
              <p className="mb-1 font-ui text-[9px] font-semibold uppercase tracking-[0.18em] text-white/38">
                {project.category} · {String(project.id).padStart(2, '0')}
              </p>
              <h2 className="truncate font-body text-base font-semibold tracking-normal text-white sm:text-xl">
                {project.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 transition-colors hover:bg-white hover:text-black"
              aria-label="Close project gallery"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-4 sm:px-16 sm:py-6">
            {project.media.length > 1 && (
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 z-30 hidden h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white/84 backdrop-blur-md transition-colors hover:bg-white hover:text-black sm:flex"
                aria-label="Previous media"
                title="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <motion.div
              layout
              data-project-media-frame
              className="relative flex max-h-full max-w-full items-center justify-center overflow-hidden rounded-lg border border-white/12 bg-[#111] shadow-[0_28px_90px_rgba(0,0,0,0.65)]"
              style={{ width: targetSize.width, height: targetSize.height }}
              initial={{
                x: origin.x,
                y: origin.y,
                scaleX: origin.scaleX,
                scaleY: origin.scaleY,
                borderRadius: 16,
                opacity: 1,
              }}
              animate={isClosing ? {
                x: origin.x,
                y: origin.y,
                scaleX: origin.scaleX,
                scaleY: origin.scaleY,
                borderRadius: 16,
                opacity: 0.92,
              } : {
                x: [origin.x, 0, 0, 0],
                y: [origin.y, 0, 0, 0],
                scaleX: [origin.scaleX, 1.055, 0.986, 1],
                scaleY: [origin.scaleY, 0.965, 1.022, 1],
                borderRadius: [16, 10, 7, 8],
                opacity: 1,
              }}
              transition={isClosing ? {
                duration: 0.5,
                ease: [0.32, 0, 0.2, 1],
              } : {
                duration: 0.92,
                times: [0, 0.68, 0.84, 1],
                ease: [0.2, 0.82, 0.22, 1],
                layout: { type: 'spring', stiffness: 145, damping: 18, mass: 0.9 },
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMedia.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.34, ease: 'easeOut' }}
                >
                  {activeMedia.type === 'video' ? (
                    <>
                      <video
                        ref={videoRef}
                        src={activeMedia.src}
                        preload="metadata"
                        playsInline
                        className="h-full w-full object-contain"
                        onClick={togglePlayback}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                      />
                      <button
                        type="button"
                        onClick={togglePlayback}
                        className={`absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/35 bg-white/22 text-white shadow-[0_12px_38px_rgba(0,0,0,0.38)] backdrop-blur-md transition-all hover:scale-105 hover:bg-white/32 sm:h-20 sm:w-20 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
                      </button>
                    </>
                  ) : (
                    <img src={activeMedia.src} alt={activeMedia.alt} className="h-full w-full object-contain" />
                  )}
                </motion.div>
              </AnimatePresence>

              <motion.img
                src={project.image}
                alt=""
                className="pointer-events-none absolute inset-0 z-20 h-full w-full object-cover"
                initial={{ opacity: 1 }}
                animate={{ opacity: isClosing ? 1 : 0 }}
                transition={{ duration: isClosing ? 0.18 : 0.3, delay: isClosing ? 0.18 : 0.2 }}
              />
            </motion.div>

            {project.media.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 z-30 hidden h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white/84 backdrop-blur-md transition-colors hover:bg-white hover:text-black sm:flex"
                aria-label="Next media"
                title="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 bg-black/55 px-4 py-3 sm:px-7 sm:py-4">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-2">
                  {project.media.map((media, index) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => selectMedia(index)}
                      className={`relative h-14 overflow-hidden rounded-md border transition-all sm:h-16 ${
                        media.orientation === 'portrait' ? 'w-10 sm:w-12' : 'w-20 sm:w-24'
                      } ${index === activeIndex ? 'border-white opacity-100' : 'border-white/12 opacity-48 hover:opacity-80'}`}
                      aria-label={`Open media ${index + 1}`}
                    >
                      {media.type === 'video' ? (
                        <video src={media.src} preload="metadata" muted className="h-full w-full object-cover" />
                      ) : (
                        <img src={media.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                      )}
                      <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-white">
                        {media.type === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <span className="shrink-0 font-ui text-[10px] tabular-nums text-white/42">
                {String(activeIndex + 1).padStart(2, '0')} / {String(project.media.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
