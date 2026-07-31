import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
  useVisualEditor, getFieldsForElement, FALLBACK,
  type FieldDef,
} from '../../contexts/VisualEditorContext';
import { useViewport } from '../../hooks/useViewport';

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
   SHARED BITS
   ═══════════════════════════════════════════ */
const ACCENT = '#f97316';

/**
 * The slice of the canvas still visible once a hero is overscanned to its cap.
 * Anything outside gets cropped on a tall window, so it is the line design
 * elements must stay inside.
 */
const cropBounds = (maxFill: number) => ({
  start: 0.5 - 0.5 / maxFill,
  end: 0.5 + 0.5 / maxFill,
});

/**
 * Elements that are SUPPOSED to run off the canvas. The portrait is scaled far
 * past the frame on purpose — counting it would keep the crop check permanently
 * red and train Frank to ignore it.
 */
const BLEED_IDS = new Set(['characterImage']);

/**
 * Design-space bounds of everything the visitor must actually see. Only the
 * editor-controlled blocks and the About panel count. Read-only, and always
 * converted back to an unscaled canvas, so it can never feed back into the
 * scale that produced it.
 */
const measureContentBounds = (designWidth: number) => {
  const box = document.querySelector('.canvas-box');
  if (!box) return null;

  const boxRect = box.getBoundingClientRect();
  if (boxRect.width <= 0) return null;
  const scale = boxRect.width / designWidth;

  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  // The About panel's own box is taller than its content — it centres what it
  // holds — so measure the children that actually render, not the container.
  box.querySelectorAll('[data-editable-id], .hero-about-panel > *').forEach(el => {
    const id = (el as HTMLElement).dataset.editableId;
    if (id && BLEED_IDS.has(id)) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    left = Math.min(left, (rect.left - boxRect.left) / scale);
    right = Math.max(right, (rect.right - boxRect.left) / scale);
    top = Math.min(top, (rect.top - boxRect.top) / scale);
  });

  return Number.isFinite(left) ? { left, right, top } : null;
};


const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 800, color: '#b4b4b4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
    {children}
  </p>
);

const SegmentedButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ active, onClick, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      flex: 1,
      padding: '6px 4px',
      borderRadius: '8px',
      fontSize: '10px',
      fontWeight: 800,
      cursor: 'pointer',
      border: active ? `1px solid ${ACCENT}` : '1px solid rgba(0,0,0,0.1)',
      background: active ? '#fff1e5' : '#fff',
      color: active ? '#c2410c' : '#666',
    }}
  >
    {children}
  </button>
);

/* ═══════════════════════════════════════════
   CANVAS OVERLAY
   ─────────────────────────────────────────────
   Drawn OUTSIDE the zoomed stage, in real screen
   pixels, from the same numbers the stage uses.
   It shows where the fixed design canvas actually
   lands on this window — which is the thing that
   has to look the same for every visitor.
   ═══════════════════════════════════════════ */
interface OverlayOptions {
  bounds: boolean;
  grid: boolean;
  centers: boolean;
}

