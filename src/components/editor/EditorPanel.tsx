import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useVisualEditor, type ElementConfig } from '../../contexts/VisualEditorContext';
import { useViewport } from '../../hooks/useViewport';
import { ACCENT, useEditorStage, type Overlays } from './stage';

/* ═══════════════════════════════════════════════════════════════
   THE PANEL
   ───────────────────────────────────────────────────────────────
   Lives outside the zoomed stage, so it stays at true screen size
   on any canvas — including a phone, where the gear is the only
   way in. Every position it shows is an absolute design-pixel
   coordinate measured off the rendered element, never the stored
   offset: click a thing, and the number is where the thing is.
   ═══════════════════════════════════════════════════════════════ */

const GEAR_KEY = 'frankportfolio-editor-gear';

/* ── Tiny UI kit ──────────────────────────────────────────────── */
const Section: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div style={{ padding: '9px 11px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9a9a' }}>
        {title}
      </span>
      {right}
    </div>
    {children}
  </div>
);

const Toggle: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; title?: string }> = ({ active, onClick, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      flex: 1, padding: '5px 3px', borderRadius: 7,
      fontSize: 9.5, fontWeight: 800, cursor: 'pointer',
      border: active ? `1px solid ${ACCENT}` : '1px solid rgba(0,0,0,0.12)',
      background: active ? '#fff1e5' : '#fff',
      color: active ? '#c2410c' : '#777',
    }}
  >
    {children}
  </button>
);

/**
 * A numeric input that lets you actually type. Committing on every keystroke
 * means "-" or a half-typed "12" would be parsed as garbage and snap the
 * element somewhere else, so the draft is kept as text until it parses.
 */
const NumberField: React.FC<{
  label: string;
  value: number;
  onCommit: (value: number) => void;
  step?: number;
  suffix?: string;
  readOnly?: boolean;
}> = ({ label, value, onCommit, step = 1, suffix, readOnly }) => {
  // The draft remembers which value it was typed against, so it survives only
  // as long as nothing else has changed the number. Without that, a half-typed
  // "200" stayed on screen after selecting a different element — the field said
  // 200 while the element was actually at 526, which is exactly the kind of lie
  // this editor exists to stop telling.
  const [draft, setDraft] = useState<{ text: string; from: number } | null>(null);
  const shown = draft && draft.from === value ? draft.text : String(value);

  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>
        {label}{suffix ? ` (${suffix})` : ''}
      </span>
      <input
        type="number"
        step={step}
        value={shown}
        readOnly={readOnly}
        onChange={event => {
          const text = event.target.value;
          const parsed = Number(text);
          if (text !== '' && Number.isFinite(parsed)) {
            setDraft({ text, from: parsed });
            onCommit(parsed);
          } else {
            // "-" or an empty box on the way to a number: keep it visible, but
            // tied to the value that is still in force.
            setDraft({ text, from: value });
          }
        }}
        onBlur={() => setDraft(null)}
        style={{
          width: '100%', boxSizing: 'border-box',
          border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
          padding: '5px 7px', fontSize: 11.5, fontFamily: 'ui-monospace, monospace',
          background: readOnly ? '#f6f6f6' : '#fff', color: '#333',
        }}
      />
    </label>
  );
};

const Slider: React.FC<{
  label: string; value: number; min: number; max: number; step: number;
  onChange: (value: number) => void; format?: (value: number) => string;
}> = ({ label, value, min, max, step, onChange, format }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#777' }}>{label}</span>
      <span style={{ fontSize: 9.5, fontWeight: 800, fontFamily: 'ui-monospace, monospace', color: ACCENT }}>
        {format ? format(value) : value}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={event => onChange(Number(event.target.value))}
      style={{ width: '100%', accentColor: ACCENT }}
    />
  </div>
);

