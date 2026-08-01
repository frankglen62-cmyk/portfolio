import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import savedLayout from '../config/layout.json';

/* eslint-disable react-refresh/only-export-components */

/* ═══════════════════════════════════════════════════════════════
   LAYOUT STORE
   ───────────────────────────────────────────────────────────────
   Holds the saved layout, which element is selected, and nothing
   else. All the editing machinery (measuring, dragging, resizing,
   the overlays) lives in components/editor and is only downloaded
   when the gear is loaded — a visitor gets this file and no more.

   `x` / `y` are still stored as OFFSETS from where CSS puts an
   element, because that is what keeps the hero's own responsive
   rules intact. The editor never shows them: it measures the real
   rendered position and converts, so what Frank types and reads is
   always an absolute design-pixel coordinate on the active canvas.
   ═══════════════════════════════════════════════════════════════ */

export type ElementKind = 'text' | 'image' | 'block';

export interface ElementConfig {
  /** Offset from the element's natural CSS position, in design px. */
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  fontSize?: string;
  fontWeight?: number;
  letterSpacing?: string;
  lineHeight?: string;
  color?: string;
  width?: string;
  height?: string;
  zIndex?: number;
}

export interface LayoutConfig {
  [id: string]: ElementConfig;
}

/** An `EditableElement` that is mounted on the canvas right now. */
export interface RegisteredElement {
  /** Base id, e.g. `iAmFrankText`. */
  id: string;
  /** The id being edited on this canvas — `iAmFrankTextMobile` on a phone. */
  activeId: string;
  label: string;
  kind: ElementKind;
  /** False for elements whose stacking is not driven by the saved zIndex. */
  canLayer: boolean;
  node: HTMLElement;
}

/** Where a save actually landed. Two very different outcomes; see saveLayout. */
export type SaveStatus = 'idle' | 'file' | 'local' | 'error';

