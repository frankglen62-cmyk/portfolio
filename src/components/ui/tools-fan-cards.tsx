import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface ToolFanItem {
  name: string;
  id: string;
}

export interface ToolFanCategory {
  categoryName: string;
  shortName: string;
  purpose: string;
  tools: ToolFanItem[];
  backgroundPosition: string;
}

interface ToolsFanCardsProps {
  categories: ToolFanCategory[];
}

const lightMonochromeIcons = new Set([
  'chatgpt.svg',
  'notion.svg',
  'wordpress.svg',
  'capcut.svg',
]);

/* ── Mobile gallery geometry ───────────────────────────────────────────────
   Declared once and used by BOTH the stylesheet at the bottom of this file and
   the scroll maths in toggleCard. A collapsed card is always this wide, so the
   position a card will occupy once it opens is known before the animation
   starts — which is the whole trick behind the open feeling instant. */
const MOBILE_CARD_WIDTH = 72;
const MOBILE_GAP = 7;
const MOBILE_PADDING = 16;
/** Long enough to read as a movement, short enough to not feel stuck. */
const MOBILE_OPEN_MS = 320;

function CategoryTitle({ name }: { name: string }) {
  const parts = name.split(' & ');

  if (parts.length !== 2) return <>{name}</>;

  return (
    <>
      {parts[0]}{' '}
      <span className="font-heading text-[0.78em] font-normal italic text-white/78">
        and
      </span>{' '}
      {parts[1]}
    </>
  );
}

