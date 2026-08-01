/* ============================================================
   Editor measurement — the whole reason the new editor exists
   ------------------------------------------------------------
   The old panel showed the raw `x` / `y` it had saved, which are
   OFFSETS added on top of wherever CSS put an element. A title
   sitting dead centre of the screen could read `x: 649, y: -447`,
   so the numbers said nothing about where the thing actually was.

   Everything here reads the opposite way round: measure what is
   ON SCREEN and express it in design pixels of the active canvas.
   That is the coordinate system the layout is authored in, the one
   that renders identically on every device — so the number in the
   panel and the position Frank can see are the same number.

     canvasX = (clientX - canvasBoxLeft) / scale

   `scale` is measured from the `.canvas-box` itself rather than
   multiplied out of zoom × hero-fill, so it stays correct whatever
   the box ended up at (phone shrink-to-fit included).
   ============================================================ */

import { getViewportState } from '../../lib/viewportStage';

export interface Box { x: number; y: number; w: number; h: number }

export interface Frame {
  /** Canvas-box origin, in real client pixels. */
  left: number;
  top: number;
  /** Client pixels per design pixel inside the box (zoom × hero fill). */
  scale: number;
  designWidth: number;
  designHeight: number;
}

export interface Measurement {
  /** Where the element is on the actual screen. */
  client: Box;
  /** The same rectangle in design pixels on the active canvas. */
  canvas: Box;
  frame: Frame;
}

export type Corner = 'nw' | 'ne' | 'se' | 'sw';

const boxOf = (node?: Element | null): HTMLElement | null =>
  (node?.closest?.('.canvas-box') as HTMLElement | null)
  ?? document.querySelector<HTMLElement>('.canvas-box');

/** Live position and scale of the canvas the hero is drawn on. */
export const canvasFrame = (node?: Element | null): Frame => {
  const { designWidth, designHeight, zoom, heroFill } = getViewportState();
  const box = boxOf(node);
  if (!box) return { left: 0, top: 0, scale: zoom, designWidth, designHeight };

  const rect = box.getBoundingClientRect();
  const scale = rect.width > 0 ? rect.width / designWidth : zoom * heroFill;
  return { left: rect.left, top: rect.top, scale, designWidth, designHeight };
};

export const measureNode = (node?: Element | null): Measurement | null => {
  if (!node) return null;
  const frame = canvasFrame(node);
  if (!frame.scale) return null;

  const rect = node.getBoundingClientRect();
  return {
    client: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    canvas: {
      x: (rect.left - frame.left) / frame.scale,
      y: (rect.top - frame.top) / frame.scale,
      w: rect.width / frame.scale,
      h: rect.height / frame.scale,
    },
    frame,
  };
};

export const clientToCanvas = (clientX: number, clientY: number, frame: Frame) => ({
  x: (clientX - frame.left) / frame.scale,
  y: (clientY - frame.top) / frame.scale,
});

export const canvasToClient = (x: number, y: number, frame: Frame) => ({
  x: frame.left + x * frame.scale,
  y: frame.top + y * frame.scale,
});

/** The corner of a box, in whatever space the box is expressed in. */
export const cornerOf = (box: Box, corner: Corner) => ({
  x: corner === 'nw' || corner === 'sw' ? box.x : box.x + box.w,
  y: corner === 'nw' || corner === 'ne' ? box.y : box.y + box.h,
});

export const oppositeCorner = (corner: Corner): Corner =>
  ({ nw: 'se', ne: 'sw', se: 'nw', sw: 'ne' } as const)[corner];

const nearlyEqual = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;

export const boxesEqual = (a: Box | null, b: Box | null, eps = 0.25): boolean => {
  if (!a || !b) return a === b;
  return nearlyEqual(a.x, b.x, eps) && nearlyEqual(a.y, b.y, eps)
    && nearlyEqual(a.w, b.w, eps) && nearlyEqual(a.h, b.h, eps);
};

export const framesEqual = (a: Frame | null, b: Frame | null, eps = 0.25): boolean => {
  if (!a || !b) return a === b;
  return nearlyEqual(a.left, b.left, eps) && nearlyEqual(a.top, b.top, eps)
    && nearlyEqual(a.scale, b.scale, 0.0005)
    && a.designWidth === b.designWidth && a.designHeight === b.designHeight;
};

type Checkable = HTMLElement & { checkVisibility?: (options?: Record<string, boolean>) => boolean };

/**
 * Is this element part of the layout right now? The About title lives in a
 * `visibility: hidden` panel until it is selected, and without this its
 * full-panel box would swallow every click aimed at the hero underneath.
 *
 * Opacity deliberately does NOT count. An element faded to 0 — by the editor,
 * by a scroll animation, or because a background tab starved the intro
 * animation of frames — still occupies its place in the composition and must
 * stay selectable.
 */
export const isVisible = (node: HTMLElement): boolean => {
  const candidate = node as Checkable;
  if (typeof candidate.checkVisibility === 'function') {
    return candidate.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true });
  }
  const style = getComputedStyle(node);
  return style.visibility !== 'hidden' && style.display !== 'none';
};