const CanvasOverlay: React.FC<{ options: OverlayOptions }> = ({ options }) => {
  const {
    zoom, heroFill, maxFill, safeHeight, designWidth, designHeight,
    screenWidth, screenHeight, stageHeight,
  } = useViewport();
  const crop = cropBounds(maxFill);
  if (!options.bounds && !options.grid && !options.centers) return null;

  // Where `.canvas-box` actually lands: page scale × hero overscan, centred
  // horizontally (so the crop is symmetrical) and pinned to the BOTTOM of the
  // viewport it lives in. That viewport is the window normally and the emulated
  // device in preview — `stageHeight * zoom` is both, in rendered pixels.
  const boxScale = zoom * heroFill;
  const stageWidth = designWidth * boxScale;
  const stageLeft = (screenWidth - stageWidth) / 2;
  const boxHeight = designHeight * boxScale;
  const viewportBottom = stageHeight * zoom;
  const boxTop = viewportBottom - boxHeight;

  const gridStep = 40 * boxScale; // 40 design px
  const majorEvery = 5;           // …and a brighter line every 200

  const verticals: React.ReactElement[] = [];
  const horizontals: React.ReactElement[] = [];

  if (options.grid && gridStep > 3) {
    for (let i = 1, x = stageLeft + gridStep; x < stageLeft + stageWidth; i++, x += gridStep) {
      verticals.push(
        <line key={`gv${i}`} x1={x} y1={boxTop} x2={x} y2={boxTop + boxHeight}
          stroke="#fdb466" strokeWidth={i % majorEvery === 0 ? 0.9 : 0.5}
          strokeOpacity={i % majorEvery === 0 ? 0.4 : 0.18} />
      );
    }
    for (let i = 1, y = boxTop + gridStep; y < boxTop + boxHeight; i++, y += gridStep) {
      horizontals.push(
        <line key={`gh${i}`} x1={stageLeft} y1={y} x2={stageLeft + stageWidth} y2={y}
          stroke="#fdb466" strokeWidth={i % majorEvery === 0 ? 0.9 : 0.5}
          strokeOpacity={i % majorEvery === 0 ? 0.4 : 0.18} />
      );
    }
  }

  return (
    <svg
      className="fixed inset-0 z-[9996] pointer-events-none"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      {verticals}
      {horizontals}

      {options.centers && (
        <>
          <line x1={stageLeft + stageWidth / 2} y1={0} x2={stageLeft + stageWidth / 2} y2={screenHeight}
            stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.75" />
          <line x1={stageLeft} y1={boxTop + boxHeight / 2} x2={stageLeft + stageWidth} y2={boxTop + boxHeight / 2}
            stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.75" />
        </>
      )}

      {options.bounds && (
        <>
          <rect x={stageLeft + 0.5} y={boxTop + 0.5} width={Math.max(0, stageWidth - 1)} height={Math.max(0, boxHeight - 1)}
            fill="none" stroke={ACCENT} strokeWidth="1.5" strokeOpacity="0.85" />

          {/* Crop lines: keep content inside these and the overscan can never
              cut it, whatever shape the visitor's window is. */}
          {[crop.start, crop.end].map((fraction, i) => (
            <line key={`safe${i}`}
              x1={stageLeft + stageWidth * fraction} y1={boxTop}
              x2={stageLeft + stageWidth * fraction} y2={boxTop + boxHeight}
              stroke="#22c55e" strokeWidth="1" strokeDasharray="2 5" strokeOpacity="0.8" />
          ))}

          {/* Safe band: the height every device shows, measured up from the
              bottom. Above the line only tall devices see anything. */}
          {safeHeight < designHeight && (
            <>
              <rect x={stageLeft} y={boxTop} width={stageWidth}
                height={Math.max(0, boxHeight * (1 - safeHeight / designHeight))}
                fill="#ef4444" fillOpacity="0.10" />
              <line
                x1={stageLeft} y1={boxTop + boxHeight * (1 - safeHeight / designHeight)}
                x2={stageLeft + stageWidth} y2={boxTop + boxHeight * (1 - safeHeight / designHeight)}
                stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.9" />
            </>
          )}

          {/* Window height the canvas does not define — background only. */}
          {boxTop > 0 && (
            <rect x={0} y={0} width={screenWidth} height={boxTop}
              fill="#38bdf8" fillOpacity="0.07" />
          )}

          <text x={Math.max(stageLeft, 0) + 8} y={boxTop + 16} fill={ACCENT} fontSize="10" fontWeight="700" fontFamily="monospace">
            {designWidth}×{designHeight} · {Math.round(zoom * 100)}%
            {heroFill > 1 ? ` · fill ${heroFill.toFixed(2)}×` : ''}
          </text>
        </>
      )}
    </svg>
  );
};

/* ═══════════════════════════════════════════
   POV READOUT
   ─────────────────────────────────────────────
   The actual debugging surface: what this window
   is doing to the canvas right now, and whether
   any of it is not what a visitor would see.
   ═══════════════════════════════════════════ */