const TextField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label style={{ display: 'block', marginBottom: 8 }}>
    <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#777', marginBottom: 3 }}>{label}</span>
    <input
      type="text" value={value}
      onChange={event => onChange(event.target.value)}
      style={{
        width: '100%', boxSizing: 'border-box',
        border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
        padding: '5px 7px', fontSize: 11, fontFamily: 'ui-monospace, monospace', background: '#fff',
      }}
    />
  </label>
);

/* ── Gear ─────────────────────────────────────────────────────── */
const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const GearButton: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { screenWidth, screenHeight } = useViewport();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const raw = localStorage.getItem(GEAR_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;   // first run, or storage blocked
    }
  });
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);

  const spot = position ?? { x: 12, y: Math.max(12, screenHeight - 72) };
  const x = Math.min(Math.max(4, spot.x), Math.max(4, screenWidth - 52));
  const y = Math.min(Math.max(4, spot.y), Math.max(4, screenHeight - 52));

  return (
    <button
      type="button"
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { dx: event.clientX - x, dy: event.clientY - y, moved: false };
      }}
      onPointerMove={event => {
        if (!drag.current) return;
        const next = { x: event.clientX - drag.current.dx, y: event.clientY - drag.current.dy };
        if (Math.abs(next.x - x) > 2 || Math.abs(next.y - y) > 2) drag.current.moved = true;
        setPosition(next);
      }}
      onPointerUp={() => {
        const moved = drag.current?.moved;
        drag.current = null;
        if (moved) {
          try { localStorage.setItem(GEAR_KEY, JSON.stringify({ x, y })); } catch { /* ignore */ }
          return;
        }
        onOpen();
      }}
      aria-label="Open the hero editor"
      title="Hero editor — drag to move, tap to open"
      style={{
        position: 'fixed', left: x, top: y, zIndex: 9998,
        width: 44, height: 44, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(24,24,24,0.86)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.16)', color: '#fff',
        boxShadow: '0 4px 18px rgba(0,0,0,0.45)', cursor: 'grab', touchAction: 'none',
      }}
    >
      <GearIcon />
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL
   ═══════════════════════════════════════════════════════════════ */
