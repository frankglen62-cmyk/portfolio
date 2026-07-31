/* ============================================================
   Viewport Stage — one composition, every screen
   ------------------------------------------------------------
   The whole site is laid out on a FIXED design canvas:

     desktop  1920 x 919   (Frank's editing viewport)
     mobile    372 x 832

   The canvas is scaled to the real window with CSS `zoom`, using
   the WIDTH only:

     zoom = windowWidth / designWidth

   so the canvas always fills the window edge to edge and every
   length inside the page ("design pixels") keeps the exact same
   proportion on a 4K monitor, a 1366 laptop, a restored-down
   window, or any phone. Nothing is ever letterboxed.

   Height is deliberately NOT part of the scale. Instead both
   `--vw` AND `--vh` are CONSTANTS of the canvas:

     --vw = designWidth  / 100
     --vh = designHeight / 100

   That is the whole trick. As long as a rule only ever uses
   design pixels, `--vw` and `--vh`, the composition cannot react
   to the window's aspect ratio — a short 16:9 window and a tall
   restored-down window produce the identical picture, only
   smaller or larger. Rules that genuinely need "however tall the
   window happens to be" (a full-bleed background, a sticky
   section) use `--screen-h`, which is the one value that does
   follow the window.

   Because the canvas width never changes, layout can no longer
   jump at a breakpoint: there is only ONE desktop composition and
   ONE mobile composition. Tailwind's sm/md/lg variants and the
   raw CSS media queries are rewired to `html[data-canvas="…"]`
   instead of real viewport width (see styles/index.css).
   ============================================================ */

export type CanvasMode = 'desktop' | 'mobile';

export const CANVAS: Record<CanvasMode, {
  width: number;
  height: number;
  /**
   * How far a `.canvas-box` may be scaled UP past the page scale so it fills a
   * window taller than the canvas, instead of leaving a band of empty
   * background above the composition.
   *
   * The cost is a horizontal crop: at fill `f` the visible slice of the canvas
   * is `[width/2 - width/2f, width/2 + width/2f]`, so the cap is set by how
   * close the composition's own blocks sit to the canvas edges. The current
   * hero lands at ~193 on the left and ~1766 on the right once the saved
   * editor offsets are applied, and the right side binds:
   *
   *     f ≤ (960 - 60) / (1766 - 960) = 1.117
   *
   *   desktop 1.12 → fills every window down to a 1.87:1 aspect; a 16:9
   *                  window ends up ~46px short, which reads as nothing.
   *   mobile   1.0 → off. Phone margins are only ~15px wide, and a phone's
   *                  viewport is nearly always SHORTER than the 832 canvas
   *                  anyway, so there is no band to fill.
   *
   * The editor draws these crop lines live and warns when an element crosses
   * them, so moving a block outward is caught rather than silently clipped.
   */
  maxFill: number;
}> = {
  desktop: { width: 1920, height: 919, maxFill: 1.12 },
  mobile: { width: 372, height: 832, maxFill: 1 },
};

/** Below this the page would be unreadable — let it overflow instead. */
const MIN_ZOOM = 0.15;

/** Rounding the scale keeps sub-pixel jitter from re-running every subscriber. */
const ZOOM_PRECISION = 10000;

const OVERRIDE_KEY = 'frankportfolio-canvas-override';

export interface ViewportState {
  /** Which design canvas is active. */
  mode: CanvasMode;
  /** The canvas this device would pick on its own, ignoring any override. */
  nativeMode: CanvasMode;
  /** realWindowWidth / designWidth — how much CSS `zoom` is applied. */
  zoom: number;
  /** Canvas width in design pixels (1920 or 372). */
  designWidth: number;
  /** Canvas height in design pixels (919 or 832). */
  designHeight: number;
  /** Real window height expressed in DESIGN pixels — the only aspect-aware value. */
  stageHeight: number;
  /**
   * Extra scale a `.canvas-box` applies so the composition fills a window
   * taller than the canvas. 1 = no overscan. See CANVAS[…].maxFill.
   */
  heroFill: number;
  /** The ceiling `heroFill` can reach on this canvas — the crop budget. */
  maxFill: number;
  /** Real window size in rendered CSS pixels. */
  screenWidth: number;
  screenHeight: number;
  /** True once the window has actually been measured (never on the very first tick). */
  measured: boolean;
  /** Manual canvas override, when one is active. */
  forced: CanvasMode | null;
  /**
   * True when the forced canvas is not the one this device would pick — the
   * page is then fitted like a device emulator instead of filling the window,
   * so a mobile preview on a desktop really shows a phone-shaped viewport.
   */
  isPreview: boolean;
}

const isBrowser = typeof window !== 'undefined';

const readForced = (): CanvasMode | null => {
  if (!isBrowser) return null;

  const fromUrl = new URLSearchParams(window.location.search).get('canvas');
  if (fromUrl === 'mobile' || fromUrl === 'desktop') return fromUrl;

  try {
    const stored = localStorage.getItem(OVERRIDE_KEY);
    if (stored === 'mobile' || stored === 'desktop') return stored;
  } catch {
    /* private mode — ignore */
  }
  return null;
};

