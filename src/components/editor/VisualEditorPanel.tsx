import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
  useVisualEditor, getFieldsForElement, FALLBACK,
  type FieldDef,
} from '../../contexts/VisualEditorContext';
import { useViewport } from '../../hooks/useViewport';
import { setForcedCanvas, type CanvasMode } from '../../lib/viewportStage';

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */
const GearIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const DragGripIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const ResetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);
const SnapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

/* ═══════════════════════════════════════════
   REFERENCE DIMENSIONS  (must match EditableElement)
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   MOVE HANDLE
   ─────────────────────────────────────────────
   On pointerdown it writes into context's dragState
   ref (active: true).  The context's existing
   window 'pointermove' listener picks that up and
   moves the element — no React onPointerMove needed,
   so setPointerCapture quirks don't matter.
   ═══════════════════════════════════════════ */
const DirectionControls: React.FC = () => {
  const { layout, selectedElement, updateProp } = useVisualEditor();
  if (!selectedElement || !layout[selectedElement]) return null;

  const nudge = (x: number, y: number) => {
    const current = layout[selectedElement];
    updateProp(selectedElement, 'x', current.x + x);
    updateProp(selectedElement, 'y', current.y + y);
  };
  const buttonStyle: React.CSSProperties = {
    width: '36px', height: '32px', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.3)',
    background: '#fff7ed', color: '#ea580c', fontSize: '18px', fontWeight: 800, lineHeight: 1, cursor: 'pointer',
  };

  return (
    <div style={{ margin: '0 10px 10px', padding: '9px', borderRadius: '10px', background: '#fffaf5', border: '1px solid rgba(249,115,22,0.16)' }}>
      <p style={{ margin: '0 0 7px', fontSize: '10px', fontWeight: 800, color: '#9a3412', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Move position</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', justifyContent: 'center', gap: '4px' }}>
        <span />
        <button type="button" aria-label="Move up" onClick={() => nudge(0, -5)} style={buttonStyle}>↑</button>
        <span />
        <button type="button" aria-label="Move left" onClick={() => nudge(-5, 0)} style={buttonStyle}>←</button>
        <button type="button" aria-label="Move down" onClick={() => nudge(0, 5)} style={buttonStyle}>↓</button>
        <button type="button" aria-label="Move right" onClick={() => nudge(5, 0)} style={buttonStyle}>→</button>
      </div>
    </div>
  );
};

const LayerControls: React.FC = () => {
  const { layout, selectedElement, updateProp } = useVisualEditor();
  if (!selectedElement || !layout[selectedElement]) return null;

  const isInFront = (layout[selectedElement].zIndex ?? 10) >= 50;
  const setLayer = (zIndex: number) => updateProp(selectedElement, 'zIndex', zIndex);
  const baseStyle: React.CSSProperties = {
    flex: 1, padding: '7px 5px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, cursor: 'pointer',
  };

  return (
    <div style={{ margin: '0 10px 10px' }}>
      <p style={{ margin: '0 0 5px', fontSize: '10px', fontWeight: 800, color: '#777', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Layer relative to image</p>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button type="button" onClick={() => setLayer(90)} style={{ ...baseStyle, border: isInFront ? '1px solid #f97316' : '1px solid rgba(0,0,0,0.1)', background: isInFront ? '#fff1e5' : '#fff', color: '#c2410c' }}>In Front</button>
        <button type="button" onClick={() => setLayer(5)} style={{ ...baseStyle, border: !isInFront ? '1px solid #0284c7' : '1px solid rgba(0,0,0,0.1)', background: !isInFront ? '#eff6ff' : '#fff', color: '#0369a1' }}>Behind Image</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PANEL
   ═══════════════════════════════════════════ */
export const VisualEditorPanel: React.FC = () => {
  const viewport = useViewport();
  const isMobileViewport = viewport.mode === 'mobile';
  const viewportSize = { width: viewport.screenWidth, height: viewport.screenHeight };
  const [panelWidth, setPanelWidth] = React.useState(190);
  const dragControls = useDragControls();
  const {
    layout, editMode, setEditMode, setPanelOpen,
    selectedElement, setSelectedElement, updateProp, saveConfig, resetConfig,
    isSaving, saveStatus, elementLabels, guides,
  } = useVisualEditor();

  const switchCanvas = (next: CanvasMode | null) => {
    setSelectedElement(null);
    setForcedCanvas(next);
  };

  const visibleElementIds = Object.keys(layout).filter(id =>
    isMobileViewport ? id.endsWith('Mobile') : !id.endsWith('Mobile')
  );

  // Panel size & initial position
  const minPanelWidth = isMobileViewport ? 170 : 220;
  const maxPanelWidth = isMobileViewport ? Math.max(170, Math.min(280, viewportSize.width - 20)) : 340;
  const panelW = Math.min(maxPanelWidth, Math.max(minPanelWidth, panelWidth));
  const panelMaxH = isMobileViewport
    ? Math.min(viewportSize.height * 0.80, 560)
    : Math.min(viewportSize.height * 0.84, 640);
  const margin = 10;

  const panelInitialX = margin;
  const panelInitialY = viewportSize.height > 0
    ? viewportSize.height - panelMaxH - margin
    : 80;

  const dragConstraints = {
    left:   0,
    top:    0,
    right:  Math.max(0, viewportSize.width  - panelW - 4),
    bottom: Math.max(0, viewportSize.height - panelMaxH - 4),
  };

  /* ── Snap selected element back to x:0 y:0 ─────────────────────────────── */
  const snapToNatural = () => {
    if (!selectedElement) return;
    updateProp(selectedElement, 'x', 0);
    updateProp(selectedElement, 'y', 0);
  };

  /* ── Reset selected element to FALLBACK defaults ────────────────────────── */
  const resetElement = () => {
    if (!selectedElement) return;
    const fallback = FALLBACK[selectedElement];
    if (!fallback) return;
    Object.entries(fallback).forEach(([key, val]) =>
      updateProp(selectedElement, key, val as string | number)
    );
  };

  /* ── Field renderer ─────────────────────────────────────────────────────── */
  const renderField = (id: string, field: FieldDef) => {
    const config = layout[id];
    if (!config) return null;
    let val = config[field.key as keyof typeof config];
    if (val === undefined) {
      if (field.key === 'scale')    val = 1;
      else if (field.key === 'opacity')  val = 1;
      else if (field.key === 'rotation') val = 0;
      else return null;
    }

    if (field.type === 'color') {
      return (
        <div key={field.key} className="mb-2.5">
          <label className="flex items-center justify-between text-[11px] font-semibold text-gray-600 mb-1">
            {field.label}
            <span className="text-[10px] text-gray-400 font-mono">{val as string}</span>
          </label>
          <input type="color" value={val as string}
            onChange={e => updateProp(id, field.key, e.target.value)}
            className="w-full h-8 rounded cursor-pointer border border-gray-200 bg-transparent" />
        </div>
      );
    }
    if (field.type === 'range') {
      const numVal = typeof val === 'number' ? val : parseFloat(val as string) || 0;
      return (
        <div key={field.key} className="mb-2.5">
          <label className="flex items-center justify-between text-[11px] font-semibold text-gray-600 mb-1">
            {field.label}
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
              style={{ background: '#fff4e8', color: '#f97316' }}>
              {field.step && field.step < 1 ? numVal.toFixed(2) : Math.round(numVal)}{field.unit || ''}
            </span>
          </label>
          <input type="range" min={field.min} max={field.max} step={field.step}
            value={numVal}
            onChange={e => updateProp(id, field.key, Number(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer"
            style={{ accentColor: '#f97316' }} />
        </div>
      );
    }
    return (
      <div key={field.key} className="mb-2.5">
        <label className="block text-[11px] font-semibold text-gray-600 mb-1">{field.label}</label>
        <input type="text" value={val as string}
          onChange={e => updateProp(id, field.key, e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-800 font-mono focus:outline-none shadow-sm"
          style={{ borderColor: 'rgba(0,0,0,0.12)' }} />
      </div>
    );
  };

  return (
    <>
      {/* ═══ GUIDE LINES ═══ */}
      {editMode && (guides.horizontal.length > 0 || guides.vertical.length > 0) && (
        <svg className="fixed inset-0 z-[9997] pointer-events-none" width="100%" height="100%">
          {guides.horizontal.map((y, i) => (
            <line key={`h${i}`} x1="0" y1={y} x2="100%" y2={y} stroke="#fdb466" strokeWidth="1" strokeDasharray="6 4" />
          ))}
          {guides.vertical.map((x, i) => (
            <line key={`v${i}`} x1={x} y1="0" x2={x} y2="100%" stroke="#fdb466" strokeWidth="1" strokeDasharray="6 4" />
          ))}
        </svg>
      )}

      {/* ═══ FLOATING PANEL ═══ */}
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={dragConstraints}
        initial={{ x: panelInitialX, y: panelInitialY }}
        className="fixed z-[9999] top-0 left-0"
        data-visual-editor-panel="true"
      >
        {editMode ? (
          <div
            style={{
              width: `${panelW}px`,
              maxHeight: `${panelMaxH}px`,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(0,0,0,0.07)',
            }}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header / panel drag handle ── */}
            <div
              className="flex items-center justify-between shrink-0 cursor-move"
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                background: 'rgba(255,255,255,0.96)',
                touchAction: 'none',
              }}
              onPointerDown={e => dragControls.start(e)}
            >
              <div className="flex items-center gap-2">
                <DragGripIcon />
                <div>
                  <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', color: '#1e1e1e', textTransform: 'uppercase', margin: 0 }}>
                    Visual Editor
                  </h2>
                  <p style={{ fontSize: '9px', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    {viewport.designWidth}×{viewport.designHeight} canvas · {Math.round(viewport.zoom * 100)}%
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => setPanelWidth(width => Math.max(minPanelWidth, width - 20))} style={{ color: '#777', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1 }} aria-label="Make editor narrower">−</button>
                <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => setPanelWidth(width => Math.min(maxPanelWidth, width + 20))} style={{ color: '#777', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1 }} aria-label="Make editor wider">+</button>
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => { setEditMode(false); setPanelOpen(false); setSelectedElement(null); }}
                  style={{ color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
                  aria-label="Close editor"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* ── Canvas preview switch ── */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
              <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 700, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Preview canvas
              </p>
              <div style={{ display: 'flex', gap: '4px' }}>
                {([
                  { key: null, label: 'Auto' },
                  { key: 'desktop' as const, label: 'Desktop' },
                  { key: 'mobile' as const, label: 'Mobile' },
                ]).map(option => {
                  const isActive = viewport.forced === option.key;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => switchCanvas(option.key)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: isActive ? '1px solid #f97316' : '1px solid rgba(0,0,0,0.1)',
                        background: isActive ? '#fff1e5' : '#fff',
                        color: isActive ? '#c2410c' : '#666',
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '9px', color: '#999', lineHeight: 1.45 }}>
                Showing the <strong>{isMobileViewport ? 'mobile' : 'desktop'}</strong> composition at {viewportSize.width}×{viewportSize.height}.
                Every visitor sees this exact layout, only scaled.
              </p>
            </div>

            {/* ── Save / Reset row ── */}
            <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
              <button
                onClick={saveConfig}
                disabled={isSaving}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  fontSize: '11px', fontWeight: 800,
                  border: 'none', cursor: 'pointer', color: 'white',
                  background: saveStatus === 'success'
                    ? '#16a34a'
                    : 'linear-gradient(135deg, #fdb466, #f97316)',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
                  transition: 'background 0.2s',
                }}
              >
                <SaveIcon />
                {isSaving ? 'Saving…' : saveStatus === 'success' ? '✓ Saved!' : 'Save All'}
              </button>
              <button
                onClick={resetConfig}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '8px 10px', borderRadius: '10px',
                  fontSize: '11px', fontWeight: 700,
                  border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                  background: '#f5f5f5', color: '#555',
                }}
              >
                <ResetIcon /> Reset
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

              {/* Element list */}
              <div style={{ padding: '10px 12px 6px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {isMobileViewport ? 'Mobile Elements' : 'Desktop Elements'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {visibleElementIds.map(id => (
                    <button
                      key={id}
                      onClick={() => setSelectedElement(id)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: selectedElement === id ? 700 : 500,
                        border: selectedElement === id ? '1.5px solid rgba(249,115,22,0.4)' : '1.5px solid transparent',
                        background: selectedElement === id ? 'rgba(249,115,22,0.08)' : 'transparent',
                        color: selectedElement === id ? '#f97316' : '#555',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      {elementLabels[id] || id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected element editor */}
              {selectedElement && layout[selectedElement] && (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px' }}>

                  {/* Element name */}
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 12px 8px' }}>
                    Editing — {elementLabels[selectedElement] || selectedElement}
                  </p>

                  {/* ── MOVE HANDLE (primary drag control) ── */}
                  <DirectionControls />
                  <LayerControls />

                  {/* Snap & Reset row */}
                  <div style={{ display: 'flex', gap: '6px', margin: '0 10px 10px' }}>
                    <button
                      onClick={snapToNatural}
                      title="Reset X and Y to 0 — brings element back to its natural CSS position"
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '7px 6px', borderRadius: '8px',
                        fontSize: '10px', fontWeight: 700,
                        border: '1px solid rgba(0,0,0,0.10)', cursor: 'pointer',
                        background: '#f0f9ff', color: '#0284c7',
                      }}
                    >
                      <SnapIcon /> Snap Back
                    </button>
                    <button
                      onClick={resetElement}
                      title="Reset this element to factory defaults"
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '7px 6px', borderRadius: '8px',
                        fontSize: '10px', fontWeight: 700,
                        border: '1px solid rgba(0,0,0,0.10)', cursor: 'pointer',
                        background: '#fef2f2', color: '#dc2626',
                      }}
                    >
                      <ResetIcon /> Reset El.
                    </button>
                  </div>

                  {/* X / Y inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 12px 10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#888', marginBottom: '4px' }}>X Pos</label>
                      <input type="number"
                        value={layout[selectedElement].x}
                        onChange={e => updateProp(selectedElement, 'x', Number(e.target.value))}
                        style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', padding: '6px 8px', fontSize: '12px', fontFamily: 'monospace', background: 'white', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#888', marginBottom: '4px' }}>Y Pos</label>
                      <input type="number"
                        value={layout[selectedElement].y}
                        onChange={e => updateProp(selectedElement, 'y', Number(e.target.value))}
                        style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', padding: '6px 8px', fontSize: '12px', fontFamily: 'monospace', background: 'white', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Other element fields (scale, fontSize, etc.) */}
                  <div style={{ padding: '0 12px 12px' }}>
                    {getFieldsForElement(selectedElement).map(field => renderField(selectedElement, field))}
                  </div>

                  {/* Tip */}
                  <div style={{
                    margin: '0 12px 12px', padding: '8px 10px', borderRadius: '8px',
                    background: '#fffbf5', border: '1px solid rgba(249,115,22,0.15)',
                    fontSize: '10px', color: '#92400e', lineHeight: '1.5',
                  }}>
                    <strong>Tip:</strong> Use the arrow buttons for precise movement, or drag the selected element directly.
                    If element disappears, tap <strong>Snap Back</strong> to restore.
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onPointerDown={e => dragControls.start(e)}
            onClick={e => { e.stopPropagation(); setEditMode(true); setPanelOpen(true); }}
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(30,30,30,0.88)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)', color: 'white',
              cursor: 'move', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s',
            }}
            aria-label="Open visual editor"
            title="Drag to move, click to edit"
          >
            <GearIcon />
          </button>
        )}
      </motion.div>
    </>
  );
};
