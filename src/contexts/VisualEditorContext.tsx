import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
}

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
  { key: 'fontSize', label: 'Font Size', type: 'text' },
  { key: 'fontWeight', label: 'Font Weight', type: 'range', min: 100, max: 900, step: 100 },
  { key: 'letterSpacing', label: 'Letter Spacing', type: 'text' },
  { key: 'lineHeight', label: 'Line Height', type: 'text' },
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05 },
  { key: 'color', label: 'Color', type: 'color' },
  { key: 'rotation', label: 'Rotation', type: 'range', min: -180, max: 180, step: 1, unit: '°' },
];
export const IMAGE_FIELDS: FieldDef[] = [
  { key: 'scale', label: 'Scale', type: 'range', min: 0.3, max: 2, step: 0.05 },
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05 },
  { key: 'rotation', label: 'Rotation', type: 'range', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'width', label: 'Width', type: 'text' },
  { key: 'height', label: 'Height', type: 'text' },
];
export const BADGE_FIELDS: FieldDef[] = [
  { key: 'scale', label: 'Scale', type: 'range', min: 0.5, max: 2, step: 0.05 },
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
  heyTextLeft: { x: -1, y: 75, fontSize: 'clamp(4rem,14vw,12rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '1', opacity: 0.75, color: '#1e1e1e', rotation: 0 },
  heyTextRight: { x: 42, y: 74, fontSize: 'clamp(4rem,14vw,12rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '1', opacity: 0.7, color: '#1e1e1e', rotation: 0 },
  characterImage: { x: 85, y: 336, scale: 1.35, opacity: 1, rotation: 0, width: 'auto', height: '100%' },
  availableBadge: { x: -22, y: 4, scale: 1, opacity: 1, rotation: 0 },
  specializationText: { x: -10, y: 99, fontSize: '14px', fontWeight: 500, letterSpacing: '0em', lineHeight: '1.625', opacity: 1, color: '#1e1e1e', rotation: 0 },
  iAmFrankText: { x: -27, y: 28, fontSize: 'clamp(3rem,8vw,7.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: '0.88', opacity: 1, color: '#1e1e1e', rotation: 0 },
  roleTitleText: { x: 0, y: 0, fontSize: 'clamp(1.2rem,3.5vw,3rem)', fontWeight: 900, letterSpacing: '-0.01em', lineHeight: '1.05', opacity: 1, color: '#1e1e1e', rotation: 0 },
  aboutTitle: { x: 0, y: 0, fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 700, letterSpacing: '0em', lineHeight: '1', opacity: 1, color: '#ffffff', rotation: 0 },
  heyTextLeftMobile: { x: 0, y: 0, fontSize: 'clamp(3.9rem,16.5vw,5.2rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '0.95', opacity: 0.75, color: '#1e1e1e', rotation: 0 },
  heyTextRightMobile: { x: 0, y: 0, fontSize: 'clamp(3.9rem,16.5vw,5.2rem)', fontWeight: 400, letterSpacing: '0em', lineHeight: '0.95', opacity: 0.7, color: '#1e1e1e', rotation: 0 },
  characterImageMobile: { x: 0, y: 0, scale: 1.02, opacity: 1, rotation: 0, width: 'auto', height: '100%' },
  availableBadgeMobile: { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 },
  specializationTextMobile: { x: 0, y: 0, fontSize: '9px', fontWeight: 500, letterSpacing: '0em', lineHeight: '1.35', opacity: 1, color: '#1e1e1e', rotation: 0 },
  iAmFrankTextMobile: { x: 0, y: 10, fontSize: 'clamp(2.65rem,12.3vw,3.85rem)', fontWeight: 900, letterSpacing: '0em', lineHeight: '0.84', opacity: 1, color: '#1e1e1e', rotation: 0 },
  roleTitleTextMobile: { x: 0, y: 8, fontSize: 'clamp(1.06rem,5.25vw,1.6rem)', fontWeight: 900, letterSpacing: '0em', lineHeight: '0.96', opacity: 1, color: '#1e1e1e', rotation: 0 },
  aboutTitleMobile: { x: 0, y: 0, fontSize: 'clamp(2.3rem,10.5vw,3.35rem)', fontWeight: 700, letterSpacing: '0em', lineHeight: '0.92', opacity: 1, color: '#1e1e1e', rotation: 0 },
};

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
  saveStatus: 'idle' | 'success' | 'error';
  configLoaded: boolean;
  elementRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  guides: GuideLines;
  setGuides: React.Dispatch<React.SetStateAction<GuideLines>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  dragState: React.MutableRefObject<{ active: boolean; id: string; startX: number; startY: number; origX: number; origY: number; } | null>;
  scaleState: React.MutableRefObject<{ active: boolean; id: string; startY: number; origScale: number; } | null>;
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
  const [layout, setLayout] = useState<LayoutConfig>(FALLBACK);
  const [editMode, setEditMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [configLoaded, setConfigLoaded] = useState(false);
  const [guides, setGuides] = useState<GuideLines>({ horizontal: [], vertical: [] });
  const [isDragging, setIsDragging] = useState(false);
  const [elementLabels, setElementLabels] = useState<Record<string, string>>({
    heyTextLeft: '"Hey," Text',
    heyTextRight: '"there" Text',
    characterImage: 'Character Image',
    availableBadge: 'Available Badge',
    specializationText: 'Specialization Text',
    iAmFrankText: '"I AM FRANK" Text',
    roleTitleText: 'Role Title Text',
    aboutTitle: 'About Title',
    heyTextLeftMobile: '"Hey," Text (Mobile)',
    heyTextRightMobile: '"there" Text (Mobile)',
    characterImageMobile: 'Character Image (Mobile)',
    availableBadgeMobile: 'Available Badge (Mobile)',
    specializationTextMobile: 'Specialization Text (Mobile)',
    iAmFrankTextMobile: '"I AM FRANK" Text (Mobile)',
    roleTitleTextMobile: 'Role Title Text (Mobile)',
    aboutTitleMobile: 'About Title (Mobile)',
  });

  const elementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragState = useRef<{ active: boolean; id: string; startX: number; startY: number; origX: number; origY: number; } | null>(null);
  const scaleState = useRef<{ active: boolean; id: string; startY: number; origScale: number; } | null>(null);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const apiResponse = await fetch('/api/layout-config');
        if (!apiResponse.ok) throw new Error('Layout API unavailable');
        const data = await apiResponse.json();
        setLayout({ ...FALLBACK, ...data });
      } catch {
        try {
          const staticResponse = await fetch('/layout.json');
          if (!staticResponse.ok) throw new Error('Static layout unavailable');
          const data = await staticResponse.json();
          setLayout({ ...FALLBACK, ...data });
        } catch {
          setLayout(FALLBACK);
        }
      } finally {
        setConfigLoaded(true);
      }
    };

    loadLayout();
  }, []);

  const saveConfig = async () => {
    setIsSaving(true); setSaveStatus('idle');
    try {
      const res = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout),
      });
      setSaveStatus(res.ok ? 'success' : 'error');
      if (res.ok) setTimeout(() => setSaveStatus('idle'), 2500);
    } catch { setSaveStatus('error'); }
    setIsSaving(false);
  };

  const resetConfig = () => {
    if (confirm('Reset all positions and styles to defaults?')) setLayout(FALLBACK);
  };

  const updateProp = (id: string, prop: string, value: string | number) => {
    setLayout(prev => ({ ...prev, [id]: { ...prev[id], [prop]: value } }));
  };

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

  useEffect(() => {
    if (!editMode) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (dragState.current?.active) {
        setIsDragging(true);
        const { id, startX, startY, origX, origY } = dragState.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newX = Math.round(origX + dx);
        const newY = Math.round(origY + dy);

        setLayout(prev => ({ ...prev, [id]: { ...prev[id], x: newX, y: newY } }));

        const el = elementRefs.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          computeGuides(id, cx, cy);
        }
      }

      if (scaleState.current?.active) {
        const { id, startY, origScale } = scaleState.current;
        const dy = startY - e.clientY;
        const newScale = Math.max(0.1, Math.round((origScale + dy * 0.005) * 100) / 100);
        setLayout(prev => ({ ...prev, [id]: { ...prev[id], scale: newScale } }));
      }
    };

    const handlePointerUp = () => {
      if (dragState.current?.active || scaleState.current?.active) {
        // slightly delay setting isDragging to false so click events don't trigger immediately
        setTimeout(() => setIsDragging(false), 50);
      }
      dragState.current = null;
      scaleState.current = null;
      setGuides({ horizontal: [], vertical: [] });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [editMode, computeGuides, isDragging]);

  return (
    <VisualEditorContext.Provider value={{
      layout, setLayout, editMode, setEditMode, panelOpen, setPanelOpen,
      selectedElement, setSelectedElement, updateProp, saveConfig, resetConfig,
      isSaving, saveStatus, configLoaded, elementRefs, guides, setGuides,
      isDragging, setIsDragging, dragState, scaleState, computeGuides,
      registerElementLabel, elementLabels
    }}>
      {children}
    </VisualEditorContext.Provider>
  );
};