export const EditorPanel: React.FC = () => {
  const {
    layout, editMode, setEditMode, selectedId, setSelectedId, registry,
    updateProp, updateProps, resetElement, resetAll, saveLayout, isSaving, saveStatus,
  } = useVisualEditor();
  const viewport = useViewport();
  const stage = useEditorStage();
  const isMobile = viewport.mode === 'mobile';

  const [collapsed, setCollapsed] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const entries = useMemo(
    () => Object.values(registry).sort((a, b) => a.label.localeCompare(b.label)),
    [registry],
  );
  const selected = selectedId ? registry[selectedId] : null;
  const config: ElementConfig | null = selectedId ? layout[selectedId] ?? null : null;
  const measured = stage.selection;

  const width = isMobile ? Math.min(viewport.screenWidth - 16, 352) : 272;
  const maxHeight = isMobile
    ? Math.min(viewport.screenHeight * 0.62, 520)
    : Math.min(viewport.screenHeight * 0.86, 720);

  // Docked to the bottom on a phone, top-left on desktop — but always movable.
  // On the 372-wide canvas the panel covers most of the composition, so being
  // able to shove it aside is the difference between usable and not.
  const home = isMobile
    ? { x: 8, y: Math.max(8, viewport.screenHeight - maxHeight - 8) }
    : { x: 12, y: 12 };
  const wanted = offset ?? home;
  const place = {
    x: Math.min(Math.max(4, wanted.x), Math.max(4, viewport.screenWidth - width - 4)),
    y: Math.min(Math.max(4, wanted.y), Math.max(4, viewport.screenHeight - 44)),
  };

  const onPointerDownHeader = useCallback((event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { dx: event.clientX - place.x, dy: event.clientY - place.y };
  }, [place.x, place.y]);

  if (!editMode) return <GearButton onOpen={() => setEditMode(true)} />;

  const close = () => { setEditMode(false); setSelectedId(null); };

  return (
    <div
      style={{
        position: 'fixed', left: place.x, top: place.y, zIndex: 9999,
        width, maxHeight,
        display: 'flex', flexDirection: 'column',
        borderRadius: 14, overflow: 'hidden',
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 44px rgba(0,0,0,0.3)',
        opacity: stage.busy ? 0.3 : 1,
        pointerEvents: stage.busy ? 'none' : 'auto',
        transition: 'opacity 0.12s',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
      onPointerDown={event => event.stopPropagation()}
    >
      {/* ── Header ── */}
      <div
        onPointerDown={onPointerDownHeader}
        onPointerMove={event => {
          if (!drag.current) return;
          setOffset({ x: event.clientX - drag.current.dx, y: event.clientY - drag.current.dy });
        }}
        onPointerUp={() => { drag.current = null; }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.07)',
          cursor: 'move', touchAction: 'none', flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#1e1e1e' }}>
            Hero editor
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', fontFamily: 'ui-monospace, monospace' }}>
            {viewport.mode} · {viewport.designWidth}×{viewport.designHeight} · {Math.round(viewport.zoom * 100)}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button type="button" onClick={() => setCollapsed(value => !value)}
            style={iconButton} aria-label={collapsed ? 'Expand' : 'Collapse'}>{collapsed ? '▴' : '▾'}</button>
          <button type="button" onClick={close} style={iconButton} aria-label="Close editor">✕</button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {/* ── Save ── */}
          <Section title="Save">
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => void saveLayout()}
                disabled={isSaving}
                style={{
                  flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 800, color: '#fff',
                  background: saveStatus === 'file' ? '#16a34a'
                    : saveStatus === 'local' ? '#0284c7'
                      : saveStatus === 'error' ? '#dc2626'
                        : `linear-gradient(135deg, #fdb466, ${ACCENT})`,
                }}
              >
                {isSaving ? 'Saving…'
                  : saveStatus === 'file' ? '✓ Saved to file'
                    : saveStatus === 'local' ? 'Saved here only'
                      : saveStatus === 'error' ? 'Save failed'
                        : `Save ${viewport.mode} layout`}
              </button>
              <button type="button" onClick={resetAll} title="Reset every element to the factory layout"
                style={{ padding: '8px 9px', borderRadius: 9, border: '1px solid rgba(0,0,0,0.12)', background: '#f6f6f6', color: '#666', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}>
                Reset
              </button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 9, lineHeight: 1.45, fontWeight: 600, color: saveStatus === 'file' ? '#15803d' : saveStatus === 'local' ? '#0369a1' : saveStatus === 'error' ? '#b91c1c' : '#a0a0a0' }}>
              {saveStatus === 'file'
                ? 'Written to layout.json — permanent, and every device and browser gets it.'
                : saveStatus === 'local'
                  ? 'Stored in this browser only — no dev server answered, so layout.json was not written. Re-save from npm run dev to make it permanent.'
                  : saveStatus === 'error'
                    ? 'Nothing was stored. Browser storage is blocked (private mode?).'
                    : 'Saves the whole layout. Positions are design pixels, so the result is identical on every device.'}
            </p>
          </Section>

          {/* ── Elements ── */}
          <Section title={`${isMobile ? 'Mobile' : 'Desktop'} elements`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {entries.map(entry => (
                <button
                  key={entry.activeId}
                  type="button"
                  onClick={() => stage.selectElement(entry.activeId)}
                  style={{
                    padding: '5px 8px', borderRadius: 7, cursor: 'pointer', fontSize: 10,
                    fontWeight: selectedId === entry.activeId ? 800 : 600,
                    border: selectedId === entry.activeId ? `1px solid ${ACCENT}` : '1px solid rgba(0,0,0,0.1)',
                    background: selectedId === entry.activeId ? '#fff1e5' : '#fff',
                    color: selectedId === entry.activeId ? '#c2410c' : '#666',
                  }}
                >
                  {entry.label}
                </button>
              ))}
              {entries.length === 0 && (
                <span style={{ fontSize: 9.5, color: '#aaa' }}>Scroll to the hero — nothing editable is mounted here.</span>
              )}
            </div>
          </Section>

          {/* ── Inspector ── */}
          {selected && config && measured && (
            <>
              <Section
                title={`Position — ${selected.label}`}
                right={<span style={{ fontSize: 9, color: '#bbb', fontFamily: 'ui-monospace, monospace' }}>design px</span>}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 7 }}>
                  <NumberField label="X" value={Math.round(measured.canvas.x)} onCommit={stage.setCanvasX} />
                  <NumberField label="Y" value={Math.round(measured.canvas.y)} onCommit={stage.setCanvasY} />
                  <NumberField label="W" value={Math.round(measured.canvas.w)} onCommit={stage.setCanvasWidth} />
                  <NumberField label="H" value={Math.round(measured.canvas.h)} onCommit={() => { }} readOnly />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: 3 }}>
                    <span />
                    <button type="button" style={padButton} onClick={() => stage.nudge(0, -stage.step)} aria-label="Move up">↑</button>
                    <span />
                    <button type="button" style={padButton} onClick={() => stage.nudge(-stage.step, 0)} aria-label="Move left">←</button>
                    <button type="button" style={padButton} onClick={() => stage.nudge(0, stage.step)} aria-label="Move down">↓</button>
                    <button type="button" style={padButton} onClick={() => stage.nudge(stage.step, 0)} aria-label="Move right">→</button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {[1, 5, 10, 25].map(value => (
                        <Toggle key={value} active={stage.step === value} onClick={() => stage.setStep(value)} title={`${value} design px per step`}>
                          {value}
                        </Toggle>
                      ))}
                    </div>
                    <Toggle active={stage.snap} onClick={() => stage.setSnap(!stage.snap)} title="Snap to edges and centres — hold Alt to override">
                      Snap {stage.snap ? 'on' : 'off'}
                    </Toggle>
                  </div>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 8.5, color: '#b3b3b3', lineHeight: 1.4 }}>
                  Drag the element itself, or the corner handles to resize. Arrow keys nudge, Shift ×5, Ctrl+S saves.
                </p>
              </Section>

              <Section title="Size & style">
                <Slider label="Scale" min={0.05} max={6} step={0.01}
                  value={config.scale ?? 1}
                  onChange={value => updateProp(selectedId!, 'scale', value)}
                  format={value => `${value.toFixed(2)}×`} />
                <Slider label="Rotation" min={-180} max={180} step={1}
                  value={config.rotation ?? 0}
                  onChange={value => updateProp(selectedId!, 'rotation', value)}
                  format={value => `${Math.round(value)}°`} />
                <Slider label="Opacity" min={0} max={1} step={0.05}
                  value={config.opacity ?? 1}
                  onChange={value => updateProp(selectedId!, 'opacity', value)}
                  format={value => value.toFixed(2)} />

                {selected.kind === 'text' && (
                  <>
                    <TextField label="Font size" value={config.fontSize ?? ''} onChange={value => updateProp(selectedId!, 'fontSize', value)} />
                    <Slider label="Font weight" min={100} max={900} step={100}
                      value={config.fontWeight ?? 400}
                      onChange={value => updateProp(selectedId!, 'fontWeight', value)} />
                    <TextField label="Letter spacing" value={config.letterSpacing ?? ''} onChange={value => updateProp(selectedId!, 'letterSpacing', value)} />
                    <TextField label="Line height" value={config.lineHeight ?? ''} onChange={value => updateProp(selectedId!, 'lineHeight', value)} />
                    <label style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#777', marginBottom: 3 }}>Colour</span>
                      <input type="color" value={config.color ?? '#ffffff'}
                        onChange={event => updateProp(selectedId!, 'color', event.target.value)}
                        style={{ width: '100%', height: 26, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, background: 'none', cursor: 'pointer' }} />
                    </label>
                  </>
                )}

                {selected.kind === 'image' && (
                  <>
                    <TextField label="Image width" value={config.width ?? 'auto'} onChange={value => updateProp(selectedId!, 'width', value)} />
                    <TextField label="Image height" value={config.height ?? '100%'} onChange={value => updateProp(selectedId!, 'height', value)} />
                  </>
                )}
              </Section>

              <Section title="Arrange">
                {selected.canLayer ? (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    <Toggle active={(config.zIndex ?? 10) >= 50} onClick={() => updateProp(selectedId!, 'zIndex', 90)}>In front</Toggle>
                    <Toggle active={(config.zIndex ?? 10) < 50} onClick={() => updateProp(selectedId!, 'zIndex', 5)}>Behind portrait</Toggle>
                    <div style={{ width: 64 }}>
                      <NumberField label="z" value={config.zIndex ?? 10} onCommit={value => updateProp(selectedId!, 'zIndex', value)} />
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0 0 6px', fontSize: 9, color: '#aaa' }}>This element's stacking is fixed by its section.</p>
                )}
                <div style={{ display: 'flex', gap: 4 }}>
                  <Toggle active={false} onClick={() => updateProps(selectedId!, { x: 0, y: 0 })} title="Back to the natural CSS position">
                    Snap back
                  </Toggle>
                  <Toggle active={false} onClick={() => resetElement(selectedId!)} title="Factory defaults for this element">
                    Reset element
                  </Toggle>
                </div>
              </Section>
            </>
          )}

          {/* ── Debug ── */}
          <Section
            title="Debugging mode"
            right={(
              <button type="button" onClick={() => stage.setDebug(!stage.debug)}
                style={{
                  padding: '2px 8px', borderRadius: 999, cursor: 'pointer', fontSize: 9, fontWeight: 800,
                  border: stage.debug ? `1px solid ${ACCENT}` : '1px solid rgba(0,0,0,0.12)',
                  background: stage.debug ? ACCENT : '#fff', color: stage.debug ? '#fff' : '#888',
                }}>
                {stage.debug ? 'ON' : 'OFF'}
              </button>
            )}
          >
            {stage.debug ? <DebugBody /> : (
              <p style={{ margin: 0, fontSize: 9, color: '#aaa', lineHeight: 1.45 }}>
                Turn on to see the canvas bounds, the crop and safe-band lines, live pointer
                coordinates, and a warning when an element sits where some devices would cut it.
              </p>
            )}
          </Section>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DEBUG BODY — what this window is doing to the canvas, and
   whether any of it differs from what a visitor would see.
   ═══════════════════════════════════════════════════════════════ */
