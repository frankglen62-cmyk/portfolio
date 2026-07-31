# Frank Glen Martin — portfolio

React 19 + Vite + Tailwind v4 + GSAP. `npm run dev` (port 5173, base `/portfolio/`),
`npm run build`, `npm run lint`.

## The one rule: identical POV on every device

The site is drawn on a **fixed design canvas** that is scaled to the window.
Whatever Frank sees while editing is what every visitor sees — a different
screen only changes the scale, never where anything sits.

| Canvas  | Size      | Used by                                 |
| ------- | --------- | --------------------------------------- |
| desktop | 1920 × 919 | every non-handheld device, at any window size |
| mobile  | 372 × 832  | phones and small tablets                 |

There are exactly **two compositions**. There are no width breakpoints, and
resizing or restoring down a window never switches between them — the canvas is
chosen from the *device*, not from the window (`detectMode` in
`src/lib/viewportStage.ts`).

### How the scaling works

```
zoom = windowWidth / designWidth      →  CSS `zoom` on .viewport-stage
```

Width alone decides the scale, so the canvas always fills the window edge to
edge and nothing is ever letterboxed. On phones the same thing is done by the
browser instead, via `<meta name="viewport" content="width=372">`.

Height is deliberately **not** part of the scale. A 16:9 window and a tall
restored-down window would otherwise show different compositions. Instead:

- `--vw` = `designWidth / 100` — **a constant**, not 1% of the window
- `--vh` = `designHeight / 100` — **a constant**, not 1% of the window
- `--screen-h` = the live window height in design px — the *only* aspect-aware
  value. It comes from `calc(100svh / var(--zoom))` in the stylesheet, **not**
  from a JS measurement: `svh` is the small viewport (phone address bar
  showing), so it updates by itself and nothing bottom-anchored can slide under
  the browser UI. `viewportStage.ts` overrides it only while emulating a device.

### Writing CSS / JSX that keeps the POV

**Do**

- Position and size things in plain `px`, `%`, `--vw`, `--vh`, `rem`. All of
  these are canvas-relative, so they render the same picture everywhere.
- Put anything absolutely positioned inside a `.canvas-box` (a fixed
  design-w × design-h frame, bottom-anchored in its parent). The hero uses
  `.hero-canvas.canvas-box`; percentages inside it resolve against the canvas,
  never against the window.
- Use `sm:` `md:` `lg:` `xl:` to mean "desktop canvas" and `max-sm:` … to mean
  "mobile canvas". They are rewired to `html[data-canvas="…"]` in
  `src/styles/index.css` — they no longer mean a window width.
- Read the current state through `useViewport()` / `useIsMobileCanvas()`.

**Don't**

- ❌ raw `vw` / `vh` / `svh` / `dvh` / `vmin` anywhere inside the stage. They
  are not zoom-aware *and* they follow the window's aspect ratio. (Values saved
  from the visual editor are rewritten automatically by
  `src/lib/canvasUnits.ts`; hand-written CSS is not.)
- ❌ `window.innerWidth` / `matchMedia('(max-width: …)')` to decide layout.
- ❌ `@media (min-width: …)` for composition. Media queries are fine only for
  `prefers-reduced-motion`, `hover`, `pointer`.
- ❌ `--screen-h` to place a design element. It is for full-bleed backgrounds
  and sticky scroll stages only — things that must physically fill the window.

### Filling a taller window

The desktop canvas is 2.09:1, wider than most windows. A proportionally taller
window would leave a band of empty background above the bottom-anchored
composition, so `.canvas-box` is scaled up (`--hero-fill`) until it covers that
height — the composition reads identically, just framed tighter, and the
overflow is cropped off the **left and right**.

The cap is `CANVAS[…].maxFill` in `viewportStage.ts` — **1.12** on desktop,
which crops at most ~103 design px per side. It is derived from how close the
hero's own blocks sit to the canvas edges (currently 154…1766), so **if you move
a block outward, re-check it**: the editor's Canvas overlay draws the crop lines
in green and the POV readout turns red naming the element's overhang. Mobile
uses `maxFill: 1` — phone margins are ~15px and a phone viewport is almost
always shorter than the 832 canvas anyway.

### The safe band — what "every device" actually means

A device shorter than the canvas simply cuts the top off, and how much it cuts
depends on the device. `CANVAS[…].safeHeight` is the band, measured **up from
the bottom**, that every device is guaranteed to show:

| Canvas  | Safe band | Range devices actually show |
| ------- | --------- | --------------------------- |
| mobile  | 632 of 832 | 632 (16:9 handset) … 744 (20:9); Frank's phone is 701 |
| desktop | 919 (all)  | the overscan covers the taller direction |

**Design inside the band and the composition is identical on every device.**
Above it, only tall devices see anything. The editor draws the boundary as a
green dashed line with a red tint above it (Canvas overlay), and the POV
readout turns red naming how far an element pokes out.

The mobile preview emulates a real handset — Short / Common / Tall in the panel,
defaulting to **Short**, because what fits there fits everything. It must never
be set to the canvas's own 372×832: no phone is that shape, and pretending
otherwise showed 131 design px of hero in the editor that Frank's phone cuts.
That single wrong assumption is why his phone and his edits disagreed.

`characterImage` is exempt from both checks (`BLEED_IDS`) — it is scaled far
past the frame on purpose.

### Consequences to expect

- A window taller than ~1.87:1 is filled completely.
- A squarer window than that still shows background above; it cannot be filled
  without cropping into the design. The POV readout says how much is left.
- A window **shorter** than the canvas aspect pushes the top of the canvas off
  screen — background only.
- None of these move an element relative to any other element. That is the
  guarantee.

### Animations and hidden tabs

`document.visibilityState === 'hidden'` pauses `requestAnimationFrame`, so
framer-motion's intro never advances and the hero sits at its `initial`
`opacity: 0` — a completely black hero. This is normal browser behaviour, not a
bug; it resolves the moment the tab is focused. Do not go looking for a
rendering fault when a screenshot of an unfocused tab comes out black — check
`visibilityState` first.

## Visual editor (`src/components/editor/`)

Open with the gear button; it lives **outside** the stage so it stays at true
screen size at any zoom.

- Saved `x` / `y` are **design pixels on the active canvas**, both axes. What
  you set is what everyone gets.
- Elements ending in `Mobile` belong to the mobile canvas; the panel filters
  the list to whichever canvas is active.
- **Edit canvas**: Auto / Desktop / Mobile. Forcing the canvas your device
  would not pick puts the page into an emulator frame at the right aspect
  (`isPreview`), so a phone layout can be edited from a desktop accurately.
  Also settable with `?canvas=mobile`.
- **Overlays**: canvas bounds (plus the band of window height the canvas does
  not define), the green crop lines, a 40-design-px grid, and centre lines.
- Arrow keys nudge the selection; Shift = ×5; the step is 1/5/10/25 design px.
- Save writes to `localStorage`, and to `src/config/layout.json` +
  `public/layout.json` through the dev-server plugin in `vite.config.ts`.

## Scroll animations

GSAP ScrollTrigger caches pixel measurements. `App.tsx` subscribes to
`subscribeStageRelayout()` and calls `ScrollTrigger.refresh()` (debounced)
whenever the stage rescales — without it, resizing the window leaves the About
panel and other scroll-driven elements stuck at stale progress.

## Debugging from the console

```js
__viewportStage.state()        // canvas, zoom, window, crop
__viewportStage.force('mobile')// same as the editor's canvas switch
ScrollTrigger.getAll()         // dev builds only
```
