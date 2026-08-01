import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVisualEditor, type RegisteredElement } from '../../contexts/VisualEditorContext';
import { useViewport } from '../../hooks/useViewport';
import { EditorPanel } from './EditorPanel';
import { ACCENT, StageContext, type EditorStageValue, type Overlays } from './stage';
import {
  boxesEqual, canvasFrame, canvasToClient, clientToCanvas, cornerOf, framesEqual,
  isVisible, measureNode, oppositeCorner,
  type Box, type Corner, type Frame, type Measurement,
} from './measure';

/* ═══════════════════════════════════════════════════════════════
   EDITOR ROOT — the interaction engine and every overlay
   ───────────────────────────────────────────────────────────────
   Everything here is drawn OUTSIDE `.viewport-stage`, in real
   screen pixels, from rectangles measured off the live DOM. So a
   selection box sits exactly on the element as rendered, a handle
   is always 12 physical pixels no matter how far the canvas is
   zoomed, and the numbers in the panel are the same numbers the
   outline is drawn from — there is no second source of truth to
   drift.

   This whole file is in the editor chunk: a visitor downloads it
   only when the gear is loaded, once the browser has gone idle.
   ═══════════════════════════════════════════════════════════════ */

const SNAP_TOLERANCE = 6;   // design px
const MIN_SCALE = 0.05;
const MAX_SCALE = 20;

type Interaction =
  | {
    kind: 'drag';
    id: string;
    startClient: { x: number; y: number };
    origin: { x: number; y: number };
    scale: number;
    /** Canvas position the element would have with a zero offset. */
    natural: { x: number; y: number };
    size: { w: number; h: number };
    others: Box[];
  }
  | {
    kind: 'resize';
    id: string;
    corner: Corner;
    anchorClient: { x: number; y: number };
    startScale: number;
    startDist: number;
  };

/** A corner that has to stay put while the opposite one is dragged. */
interface AnchorFix {
  id: string;
  corner: Corner;
  target: { x: number; y: number };
  /** While a resize is in flight the fix is re-applied every frame. */
  sticky: boolean;
  frames: number;
}