/* ── Factory defaults ─────────────────────────────────────────── */
export const FALLBACK: LayoutConfig = {
  characterImage: { x: 78, y: 374, scale: 1.45, opacity: 1, rotation: 0, width: 'auto', height: '100%', zIndex: 20 },
  availableBadge: { x: -22, y: 4, scale: 1, opacity: 1, rotation: 0, zIndex: 30 },
  specializationText: { x: -10, y: 99, scale: 1, fontSize: '14px', fontWeight: 500, letterSpacing: '0em', lineHeight: '1.625', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 30 },
  iAmFrankText: { x: -27, y: 28, scale: 1, fontSize: 'clamp(3rem,8vw,7.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: '0.88', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  roleTitleText: { x: 0, y: 0, scale: 1, fontSize: 'clamp(1.2rem,3.5vw,3rem)', fontWeight: 900, letterSpacing: '-0.01em', lineHeight: '1.05', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  aboutTitle: { x: 0, y: 0, scale: 1, fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 700, letterSpacing: '0em', lineHeight: '1', opacity: 1, color: '#ffffff', rotation: 0 },

  characterImageMobile: { x: -6, y: 892, scale: 3.55, opacity: 1, rotation: 0, width: 'auto', height: '100%', zIndex: 20 },
  availableBadgeMobile: { x: -3, y: -18, scale: 1, opacity: 1, rotation: 0, zIndex: 30 },
  specializationTextMobile: { x: 0, y: 0, scale: 1, fontSize: '8.5px', fontWeight: 500, letterSpacing: '0em', lineHeight: '1.35', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 30 },
  iAmFrankTextMobile: { x: 19, y: 15, scale: 1.35, fontSize: 'clamp(2.35rem,12vw,3.15rem)', fontWeight: 900, letterSpacing: '0em', lineHeight: '0.88', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  roleTitleTextMobile: { x: -6, y: 21, scale: 1.1, fontSize: 'clamp(1.05rem,5.1vw,1.35rem)', fontWeight: 700, letterSpacing: '0em', lineHeight: '1.02', opacity: 1, color: '#e0e0e0', rotation: 0, zIndex: 10 },
  aboutTitleMobile: { x: 0, y: 0, scale: 1, fontSize: 'clamp(2.85rem,12.9vw,3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: '0.92', opacity: 1, color: '#1e1e1e', rotation: 0 },
};

/**
 * The layout Frank actually saved, compiled into the bundle rather than
 * fetched: `src/config/layout.json` is written by the dev-server plugin on
 * every save, so a deployed build already knows the final coordinates and
 * paints them on the first frame.
 */
export const SAVED_LAYOUT: LayoutConfig = { ...FALLBACK, ...(savedLayout as LayoutConfig) };

const LS_KEY = 'frankportfolio-layout-v2';

/**
 * The layout to render on the very first frame — nothing is awaited.
 *
 * Which copy wins depends on which one CAN be newer. Under `npm run dev` a save
 * writes the file, so the file is by definition the freshest and localStorage is
 * ignored entirely (without this a hand-edit to layout.json was invisible on the
 * one machine that can actually save it). Off the dev server nothing can write
 * the file, so an edit made in this browser is the newest thing available.
 */
function initialLayout(): LayoutConfig {
  if (import.meta.env.DEV) return SAVED_LAYOUT;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...SAVED_LAYOUT, ...JSON.parse(raw) };
  } catch { /* corrupt storage — the built-in layout stands */ }
  return SAVED_LAYOUT;
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT
   ═══════════════════════════════════════════════════════════════ */
interface VisualEditorContextValue {
  layout: LayoutConfig;
  setLayout: React.Dispatch<React.SetStateAction<LayoutConfig>>;
  updateProp: (id: string, prop: keyof ElementConfig, value: string | number) => void;
  updateProps: (id: string, patch: Partial<ElementConfig>) => void;
  resetElement: (id: string) => void;
  resetAll: () => void;

  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;

  /** Everything currently mounted on the canvas, keyed by active id. */
  registry: Record<string, RegisteredElement>;
  register: (entry: RegisteredElement) => void;
  unregister: (activeId: string) => void;

  saveLayout: () => Promise<void>;
  isSaving: boolean;
  saveStatus: SaveStatus;
  /** Kept for the hero: the layout is known synchronously, so always true. */
  configLoaded: boolean;
}

const VisualEditorContext = createContext<VisualEditorContextValue | undefined>(undefined);

export const useVisualEditor = () => {
  const context = useContext(VisualEditorContext);
  if (!context) throw new Error('useVisualEditor must be used within VisualEditorProvider');
  return context;
};

export const VisualEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layout, setLayout] = useState<LayoutConfig>(initialLayout);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [registry, setRegistry] = useState<Record<string, RegisteredElement>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  /* The dev server is the one place layout.json can change without a rebuild,
     so only a dev build asks for a fresher copy — and only after the paint. */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let cancelled = false;

    fetch('/api/layout-config')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('no dev server'))))
      .then(data => { if (!cancelled) setLayout({ ...SAVED_LAYOUT, ...data }); })
      .catch(() => { /* editing against a preview build — the baked layout stands */ });

    return () => { cancelled = true; };
  }, []);

  const register = useCallback((entry: RegisteredElement) => {
    setRegistry(prev => (prev[entry.activeId]?.node === entry.node
      && prev[entry.activeId]?.label === entry.label
      ? prev
      : { ...prev, [entry.activeId]: entry }));
  }, []);

  const unregister = useCallback((activeId: string) => {
    setRegistry(prev => {
      if (!prev[activeId]) return prev;
      const next = { ...prev };
      delete next[activeId];
      return next;
    });
  }, []);

  const updateProps = useCallback((id: string, patch: Partial<ElementConfig>) => {
    setLayout(prev => ({ ...prev, [id]: { ...(prev[id] ?? { x: 0, y: 0 }), ...patch } }));
  }, []);

  const updateProp = useCallback((id: string, prop: keyof ElementConfig, value: string | number) => {
    updateProps(id, { [prop]: value } as Partial<ElementConfig>);
  }, [updateProps]);

  const resetElement = useCallback((id: string) => {
    const defaults = FALLBACK[id];
    if (!defaults) return;
    setLayout(prev => ({ ...prev, [id]: { ...defaults } }));
  }, []);

  const resetAll = useCallback(() => {
    if (!confirm('Reset every element on both canvases back to the factory layout?')) return;
    setLayout({ ...FALLBACK });
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }, []);

  /**
   * Two very different outcomes used to both report "Saved!":
   *
   *   'file'  — the dev server wrote src/config/layout.json + public/layout.json.
   *             Permanent: survives a new browser, another device, a deploy.
   *   'local' — only this browser's localStorage took it, which is what happens
   *             against `vite preview` or a static host (e.g. from a phone).
   */
  const saveLayout = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus('idle');

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
      // A static host answers unknown paths with index.html and a 200, so
      // require a real JSON acknowledgement rather than an OK status.
      storedToFile = res.ok && (await res.json().catch(() => null))?.success === true;
    } catch {
      /* no dev server reachable — localStorage is all we have */
    }

    setSaveStatus(storedToFile ? 'file' : storedLocally ? 'local' : 'error');
    setIsSaving(false);
    window.setTimeout(() => setSaveStatus('idle'), 6000);
  }, [layout]);

  const value = useMemo<VisualEditorContextValue>(() => ({
    layout, setLayout, updateProp, updateProps, resetElement, resetAll,
    editMode, setEditMode, selectedId, setSelectedId,
    registry, register, unregister,
    saveLayout, isSaving, saveStatus, configLoaded: true,
  }), [
    layout, updateProp, updateProps, resetElement, resetAll,
    editMode, selectedId, registry, register, unregister,
    saveLayout, isSaving, saveStatus,
  ]);

  return (
    <VisualEditorContext.Provider value={value}>
      {children}
    </VisualEditorContext.Provider>
  );
};
