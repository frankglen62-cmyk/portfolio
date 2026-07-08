import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useVisualEditor, getFieldsForElement, type FieldDef } from '../../contexts/VisualEditorContext';

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */
const GearIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const MoveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" /><polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const VisualEditorPanel: React.FC = () => {
  const [isMobileViewport, setIsMobileViewport] = React.useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 809px)').matches : false
  ));
  const [viewportSize, setViewportSize] = React.useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));
  const dragControls = useDragControls();
  const {
    layout, editMode, setEditMode, setPanelOpen,
    selectedElement, setSelectedElement, updateProp, saveConfig, resetConfig,
    isSaving, saveStatus, elementLabels, guides
  } = useVisualEditor();

  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 809px)');
    const sync = () => {
      setIsMobileViewport(query.matches);
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    sync();
    query.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      query.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  const visibleElementIds = Object.keys(layout).filter((id) => (
    isMobileViewport ? id.endsWith('Mobile') : !id.endsWith('Mobile')
  ));
  const panelClassName = isMobileViewport
    ? 'w-[236px] max-h-[58svh] flex flex-col rounded-xl overflow-hidden shadow-2xl'
    : 'w-[280px] max-h-[85vh] flex flex-col rounded-xl overflow-hidden shadow-2xl';
  const panelOffset = isMobileViewport ? { left: 10, bottom: 10 } : { left: 24, bottom: 24 };

  const renderField = (id: string, field: FieldDef) => {
    const config = layout[id];
    if (!config) return null;
    if (!(field.key in config)) return null;
    const val = config[field.key as keyof typeof config];

    if (field.type === 'color') {
      return (
        <div key={field.key} className="mb-3">
          <label className="flex items-center justify-between text-xs font-medium text-gray-400 mb-1">
            {field.label}<span className="text-[10px] text-gray-500 font-mono">{val}</span>
          </label>
          <input type="color" value={val} onChange={e => updateProp(id, field.key, e.target.value)}
            className="w-full h-8 rounded cursor-pointer border border-gray-700 bg-transparent" />
        </div>
      );
    }
    if (field.type === 'range') {
      return (
        <div key={field.key} className="mb-3">
          <label className="flex items-center justify-between text-xs font-medium text-gray-400 mb-1">
            {field.label}<span className="text-[10px] text-gray-500 font-mono">{val}{field.unit || ''}</span>
          </label>
          <input type="range" min={field.min} max={field.max} step={field.step} value={val}
            onChange={e => updateProp(id, field.key, Number(e.target.value))}
            className="w-full h-1.5 accent-orange rounded-full cursor-pointer" />
        </div>
      );
    }
    return (
      <div key={field.key} className="mb-3">
        <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
        <input type="text" value={val} onChange={e => updateProp(id, field.key, e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange" />
      </div>
    );
  };

  return (
    <>
      {/* ═══ ALIGNMENT GUIDE LINES ═══ */}
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

      {/* ═══ DRAGGABLE FLOATING TOOL ═══ */}
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        className="fixed z-[9999] flex flex-col items-start"
        style={panelOffset}
      >
        {editMode ? (
          <div 
            className={panelClassName}
            style={{
              background: 'rgba(20, 20, 25, 0.95)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'white',
            }}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header (Drag Handle) */}
            <div 
              className={`${isMobileViewport ? 'px-3 py-2' : 'px-4 py-3'} border-b border-white/10 shrink-0 cursor-move flex items-center justify-between`}
              style={{ background: 'rgba(20, 20, 25, 0.98)' }}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="flex items-center gap-2">
                <MoveIcon />
                <div>
                  <h2 className="text-xs font-bold tracking-wide uppercase text-white/90">Visual Editor</h2>
                  <p className="text-[9px] font-medium uppercase tracking-wide text-white/45">
                    {isMobileViewport ? 'Mobile' : 'Desktop'} {viewportSize.width}x{viewportSize.height}
                  </p>
                </div>
              </div>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => { setEditMode(false); setPanelOpen(false); setSelectedElement(null); }} 
                className="text-white/50 hover:text-white transition"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Actions (Save / Reset) */}
            <div className={`${isMobileViewport ? 'px-3 py-2' : 'px-4 py-3'} border-b border-white/10 shrink-0 flex gap-2`}>
              <button onClick={saveConfig} disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all"
                style={{
                  background: saveStatus === 'success' ? '#16a34a' : saveStatus === 'error' ? '#dc2626' : 'linear-gradient(135deg, #fdb466, #f97316)',
                  color: 'white',
                }}
              >
                <SaveIcon /> {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save All'}
              </button>
              <button onClick={resetConfig}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold bg-white/10 hover:bg-white/20 transition text-white/80 hover:text-white"
              >
                <ResetIcon /> Reset
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Element List */}
              <div className={isMobileViewport ? 'px-3 py-2' : 'px-4 py-3'}>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                  {isMobileViewport ? 'Mobile Elements' : 'Desktop Elements'}
                </p>
                <div className="space-y-1">
                  {visibleElementIds.map(id => (
                    <button key={id} onClick={() => setSelectedElement(id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-[10px] font-medium transition-all flex items-center gap-2 ${
                        selectedElement === id
                          ? 'bg-orange/20 text-orange border border-orange/30'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      {elementLabels[id] || id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Element Properties */}
              {selectedElement && layout[selectedElement] && (
                <div className={`${isMobileViewport ? 'px-3 py-2' : 'px-4 py-3'} border-t border-white/10`}>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-3">
                    Edit — {elementLabels[selectedElement] || selectedElement}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-400 mb-1">X Position</label>
                      <input type="number" value={layout[selectedElement].x}
                        onChange={e => updateProp(selectedElement, 'x', Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-orange" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-400 mb-1">Y Position</label>
                      <input type="number" value={layout[selectedElement].y}
                        onChange={e => updateProp(selectedElement, 'y', Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-orange" />
                    </div>
                  </div>
                  {getFieldsForElement(selectedElement).map((field) => renderField(selectedElement, field))}
                  <div className="mt-3 p-2 rounded bg-white/5 text-[9px] text-gray-400 leading-relaxed">
                    <strong>Tips:</strong> Arrow keys nudge. Shift+Arrow for 10px. Drag on screen to move. Corner handles scale images.
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onPointerDown={(e) => dragControls.start(e)}
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(true); setPanelOpen(true);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 cursor-move"
            style={{
              background: 'rgba(30,30,30,0.85)',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
            }}
            title="Drag to move, click to edit"
          >
            <GearIcon />
          </button>
        )}
      </motion.div>
    </>
  );
};
