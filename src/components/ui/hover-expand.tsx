import * as React from "react";
import { motion } from "framer-motion";

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
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const revealOffset = Math.max(0, (expandedHeight - collapsedHeight) / 2);
  const totalHeight = items.length * collapsedHeight + revealOffset;
  const hasHover = hoveredIndex !== null;

  return (
    <div
      className={cn("relative w-full overflow-hidden font-body", className)}
      style={{ height: totalHeight }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {items.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const isOtherHovered = hoveredIndex !== null && !isHovered;
        const activeTop =
          hoveredIndex === null
            ? revealOffset
            : Math.max(
                0,
                Math.min(
                  revealOffset + hoveredIndex * collapsedHeight - revealOffset,
                  totalHeight - expandedHeight,
                ),
              );
        const itemTop =
          hasHover && hoveredIndex !== null
            ? i < hoveredIndex
              ? activeTop - (hoveredIndex - i) * collapsedHeight
              : i > hoveredIndex
                ? activeTop +
                  expandedHeight +
                  (i - hoveredIndex - 1) * collapsedHeight
                : activeTop
            : revealOffset + i * collapsedHeight;

        return (
          <motion.div
            key={item.label}
            className={cn(
              "absolute left-0 w-full overflow-hidden border-t border-current/15 outline-none",
              i === items.length - 1 && "border-b",
            )}
            style={{ height: isHovered ? expandedHeight : collapsedHeight }}
            animate={{
              y: itemTop,
              height: isHovered ? expandedHeight : collapsedHeight,
              opacity: isOtherHovered ? 0.34 : 1,
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
            onMouseEnter={() => setHoveredIndex(i)}
            onFocus={() => setHoveredIndex(i)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => setHoveredIndex(i)}
            tabIndex={0}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 h-full w-full origin-center"
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 1.04,
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
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,13,18,0.88)_0%,rgba(10,13,18,0.52)_46%,rgba(10,13,18,0.18)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/72 to-transparent" />
            </motion.div>

            <div className="absolute inset-0 flex items-center px-4 py-4 sm:px-6 md:px-8">
              <div className="flex w-full items-center justify-between gap-5">
                <div className="flex min-w-0 items-baseline gap-3 md:gap-4">
                  <motion.span
                    className="shrink-0 text-xs tabular-nums"
                    animate={{
                      color: isHovered
                        ? "rgba(255,255,255,0.58)"
                        : "currentColor",
                      opacity: isHovered ? 1 : 0.38,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>

                  <motion.span
                    className="min-w-0 text-[clamp(1.35rem,3vw,2.15rem)] font-semibold leading-none tracking-normal"
                    animate={{
                      color: isHovered ? "#ffffff" : "currentColor",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>

                  {item.description && (
                    <motion.span
                      className="hidden max-w-[44rem] text-sm font-medium leading-relaxed text-white/76 md:block"
                      initial={false}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -10,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: isHovered ? 0.1 : 0,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      - {item.description}
                    </motion.span>
                  )}
                </div>

                {item.sublabel && (
                  <motion.span
                    className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.2em] sm:block"
                    animate={{
                      color: isHovered
                        ? "rgba(255,255,255,0.64)"
                        : "currentColor",
                      opacity: isHovered ? 1 : 0.42,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.sublabel}
                  </motion.span>
                )}
              </div>
            </div>

            {item.detailTags && (
              <motion.div
                className="pointer-events-none absolute bottom-5 left-4 right-4 flex flex-wrap gap-2 sm:left-6 sm:right-6 md:left-8 md:right-8"
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 12,
                }}
                transition={{
                  duration: 0.28,
                  delay: isHovered ? 0.16 : 0,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {item.detailTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-xs font-semibold tracking-normal text-white shadow-sm backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