const PovReadout: React.FC = () => {
  const {
    zoom, heroFill, maxFill, safeHeight, designWidth, designHeight, screenWidth, screenHeight,
    stageHeight, measured,
  } = useViewport();

  // Switching canvases (device emulation on/off) re-renders this panel in the
  // same commit that swaps the hero's blocks, so the measurement below runs
  // against the OLD canvas's elements sized to the NEW canvas's width — which
  // latched a nonsense "1313px past the crop line" that never cleared, because
  // nothing afterwards re-rendered the panel. Re-measure once the new canvas
  // has actually painted.
  const [, remeasure] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(remeasure); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, [designWidth, designHeight, zoom, heroFill]);

  // How much of the canvas the overscan pushes past the left/right edges…
  const sideCrop = Math.round((designWidth * (1 - 1 / heroFill)) / 2);
  // …how much window height is still left over above the filled canvas…
  const spare = Math.max(0, Math.round(stageHeight - designHeight * heroFill));
  // …and the other direction: a short window cuts off the top.
  const topCrop = Math.max(0, Math.round(designHeight * heroFill - stageHeight));

  // Does any element actually reach past the worst-case crop line? Measured on
  // every render rather than assumed, so it reacts to a drag as it happens.
  // (The panel only renders while the editor is open, and GSAP is reverted in
  // edit mode, so nothing here is caught mid-animation.)
  const crop = cropBounds(maxFill);
  const bounds = measureContentBounds(designWidth);
  const overflowLeft = bounds ? Math.round(designWidth * crop.start - bounds.left) : 0;
  const overflowRight = bounds ? Math.round(bounds.right - designWidth * crop.end) : 0;
  const overflow = Math.max(overflowLeft, overflowRight) > 0;

  // The vertical equivalent: how far an element pokes above the band that every
  // device is guaranteed to show. This is what made the hero title disappear on
  // a real phone while looking fine in the old preview.
  const safeTop = designHeight - safeHeight;
  const aboveSafe = bounds ? Math.round(safeTop - bounds.top) : 0;

  const rows: [string, string][] = [
    ['Canvas', `${designWidth} × ${designHeight}`],
    ['Window', `${screenWidth} × ${screenHeight}`],
    ['Scale', `${(zoom * 100).toFixed(1)}%`],
    ['Canvas fit', heroFill === 1
      ? 'exact'
      : heroFill > 1
        ? `${heroFill.toFixed(3)}× cover (−${sideCrop}px/side)`
        : `${heroFill.toFixed(3)}× fit`],
    ['Window height', `${Math.round(stageHeight)} design px`],
    ['Safe band', safeHeight >= designHeight ? 'whole canvas' : `bottom ${safeHeight} of ${designHeight}`],
  ];

  const status = !measured
    ? { tone: '#a16207', bg: '#fefce8', text: 'Measuring the window…' }
    : aboveSafe > 0
      ? {
        tone: '#b91c1c', bg: '#fef2f2',
        text: `An element reaches ${aboveSafe}px above the safe band. Only the tallest devices show it — on a short phone it is cut off. Turn on the Canvas overlay and drag it below the green line.`,
      }
      : overflow
        ? {
          tone: '#b91c1c', bg: '#fef2f2',
          text: `An element sits ${Math.max(overflowLeft, overflowRight)}px past the ${overflowLeft >= overflowRight ? 'left' : 'right'} crop line. Visitors with taller windows will see it cut — turn on the Canvas overlay and move it inside the green lines.`,
        }
        : topCrop > 0
          ? { tone: '#a16207', bg: '#fefce8', text: `The top ${topCrop}px of the canvas is off-screen here — everything that matters is inside the safe band, so this is background only.` }
          : spare > 0
            ? { tone: '#a16207', bg: '#fefce8', text: `Filled as far as the crop budget allows — ${spare}px of background still shows above. A squarer window can't be filled without cutting into the design.` }
            : heroFill < 1
              ? { tone: '#15803d', bg: '#f0fdf4', text: `POV locked. The whole canvas fits at ${Math.round(heroFill * 100)}% — nothing cut, and every device sees this exact composition.` }
              : { tone: '#15803d', bg: '#f0fdf4', text: `POV locked, screen filled. Same composition for everyone${sideCrop ? `, ${sideCrop}px of background cropped per side` : ''}.` };

  return (
    <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
      <SectionLabel>Point of view</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: '3px', columnGap: '10px', marginBottom: '8px' }}>
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#999' }}>{label}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#444', fontFamily: 'monospace', textAlign: 'right' }}>{value}</span>
          </React.Fragment>
        ))}
      </div>
      <p style={{
        margin: 0, padding: '6px 8px', borderRadius: '7px',
        background: status.bg, color: status.tone,
        fontSize: '9.5px', fontWeight: 600, lineHeight: 1.45,
      }}>
        {status.text}
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MOVE PAD
   ═══════════════════════════════════════════ */