const DebugBody: React.FC = () => {
  const viewport = useViewport();
  const stage = useEditorStage();
  const { selection, contentBounds, pointer } = stage;

  const {
    zoom, heroFill, maxFill, safeHeight, designWidth, designHeight,
    screenWidth, screenHeight, stageHeight, measured,
  } = viewport;

  const sideCrop = Math.round((designWidth * (1 - 1 / heroFill)) / 2);
  const spare = Math.max(0, Math.round(stageHeight - designHeight * heroFill));
  const topCrop = Math.max(0, Math.round(designHeight * heroFill - stageHeight));

  const cropStart = designWidth * (0.5 - 0.5 / maxFill);
  const cropEnd = designWidth * (0.5 + 0.5 / maxFill);
  const overflowLeft = contentBounds ? Math.round(cropStart - contentBounds.left) : 0;
  const overflowRight = contentBounds ? Math.round(contentBounds.right - cropEnd) : 0;
  const aboveSafe = contentBounds ? Math.round((designHeight - safeHeight) - contentBounds.top) : 0;

  const status = !measured
    ? { tone: '#a16207', bg: '#fefce8', text: 'Measuring the window…' }
    : aboveSafe > 0
      ? { tone: '#b91c1c', bg: '#fef2f2', text: `An element reaches ${aboveSafe}px above the safe band — a short phone cuts it off. Drag it below the green line.` }
      : Math.max(overflowLeft, overflowRight) > 0
        ? { tone: '#b91c1c', bg: '#fef2f2', text: `An element sits ${Math.max(overflowLeft, overflowRight)}px past the ${overflowLeft >= overflowRight ? 'left' : 'right'} crop line. Taller windows will cut it — move it inside the green lines.` }
        : topCrop > 0
          ? { tone: '#a16207', bg: '#fefce8', text: `The top ${topCrop}px of the canvas is off-screen here — background only, nothing designed is lost.` }
          : spare > 0
            ? { tone: '#a16207', bg: '#fefce8', text: `Filled as far as the crop budget allows — ${spare}px of background still shows above.` }
            : heroFill < 1
              ? { tone: '#15803d', bg: '#f0fdf4', text: `POV locked. The whole canvas fits at ${Math.round(heroFill * 100)}% — nothing cut, every device sees this exact composition.` }
              : { tone: '#15803d', bg: '#f0fdf4', text: `POV locked, screen filled. Same composition for everyone${sideCrop ? `, ${sideCrop}px of background cropped per side` : ''}.` };

  const rows: [string, string][] = [
    ['Canvas', `${designWidth} × ${designHeight}`],
    ['Window', `${screenWidth} × ${screenHeight}`],
    ['Scale', `${(zoom * 100).toFixed(1)}%`],
    ['Canvas fit', heroFill === 1 ? 'exact' : heroFill > 1 ? `${heroFill.toFixed(3)}× cover (−${sideCrop}px/side)` : `${heroFill.toFixed(3)}× fit`],
    ['Window height', `${Math.round(stageHeight)} design px`],
    ['Safe band', safeHeight >= designHeight ? 'whole canvas' : `bottom ${safeHeight} of ${designHeight}`],
    ['Pointer', pointer ? `${pointer.x}, ${pointer.y}` : '—'],
  ];

  if (selection) {
    rows.push(
      ['Selected box', `${Math.round(selection.canvas.x)}, ${Math.round(selection.canvas.y)} · ${Math.round(selection.canvas.w)}×${Math.round(selection.canvas.h)}`],
      ['Right / bottom', `${Math.round(selection.canvas.x + selection.canvas.w)}, ${Math.round(selection.canvas.y + selection.canvas.h)}`],
      ['On screen', `${Math.round(selection.client.x)}, ${Math.round(selection.client.y)} px`],
    );
  }

  const toggles: [keyof Overlays, string][] = [
    ['bounds', 'Canvas'],
    ['grid', 'Grid'],
    ['centres', 'Centre'],
    ['outlines', 'Boxes'],
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: 3, marginBottom: 7 }}>
        {toggles.map(([key, label]) => (
          <Toggle key={key} active={stage.overlays[key]} onClick={() => stage.toggleOverlay(key)}>{label}</Toggle>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 2, columnGap: 8, marginBottom: 7 }}>
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#a0a0a0' }}>{label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#555', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>{value}</span>
          </React.Fragment>
        ))}
      </div>

      <p style={{ margin: 0, padding: '6px 7px', borderRadius: 7, background: status.bg, color: status.tone, fontSize: 9, fontWeight: 600, lineHeight: 1.45 }}>
        {status.text}
      </p>
    </>
  );
};

/* ── Shared inline styles ─────────────────────────────────────── */
const iconButton: React.CSSProperties = {
  width: 22, height: 22, borderRadius: 6, border: 'none', background: 'none',
  color: '#999', fontSize: 12, lineHeight: 1, cursor: 'pointer',
};

const padButton: React.CSSProperties = {
  width: 28, height: 24, borderRadius: 6, border: '1px solid rgba(249,115,22,0.3)',
  background: '#fff7ed', color: '#ea580c', fontSize: 13, fontWeight: 800, lineHeight: 1, cursor: 'pointer',
};
