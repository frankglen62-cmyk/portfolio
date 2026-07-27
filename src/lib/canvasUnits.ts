/**
 * Viewport units (`vw`, `vh`, `svh`, …) are NOT aware of the canvas zoom: inside
 * the stage `100vw` resolves against the real window and is then scaled again,
 * so it lands at the wrong size. `--vw` / `--vh` are the canvas-space
 * equivalents (see styles/index.css).
 *
 * This rewrites viewport units in any CSS length string — used for values that
 * come from saved layout config, where Frank can still type a friendly `8vw`.
 */
const VIEWPORT_UNIT = /(-?\d*\.?\d+)(s|l|d)?(vw|vh)\b/gi;

export function toCanvasLength(value: string): string;
export function toCanvasLength<T>(value: T): T;
export function toCanvasLength(value: unknown): unknown {
  if (typeof value !== 'string' || !value) return value;

  return value.replace(VIEWPORT_UNIT, (_match, amount: string, _prefix, axis: string) =>
    axis.toLowerCase() === 'vw'
      ? `calc(${amount} * var(--vw))`
      : `calc(${amount} * var(--vh))`,
  );
}