export function ToolsFanCards({ categories }: ToolsFanCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const expandedIndex = hoveredIndex ?? selectedIndex;

  const updateScrollCues = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 8);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 8);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const frame = window.requestAnimationFrame(updateScrollCues);
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(updateScrollCues);
    });
    resizeObserver.observe(container);
    container.addEventListener('scroll', updateScrollCues, { passive: true });
    window.addEventListener('resize', updateScrollCues, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      container.removeEventListener('scroll', updateScrollCues);
      window.removeEventListener('resize', updateScrollCues);
    };
  }, [categories, updateScrollCues]);

  const scrollMobileGallery = (direction: -1 | 1) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction * container.clientWidth * 0.72,
      behavior: 'smooth',
    });
  };

  const toggleCard = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    const opening = selectedIndex !== index;
    setHoveredIndex(null);
    setSelectedIndex(opening ? index : null);

    if (!opening) {
      event.currentTarget.blur();
    }

    if (opening && document.documentElement.dataset.canvas === 'mobile') {
      const container = containerRef.current;
      if (!container) return;

      // Every OTHER card ends up collapsed, so the opened card's final left
      // edge is pure arithmetic — no measuring required.
      //
      // This used to wait 120ms and then read `card.offsetLeft`, which is a
      // moving target: the widths were mid-animation, so it scrolled to a
      // position that had already stopped being true, and the correction
      // fought the width transition all the way. That fight is what felt slow.
      // Starting now, from the known destination, makes the two movements one.
      container.scrollTo({
        left: index * (MOBILE_CARD_WIDTH + MOBILE_GAP),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[1420px]">
      <div
        ref={containerRef}
        className="tools-accordion mx-auto flex h-[430px] w-full gap-2 px-5 sm:h-[470px] sm:gap-2.5 sm:px-8 lg:px-10"
        // Scroll snapping re-targets itself while the cards are resizing, which
        // stutters against the programmatic scroll above. It is only useful for
        // free browsing, so it steps aside while a card is open.
        data-expanded={expandedIndex !== null ? 'true' : 'false'}
        onMouseLeave={() => setHoveredIndex(null)}
        aria-label="Tool categories"
      >
        {categories.map((category, index) => {
          const isExpanded = expandedIndex === index;
          const anotherCardIsExpanded = expandedIndex !== null && !isExpanded;

          return (
            <button
              key={category.categoryName}
              ref={(element) => { cardRefs.current[index] = element; }}
              type="button"
              className="tools-accordion-card group relative min-w-0 overflow-hidden rounded-[14px] border border-white/10 bg-[#121212] text-left text-white shadow-[0_18px_55px_rgba(0,0,0,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              style={{
                flexBasis: 0,
                flexGrow: isExpanded ? 5.2 : anotherCardIsExpanded ? 0.86 : 1,
              }}
              onMouseEnter={() => {
                if (window.matchMedia('(hover: hover)').matches) {
                  setHoveredIndex(index);
                }
              }}
              onClick={(event) => toggleCard(index, event)}
              aria-expanded={isExpanded}
              aria-label={`${category.categoryName}: ${category.purpose}`}
            >
              <img
                src={`${import.meta.env.BASE_URL}tools-panorama-v1.webp`}
                alt=""
                aria-hidden="true"
                draggable={false}
                loading="lazy"
                decoding="async"
                className="tools-card-photo absolute inset-0 h-full w-full scale-[1.02] object-cover transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                style={{ objectPosition: category.backgroundPosition }}
              />

              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/5" />
              <span
                className={`pointer-events-none absolute inset-0 transition-colors duration-500 ${
                  isExpanded ? 'bg-black/10' : anotherCardIsExpanded ? 'bg-black/48' : 'bg-black/24'
                }`}
              />

              <span className="absolute inset-x-0 bottom-0 flex min-w-[280px] flex-col p-4 sm:p-5">
                <span
                  className={`tools-card-fade mb-3 grid w-full max-w-[470px] grid-cols-5 gap-1.5 transition-transform duration-500 sm:grid-cols-6 ${
                    isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                  }`}
                >
                  {category.tools.map((tool) => (
                    <span
                      key={tool.name}
                      className="tools-chip flex min-w-0 flex-col items-center justify-start gap-1 rounded-[9px] border border-white/10 bg-white/20 px-1 py-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                      title={tool.name}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}icons/tools/${tool.id}`}
                        alt={tool.name}
                        loading="lazy"
                        decoding="async"
                        className={`h-[18px] w-[18px] object-contain opacity-75 sm:h-5 sm:w-5 ${
                          lightMonochromeIcons.has(tool.id) ? 'brightness-0' : ''
                        }`}
                      />
                      <span className="line-clamp-2 min-h-[14px] w-full text-center font-body text-[6.5px] font-semibold leading-[1.05] text-white/95 sm:text-[7px]">
                        {tool.name}
                      </span>
                    </span>
                  ))}
                </span>

                <span
                  className={`tools-card-fade font-body text-[10px] font-medium uppercase tracking-[0.18em] text-white/65 transition-all duration-500 ${
                    isExpanded ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')} / {category.tools.length} tools
                </span>
                <span
                  className={`tools-card-fade mt-1 block font-heading font-semibold leading-tight text-white transition-all duration-500 ${
                    isExpanded ? 'text-2xl opacity-100 sm:text-3xl' : 'text-lg opacity-0'
                  }`}
                >
                  <CategoryTitle name={category.categoryName} />
                </span>
                <span
                  className={`tools-card-fade mt-2 max-w-lg font-body text-xs leading-relaxed text-white/70 transition-all duration-500 sm:text-sm ${
                    isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                  }`}
                >
                  {category.purpose}
                </span>
              </span>

              <span
                className={`absolute inset-x-0 bottom-0 flex h-full flex-col items-center justify-end pb-5 ${
                  isExpanded ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                <span className="tools-chip mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/40 shadow-lg backdrop-blur-sm">
                  <img
                    src={`${import.meta.env.BASE_URL}icons/tools/${category.tools[0].id}`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className={`h-6 w-6 object-contain opacity-75 ${
                      lightMonochromeIcons.has(category.tools[0].id) ? 'brightness-0' : ''
                    }`}
                  />
                </span>
                <span className="font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-white [writing-mode:vertical-rl] [text-shadow:0_2px_10px_rgba(0,0,0,0.95)]">
                  {category.shortName}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollMobileGallery(-1)}
          className="tools-scroll-prev absolute left-0 top-[calc(50%+22px)] z-30 flex -translate-y-1/2 items-center justify-center p-2 text-white drop-shadow-[0_5px_12px_rgba(0,0,0,0.95)] transition-opacity active:opacity-60 md:hidden"
          aria-label="See previous tool cards"
        >
          <ChevronsLeft className="h-8 w-8 stroke-[2.2]" aria-hidden="true" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollMobileGallery(1)}
          className="tools-scroll-next absolute right-0 top-[calc(50%+22px)] z-30 flex -translate-y-1/2 items-center justify-center p-2 text-white drop-shadow-[0_5px_12px_rgba(0,0,0,0.95)] transition-opacity active:opacity-60 md:hidden"
          aria-label="See more tool cards"
        >
          <ChevronsRight className="h-8 w-8 stroke-[2.2]" aria-hidden="true" />
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 -bottom-8 flex items-center justify-center md:hidden">
        <span className="font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
          Swipe to explore
        </span>
      </div>

      <style>{`
        .tools-accordion-card {
          transition:
            flex-grow 600ms cubic-bezier(0.22, 1, 0.36, 1),
            flex-basis 600ms cubic-bezier(0.22, 1, 0.36, 1),
            width 600ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 500ms ease,
            opacity 500ms ease;
        }

        [data-canvas="mobile"] .tools-accordion {
          height: 400px;
          gap: ${MOBILE_GAP}px;
          overflow-x: auto;
          overflow-y: hidden;
          padding-inline: ${MOBILE_PADDING}px;
          scroll-padding-inline: ${MOBILE_PADDING}px;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
          overscroll-behavior-x: contain;
          /* Opening a card changes the scrollable width. Scroll anchoring
             reacts to that by nudging the scroll position, on top of the
             smooth scroll already running — two corrections, one stutter. */
          overflow-anchor: none;
        }

        [data-canvas="mobile"] .tools-accordion[data-expanded="true"] {
          scroll-snap-type: none;
        }

        [data-canvas="mobile"] .tools-accordion::-webkit-scrollbar {
          display: none;
        }

        [data-canvas="mobile"] .tools-accordion-card {
          flex: 0 0 ${MOBILE_CARD_WIDTH}px !important;
          width: ${MOBILE_CARD_WIDTH}px;
          height: 390px;
          scroll-snap-align: start;
          /* Only the two properties that actually move. The desktop rule also
             transitions flex-grow, filter and opacity, none of which change
             here — each one is another property the engine has to check on
             every frame of a resize that is already doing layout work. */
          transition:
            flex-basis ${MOBILE_OPEN_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
            width ${MOBILE_OPEN_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.38);
        }

        [data-canvas="mobile"] .tools-accordion-card[aria-expanded="true"] {
          flex-basis: min(calc(82 * var(--vw)), 330px) !important;
          width: min(calc(82 * var(--vw)), 330px);
        }

        /* backdrop-filter re-reads and re-blurs whatever is painted behind the
           element. There are eight of these on screen at rest and up to fifteen
           more inside an open card, and every one of them is recomputed on
           every frame while a card resizes — by far the most expensive thing in
           this component on a phone. The chips keep their translucent fill, and
           at 18px over a photo the blur was never legible anyway. */
        [data-canvas="mobile"] .tools-chip {
          backdrop-filter: none;
          box-shadow: none;
        }

        /* Nothing hovers on a touch screen, so this transition can only ever
           fire mid-resize, where it costs and shows nothing. */
        [data-canvas="mobile"] .tools-card-photo {
          transition: none;
        }

        [data-canvas="mobile"] .tools-card-fade {
          transition-duration: ${MOBILE_OPEN_MS - 40}ms;
        }

        [data-canvas="mobile"] .tools-scroll-next {
          animation: tools-scroll-next-nudge 1.8s ease-in-out infinite;
        }

        [data-canvas="mobile"] .tools-scroll-prev {
          animation: tools-scroll-prev-nudge 1.8s ease-in-out infinite;
        }

        @keyframes tools-scroll-next-nudge {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(5px); }
        }

        @keyframes tools-scroll-prev-nudge {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(-5px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .tools-accordion-card,
          .tools-accordion-card * {
            transition-duration: 0.01ms !important;
          }

          .tools-scroll-next,
          .tools-scroll-prev {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
