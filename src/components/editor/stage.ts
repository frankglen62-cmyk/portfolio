import { createContext, useContext } from 'react';
import type { Frame, Measurement } from './measure';

/** The editor's one accent colour. */
export const ACCENT = '#f97316';

export interface Overlays {
  bounds: boolean;
  grid: boolean;
  centres: boolean;
  outlines: boolean;
}

/**
 * Live editing state shared by the overlay and the panel. It is deliberately
 * NOT in VisualEditorContext: it changes on every animation frame while an
 * element is being dragged, and the hero must not re-render for that.
 */
export interface EditorStageValue {
  /** The selected element as it is rendered right now — screen and canvas px. */
  selection: Measurement | null;
  /** Live canvas-box position and scale, re-measured every frame. */
  frame: Frame;
  /** Pointer position in design pixels on the canvas. */
  pointer: { x: number; y: number } | null;
  /** Bounding box of everything a visitor must see, in design px. */
  contentBounds: { left: number; right: number; top: number } | null;

  debug: boolean;
  setDebug: (value: boolean) => void;
  overlays: Overlays;
  toggleOverlay: (key: keyof Overlays) => void;
  snap: boolean;
  setSnap: (value: boolean) => void;
  step: number;
  setStep: (value: number) => void;
  /** True while a drag or resize is in flight. */
  busy: boolean;

  /** Select an element and measure it in the same tick — no waiting for a frame. */
  selectElement: (activeId: string | null) => void;

  /** Move the selection so its top-left lands on this canvas coordinate. */
  setCanvasX: (value: number) => void;
  setCanvasY: (value: number) => void;
  /** Resize the selection to this rendered width, keeping its top-left corner. */
  setCanvasWidth: (value: number) => void;
  nudge: (dx: number, dy: number) => void;
}

export const StageContext = createContext<EditorStageValue | null>(null);

export const useEditorStage = (): EditorStageValue => {
  const value = useContext(StageContext);
  if (!value) throw new Error('useEditorStage must be used inside the editor');
  return value;
};
