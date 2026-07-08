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
  const [isMobileViewport, setIsMobileViewport] = React.useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 809px)').matches : false
  ));
  const {
    layout, editMode, selectedElement, setSelectedElement,
    elementRefs: elementRefsRef, isDragging, dragState: dragStateRef, scaleState: scaleStateRef,
    panelOpen, setPanelOpen, registerElementLabel
  } = useVisualEditor();

  const mobileId = `${id}Mobile`;
  const activeId = isMobileViewport && layout[mobileId] ? mobileId : id;
  const config = layout[activeId] || layout[id] || { x: 0, y: 0 };
  const isSelected = editMode && selectedElement === activeId;
  const hasScale = 'scale' in config;
  const hasMobileConfig = Boolean(layout[mobileId]);
  const transformStyle = {
    '--editable-x': `${config.x || 0}px`,
    '--editable-y': `${config.y || 0}px`,
    '--editable-rotation': `${config.rotation || 0}deg`,
    '--editable-scale': `${config.scale ?? 1}`,
    '--editable-opacity': `${config.opacity ?? 1}`,
  } as React.CSSProperties;

  useEffect(() => {
    if (label) registerElementLabel(id, label);
    if (label && hasMobileConfig) registerElementLabel(mobileId, `${label} (Mobile)`);
  }, [id, label, hasMobileConfig, mobileId, registerElementLabel]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 809px)');
    const sync = (event: MediaQueryListEvent) => setIsMobileViewport(event.matches);

    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    setSelectedElement(activeId);
    if (!panelOpen) setPanelOpen(true);

    dragStateRef.current = {
      active: true,
      id: activeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: config.x || 0,
      origY: config.y || 0,
    };
  };

  const handleScalePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    scaleStateRef.current = {
      active: true,
      id: activeId,
      startY: e.clientY,
      origScale: config.scale || 1,
    };
  };

  return (
    <div
      ref={el => { elementRefsRef.current[activeId] = el; }}
      data-editable-id={id}
      data-active-editable-id={activeId}
      data-edit-mode={editMode ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
      onClick={e => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      className={className}
      style={{
        ...style,
        ...transformStyle,
        transform: 'translate(var(--editable-x), var(--editable-y)) rotate(var(--editable-rotation)) scale(var(--editable-scale))',
        cursor: editMode ? (isDragging ? 'grabbing' : 'grab') : undefined,
        outline: isSelected ? '2px solid #fdb466' : editMode ? '1px dashed rgba(253,180,102,0.25)' : 'none',
        outlineOffset: '6px',
        touchAction: editMode ? 'none' : 'auto',
        pointerEvents: editMode ? 'auto' : style?.pointerEvents,
        position: 'relative',
        userSelect: editMode ? 'none' : undefined,
        opacity: 'var(--editable-opacity)',
      }}
    >
      {children}

      {/* ─── Scale handles (shown when selected and element has scale) ─── */}
      {isSelected && hasScale && (
        <>
          {[
            { top: '-8px', left: '-8px' },
            { top: '-8px', right: '-8px' },
            { bottom: '-8px', left: '-8px' },
            { bottom: '-8px', right: '-8px' },
          ].map((pos, i) => (
            <div
              key={i}
              onPointerDown={handleScalePointerDown}
              style={{
                position: 'absolute',
                ...pos,
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