const round = (value: number, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* ── Snapping ─────────────────────────────────────────────────── */
const snapAxis = (edges: number[], targets: number[]) => {
  let delta = 0;
  let best = SNAP_TOLERANCE + 1;
  let line: number | null = null;

  edges.forEach(edge => {
    targets.forEach(target => {
      const distance = Math.abs(target - edge);
      if (distance < best) {
        best = distance;
        delta = target - edge;
        line = target;
      }
    });
  });

  return best <= SNAP_TOLERANCE ? { delta, line } : { delta: 0, line: null };
};

const snapBox = (predicted: Box, others: Box[], frame: Frame) => {
  const verticalTargets = [0, frame.designWidth / 2, frame.designWidth];
  const horizontalTargets = [0, frame.designHeight / 2, frame.designHeight];
  others.forEach(other => {
    verticalTargets.push(other.x, other.x + other.w / 2, other.x + other.w);
    horizontalTargets.push(other.y, other.y + other.h / 2, other.y + other.h);
  });

  const x = snapAxis([predicted.x, predicted.x + predicted.w / 2, predicted.x + predicted.w], verticalTargets);
  const y = snapAxis([predicted.y, predicted.y + predicted.h / 2, predicted.y + predicted.h], horizontalTargets);

  return {
    dx: x.delta,
    dy: y.delta,
    guides: {
      v: x.line === null ? [] : [x.line],
      h: y.line === null ? [] : [y.line],
    },
  };
};

/* ═══════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════ */
const EditorRoot: React.FC = () => {
  const {
    layout, editMode, setEditMode, selectedId, setSelectedId,
    registry, updateProps, saveLayout,
  } = useVisualEditor();

  const [frame, setFrame] = useState<Frame>(() => canvasFrame(null));
  const [selection, setSelection] = useState<Measurement | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const [contentBounds, setContentBounds] = useState<{ left: number; right: number; top: number } | null>(null);
  const [debug, setDebug] = useState(false);
  const [overlays, setOverlays] = useState<Overlays>({ bounds: false, grid: false, centres: false, outlines: false });
  const [snap, setSnap] = useState(true);
  const [step, setStep] = useState(5);
  const [busy, setBusy] = useState(false);

  const interaction = useRef<Interaction | null>(null);
  const anchorFix = useRef<AnchorFix | null>(null);
  // The pointer handlers and the measuring loop are long-lived, so they read
  // the current layout through refs rather than being torn down and rebuilt on
  // every frame of a drag.
  const layoutRef = useRef(layout);
  const registryRef = useRef(registry);
  const selectedRef = useRef(selectedId);
  // `debug` is read through a ref rather than being a dependency of the loop
  // below: turning it on used to tear the loop down and take the selection with
  // it, so opening the debug panel deselected whatever you were inspecting.
  const debugRef = useRef(debug);
  useEffect(() => {
    layoutRef.current = layout;
    registryRef.current = registry;
    selectedRef.current = selectedId;
    debugRef.current = debug;
  });

  const configOf = useCallback((id: string) => layoutRef.current[id] ?? { x: 0, y: 0 }, []);

  /* ── One measuring loop, one source of truth ─────────────────── */
  useEffect(() => {
    if (!editMode) return;

    let raf = 0;
    let lastBoundsCheck = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);

      const nextFrame = canvasFrame(null);
      setFrame(prev => (framesEqual(prev, nextFrame) ? prev : nextFrame));

      const id = selectedRef.current;
      const entry = id ? registryRef.current[id] : null;
      const measured = entry ? measureNode(entry.node) : null;

      // Keep the anchored corner still while `scale` grows around the
      // element's own transform origin. Measured and corrected rather than
      // predicted, so it works for the portrait (origin: bottom) too.
      const fix = anchorFix.current;
      if (fix && measured && entry && entry.activeId === fix.id) {
        const current = cornerOf(measured.canvas, fix.corner);
        const dx = fix.target.x - current.x;
        const dy = fix.target.y - current.y;
        const settled = Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5;

        if (!settled) {
          const config = configOf(fix.id);
          updateProps(fix.id, {
            x: Math.round((config.x || 0) + dx),
            y: Math.round((config.y || 0) + dy),
          });
        }
        fix.frames -= 1;
        if (!fix.sticky && (settled || fix.frames <= 0)) anchorFix.current = null;
      }

      setSelection(prev => {
        if (!prev || !measured) return prev === measured ? prev : measured;
        return boxesEqual(prev.client, measured.client) && boxesEqual(prev.canvas, measured.canvas)
          ? prev
          : measured;
      });

      // The crop / safe-band check only matters while the debug panel is open,
      // and it touches every element — so it runs a few times a second, not 60.
      if (debugRef.current && now - lastBoundsCheck > 200) {
        lastBoundsCheck = now;
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        Object.values(registryRef.current).forEach(item => {
          // The portrait is scaled far past the frame on purpose — counting it
          // would keep the check permanently red.
          if (item.id === 'characterImage' || !isVisible(item.node)) return;
          const box = measureNode(item.node)?.canvas;
          if (!box || box.w <= 0) return;
          left = Math.min(left, box.x);
          right = Math.max(right, box.x + box.w);
          top = Math.min(top, box.y);
        });
        const bounds = Number.isFinite(left) ? { left, right, top } : null;
        setContentBounds(prev => (
          prev && bounds
            && Math.abs(prev.left - bounds.left) < 0.5
            && Math.abs(prev.right - bounds.right) < 0.5
            && Math.abs(prev.top - bounds.top) < 0.5
            ? prev
            : bounds
        ));
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setSelection(null);
      setGuides({ v: [], h: [] });
    };
  }, [editMode, configOf, updateProps]);

  /* ── Hit testing ─────────────────────────────────────────────── */
  const hitTest = useCallback((clientX: number, clientY: number): RegisteredElement | null => {
    let winner: RegisteredElement | null = null;
    let winnerArea = Infinity;

    Object.values(registryRef.current).forEach(entry => {
      if (!isVisible(entry.node)) return;
      const rect = entry.node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;

      // The smallest box under the pointer wins, so a title that sits behind
      // the portrait is still selectable by clicking straight at it.
      const area = rect.width * rect.height;
      if (area < winnerArea) {
        winner = entry;
        winnerArea = area;
      }
    });

    return winner;
  }, []);

  /* ── Drag ────────────────────────────────────────────────────── */
  const beginDrag = useCallback((entry: RegisteredElement, clientX: number, clientY: number) => {
    const measured = measureNode(entry.node);
    if (!measured) return;

    const config = configOf(entry.activeId);
    const others: Box[] = [];
    Object.values(registryRef.current).forEach(item => {
      if (item.activeId === entry.activeId || !isVisible(item.node)) return;
      const box = measureNode(item.node)?.canvas;
      if (box) others.push(box);
    });

    interaction.current = {
      kind: 'drag',
      id: entry.activeId,
      startClient: { x: clientX, y: clientY },
      origin: { x: config.x || 0, y: config.y || 0 },
      scale: measured.frame.scale,
      natural: {
        x: measured.canvas.x - (config.x || 0),
        y: measured.canvas.y - (config.y || 0),
      },
      size: { w: measured.canvas.w, h: measured.canvas.h },
      others,
    };
    anchorFix.current = null;
    setBusy(true);
  }, [configOf]);

  const beginResize = useCallback((corner: Corner, clientX: number, clientY: number) => {
    const id = selectedRef.current;
    const entry = id ? registryRef.current[id] : null;
    if (!entry) return;
    const measured = measureNode(entry.node);
    if (!measured) return;

    const anchor = oppositeCorner(corner);
    const anchorCanvas = cornerOf(measured.canvas, anchor);
    const anchorClient = canvasToClient(anchorCanvas.x, anchorCanvas.y, measured.frame);
    const distance = Math.hypot(clientX - anchorClient.x, clientY - anchorClient.y);

    interaction.current = {
      kind: 'resize',
      id: entry.activeId,
      corner,
      anchorClient,
      startScale: configOf(entry.activeId).scale ?? 1,
      startDist: Math.max(8, distance),
    };
    anchorFix.current = { id: entry.activeId, corner: anchor, target: anchorCanvas, sticky: true, frames: Infinity };
    setBusy(true);
  }, [configOf]);

  /* ── Pointer plumbing ────────────────────────────────────────── */
  useEffect(() => {
    if (!editMode) return;

    const handleMove = (event: PointerEvent) => {
      const active = interaction.current;

      // Live canvas coordinates under the pointer — the fastest way to read off
      // where something should go. Only tracked while the debug readout is
      // showing it, so plain mouse movement doesn't re-render the panel.
      if (debugRef.current) {
        const point = clientToCanvas(event.clientX, event.clientY, canvasFrame(null));
        setPointer(prev => {
          const next = { x: Math.round(point.x), y: Math.round(point.y) };
          return prev && prev.x === next.x && prev.y === next.y ? prev : next;
        });
      }

      if (!active) {
        const hit = hitTest(event.clientX, event.clientY);
        setHoverId(prev => (prev === (hit?.activeId ?? null) ? prev : hit?.activeId ?? null));
        return;
      }

      if (active.kind === 'drag') {
        const dx = (event.clientX - active.startClient.x) / active.scale;
        const dy = (event.clientY - active.startClient.y) / active.scale;
        let x = active.origin.x + dx;
        let y = active.origin.y + dy;

        if (snap && !event.altKey) {
          const predicted: Box = {
            x: active.natural.x + x,
            y: active.natural.y + y,
            w: active.size.w,
            h: active.size.h,
          };
          const snapped = snapBox(predicted, active.others, canvasFrame(null));
          x += snapped.dx;
          y += snapped.dy;
          setGuides(prev => (
            prev.v[0] === snapped.guides.v[0] && prev.h[0] === snapped.guides.h[0] ? prev : snapped.guides
          ));
        }

        updateProps(active.id, { x: Math.round(x), y: Math.round(y) });
        return;
      }

      const distance = Math.hypot(event.clientX - active.anchorClient.x, event.clientY - active.anchorClient.y);
      let scale = clamp(active.startScale * (distance / active.startDist), MIN_SCALE, MAX_SCALE);
      if (event.shiftKey) scale = Math.round(scale * 20) / 20;
      updateProps(active.id, { scale: round(scale, 3) });
    };

    const handleUp = () => {
      if (!interaction.current) return;
      if (interaction.current.kind === 'resize' && anchorFix.current) {
        // Let the correction finish, then stop steering the element.
        anchorFix.current = { ...anchorFix.current, sticky: false, frames: 12 };
      }
      interaction.current = null;
      setBusy(false);
      setGuides({ v: [], h: [] });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [editMode, hitTest, snap, updateProps]);

  /* ── Keyboard ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!editMode) return;

    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void saveLayout();
        return;
      }
      if (typing) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        if (selectedRef.current) setSelectedId(null);
        else setEditMode(false);
        return;
      }

      const axis = ({
        ArrowLeft: ['x', -1], ArrowRight: ['x', 1], ArrowUp: ['y', -1], ArrowDown: ['y', 1],
      } as Record<string, ['x' | 'y', number]>)[event.key];
      if (!axis || !selectedRef.current) return;

      event.preventDefault();
      const [prop, direction] = axis;
      const config = configOf(selectedRef.current);
      const amount = direction * step * (event.shiftKey ? 5 : 1);
      updateProps(selectedRef.current, { [prop]: (config[prop] || 0) + amount });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editMode, step, configOf, updateProps, setSelectedId, setEditMode, saveLayout]);

  /* ── Panel actions that speak absolute canvas coordinates ────── */
  const setCanvasX = useCallback((value: number) => {
    const id = selectedRef.current;
    if (!id || !selection) return;
    updateProps(id, { x: Math.round((configOf(id).x || 0) + (value - selection.canvas.x)) });
  }, [selection, configOf, updateProps]);

  const setCanvasY = useCallback((value: number) => {
    const id = selectedRef.current;
    if (!id || !selection) return;
    updateProps(id, { y: Math.round((configOf(id).y || 0) + (value - selection.canvas.y)) });
  }, [selection, configOf, updateProps]);

  const setCanvasWidth = useCallback((value: number) => {
    const id = selectedRef.current;
    if (!id || !selection || selection.canvas.w <= 0 || value <= 0) return;
    const config = configOf(id);
    const scale = clamp((config.scale ?? 1) * (value / selection.canvas.w), MIN_SCALE, MAX_SCALE);
    anchorFix.current = {
      id,
      corner: 'nw',
      target: { x: selection.canvas.x, y: selection.canvas.y },
      sticky: false,
      frames: 12,
    };
    updateProps(id, { scale: round(scale, 3) });
  }, [selection, configOf, updateProps]);

  const nudge = useCallback((dx: number, dy: number) => {
    const id = selectedRef.current;
    if (!id) return;
    const config = configOf(id);
    updateProps(id, { x: (config.x || 0) + dx, y: (config.y || 0) + dy });
  }, [configOf, updateProps]);

  /**
   * Selecting measures straight away instead of waiting for the next frame, so
   * the panel and the outline are already right on the pointer-down that
   * selected the element rather than one frame later.
   */
  const selectElement = useCallback((activeId: string | null) => {
    setSelectedId(activeId);
    selectedRef.current = activeId;
    const entry = activeId ? registryRef.current[activeId] : null;
    setSelection(entry ? measureNode(entry.node) : null);
  }, [setSelectedId]);

  const toggleOverlay = useCallback((key: keyof Overlays) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const stage = useMemo<EditorStageValue>(() => ({
    selection, frame, pointer, contentBounds,
    debug, setDebug, overlays, toggleOverlay, snap, setSnap, step, setStep, busy,
    selectElement, setCanvasX, setCanvasY, setCanvasWidth, nudge,
  }), [
    selection, frame, pointer, contentBounds, debug, overlays, toggleOverlay,
    snap, step, busy, selectElement, setCanvasX, setCanvasY, setCanvasWidth, nudge,
  ]);

  const hovered = hoverId && hoverId !== selectedId ? registry[hoverId] : null;
  const hoverRect = hovered ? hovered.node.getBoundingClientRect() : null;

  return (
    <StageContext.Provider value={stage}>
      {editMode && (
        <>
          <DebugOverlay overlays={overlays} frame={frame} registry={registry} selectedId={selectedId} />

          {/* Click-through capture layer: every pointer press in edit mode is
              resolved by hit-testing the registry, so an element is selectable
              even when the portrait is painted on top of it. */}
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9995,
              cursor: busy ? 'grabbing' : hoverId ? 'grab' : 'default',
              touchAction: 'none',
            }}
            onPointerDown={event => {
              if (event.button !== 0 && event.pointerType === 'mouse') return;
              event.preventDefault();
              const hit = hitTest(event.clientX, event.clientY);
              if (!hit) {
                selectElement(null);
                return;
              }
              selectElement(hit.activeId);
              beginDrag(hit, event.clientX, event.clientY);
            }}
            onPointerLeave={() => { setPointer(null); setHoverId(null); }}
          />

          {/* Snap guides */}
          {(guides.v.length > 0 || guides.h.length > 0) && (
            <svg style={{ position: 'fixed', inset: 0, zIndex: 9996, pointerEvents: 'none' }} width="100%" height="100%">
              {guides.v.map(value => {
                const x = canvasToClient(value, 0, frame).x;
                return <line key={`v${value}`} x1={x} y1={0} x2={x} y2="100%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="5 4" />;
              })}
              {guides.h.map(value => {
                const y = canvasToClient(0, value, frame).y;
                return <line key={`h${value}`} x1={0} y1={y} x2="100%" y2={y} stroke="#38bdf8" strokeWidth="1" strokeDasharray="5 4" />;
              })}
            </svg>
          )}

          {/* Hover hint */}
          {hoverRect && !busy && (
            <div style={{
              position: 'fixed', zIndex: 9996, pointerEvents: 'none',
              left: hoverRect.left, top: hoverRect.top, width: hoverRect.width, height: hoverRect.height,
              border: '1px dashed rgba(249,115,22,0.75)', borderRadius: '2px',
            }} />
          )}

          {selection && <SelectionOverlay measurement={selection} onResize={beginResize} />}
        </>
      )}

      <EditorPanel />
    </StageContext.Provider>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SELECTION — outline, corner handles, live coordinate chip
   ═══════════════════════════════════════════════════════════════ */
const HANDLES: { corner: Corner; cursor: string }[] = [
  { corner: 'nw', cursor: 'nwse-resize' },
  { corner: 'ne', cursor: 'nesw-resize' },
  { corner: 'se', cursor: 'nwse-resize' },
  { corner: 'sw', cursor: 'nesw-resize' },
];

const SelectionOverlay: React.FC<{
  measurement: Measurement;
  onResize: (corner: Corner, clientX: number, clientY: number) => void;
}> = ({ measurement, onResize }) => {
  const { client, canvas } = measurement;
  const chipTop = client.y > 34 ? client.y - 26 : client.y + client.h + 6;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9997, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        left: client.x, top: client.y, width: client.w, height: client.h,
        border: `1.5px solid ${ACCENT}`,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.35)',
      }} />

      {HANDLES.map(({ corner, cursor }) => {
        const point = cornerOf(client, corner);
        return (
          <div
            key={corner}
            onPointerDown={event => {
              event.preventDefault();
              event.stopPropagation();
              onResize(corner, event.clientX, event.clientY);
            }}
            style={{
              position: 'absolute',
              left: point.x - 6, top: point.y - 6,
              width: 12, height: 12,
              background: '#fff', border: `2px solid ${ACCENT}`, borderRadius: 3,
              boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
              cursor, pointerEvents: 'auto', touchAction: 'none',
            }}
          />
        );
      })}

      <div style={{
        position: 'absolute',
        left: Math.max(4, Math.min(client.x, window.innerWidth - 190)),
        top: chipTop,
        padding: '3px 7px', borderRadius: 5,
        background: ACCENT, color: '#fff',
        font: '700 10px/1.2 ui-monospace, monospace', whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        x {Math.round(canvas.x)} · y {Math.round(canvas.y)} · {Math.round(canvas.w)}×{Math.round(canvas.h)}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DEBUG OVERLAY — where the canvas actually lands on this window
   ═══════════════════════════════════════════════════════════════ */
const DebugOverlay: React.FC<{
  overlays: Overlays;
  frame: Frame;
  registry: Record<string, RegisteredElement>;
  selectedId: string | null;
}> = ({ overlays, frame, registry, selectedId }) => {
  const { maxFill, safeHeight } = useViewport();
  if (!overlays.bounds && !overlays.grid && !overlays.centres && !overlays.outlines) return null;

  const width = frame.designWidth * frame.scale;
  const height = frame.designHeight * frame.scale;
  const left = frame.left;
  const top = frame.top;

  // The slice of the canvas that survives being overscanned to its cap. Keep
  // content between these and no window shape can crop it.
  const cropStart = 0.5 - 0.5 / maxFill;
  const cropEnd = 0.5 + 0.5 / maxFill;
  const safeTop = top + height * (1 - safeHeight / frame.designHeight);

  const gridStep = 40 * frame.scale;
  const lines: React.ReactElement[] = [];
  if (overlays.grid && gridStep > 3) {
    for (let i = 1, x = left + gridStep; x < left + width; i++, x += gridStep) {
      lines.push(<line key={`gv${i}`} x1={x} y1={top} x2={x} y2={top + height}
        stroke={ACCENT} strokeWidth={i % 5 === 0 ? 0.9 : 0.5} strokeOpacity={i % 5 === 0 ? 0.4 : 0.16} />);
    }
    for (let i = 1, y = top + gridStep; y < top + height; i++, y += gridStep) {
      lines.push(<line key={`gh${i}`} x1={left} y1={y} x2={left + width} y2={y}
        stroke={ACCENT} strokeWidth={i % 5 === 0 ? 0.9 : 0.5} strokeOpacity={i % 5 === 0 ? 0.4 : 0.16} />);
    }
  }

  return (
    <svg style={{ position: 'fixed', inset: 0, zIndex: 9994, pointerEvents: 'none' }} width="100%" height="100%" aria-hidden="true">
      {lines}

      {overlays.centres && (
        <>
          <line x1={left + width / 2} y1={0} x2={left + width / 2} y2="100%"
            stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.7" />
          <line x1={left} y1={top + height / 2} x2={left + width} y2={top + height / 2}
            stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.7" />
        </>
      )}

      {overlays.bounds && (
        <>
          {top > 0 && <rect x={0} y={0} width="100%" height={top} fill="#38bdf8" fillOpacity="0.07" />}
          <rect x={left + 0.5} y={top + 0.5} width={Math.max(0, width - 1)} height={Math.max(0, height - 1)}
            fill="none" stroke={ACCENT} strokeWidth="1.5" strokeOpacity="0.85" />
          {[cropStart, cropEnd].map((fraction, index) => (
            <line key={`crop${index}`} x1={left + width * fraction} y1={top} x2={left + width * fraction} y2={top + height}
              stroke="#22c55e" strokeWidth="1" strokeDasharray="2 5" strokeOpacity="0.85" />
          ))}
          {safeHeight < frame.designHeight && (
            <>
              <rect x={left} y={top} width={width} height={Math.max(0, safeTop - top)} fill="#ef4444" fillOpacity="0.1" />
              <line x1={left} y1={safeTop} x2={left + width} y2={safeTop}
                stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.9" />
            </>
          )}
        </>
      )}

      {overlays.outlines && Object.values(registry).map(entry => {
        const rect = entry.node.getBoundingClientRect();
        if (rect.width <= 0) return null;
        const active = entry.activeId === selectedId;
        return (
          <g key={entry.activeId}>
            <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height}
              fill="none" stroke={active ? ACCENT : '#38bdf8'} strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
            <text x={rect.left + 3} y={Math.max(10, rect.top - 3)} fill={active ? ACCENT : '#38bdf8'}
              fontSize="9" fontWeight="700" fontFamily="ui-monospace, monospace">
              {entry.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default EditorRoot;
