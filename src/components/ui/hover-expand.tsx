import * as React from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { cn } from "../../lib/utils";

export interface HoverExpandItem {
  label: string;
  /** e.g. country, year, category */
  sublabel?: string;
  image: string;
  imageAlt?: string;
  /** short descriptor shown when expanded */
  description?: string;
  /** readable chips shown over the expanded image */
  detailTags?: string[];
}

export interface HoverExpandProps {
  items: HoverExpandItem[];
  /**
   * Row height when collapsed, in pixels.
   * @default 68
   */
  collapsedHeight?: number;
  /**
   * Row height when expanded, in pixels.
   * @default 320
   */
  expandedHeight?: number;
  className?: string;
}

export function HoverExpand({
  items,
  collapsedHeight = 68,
  expandedHeight = 320,
  className,
}: HoverExpandProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [canHover, setCanHover] = React.useState(false);
  const compactRowHeight = Math.min(collapsedHeight, 66);
  const compactExpandedHeight = Math.min(expandedHeight, 292);

  React.useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const rowHeight = canHover ? collapsedHeight : compactRowHeight;
  const openHeight = canHover ? expandedHeight : compactExpandedHeight;
  const revealOffset = Math.max(0, (openHeight - rowHeight) / 2);
  const closedTotalHeight = items.length * rowHeight;
  const openTotalHeight = openHeight + (items.length - 1) * rowHeight;
  const totalHeight = canHover
    ? openTotalHeight
    : activeIndex === null
      ? closedTotalHeight
      : openTotalHeight;

  return (
    <motion.div
      className={cn("relative w-full overflow-hidden font-body [overflow-anchor:none]", className)}
      initial={false}
      animate={{ height: totalHeight }}
      transition={{ type: "spring", stiffness: 250, damping: 32, mass: 0.9 }}
      onMouseLeave={() => canHover && setActiveIndex(null)}
    >
      {items.map((item, i) => {
        const isActive = activeIndex === i;
        const isOtherActive = activeIndex !== null && !isActive;
        const splitActiveTop = activeIndex === null
          ? 0
          : Math.max(0, Math.min(activeIndex * rowHeight, totalHeight - openHeight));
        const itemTop = canHover
          ? activeIndex === null
            ? revealOffset + i * rowHeight
            : i < activeIndex
              ? splitActiveTop - (activeIndex - i) * rowHeight
              : i > activeIndex
                ? splitActiveTop + openHeight + (i - activeIndex - 1) * rowHeight
                : splitActiveTop
          : activeIndex !== null && i > activeIndex
            ? i * rowHeight + (openHeight - rowHeight)
            : i * rowHeight;

        return (
          <motion.div
            key={item.label}
            className={cn(
              "absolute left-0 w-full overflow-hidden border-t border-current/15 outline-none",
              i === items.length - 1 && "border-b",
            )}
            style={{ height: isActive ? openHeight : rowHeight }}
            animate={{
              y: itemTop,
              height: isActive ? openHeight : rowHeight,
              opacity: isOtherActive ? 0.48 : 1,
            }}
            transition={{
              y: {
                type: "spring",
                stiffness: 250,
                damping: 30,
                mass: 0.95,
              },
              height: {
                type: "spring",
                stiffness: 250,
                damping: 30,
                mass: 0.95,
              },
              opacity: { duration: 0.22, ease: "easeOut" },
            }}
            onMouseEnter={() => canHover && setActiveIndex(i)}
            onClick={() => setActiveIndex((current) => current === i ? null : i)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveIndex((current) => current === i ? null : i);
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={isActive}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 h-full w-full origin-center"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 1.04,
              }}
              transition={{
                opacity: { duration: 0.42, ease: [0.23, 1, 0.32, 1] },
                scale: { duration: 0.65, ease: [0.23, 1, 0.32, 1] },
              }}
            >
              <img
                src={item.image}
                alt={item.imageAlt ?? ""}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,13,18,0.94)_0%,rgba(10,13,18,0.76)_48%,rgba(10,13,18,0.12)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/72 to-transparent" />
            </motion.div>

            <div className="absolute inset-x-0 top-0 flex items-center px-3 sm:px-6 md:px-8" style={{ height: rowHeight }}>
              <div className="flex w-full items-center justify-between gap-5">
                <div className="flex min-w-0 items-baseline gap-3 md:gap-4">
                  <motion.span
                    className="shrink-0 text-xs tabular-nums"
                    animate={{
                      color: isActive
                        ? "rgba(255,255,255,0.58)"
                        : "currentColor",
                      opacity: isActive ? 1 : 0.38,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>

                  <motion.span
                    className="min-w-0 text-[clamp(1.05rem,4.6vw,2.15rem)] font-semibold leading-[1.02] tracking-normal"
                    animate={{
                      color: isActive ? "#ffffff" : "currentColor",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>

                </div>

                <div className="flex shrink-0 items-center gap-4">
                  {item.sublabel && (
                  <motion.span
                    className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.2em] md:block"
                    animate={{
                      color: isActive
                        ? "rgba(255,255,255,0.64)"
                        : "currentColor",
                      opacity: isActive ? 1 : 0.42,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.sublabel}
                  </motion.span>
                  )}
                  <motion.span
                    animate={{ color: isActive ? "#ffffff" : "currentColor", opacity: isActive ? 0.8 : 0.42 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  >
                    {isActive ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </motion.span>
                </div>
              </div>
            </div>

            {item.description && (
              <motion.div
                className="pointer-events-none absolute left-4 right-4 max-w-[34rem] sm:left-14 sm:right-auto md:left-20"
                style={{ top: rowHeight + 12 }}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
                transition={{ duration: 0.3, delay: isActive ? 0.1 : 0, ease: [0.23, 1, 0.32, 1] }}
              >
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300 sm:text-xs">
                  Core capability
                </span>
                <p className="text-sm font-medium leading-relaxed text-white/82 sm:text-base">
                  {item.description}
                </p>
              </motion.div>
            )}

            {item.detailTags && (
              <motion.div
                className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5 sm:bottom-5 sm:left-14 sm:right-6 sm:gap-2 md:left-20 md:right-8"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 12,
                }}
                transition={{
                  duration: 0.28,
                  delay: isActive ? 0.16 : 0,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {item.detailTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-semibold tracking-normal text-white shadow-sm backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
