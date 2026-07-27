import React, { useEffect } from 'react';
import { useVisualEditor } from '../../contexts/VisualEditorContext';
import { useViewport } from '../../hooks/useViewport';

interface EditableElementProps {
  id: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  responsivePosition?: boolean;
}

/**
 * Pointer capture keeps a drag alive when the finger crosses the portrait or
 * the panel, but it throws if the pointer is already gone — never let that
 * abort the drag itself.
 */
const capturePointer = (event: React.PointerEvent<Element>) => {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    /* pointer already released — dragging still works via window listeners */
  }
};

export const EditableElement: React.FC<EditableElementProps> = ({
  id, label, children, className, style, responsivePosition = false,
}) => {
  // The saved reference canvas IS the render canvas now, so an X of 120 means
  // 120 design pixels on every screen — the position can no longer drift.
  const { mode, designHeight } = useViewport();
  const isMobileViewport = mode === 'mobile';
  const {
    layout, editMode, selectedElement, setSelectedElement,
    elementRefs: elementRefsRef, scaleState: scaleStateRef,
    panelOpen, setPanelOpen, registerElementLabel, startElementDrag,
  } = useVisualEditor();

  const mobileId      = `${id}Mobile`;
  const activeId      = isMobileViewport && layout[mobileId] ? mobileId : id;
  const config        = layout[activeId] || layout[id] || { x: 0, y: 0 };
  const isSelected    = editMode && selectedElement === activeId;
  const hasScale      = 'scale' in config;
  const hasMobileConfig = Boolean(layout[mobileId]);
  const isCharacterImage = id === 'characterImage';
  const elementScale  = config.scale ?? 1;
  const selectionUiScale = 1 / elementScale;

  // ─── Coordinate offsets ────────────────────────────────────────────────────
  // X is a plain design pixel: the canvas width is fixed, so it scales with the
  // whole page and never lands somewhere else on a different screen.
  const xOffset = `${config.x || 0}px`;
  // Y stays proportional to the real viewport height (--vh is expressed in
  // design pixels) so the hero composition keeps its vertical balance on
  // taller and shorter screens alike.
  const yOffset = responsivePosition
    ? `calc(${((config.y || 0) / designHeight) * 100} * var(--vh))`
    : `${config.y || 0}px`;

  const transformStyle = {
    '--editable-x':        xOffset,
    '--editable-y':        yOffset,
    '--editable-rotation': `${config.rotation || 0}deg`,
    '--editable-scale':    `${config.scale ?? 1}`,
    '--editable-opacity':  `${config.opacity ?? 1}`,
  } as React.CSSProperties;

  // ─── Label registration ────────────────────────────────────────────────────
  useEffect(() => {
    if (label) registerElementLabel(id, label);
    if (label && hasMobileConfig) registerElementLabel(mobileId, `${label} (Mobile)`);
  }, [id, label, hasMobileConfig, mobileId, registerElementLabel]);

  // ─── Scale-handle pointer down ─────────────────────────────────────────────
  // Drag initiation is handled GLOBALLY in VisualEditorContext so elements
  // can be moved even when they are behind the character photo.
  // Scale handles are the only thing that still capture events on the element.
  const handleScalePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    capturePointer(e);
    if (!panelOpen) setPanelOpen(true);
    scaleStateRef.current = {
      active: true,
      id: activeId,
      startY: e.clientY,
      origScale: config.scale || 1,
    };
  };

  const handleElementPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!editMode) return;

    // A selected element is now draggable directly. Capturing the pointer is
    // essential on touch devices: the drag keeps receiving events even if the
    // finger moves over the portrait, panel, or another layered element.
    e.preventDefault();
    e.stopPropagation();
    capturePointer(e);
    setSelectedElement(activeId);
    if (!panelOpen) setPanelOpen(true);
    startElementDrag(activeId, e.nativeEvent);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={el => {
        elementRefsRef.current[activeId] = el;
        // Drop the ref on unmount so alignment guides never snap to an element
        // that belongs to the other canvas.
        return () => { delete elementRefsRef.current[activeId]; };
      }}
      data-editable-id={id}
      data-active-editable-id={activeId}
      data-edit-mode={editMode ? 'true' : 'false'}
      className={className}
      onPointerDown={handleElementPointerDown}
      onClick={e => {
        if (editMode) e.stopPropagation();
      }}
      style={{
        ...style,
        ...transformStyle,
        transform: 'translate(var(--editable-x), var(--editable-y)) rotate(var(--editable-rotation)) scale(var(--editable-scale))',
        // Let selected elements receive direct touch/mouse input in edit mode.
        // Their selected hero layer is raised above the portrait, which fixes
        // controls that were previously visible but impossible to grab.
        pointerEvents: editMode ? 'auto' : style?.pointerEvents,
        position:  'relative',
        opacity:   'var(--editable-opacity)',
        // gets visual feedback (even though actual drag starts from any canvas press).
        cursor: (editMode && isSelected) ? 'grab' : undefined,
        zIndex: isSelected ? 9900 : undefined,
        outline:       isSelected && !isCharacterImage ? '2px solid #fdb466' : 'none',
        outlineOffset: '6px',
        userSelect:    editMode ? 'none' : undefined,
        touchAction:   editMode ? 'none' : 'auto',
      }}
    >
      {children}

      {/* ─── Scale handles (corner squares when element is selected) ─── */}
      {isSelected && hasScale && (
        <>
          {[
            { top: '-8px', left:  '-8px' },
            { top: '-8px', right: '-8px' },
            { bottom: '-8px', left:  '-8px' },
            { bottom: '-8px', right: '-8px' },
          ].map((pos, i) => (
            <div
              key={i}
              onPointerDown={handleScalePointerDown}
              style={{
                position: 'absolute',
                ...Object.fromEntries(
                  Object.entries(pos).map(([k, v]) => [k, `${parseFloat(v) * selectionUiScale}px`])
                ),
                width:  `${14 * selectionUiScale}px`,
                height: `${14 * selectionUiScale}px`,
                background:   '#fdb466',
                border:       `${2 * selectionUiScale}px solid white`,
                borderRadius: `${3 * selectionUiScale}px`,
                cursor: 'nwse-resize',
                zIndex: 10001,           // above the drag overlay in VisualEditorPanel
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                // Explicitly re-enable pointer events for the handle even though
                // the parent wrapper has pointer-events:none.
                pointerEvents: 'auto',
                touchAction:   'none',
              }}
            />
          ))}

          {/* ─── Position + Scale label ─── */}
          <div style={{
            position: 'absolute',
            top: `${-28 * selectionUiScale}px`,
            left: '50%',
            transform: `translateX(-50%) scale(${selectionUiScale})`,
            transformOrigin: 'bottom center',
            background: '#fdb466', color: '#1e1e1e',
            borderRadius: '4px', padding: '2px 8px',
            fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            zIndex: 10001,
          }}>
            X: {config.x || 0}  Y: {config.y || 0}
            {hasScale ? ` | Scale: ${(config.scale || 1).toFixed(2)}` : ''}
          </div>
        </>
      )}

      {/* ─── Position label (non-scaleable elements) ─── */}
      {isSelected && !hasScale && (
        <div style={{
          position: 'absolute', top: '-28px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#fdb466', color: '#1e1e1e',
          borderRadius: '4px', padding: '2px 8px',
          fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
          zIndex: 10001,
        }}>
          X: {config.x || 0}  Y: {config.y || 0}
        </div>
      )}
    </div>
  );
};