/**
 * The canvas is picked from the DEVICE, never from the window size, so
 * shrinking or restoring a desktop window keeps the identical desktop
 * composition — which is the entire point of the stage.
 */
const detectMode = (): CanvasMode => {
  if (!isBrowser) return 'desktop';

  // `screen` is the physical display and stays put while the window is
  // resized. It reports 0 in a few embedded/headless contexts, hence the
  // window fallback.
  const displayWidth = window.screen?.width || window.innerWidth || 1920;
  const displayHeight = window.screen?.height || window.innerHeight || 1080;
  const shortSide = Math.min(displayWidth, displayHeight);

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const isHandheld = coarsePointer && noHover;

  // Phones, in either orientation.
  if (shortSide <= 540) return 'mobile';
  // Small tablets held like a phone. Anything bigger reads the desktop canvas.
  if (isHandheld && shortSide <= 820) return 'mobile';
  return 'desktop';
};

const computeState = (): ViewportState => {
  const forced = readForced();
  const nativeMode = detectMode();
  const mode = forced ?? nativeMode;
  const design = CANVAS[mode];
  const isPreview = forced !== null && forced !== nativeMode;

  const fallback: ViewportState = {
    mode,
    nativeMode,
    zoom: 1,
    designWidth: design.width,
    designHeight: design.height,
    stageHeight: design.height,
    heroFill: 1,
    maxFill: design.maxFill,
    screenWidth: design.width,
    screenHeight: design.height,
    measured: false,
    forced,
    isPreview,
  };

  if (!isBrowser) return fallback;

  const root = document.documentElement;
  const screenWidth = root.clientWidth || window.innerWidth;
  const screenHeight = root.clientHeight || window.innerHeight;

  // Before the first layout `clientWidth` can still be 0. Applying a scale from
  // that would paint the whole page at 15% for a frame, so keep the neutral
  // state until there is something real to measure.
  if (!screenWidth || !screenHeight) return fallback;

  // Normally the canvas fills the window edge to edge — width decides the scale
  // and nothing else. In preview it is fitted instead, so the whole emulated
  // device — width AND height — is visible at once.
  const rawZoom = isPreview
    ? Math.min(screenWidth / design.width, screenHeight / design.height)
    : screenWidth / design.width;
  const zoom = Math.round(Math.max(MIN_ZOOM, rawZoom) * ZOOM_PRECISION) / ZOOM_PRECISION;

  // While emulating a device the "window" IS the canvas, so the stage gets the
  // canvas height exactly — otherwise a phone preview on a desktop would be
  // given the desktop window's height and stop looking like a phone.
  const stageHeight = isPreview
    ? design.height
    : Math.round((screenHeight / zoom) * 100) / 100;

  // Fill a taller-than-canvas window by scaling the composition up rather than
  // padding it with empty background — capped so the side content survives.
  const heroFill = Math.round(
    Math.min(design.maxFill, Math.max(1, stageHeight / design.height)) * 10000,
  ) / 10000;

  return {
    mode,
    nativeMode,
    zoom,
    designWidth: design.width,
    designHeight: design.height,
    stageHeight,
    heroFill,
    maxFill: design.maxFill,
    screenWidth,
    screenHeight,
    measured: true,
    forced,
    isPreview,
  };
};

let state: ViewportState = computeState();
const listeners = new Set<(next: ViewportState) => void>();

/**
 * On a real phone the canvas is scaled by the browser itself via the viewport
 * meta tag rather than CSS zoom. It is the most reliable path on mobile — iOS
 * Safari in particular has a long history of quirks with `position: fixed`
 * inside a zoomed subtree — and it leaves the CSS zoom at exactly 1.
 */
const applyViewportMeta = (next: ViewportState) => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) return;

  const content = next.mode === 'mobile' && !next.isPreview
    ? `width=${next.designWidth}, viewport-fit=cover`
    : 'width=device-width, initial-scale=1, viewport-fit=cover';

  if (meta.content !== content) meta.content = content;
};

const applyToDocument = (next: ViewportState) => {
  if (!isBrowser) return;
  const root = document.documentElement;

  applyViewportMeta(next);
  root.dataset.canvas = next.mode;
  if (next.isPreview) root.dataset.canvasPreview = 'true';
  else delete root.dataset.canvasPreview;

  root.style.setProperty('--zoom', String(next.zoom));
  root.style.setProperty('--design-w', `${next.designWidth}px`);
  root.style.setProperty('--design-h', `${next.designHeight}px`);

  /* ── The two canvas constants ──────────────────────────────────────────────
     Both are fixed lengths, NOT window measurements. A rule written with them
     renders the same picture at every window size and aspect ratio. */
  root.style.setProperty('--vw', `${next.designWidth / 100}px`);
  root.style.setProperty('--vh', `${next.designHeight / 100}px`);

  /* ── The one aspect-aware value ───────────────────────────────────────────
     How tall the real window is, in design pixels. Only for things that must
     physically fill the window (full-bleed backgrounds, sticky scroll stages).
     Never use it to position a design element. */
  root.style.setProperty('--screen-h', `${next.stageHeight}px`);

  /* Overscan a `.canvas-box` applies to fill a tall window. */
  root.style.setProperty('--hero-fill', String(next.heroFill));
};

