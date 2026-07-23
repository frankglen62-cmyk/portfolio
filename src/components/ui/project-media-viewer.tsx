import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, X } from 'lucide-react';

export interface ProjectMedia {
  id: string;
  type: 'video' | 'image';
  src: string;
  alt: string;
  label?: string;
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

export const ProjectMediaViewer: React.FC<ProjectMediaViewerProps> = ({
  project,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const activeIndexRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const swipeStartXRef = useRef<number | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const requestClose = React.useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 430);
  }, [onClose]);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
      if (event.key === 'ArrowLeft') {
        const next = (activeIndexRef.current - 1 + project.media.length) % project.media.length;
        activeIndexRef.current = next;
        setActiveIndex(next);
      }
      if (event.key === 'ArrowRight') {
        const next = (activeIndexRef.current + 1) % project.media.length;
        activeIndexRef.current = next;
        setActiveIndex(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, requestClose]);

  useEffect(() => {
    if (!project) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.muted = true;
        video.preload = 'auto';

        const startPlayback = () => {
          if (video.readyState >= 1) video.currentTime = 0;
          video.play().catch(() => undefined);
        };

        if (video.readyState >= 2) {
          startPlayback();
        } else {
          video.addEventListener('canplay', startPlayback, { once: true });
          video.load();
        }
      } else {
        video.pause();
        video.muted = true;
        const rawDistance = Math.abs(index - activeIndex);
        const carouselDistance = Math.min(rawDistance, project.media.length - rawDistance);
        video.preload = carouselDistance <= 1 ? 'auto' : 'metadata';
      }
    });
  }, [activeIndex, project]);

  useEffect(() => {
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) activeVideo.muted = isMuted;
  }, [activeIndex, isMuted]);

  if (typeof document === 'undefined') return null;

  const getTargetSize = (media: ProjectMedia) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 640;
    const availableWidth = viewportWidth - (isMobile ? 64 : 280);
    const availableHeight = viewportHeight - (isMobile ? 76 : 34);

    if (media.orientation === 'portrait') {
      let height = Math.max(300, availableHeight);
      let width = height * 9 / 16;
      if (width > availableWidth) {
        width = availableWidth;
        height = width * 16 / 9;
      }
      return { width, height };
    }

    let width = Math.min(availableWidth, 1180);
    let height = width * 10 / 16;
    if (height > availableHeight) {
      height = availableHeight;
      width = height * 16 / 10;
    }
    return { width, height };
  };

  const targetSize = project
    ? getTargetSize(project.media[activeIndex])
    : { width: 0, height: 0 };
  const isMobile = window.innerWidth < 640;

  const getRelativePosition = (index: number) => {
    if (!project) return 0;
    let difference = index - activeIndex;
    const midpoint = project.media.length / 2;
    if (difference > midpoint) difference -= project.media.length;
    if (difference < -midpoint) difference += project.media.length;
    return difference;
  };

  const showPrevious = () => {
    if (!project) return;
    const next = (activeIndexRef.current - 1 + project.media.length) % project.media.length;
    activeIndexRef.current = next;
    setActiveIndex(next);
  };

  const showNext = () => {
    if (!project) return;
    const next = (activeIndexRef.current + 1) % project.media.length;
    activeIndexRef.current = next;
    setActiveIndex(next);
  };

  const goToIndex = (index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  const handleSwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    swipeStartXRef.current = event.clientX;
  };

  const handleSwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const startX = swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (startX === null) return;

    const distance = event.clientX - startX;
    if (Math.abs(distance) < 44) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  const getCardMotion = (relativePosition: number) => {
    const absolutePosition = Math.abs(relativePosition);
    const direction = relativePosition < 0 ? -1 : 1;

    if (relativePosition === 0) {
      return {
        x: 0,
        scale: 1,
        opacity: isClosing ? 0 : 1,
        filter: 'blur(0px)',
        rotateY: 0,
      };
    }

    if (absolutePosition === 1) {
      return {
        x: direction * targetSize.width * (isMobile ? 0.5 : 0.62),
        scale: isMobile ? 0.78 : 0.84,
        opacity: isClosing ? 0 : isMobile ? 0.9 : 0.94,
        filter: 'blur(0.8px)',
        rotateY: direction * -2,
      };
    }

    return {
      x: direction * targetSize.width * (isMobile ? 0.68 : 0.9),
      scale: isMobile ? 0.64 : 0.7,
      opacity: isClosing ? 0 : isMobile ? 0.34 : 0.48,
      filter: 'blur(3px)',
      rotateY: direction * -4,
    };
  };

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[10000] overflow-hidden bg-[#080a0c] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} video carousel`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.065),transparent_58%)]" />

          <button
            type="button"
            onClick={requestClose}
            className="absolute right-4 top-4 z-[80] flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-black/36 text-white/80 backdrop-blur-md transition-all hover:rotate-90 hover:bg-white hover:text-black sm:right-7 sm:top-6 sm:h-11 sm:w-11"
            aria-label="Close video carousel"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute inset-0 flex items-center justify-center px-8 sm:px-[140px]">
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/38 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-black sm:left-8 sm:h-12 sm:w-12"
              aria-label="Previous video"
              title="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              className="relative"
              style={{
                width: targetSize.width,
                height: targetSize.height,
                touchAction: 'pan-y',
                perspective: 1200,
              }}
              onPointerDown={handleSwipeStart}
              onPointerUp={handleSwipeEnd}
            >
              {project.media.map((media, index) => {
                const relativePosition = getRelativePosition(index);
                const isActive = relativePosition === 0;
                const cardMotion = getCardMotion(relativePosition);

                return (
                  <motion.div
                    key={media.id}
                    className={`absolute inset-0 overflow-hidden rounded-[18px] border bg-[#111] shadow-[0_26px_90px_rgba(0,0,0,0.7)] ${
                      isActive
                        ? 'border-white/18'
                        : 'cursor-pointer border-white/8'
                    }`}
                    style={{
                      zIndex: isActive ? 50 : 30 - Math.abs(relativePosition),
                      pointerEvents: Math.abs(relativePosition) <= 1 ? 'auto' : 'none',
                      transformOrigin: 'center center',
                    }}
                    animate={cardMotion}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 30,
                      mass: 0.78,
                    }}
                    onClick={() => {
                      if (!isActive) goToIndex(index);
                    }}
                  >
                    {media.type === 'video' ? (
                      <video
                        ref={(element) => {
                          videoRefs.current[index] = element;
                        }}
                        src={media.src}
                        preload={Math.abs(relativePosition) <= 1 ? 'auto' : 'metadata'}
                        playsInline
                        muted={!isActive || isMuted}
                        className="h-full w-full object-cover"
                        onCanPlay={(event) => {
                          if (isActive && event.currentTarget.paused) {
                            event.currentTarget.play().catch(() => undefined);
                          }
                        }}
                        onEnded={(event) => {
                          if (videoRefs.current[activeIndexRef.current] === event.currentTarget) {
                            showNext();
                          }
                        }}
                      />
                    ) : (
                      <img src={media.src} alt={media.alt} className="h-full w-full object-cover" />
                    )}

                    {!isActive && (
                      <span
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundColor: Math.abs(relativePosition) === 1
                            ? 'rgba(0, 0, 0, 0.52)'
                            : 'rgba(0, 0, 0, 0.66)',
                        }}
                      />
                    )}

                    {isActive && media.type === 'video' && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsMuted((current) => !current);
                        }}
                        className="absolute right-3 top-3 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-white/86 text-black/75 shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
                        aria-label={isMuted ? 'Turn sound on' : 'Mute video'}
                        title={isMuted ? 'Turn sound on' : 'Mute video'}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/38 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-black sm:right-8 sm:h-12 sm:w-12"
              aria-label="Next video"
              title="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
