import React, { useEffect, useState } from 'react';
import { useVisualEditor, type ElementKind } from '../../contexts/VisualEditorContext';
import { useViewport } from '../../hooks/useViewport';

interface EditableElementProps {
  /** Desktop id. The mobile canvas edits `${id}Mobile` when that entry exists. */
  id: string;
  /** What the panel calls it. */
  label: string;
  kind?: ElementKind;
  /** False when the element's stacking is not driven by the saved zIndex. */
  canLayer?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wraps one piece of the hero so the editor can move, resize and inspect it.
 *
 * It carries no editor UI of its own any more — no outline, no handles, no
 * pointer handlers. Those were drawn INSIDE the element, so they inherited its
 * scale and rotation, sat underneath the portrait, and had to fight z-index to
 * stay grabbable. They now live in the overlay, which is drawn outside the
 * zoomed stage in real screen pixels, so a handle is always the same size and
 * always on top. All this component does is:
 *
 *   1. apply the saved offset / scale / rotation / opacity, and
 *   2. tell the editor it exists, so the panel can list and measure it.
 *
 * That means the composition in edit mode is byte-for-byte the composition a
 * visitor sees — which is the whole point of measuring against it.
 */
export const EditableElement: React.FC<EditableElementProps> = ({
  id, label, kind = 'text', canLayer = true, children, className, style,
}) => {
  const { mode } = useViewport();
  const { layout, register, unregister } = useVisualEditor();
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  const mobileId = `${id}Mobile`;
  const activeId = mode === 'mobile' && layout[mobileId] ? mobileId : id;
  const config = layout[activeId] ?? layout[id] ?? { x: 0, y: 0 };

  useEffect(() => {
    if (!node) return;
    register({ id, activeId, label, kind, canLayer, node });
    return () => unregister(activeId);
  }, [node, id, activeId, label, kind, canLayer, register, unregister]);

  return (
    <div
      ref={setNode}
      data-editable-id={id}
      data-active-editable-id={activeId}
      className={className}
      style={{
        ...style,
        position: 'relative',
        // Both axes are plain DESIGN pixels: an offset of 120 lands on exactly
        // the same spot of the composition on a 4K monitor, a laptop, a
        // restored-down window and a phone.
        transform: `translate(${config.x || 0}px, ${config.y || 0}px)`
          + ` rotate(${config.rotation || 0}deg)`
          + ` scale(${config.scale ?? 1})`,
        opacity: config.opacity ?? 1,
      }}
    >
      {children}
    </div>
  );
};