const DirectionControls: React.FC<{ step: number; setStep: (n: number) => void }> = ({ step, setStep }) => {
  const { layout, selectedElement, updateProp } = useVisualEditor();
  if (!selectedElement || !layout[selectedElement]) return null;

  const nudge = (x: number, y: number) => {
    const current = layout[selectedElement];
    if (x) updateProp(selectedElement, 'x', (current.x || 0) + x * step);
    if (y) updateProp(selectedElement, 'y', (current.y || 0) + y * step);
  };
  const buttonStyle: React.CSSProperties = {
    width: '36px', height: '32px', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.3)',
    background: '#fff7ed', color: '#ea580c', fontSize: '18px', fontWeight: 800, lineHeight: 1, cursor: 'pointer',
  };

  return (
    <div style={{ margin: '0 10px 10px', padding: '9px', borderRadius: '10px', background: '#fffaf5', border: '1px solid rgba(249,115,22,0.16)' }}>
      <p style={{ margin: '0 0 7px', fontSize: '10px', fontWeight: 800, color: '#9a3412', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Move — design px
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', justifyContent: 'center', gap: '4px' }}>
        <span />
        <button type="button" aria-label="Move up" onClick={() => nudge(0, -1)} style={buttonStyle}>↑</button>
        <span />
        <button type="button" aria-label="Move left" onClick={() => nudge(-1, 0)} style={buttonStyle}>←</button>
        <button type="button" aria-label="Move down" onClick={() => nudge(0, 1)} style={buttonStyle}>↓</button>
        <button type="button" aria-label="Move right" onClick={() => nudge(1, 0)} style={buttonStyle}>→</button>
      </div>
      <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
        {[1, 5, 10, 25].map(value => (
          <SegmentedButton key={value} active={step === value} onClick={() => setStep(value)} title={`${value} design pixels per step`}>
            {value}
          </SegmentedButton>
        ))}
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '9px', color: '#b0a396', lineHeight: 1.4 }}>
        Arrow keys nudge too — hold Shift for ×5.
      </p>
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
        <button type="button" onClick={() => setLayer(90)} style={{ ...baseStyle, border: isInFront ? `1px solid ${ACCENT}` : '1px solid rgba(0,0,0,0.1)', background: isInFront ? '#fff1e5' : '#fff', color: '#c2410c' }}>In Front</button>
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
  const [step, setStep] = React.useState(5);
  const [overlay, setOverlay] = React.useState<OverlayOptions>({ bounds: false, grid: false, centers: false });
  const dragControls = useDragControls();
  const {
    layout, editMode, setEditMode, setPanelOpen,
    selectedElement, setSelectedElement, updateProp, saveConfig, resetConfig,
    isSaving, saveStatus, elementLabels, guides,
  } = useVisualEditor();

  const visibleElementIds = Object.keys(layout).filter(id =>
    isMobileViewport ? id.endsWith('Mobile') : !id.endsWith('Mobile')
  );

  /* ── Keyboard nudging ───────────────────────────────────────────────────── */
  React.useEffect(() => {
    if (!editMode || !selectedElement) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Never steal the arrow keys from a field the user is typing in.
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;

      const axis = { ArrowLeft: ['x', -1], ArrowRight: ['x', 1], ArrowUp: ['y', -1], ArrowDown: ['y', 1] }[event.key] as
        [('x' | 'y'), number] | undefined;
      if (!axis) return;

      event.preventDefault();
      const [prop, direction] = axis;
      const current = layout[selectedElement];
      if (!current) return;
      updateProp(selectedElement, prop, (current[prop] || 0) + direction * step * (event.shiftKey ? 5 : 1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, selectedElement, layout, step, updateProp]);

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
              style={{ background: '#fff4e8', color: ACCENT }}>
              {field.step && field.step < 1 ? numVal.toFixed(2) : Math.round(numVal)}{field.unit || ''}
            </span>
          </label>
          <input type="range" min={field.min} max={field.max} step={field.step}
            value={numVal}
            onChange={e => updateProp(id, field.key, Number(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer"
            style={{ accentColor: ACCENT }} />
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
      {/* ═══ CANVAS OVERLAY ═══ */}
      {editMode && <CanvasOverlay options={overlay} />}

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
                    {viewport.mode} · {viewport.designWidth}×{viewport.designHeight} · {Math.round(viewport.zoom * 100)}%
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

            {/* ── POV readout ── */}
            <PovReadout />

            {/* ── Overlays ── */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
              <SectionLabel>Overlays</SectionLabel>
              <div style={{ display: 'flex', gap: '4px' }}>
                {([
                  ['bounds', 'Canvas'],
                  ['grid', 'Grid'],
                  ['centers', 'Centre'],
                ] as [keyof OverlayOptions, string][]).map(([key, label]) => (
                  <SegmentedButton
                    key={key}
                    active={overlay[key]}
                    onClick={() => setOverlay(prev => ({ ...prev, [key]: !prev[key] }))}
                  >
                    {label}
                  </SegmentedButton>
                ))}
              </div>
            </div>

            {/* ── Save / Reset row ── */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '8px' }}>
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
                  background: saveStatus === 'file'
                    ? '#16a34a'
                    : saveStatus === 'local'
                      ? '#0284c7'
                      : saveStatus === 'error'
                        ? '#dc2626'
                        : 'linear-gradient(135deg, #fdb466, #f97316)',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
                  transition: 'background 0.2s',
                }}
              >
                <SaveIcon />
                {isSaving
                  ? 'Saving…'
                  : saveStatus === 'file'
                    ? '✓ Saved to file'
                    : saveStatus === 'local'
                      ? 'Saved here only'
                      : saveStatus === 'error'
                        ? 'Save failed'
                        : 'Save All'}
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

              {/* "Nasave ba talaga?" — an honest answer, not a green tick either way. */}
              {saveStatus === 'local' && (
                <p style={{ margin: '7px 0 0', padding: '6px 8px', borderRadius: '7px', background: '#eff6ff', color: '#0369a1', fontSize: '9.5px', fontWeight: 600, lineHeight: 1.45 }}>
                  Stored in this browser only — no dev server to write layout.json.
                  Other devices and a fresh deploy will not have it. Re-save from
                  <strong> npm run dev</strong> to make it permanent.
                </p>
              )}
              {saveStatus === 'file' && (
                <p style={{ margin: '7px 0 0', padding: '6px 8px', borderRadius: '7px', background: '#f0fdf4', color: '#15803d', fontSize: '9.5px', fontWeight: 600, lineHeight: 1.45 }}>
                  Written to layout.json — permanent, and every device gets it.
                </p>
              )}
              {saveStatus === 'error' && (
                <p style={{ margin: '7px 0 0', padding: '6px 8px', borderRadius: '7px', background: '#fef2f2', color: '#b91c1c', fontSize: '9.5px', fontWeight: 600, lineHeight: 1.45 }}>
                  Nothing was stored. Browser storage is blocked (private mode?).
                </p>
              )}
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

              {/* Element list */}
              <div style={{ padding: '10px 12px 6px' }}>
                <SectionLabel>{isMobileViewport ? 'Mobile elements' : 'Desktop elements'}</SectionLabel>
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
                        color: selectedElement === id ? ACCENT : '#555',
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
                  <DirectionControls step={step} setStep={setStep} />
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
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#888', marginBottom: '4px' }}>X (design px)</label>
                      <input type="number"
                        value={layout[selectedElement].x}
                        onChange={e => updateProp(selectedElement, 'x', Number(e.target.value))}
                        style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', padding: '6px 8px', fontSize: '12px', fontFamily: 'monospace', background: 'white', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#888', marginBottom: '4px' }}>Y (design px)</label>
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
                    <strong>Design pixels:</strong> every number here is measured on the fixed
                    {' '}{viewport.designWidth}×{viewport.designHeight} canvas, so whatever you set is what
                    every visitor gets — their screen only changes the scale, never the placement.
                    Sizes typed as <code>vw</code>/<code>vh</code> are rewritten to canvas units automatically.
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
