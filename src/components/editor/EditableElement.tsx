import React, { useEffect } from 'react';
import { useVisualEditor } from '../../contexts/VisualEditorContext';

interface EditableElementProps {
  id: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EditableElement: React.FC<EditableElementProps> = ({ id, label, children, className, style }) => {
  const {
    layout, editMode, selectedElement, setSelectedElement,
    elementRefs, isDragging, dragState, scaleState, panelOpen, setPanelOpen,
    computeGuides, registerElementLabel
  } = useVisualEditor();

  const config = layout[id] || { x: 0, y: 0 };
  const isSelected = editMode && selectedElement === id;
  const hasScale = 'scale' in config;

  useEffect(() => {
    if (label) registerElementLabel(id, label);
  }, [id, label, registerElementLabel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setSelectedElement(id);
    if (!panelOpen) setPanelOpen(true);

    dragState.current = {
      active: true,
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: config.x || 0,
      origY: config.y || 0,
    };
  };

  const handleScalePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scaleState.current = {
      active: true,
      id,
      startY: e.clientY,
      origScale: config.scale || 1,
    };
  };

  return (
    <div
      ref={el => { elementRefs.current[id] = el; }}
      onPointerDown={handlePointerDown}
      onClick={e => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      className={className}
      style={{
        ...style,
        transform: `translate(${config.x || 0}px, ${config.y || 0}px) rotate(${config.rotation || 0}deg)`,
        cursor: editMode ? (isDragging && dragState.current?.id === id ? 'grabbing' : 'grab') : undefined,
        outline: isSelected ? '2px solid #fdb466' : editMode ? '1px dashed rgba(253,180,102,0.25)' : 'none',
        outlineOffset: '6px',
        touchAction: editMode ? 'none' : 'auto',
        zIndex: isSelected ? 100 : undefined,
        pointerEvents: editMode ? 'auto' : (style?.pointerEvents as any) || undefined,
        position: 'relative',
        userSelect: editMode ? 'none' : undefined,
      }}
    >
      {children}

      {/* ─── Scale handles (shown when selected and element has scale) ─── */}
      {isSelected && hasScale && (
        <>
          {[
            { t: '-8px', l: '-8px' },
            { t: '-8px', r: '-8px' },
            { b: '-8px', l: '-8px' },
            { b: '-8px', r: '-8px' },
          ].map((pos, i) => (
            <div
              key={i}
              onPointerDown={handleScalePointerDown}
              style={{
                position: 'absolute',
                top: pos.t, bottom: (pos as any).b,
                left: pos.l, right: (pos as any).r,
                width: '14px', height: '14px',
                background: '#fdb466',
                border: '2px solid white',
                borderRadius: '3px',
                cursor: 'nwse-resize',
                zIndex: 200,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          ))}

          {/* ─── Combined Position & Scale label ─── */}
          <div style={{
            position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)',
            background: '#fdb466', color: '#1e1e1e', borderRadius: '4px',
            padding: '2px 8px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}>
            X: {config.x || 0} Y: {config.y || 0} | Scale: {(config.scale || 1).toFixed(2)}
          </div>
        </>
      )}

      {/* ─── Position label (when selected, for elements without scale) ─── */}
      {isSelected && !hasScale && (
        <div style={{
          position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)',
          background: '#fdb466', color: '#1e1e1e', borderRadius: '4px',
          padding: '2px 8px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>
          X: {config.x || 0} Y: {config.y || 0}
        </div>
      )}
    </div>
  );
};
