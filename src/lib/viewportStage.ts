/* ============================================================
   Viewport Stage — one composition, every screen
   ------------------------------------------------------------
   The whole site is laid out on a FIXED design canvas:

     desktop  1920 x 919   (Frank's editing viewport)
     mobile    372 x 832

   The canvas is then scaled to the real viewport with CSS `zoom`,
   so every length inside the page ("design pixels") keeps the exact
   same proportion on a 4K monitor, a 1366 laptop, a restored-down
   browser window, or any phone.

   Because the canvas width never changes, layout can no longer jump
   at a breakpoint: there is only ONE desktop composition and ONE
   mobile composition. Tailwind's sm/md/lg variants and the raw CSS
   media queries are rewired to `html[data-canvas="…"]` instead of
   real viewport width (see styles/index.css).
   ============================================================ */

export type CanvasMode = 'desktop' | 'mobile';

export const CANVAS: Record<CanvasMode, { width: number; height: number }> = {
  desktop: { width: 1920, height: 919 },
  mobile: { width: 372, height: 832 },
};

/** Below this the page would be unreadable — let it overflow instead. */
const MIN_ZOOM = 0.15;

const OVERRIDE_KEY = 'frankportfolio-canvas-override';

export interface ViewportState {
  /** Which design canvas is active. */
  mode: CanvasMode;
  /** realViewportWidth / designWidth — how much CSS `zoom` is applied. */
  zoom: number;
  /** Canvas width in design pixels (1920 or 372). */
  designWidth: number;
  /** Canvas reference height in design pixels (919 or 832). */
  designHeight: number;
  /** Real viewport height expressed in DESIGN pixels. */
  stageHeight: number;
  /** Real viewport size in rendered CSS pixels. */
  screenWidth: number;
  screenHeight: number;
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
 * Canvas is picked from the DEVICE, never from the window size, so shrinking
 * or restoring a desktop window keeps the identical desktop composition.
 */
const detectMode = (forced: CanvasMode | null): CanvasMode => {
  if (forced) return forced;
  if (!isBrowser) return 'desktop';

  const screenWidth = window.screen?.width || window.innerWidth;
  const screenHeight = window.screen?.height || window.innerHeight;
  const shortSide = Math.min(screenWidth, screenHeight);
  const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;

  if (shortSide <= 540) return 'mobile';
  if (isTouchPrimary && shortSide <= 900) return 'mobile';
  return 'desktop';
};

const computeState = (): ViewportState => {
  const forced = readForced();
  const nativeMode = detectMode(null);
  const mode = forced ?? nativeMode;
  const design = CANVAS[mode];
  const isPreview = forced !== null && forced !== nativeMode;

  if (!isBrowser) {
    return {
      mode,
      zoom: 1,
      designWidth: design.width,
      designHeight: design.height,
      stageHeight: design.height,
      screenWidth: design.width,
      screenHeight: design.height,
      forced,
      isPreview,
    };
  }

  const root = document.documentElement;
  const screenWidth = root.clientWidth || window.innerWidth;
  const screenHeight = root.clientHeight || window.innerHeight;

  // Normally the canvas fills the window edge to edge. In preview it is fitted
  // so the whole emulated viewport — width AND height — is visible at once.
  const zoom = isPreview
    ? Math.max(MIN_ZOOM, Math.min(screenWidth / design.width, screenHeight / design.height))
    : Math.max(MIN_ZOOM, screenWidth / design.width);

  return {
    mode,
    zoom,
    designWidth: design.width,
    designHeight: design.height,
    stageHeight: screenHeight / zoom,
    screenWidth,
    screenHeight,
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
  /* 1vw of the DESIGN canvas — replaces raw `vw` inside the stage. */
  root.style.setProperty('--vw', `${next.designWidth / 100}px`);
};

const hasChanged = (a: ViewportState, b: ViewportState) =>
  a.mode !== b.mode ||
  a.zoom !== b.zoom ||
  a.screenWidth !== b.screenWidth ||
  a.screenHeight !== b.screenHeight ||
  a.forced !== b.forced ||
  a.isPreview !== b.isPreview;

const sync = () => {
  const next = computeState();
  if (!hasChanged(state, next)) return;
  state = next;
  applyToDocument(next);
  listeners.forEach(listener => listener(next));
};

export const getViewportState = (): ViewportState => state;

export const subscribeViewport = (listener: (next: ViewportState) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
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
  // both, so the canvas always fills the viewport exactly.
  if ('ResizeObserver' in window) {
    new ResizeObserver(sync).observe(document.documentElement);
  }

  // ResizeObserver notifications are also withheld while a tab is hidden, so
  // re-measure once stylesheets have been applied.
  window.setTimeout(sync, 0);
  window.addEventListener('load', sync, { once: true });
  // A window that was minimised or on a background tab resizes without ever
  // rendering — re-measure the moment it comes back into view.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) sync();
  });
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
