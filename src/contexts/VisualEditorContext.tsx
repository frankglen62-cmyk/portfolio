import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getRenderScale } from '../lib/viewportStage';
import savedLayout from '../config/layout.json';

/* eslint-disable react-refresh/only-export-components */

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
export interface ElementConfig {
  x: number;
  y: number;
  fontSize?: string;
  fontWeight?: number;
  letterSpacing?: string;
  lineHeight?: string;
  opacity?: number;
  color?: string;
  rotation?: number;
  scale?: number;
  width?: string;
  height?: string;
  zIndex?: number;
}

/** Where a save actually landed. See saveConfig. */
export type SaveStatus = 'idle' | 'file' | 'local' | 'error';

export interface LayoutConfig {
  [key: string]: ElementConfig;
}

export interface GuideLines {
  horizontal: number[];
  vertical: number[];
}

export type FieldType = 'text' | 'number' | 'range' | 'color';
export interface FieldDef { key: string; label: string; type: FieldType; min?: number; max?: number; step?: number; unit?: string; }

export const TEXT_FIELDS: FieldDef[] = [
  { key: 'scale', label: 'Scale', type: 'range', min: 0.3, max: 5, step: 0.05 },
  { key: 'fontSize', label: 'Font Size', type: 'text' },
  { key: 'fontWeight', label: 'Font Weight', type: 'range', min: 100, max: 900, step: 100 },
  { key: 'letterSpacing', label: 'Letter Spacing', type: 'text' },
  { key: 'lineHeight', label: 'Line Height', type: 'text' },
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05 },
  { key: 'color', label: 'Color', type: 'color' },
  { key: 'rotation', label: 'Rotation', type: 'range', min: -180, max: 180, step: 1, unit: '°' },
];
export const IMAGE_FIELDS: FieldDef[] = [
  { key: 'scale', label: 'Scale', type: 'range', min: 0.3, max: 5, step: 0.05 },
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05 },
  { key: 'rotation', label: 'Rotation', type: 'range', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'width', label: 'Width', type: 'text' },
  { key: 'height', label: 'Height', type: 'text' },
];
export const BADGE_FIELDS: FieldDef[] = [
  { key: 'scale', label: 'Scale', type: 'range', min: 0.5, max: 5, step: 0.05 },
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05 },
  { key: 'rotation', label: 'Rotation', type: 'range', min: -180, max: 180, step: 1, unit: '°' },
];

export const getFieldsForElement = (id: string): FieldDef[] => {
  const baseId = id.replace(/Mobile$/, '');
  if (baseId === 'characterImage') return IMAGE_FIELDS;
  if (baseId === 'availableBadge') return BADGE_FIELDS;
  return TEXT_FIELDS;
};

/* ═══════════════════════════════════════════
   DEFAULTS
   ═══════════════════════════════════════════ */
