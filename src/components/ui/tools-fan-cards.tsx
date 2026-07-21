import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';

export interface ToolFanItem {
  name: string;
  id: string;
}

export interface ToolFanCategory {
  categoryName: string;
  purpose: string;
  tools: ToolFanItem[];
  accent: string;
  backgroundImage: string;
  backgroundPosition?: string;
}

interface ToolsFanCardsProps {
  categories: ToolFanCategory[];
}

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1, x: 0, y: 0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

const lightMonochromeIcons = new Set([
  'chatgpt.svg',
  'notion.svg',
  'wordpress.svg',
  'capcut.svg',
]);

function getWidthMultiplier(width: number) {
  if (width < 480) return 0.44;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1;
}

function getHeightMultiplier(width: number, height: number) {
  const idealHeight = width < 480
    ? 544
    : width < 640
      ? 576
      : width < 1024
        ? 608
        : 640;

  return Math.min(1, (height * 0.78) / idealHeight);
}

function getCircularSlot(index: number, activeIndex: number, total: number) {
  const half = Math.floor(total / 2);
  let offset = index - activeIndex;

  while (offset > half) offset -= total;
  while (offset < -half) offset += total;

  return offset + half;
}

export function ToolsFanCards({ categories }: ToolsFanCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasAnimated = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const handleResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isInView || categories.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const widthMultiplier = getWidthMultiplier(viewport.width);
    const heightMultiplier = getHeightMultiplier(viewport.width, viewport.height);
    const centerSlot = Math.floor(categories.length / 2);
    const firstAnimation = !hasAnimated.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const slot = getCircularSlot(index, activeIndex, categories.length);
      const base = FAN_POSITIONS[slot] ?? FAN_POSITIONS[centerSlot];
      const distanceFromHover = hoveredIndex === null
        ? 0
        : Math.abs(slot - getCircularSlot(hoveredIndex, activeIndex, categories.length));
      let targetX = base.x * 16 * widthMultiplier;
      let targetY = base.y * 16 * heightMultiplier;
      let targetRotation = base.rot;
      let targetScale = base.scale;
      let targetZIndex = base.zIndex;

      if (hoveredIndex !== null) {
        const hoveredSlot = getCircularSlot(hoveredIndex, activeIndex, categories.length);

        if (index === hoveredIndex) {
          targetY -= 20 * heightMultiplier;
          targetScale *= 1.055;
          targetZIndex = 30;
        } else {
          const push = Math.max(8, 23 - distanceFromHover * 4) * widthMultiplier;
          targetX += slot < hoveredSlot ? -push : push;
          targetRotation += slot < hoveredSlot ? -1.5 : 1.5;
        }
      }

      const target = {
        x: targetX,
        y: targetY,
        xPercent: -50,
        rotation: targetRotation,
        scale: targetScale,
        opacity: 1,
        zIndex: targetZIndex,
      };

      if (reduceMotion) {
        gsap.set(card, target);
      } else if (firstAnimation) {
        gsap.fromTo(
          card,
          { x: 0, y: 150 * heightMultiplier, xPercent: -50, rotation: 0, scale: 0.5, opacity: 0 },
          {
            ...target,
            duration: 1.15,
            delay: 0.12 + slot * 0.055,
            ease: 'elastic.out(1.05, 0.78)',
          },
        );
      } else {
        gsap.to(card, {
          ...target,
          duration: hoveredIndex === null ? 0.58 : 0.46,
          delay: hoveredIndex === null ? Math.abs(slot - centerSlot) * 0.012 : distanceFromHover * 0.012,
          ease: 'elastic.out(1, 0.78)',
          overwrite: 'auto',
        });
      }
    });

    hasAnimated.current = true;

    return () => {
      cardRefs.current.forEach((card) => {
        if (card) gsap.killTweensOf(card);
      });
    };
  }, [activeIndex, categories, hoveredIndex, isInView, viewport]);

  if (categories.length !== FAN_POSITIONS.length) return null;

  const cycle = (direction: -1 | 1) => {
    setHoveredIndex(null);
    setActiveIndex((current) => (
      current + direction + categories.length
    ) % categories.length);
  };

  return (
    <div className="relative w-full overflow-hidden pb-0 sm:pb-10">
      <div
        ref={containerRef}
        className="relative mx-auto h-[min(calc(100svh-246px),clamp(480px,calc(22.73svh+310.9px),500px))] w-full max-w-[94rem] select-none sm:h-[38rem] lg:h-[42rem]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {categories.map((category, index) => {
          const isActive = index === activeIndex;
          const compact = category.tools.length > 12;

          return (
            <button
              key={category.categoryName}
              ref={(element) => { cardRefs.current[index] = element; }}
              type="button"
              className="absolute left-1/2 top-[clamp(24px,calc(22.73svh-145.1px),44px)] h-[min(456px,calc(100svh-270px))] w-[min(74vw,305px)] origin-center overflow-hidden rounded-[24px] border border-white/20 bg-[#0b0d10] text-left text-white shadow-[0_30px_80px_rgba(0,0,0,0.72)] outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:top-16 sm:h-[480px] sm:w-[370px] lg:top-20 lg:h-[500px] lg:w-[380px]"
              style={{ opacity: 0 }}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              aria-pressed={isActive}
              aria-label={`Show ${category.categoryName}: ${category.purpose}`}
            >
              <img
                src={`${import.meta.env.BASE_URL}${category.backgroundImage}`}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-60 saturate-[0.82] contrast-[1.08]"
                style={{ objectPosition: category.backgroundPosition ?? 'center' }}
              />
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, rgba(4, 6, 9, 0.66) 0%, rgba(5, 7, 10, 0.82) 38%, rgba(5, 7, 10, 0.96) 72%, rgba(5, 7, 10, 0.99) 100%), linear-gradient(135deg, ${category.accent}1f 0%, transparent 46%)`,
                }}
              />
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                style={{ background: category.accent }}
              />
              <span
                className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-20 blur-3xl"
                style={{ background: category.accent }}
              />
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.13),transparent_35%),linear-gradient(145deg,rgba(255,255,255,0.035),transparent_52%)]" />

              <span className="relative flex h-full flex-col px-5 py-[18px] sm:px-6 sm:py-6">
                <span className="flex items-center justify-between font-ui text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.95)]">
                  <span>{String(index + 1).padStart(2, '0')} / 07</span>
                  <span>{category.tools.length} tools</span>
                </span>

                <span className="mt-3.5 block min-h-[91px] sm:mt-5 sm:min-h-[110px]">
                  <span className="block font-display text-[22px] font-bold uppercase leading-[1.02] tracking-[0.01em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.95)] sm:text-[25px]">
                    {category.categoryName}
                  </span>
                  <span className="mt-2 block max-w-[300px] font-body text-[11px] font-medium leading-[1.45] text-white/80 [text-shadow:0_1px_9px_rgba(0,0,0,0.98)] sm:mt-2.5 sm:text-[12px] sm:leading-[1.5]">
                    {category.purpose}
                  </span>
                </span>

                <span className="my-2 block h-px w-full bg-white/20 sm:my-3" />

                <span className="flex flex-1 content-start justify-center">
                  <span className={`grid w-full grid-cols-6 content-start ${compact ? 'gap-x-1.5 gap-y-1' : 'gap-x-2 gap-y-2.5'}`}>
                    {category.tools.map((tool, toolIndex) => {
                      const remainder = category.tools.length % 3;
                      const isFirstOfTwoCentered = remainder === 2 && toolIndex === category.tools.length - 2;
                      const isSecondOfTwoCentered = remainder === 2 && toolIndex === category.tools.length - 1;
                      const isSingleCentered = remainder === 1 && toolIndex === category.tools.length - 1;

                      return (
                      <span
                        key={tool.name}
                        className={`col-span-2 flex w-full flex-col items-center justify-start bg-transparent px-0.5 text-center ${compact ? 'h-[42px]' : 'h-[52px] sm:h-[58px]'} ${isFirstOfTwoCentered ? 'col-start-2' : ''} ${isSecondOfTwoCentered ? 'col-start-4' : ''} ${isSingleCentered ? 'col-start-3' : ''}`}
                      >
                        <span className={`flex shrink-0 items-center justify-center bg-transparent ${compact ? 'h-7 w-7' : 'h-8 w-8 sm:h-9 sm:w-9'}`}>
                          <img
                            src={`${import.meta.env.BASE_URL}icons/tools/${tool.id}`}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className={`object-contain drop-shadow-[0_2px_7px_rgba(0,0,0,0.95)] ${lightMonochromeIcons.has(tool.id) ? 'brightness-0 invert' : ''} ${compact ? 'h-[26px] w-[26px]' : 'h-8 w-8 sm:h-9 sm:w-9'}`}
                          />
                        </span>
                        <span className={`mt-1 block w-full overflow-hidden text-ellipsis font-body font-semibold leading-[1.08] text-white/95 [text-shadow:0_1px_8px_rgba(0,0,0,1)] ${compact ? 'whitespace-nowrap text-[8px] sm:text-[8.5px]' : 'line-clamp-2 text-[8.5px] sm:text-[9.5px]'}`}>
                          {tool.name}
                        </span>
                      </span>
                      );
                    })}
                  </span>
                </span>

                <span className="mt-1.5 flex items-center justify-between font-ui text-[8px] font-semibold uppercase tracking-[0.18em] text-white/55 [text-shadow:0_1px_7px_rgba(0,0,0,0.95)]">
                  <span>{isActive ? 'Selected toolkit' : 'Select card'}</span>
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: category.accent, boxShadow: `0 0 14px ${category.accent}` }}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative z-40 mx-auto mt-[clamp(8px,calc(18.18svh-127.27px),24px)] flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:mt-2">
        <button
          type="button"
          onClick={() => cycle(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Previous tool category"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1.5" aria-label={`Tool category ${activeIndex + 1} of ${categories.length}`}>
          {categories.map((category, index) => (
            <button
              key={category.categoryName}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${index === activeIndex ? 'w-6 bg-white/85' : 'w-2 bg-white/20 hover:bg-white/45'}`}
              aria-label={`Show ${category.categoryName}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => cycle(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Next tool category"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