const hasChanged = (a: ViewportState, b: ViewportState) =>
  a.mode !== b.mode ||
  a.zoom !== b.zoom ||
  a.screenWidth !== b.screenWidth ||
  a.screenHeight !== b.screenHeight ||
  a.measured !== b.measured ||
  a.forced !== b.forced ||
  a.isPreview !== b.isPreview;

/** True when the page has to be re-measured by scroll/animation engines. */
const needsRelayout = (a: ViewportState, b: ViewportState) =>
  a.mode !== b.mode || a.zoom !== b.zoom || a.stageHeight !== b.stageHeight ||
  a.heroFill !== b.heroFill || a.measured !== b.measured;

const relayoutListeners = new Set<() => void>();

const sync = () => {
  const next = computeState();
  if (!hasChanged(state, next)) return;
  const relayout = needsRelayout(state, next);
  state = next;
  applyToDocument(next);
  listeners.forEach(listener => listener(next));
  if (relayout) relayoutListeners.forEach(listener => listener());
};

export const getViewportState = (): ViewportState => state;

export const subscribeViewport = (listener: (next: ViewportState) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Fires when the stage was rescaled — i.e. every cached pixel measurement in
 * the page (ScrollTrigger start/end values above all) is now stale.
 */
export const subscribeStageRelayout = (listener: () => void) => {
  relayoutListeners.add(listener);
  return () => {
    relayoutListeners.delete(listener);
  };
};

/** Force a canvas (used by the visual editor's Desktop/Mobile preview switch). */
export const setForcedCanvas = (mode: CanvasMode | null) => {
  try {
    if (mode) localStorage.setItem(OVERRIDE_KEY, mode);
    else localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    /* private mode — the URL param still works */
  }
  sync();
};

/** Convert a rendered/client pixel value (e.g. clientX, getBoundingClientRect) to design pixels. */
export const toDesignPx = (renderedPx: number) => renderedPx / state.zoom;

/** Convert a design pixel value to rendered pixels. */
export const toRenderedPx = (designPx: number) => designPx * state.zoom;

/**
 * How many rendered pixels one design pixel occupies *for this element*.
 *
 * Inside a `.canvas-box` that is `zoom * heroFill`, everywhere else just
 * `zoom`. Measured from the box rather than multiplied out, so it stays right
 * whatever fill the box ended up with. Use it for anything that has to
 * turn a pointer position or a `getBoundingClientRect()` reading back into the
 * design pixels the layout is authored in.
 */
export const getRenderScale = (element: Element | null | undefined): number => {
  const box = element?.closest?.('.canvas-box');
  if (!box) return state.zoom;
  const width = box.getBoundingClientRect().width;
  return width > 0 ? width / state.designWidth : state.zoom * state.heroFill;
};

/** Origin of the `.canvas-box` an element sits in, in client pixels. */
export const getCanvasOrigin = (element: Element | null | undefined) => {
  const box = element?.closest?.('.canvas-box');
  if (!box) return { left: 0, top: 0 };
  const rect = box.getBoundingClientRect();
  return { left: rect.left, top: rect.top };
};

let started = false;

export const startViewportStage = () => {
  if (!isBrowser || started) return;
  started = true;

  applyToDocument(state);

  // Deliberately synchronous: requestAnimationFrame is starved while a tab is
  // hidden, which would leave a restored window drawing at the old scale.
  window.addEventListener('resize', sync, { passive: true });
  window.addEventListener('orientationchange', sync, { passive: true });
  window.visualViewport?.addEventListener('resize', sync, { passive: true });

  // A scrollbar appearing/disappearing changes the usable width without firing
  // `resize`, and the first measurement happens before layout — this catches
  // both, so the canvas always fills the window exactly.
  if ('ResizeObserver' in window) {
    new ResizeObserver(sync).observe(document.documentElement);
  }

  // ResizeObserver notifications are also withheld while a tab is hidden, so
  // re-measure once stylesheets have been applied.
  window.setTimeout(sync, 0);
  window.addEventListener('load', sync, { once: true });
  // A window that was minimised, snapped, or on a background tab resizes
  // without ever rendering — re-measure the moment it comes back into view.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) sync();
  });
  window.addEventListener('pageshow', sync);
  // Dragging a window onto a monitor with a different DPI rescales everything.
  window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    ?.addEventListener?.('change', sync);
};

// Apply immediately on import so the first paint already uses the right canvas.
startViewportStage();

if (isBrowser) {
  // Handy from the browser console when checking why something looks off:
  //   __viewportStage.state()   __viewportStage.force('mobile')
  (window as unknown as Record<string, unknown>).__viewportStage = {
    state: getViewportState,
    sync,
    force: setForcedCanvas,
  };
}