export const FALLBACK: LayoutConfig = {
  heyTextLeft: { x: 136, y: 122, fontSize: 'clamp(4rem,14vw,12rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '1', opacity: 0.75, color: '#e0e0e0', rotation: 0 },
  heyTextRight: { x: -2, y: 122, fontSize: 'clamp(4rem,14vw,12rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '1', opacity: 0.7, color: '#e0e0e0', rotation: 0 },
  characterImage: { x: 78, y: 374, scale: 1.45, opacity: 1, rotation: 0, width: 'auto', height: '100%', zIndex: 20 },
  availableBadge: { x: -22, y: 4, scale: 1, opacity: 1, rotation: 0, zIndex: 30 },
  specializationText: { x: -10, y: 99, fontSize: '14px', fontWeight: 500, letterSpacing: '0em', lineHeight: '1.625', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 30 },
  iAmFrankText: { x: -27, y: 28, fontSize: 'clamp(3rem,8vw,7.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: '0.88', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  roleTitleText: { x: 0, y: 0, fontSize: 'clamp(1.2rem,3.5vw,3rem)', fontWeight: 900, letterSpacing: '-0.01em', lineHeight: '1.05', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  aboutTitle: { x: 0, y: 0, fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 700, letterSpacing: '0em', lineHeight: '1', opacity: 1, color: '#e0e0e0', rotation: 0 },
  heyTextLeftMobile: { x: -31, y: 120, fontSize: 'clamp(2.5rem,12vw,3.4rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '1', opacity: 1, color: '#e0e0e0', rotation: 0 },
  heyTextRightMobile: { x: 66, y: 120, fontSize: 'clamp(2.5rem,12vw,3.4rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '1', opacity: 1, color: '#e0e0e0', rotation: 0 },
  characterImageMobile: { x: -6, y: 892, scale: 3.55, opacity: 1, rotation: 0, width: 'auto', height: '100%', zIndex: 20 },
  availableBadgeMobile: { x: -3, y: -18, scale: 1, opacity: 1, rotation: 0, zIndex: 30 },
  specializationTextMobile: { x: 0, y: 0, fontSize: '8.5px', fontWeight: 500, letterSpacing: '0em', lineHeight: '1.35', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 30 },
  iAmFrankTextMobile: { x: 19, y: 15, scale: 1.35, fontSize: 'clamp(2.35rem,12vw,3.15rem)', fontWeight: 900, letterSpacing: '0em', lineHeight: '0.88', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  roleTitleTextMobile: { x: -6, y: 21, scale: 1.1, fontSize: 'clamp(1.05rem,5.1vw,1.35rem)', fontWeight: 700, letterSpacing: '0em', lineHeight: '1.02', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  aboutTitleMobile: { x: 0, y: 0, fontSize: 'clamp(2.45rem,11vw,2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: '0.92', opacity: 1, color: '#e0e0e0', rotation: 0 },
};

/**
 * The layout Frank actually saved, compiled into the bundle rather than fetched.
 * `src/config/layout.json` is written by the dev-server plugin on every save and
 * committed, so a deployed build already knows the final coordinates and can
 * paint them on the first frame. See loadLayout below.
 */
export const SAVED_LAYOUT: LayoutConfig = { ...FALLBACK, ...(savedLayout as LayoutConfig) };

const LS_KEY = 'frankportfolio-layout-v2';

/**
 * The layout to render on the very first frame — no await anywhere.
 *
 * A deployed build used to spend two serial round trips getting here:
 * /api/layout-config (which a static host answers with index.html, status 200,
 * so it only fails at JSON.parse) and then /layout.json. Every hero element sat
 * at the fallback coordinates until they landed and then jumped. The file only
 * ever changes by a deploy, so it is compiled in instead.
 */
function initialLayout(): LayoutConfig {
  // Under `npm run dev` the file is the authority (see the fetch below), so the
  // first frame paints it directly instead of flashing this browser's older
  // localStorage copy for a moment and then correcting itself.
  if (import.meta.env.DEV) return SAVED_LAYOUT;

  try {
    // An edit made on this very browser still outranks the built-in layout.
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...SAVED_LAYOUT, ...JSON.parse(raw) };
  } catch { /* corrupt storage — the built-in layout stands */ }
  return SAVED_LAYOUT;
}

/* ═══════════════════════════════════════════
   CONTEXT INTERFACE
   ═══════════════════════════════════════════ */
interface VisualEditorContextProps {
  layout: LayoutConfig;
  setLayout: React.Dispatch<React.SetStateAction<LayoutConfig>>;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  panelOpen: boolean;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedElement: string | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<string | null>>;
  updateProp: (id: string, prop: string, value: string | number) => void;
  saveConfig: () => Promise<void>;
  resetConfig: () => void;
  isSaving: boolean;
  saveStatus: SaveStatus;
  configLoaded: boolean;
  elementRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  guides: GuideLines;
  setGuides: React.Dispatch<React.SetStateAction<GuideLines>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  startElementDrag: (id: string, event: Pick<PointerEvent, 'clientX' | 'clientY'>) => void;
  dragState: React.MutableRefObject<{ active: boolean; id: string; startX: number; startY: number; origX: number; origY: number; coordinateScaleX?: number; coordinateScaleY?: number; } | null>;
  scaleState: React.MutableRefObject<{ active: boolean; id: string; startY: number; origScale: number; zoom?: number; } | null>;
  computeGuides: (dragId: string, dragCenterX: number, dragCenterY: number) => void;
  registerElementLabel: (id: string, label: string) => void;
  elementLabels: Record<string, string>;
}

const VisualEditorContext = createContext<VisualEditorContextProps | undefined>(undefined);

export const useVisualEditor = () => {
  const context = useContext(VisualEditorContext);
  if (!context) throw new Error('useVisualEditor must be used within VisualEditorProvider');
  return context;
};

export const VisualEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layout, setLayout] = useState<LayoutConfig>(initialLayout);
  const [editMode, setEditMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  // Nothing is fetched before the layout is known, so it is loaded on frame one.
  const [configLoaded] = useState(true);
  const [guides, setGuides] = useState<GuideLines>({ horizontal: [], vertical: [] });
  const [isDragging, setIsDragging] = useState(false);
  const [elementLabels, setElementLabels] = useState<Record<string, string>>({
    heyTextLeft: '"Hey," Text',
    heyTextRight: '"there" Text',
    characterImage: 'Character Image',
    availableBadge: 'Available Badge',
    specializationText: 'Specialization Text',
    iAmFrankText: '"FRANK" Text',
    roleTitleText: 'Role Title Text',
    aboutTitle: 'About Title',
    heyTextLeftMobile: '"Hey," Text (Mobile)',
    heyTextRightMobile: '"there" Text (Mobile)',
    characterImageMobile: 'Character Image (Mobile)',
    availableBadgeMobile: 'Available Badge (Mobile)',
    specializationTextMobile: 'Specialization Text (Mobile)',
    iAmFrankTextMobile: '"FRANK" Text (Mobile)',
    roleTitleTextMobile: 'Role Title Text (Mobile)',
    aboutTitleMobile: 'About Title (Mobile)',
  });

  const elementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragState = useRef<{ active: boolean; id: string; startX: number; startY: number; origX: number; origY: number; coordinateScaleX?: number; coordinateScaleY?: number; } | null>(null);
  const scaleState = useRef<{ active: boolean; id: string; startY: number; origScale: number; zoom?: number; } | null>(null);

  // The initial layout is already correct (see initialLayout). The dev server is
  // the one place src/config/layout.json can change without a rebuild, so only
  // a dev build asks it for a fresher copy — and even then, after the paint.
  //
  // In dev the FILE wins over this browser's localStorage, which is the opposite
  // of everywhere else. Under `npm run dev` a save writes the file (green "Saved
  // to file"), so the file is the newer of the two by definition — while the
  // stale localStorage copy was silently outranking it, which is why an edit to
  // layout.json could be reloaded and reloaded and never show up. Off the dev
  // server there is nothing to write the file, so localStorage stays the
  // authority (that is the blue "Saved here only" path, e.g. editing from a
  // phone against `vite preview`).
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let cancelled = false;
    fetch('/api/layout-config')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('no dev server'))))
      .then(data => { if (!cancelled) setLayout({ ...SAVED_LAYOUT, ...data }); })
      .catch(() => { /* editing against a preview build — the baked layout stands */ });

    return () => { cancelled = true; };
  }, []);

  /**
   * Two very different outcomes used to both report "Saved!":
   *
   *   'file'  — the dev server wrote src/config/layout.json + public/layout.json.
   *             Permanent: it survives a new browser, another device, a deploy.
   *   'local' — only this browser's localStorage took it. The layout is right
   *             here and nowhere else, which is why an edit could look saved and
   *             then be missing from the phone.
   *
   * The panel now says which one happened instead of claiming success either
   * way, so "nasave ba talaga?" has a visible answer.
   */
  const saveConfig = async () => {
    setIsSaving(true); setSaveStatus('idle');

    let storedLocally = true;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(layout));
    } catch {
      storedLocally = false;
    }

    let storedToFile = false;
    try {
      const res = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout),
      });
      // A static host answers 404/405 here, and index.html for unknown paths —
      // so require a real JSON acknowledgement, not merely an OK status.
      storedToFile = res.ok && (await res.json().catch(() => null))?.success === true;
    } catch {
      /* no dev server reachable — localStorage is all we have */
    }

    setSaveStatus(storedToFile ? 'file' : storedLocally ? 'local' : 'error');
    setTimeout(() => setSaveStatus('idle'), 5000);
    setIsSaving(false);
  };

  const resetConfig = () => {
    if (confirm('Reset all positions and styles to defaults?')) {
      setLayout(FALLBACK);
      try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    }
  };

  const updateProp = (id: string, prop: string, value: string | number) => {
    setLayout(prev => ({ ...prev, [id]: { ...prev[id], [prop]: value } }));
  };

  // Use the same drag setup for the panel handle and a selected element itself.
  // Pointer coordinates are in real screen pixels while the page is drawn on a
  // scaled design canvas, so the delta is converted back into canvas units —
  // one pixel of finger travel moves the element the same visible distance no
  // matter how far the canvas is zoomed. Both axes are design pixels, so both
  // use the same factor and a diagonal drag can no longer skew. The scale is
  // measured from the element's own canvas box, which also picks up the hero
  // overscan on a tall window.
  const startElementDrag = useCallback((id: string, event: Pick<PointerEvent, 'clientX' | 'clientY'>) => {
    const config = layout[id];
    if (!config) return;

    const scale = getRenderScale(elementRefs.current[id]);
    dragState.current = {
      active: true,
      id,
      startX: event.clientX,
      startY: event.clientY,
      origX: config.x || 0,
      origY: config.y || 0,
      coordinateScaleX: scale,
      coordinateScaleY: scale,
    };
  }, [layout]);

  const registerElementLabel = useCallback((id: string, label: string) => {
    setElementLabels(prev => prev[id] === label ? prev : { ...prev, [id]: label });
  }, []);

  const computeGuides = useCallback((dragId: string, dragCenterX: number, dragCenterY: number) => {
    const h: number[] = [];
    const v: number[] = [];
    const SNAP_THRESHOLD = 6;

    Object.keys(layout).forEach(id => {
      if (id === dragId) return;
      const el = elementRefs.current[id];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Calculate center relative to viewport
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      if (Math.abs(dragCenterY - cy) < SNAP_THRESHOLD) h.push(cy);
      if (Math.abs(dragCenterX - cx) < SNAP_THRESHOLD) v.push(cx);
    });

    setGuides({ horizontal: h, vertical: v });
  }, [layout]);

  // ─── Pointer move + up (handles scale & drag from Move Handle) ───────────────
  useEffect(() => {
    if (!editMode) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Drag via dragState (set by Move Handle with active:true directly)
      if (dragState.current?.active) {
        setIsDragging(true);
        const { id, startX, startY, origX, origY, coordinateScaleX = 1, coordinateScaleY = 1 } = dragState.current;
        const dx = (e.clientX - startX) / coordinateScaleX;
        const dy = (e.clientY - startY) / coordinateScaleY;
        setLayout(prev => ({ ...prev, [id]: { ...prev[id], x: Math.round(origX + dx), y: Math.round(origY + dy) } }));
        const el = elementRefs.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          computeGuides(id, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }

      // Scale via scaleState (set by scale-corner handles in EditableElement)
      if (scaleState.current?.active) {
        const { id, startY, origScale, zoom = 1 } = scaleState.current;
        // Normalised to design pixels so the same drag produces the same scale
        // change whether the canvas is at 40% or 200%.
        const dy = (startY - e.clientY) / zoom;
        const newScale = Math.max(0.1, Math.round((origScale + dy * 0.005) * 100) / 100);
        setLayout(prev => ({ ...prev, [id]: { ...prev[id], scale: newScale } }));
      }
    };

    const handlePointerUp = () => {
      // Only delay-clear isDragging if a real drag actually happened
      if (dragState.current?.active || scaleState.current?.active) {
        setTimeout(() => setIsDragging(false), 50);
      }
      dragState.current  = null;
      scaleState.current = null;
      setGuides({ horizontal: [], vertical: [] });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [editMode, computeGuides, isDragging]);

  return (
    <VisualEditorContext.Provider value={{
      layout, setLayout, editMode, setEditMode, panelOpen, setPanelOpen,
      selectedElement, setSelectedElement, updateProp, saveConfig, resetConfig,
      isSaving, saveStatus, configLoaded, elementRefs, guides, setGuides,
      isDragging, setIsDragging, startElementDrag, dragState, scaleState, computeGuides,
      registerElementLabel, elementLabels
    }}>
      {children}
    </VisualEditorContext.Provider>
  );
};
