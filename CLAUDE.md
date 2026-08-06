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
  the browser UI. `viewportStage.ts` never sets it — the stylesheet owns it.

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

### Fitting a shorter viewport — how mobile stays identical

`--hero-fill` runs **both ways**, between `minFill` and `maxFill`:

- viewport taller than the canvas → scale **up** to cover, crop the sides
- viewport shorter than the canvas → scale **down** to fit, keep everything

A phone at 372 CSS px wide has 632…744 px of height against an 832 canvas —
0.76…0.89, all inside `minFill: 0.6`. So **every phone scales the whole
composition to fit and nothing is ever cut**. The box narrows toward its bottom
centre and the hero's full-bleed background covers the sliver at each side.

Measured across the three presets, every element keeps identical canvas
coordinates and `designHeight - stageHeight / heroFill` is 0 on all of them —
the entire canvas, on every handset, at three different scales.

That is why cropping the top was wrong: the portrait is 749 design px tall and
bottom-anchored, so on a 701 phone it filled the screen and hid the hero title
behind it (z-index 10 against the portrait's 20), while an 832 preview left
83 px of sky where the title showed.

`CANVAS[…].safeHeight` is what survives once both limits have done their work —
832 (everything) on mobile, 919 on desktop. If it is ever less than the canvas
height, the editor draws the boundary as a green dashed line with a red tint
above it and the POV readout names how far an element pokes out.

### Checking the mobile canvas

Use the **browser's own device emulation** — Chrome DevTools → device toolbar.
It rewrites `screen` and the pointer type, which is exactly what `detectMode`
reads, so the page picks the mobile canvas, sets `width=372`, and scales by the
same rules as a real handset. Nothing about the page knows it is being emulated.

There is **no canvas switch in the editor and no `?canvas=` parameter**. The
page once had its own emulator (Auto / Desktop / Mobile, plus Short / Common /
Tall phone heights) and it was removed: a built-in emulator can only guess at a
phone's height, and when the guess was wrong Frank's edits and Frank's phone
disagreed about what fits. The browser does not have to guess.

So a canvas is only ever entered the way a visitor enters it — including the
listeners this needs. Leaving emulation rewrites `screen` *after* the viewport
resizes, so the ResizeObserver can fire while `screen` still reports the old
device and latch the wrong canvas. `startViewportStage` therefore also listens
to `(max-device-width/height: 540px)` and `(pointer: coarse)` / `(hover: none)`
— the media-query mirror of everything `detectMode` reads.

`characterImage` is exempt from the crop checks (`BLEED_IDS`) — it is scaled far
past the frame on purpose.

### Does an edit actually persist?

`saveConfig` reports **where** it landed, because the two outcomes look the same
otherwise and only one is permanent:

- **Saved to file** (green) — the dev server wrote `src/config/layout.json` and
  `public/layout.json`. Survives a new browser, another device, a deploy.
- **Saved here only** (blue) — no dev server answered, so the layout reached
  this browser's `localStorage` and nowhere else. This is what happens when the
  editor is used against `vite preview` or a static host, e.g. from a phone.

Make edits permanent from `npm run dev`.

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

## Hero editor (`src/components/editor/`)

Open with the gear button, on either canvas. Everything the editor draws lives
**outside** the stage, in real screen pixels, so the panel stays readable and a
resize handle stays 12 physical pixels no matter how far the page is zoomed. It
is its own bundle chunk (~30 kB), fetched once the browser goes idle, so a
visitor never downloads Frank's authoring tool on the critical path — the gear
appears a beat after the page, which is the point.

| File                 | Job                                                     |
| -------------------- | ------------------------------------------------------- |
| `measure.ts`         | rendered rect → design pixels on the active canvas       |
| `EditableElement.tsx`| applies the saved transform, registers itself. No UI.    |
| `EditorRoot.tsx`     | hit-testing, drag, resize, snapping, all overlays        |
| `EditorPanel.tsx`    | the panel, the gear, the debugging readout               |
| `stage.ts`           | the live editing state the overlay and panel share       |

### Everything shown is measured, never assumed

The panel shows **absolute canvas coordinates read off the live DOM**:

```
canvasX = (element.getBoundingClientRect().left - canvasBox.left) / scale
```

`scale` is measured from `.canvas-box` itself, so it already includes the page
zoom *and* `--hero-fill`. Click the FRANK title and the panel says `x 387` when
the title is 387 design pixels from the canvas's left edge — on every device.

The saved `x` / `y` in `layout.json` are still **offsets** from wherever CSS put
an element (that is what keeps the hero's own rules working), and they are never
displayed. Typing `200` into X sets `offset += 200 - measured`, so the element
lands exactly on 200. The old panel showed the raw offset instead, which is why
a title sitting dead centre could read `x: 649, y: -447` and mean nothing.

Because of this, edit mode changes **nothing** about the composition — no raised
z-index, no outlines injected into elements. What is measured is what ships.

- **Selecting**: a transparent capture layer takes every press and hit-tests the
  registry, picking the **smallest** box under the pointer — so a title behind
  the portrait is selected by clicking straight at it. Elements are also listed
  in the panel by name.
- **Moving**: drag the element, the arrow-pad, arrow keys (Shift = ×5, step
  1/5/10/25 design px), or type X/Y. Snapping to canvas edges/centre and to
  other elements is on by default; hold **Alt** to override.
- **Resizing**: the four corner handles change `scale` uniformly, anchored on
  the opposite corner. The anchor is held by *measuring* the corner every frame
  and correcting, not by predicting it — which is why it also works for the
  portrait, whose `transform-origin` is `bottom`.
- **Arranging**: In front / Behind portrait, or a raw z. The About title says so
  instead: its stacking belongs to its panel.
- The About panel is `visibility: hidden` until the scroll timeline reveals it,
  so selecting the About title **makes it visible** — otherwise it could never
  be edited.
- The panel has **no canvas switch**. It edits whichever canvas the device is
  on, so to edit the mobile layout put the browser into device emulation — see
  *Checking the mobile canvas* above. It is draggable and collapsible on both,
  and fades to 30% while you drag so it never hides what you are moving.
- `Ctrl/Cmd+S` saves. `Esc` deselects, then closes.

### Debugging mode

A switch inside the panel, not a separate tool. It adds:

- **Overlays** — Canvas (bounds, the green crop lines, the safe band, and the
  band of window height the canvas does not define), a 40-design-px Grid, Centre
  lines, and Boxes (every editable element outlined and named).
- **Readout** — canvas, window, scale, canvas fit, window height in design px,
  safe band, live pointer position in canvas coordinates, and the selected box's
  x/y/w/h, right/bottom, and on-screen position.
- **A verdict** — green when every device sees this exact composition, red with
  the number of pixels when something reaches past a crop line or above the safe
  band. The bounds it checks come from the same measurements, taken 5×/s.

### Saving

- Save writes to `localStorage`, and to `src/config/layout.json` +
  `public/layout.json` through the dev-server plugin in `vite.config.ts`.
- **Load** goes the other way and never touches the network in a deployed build:
  `src/config/layout.json` is imported into the bundle as `SAVED_LAYOUT`, so the
  hero renders at its final coordinates on the first frame. Only `npm run dev`
  re-reads the file, through `/api/layout-config`, and only after the paint.
- **Which copy wins depends on which one can be newer.** In a deployed build
  `localStorage` outranks the file — nothing there can write the file, so an edit
  made on that device is the freshest thing available (the blue *Saved here
  only*). Under `npm run dev` it is the other way round: a save writes the file,
  so the file is by definition the newer copy and `localStorage` is ignored
  entirely. Without that, a hand-edit to `layout.json` was invisible on the one
  machine that can actually save — reloaded and reloaded and never applied,
  because a months-old browser copy kept overriding it.

## Scroll animations

GSAP ScrollTrigger caches pixel measurements. `App.tsx` subscribes to
`subscribeStageRelayout()` and calls `ScrollTrigger.refresh()` (debounced)
whenever the stage rescales — without it, resizing the window leaves the About
panel and other scroll-driven elements stuck at stale progress.

## What a phone can afford to animate

Desktop and mobile run the same components, but a phone does not have the fill
rate to keep up with effects that look free on a laptop. Three of them were
making the two card sections stutter, and each is worth recognising before it is
reintroduced. Split on `useIsMobileCanvas()` / `[data-canvas="mobile"]` — never
on window width.

- **A blur whose radius changes with scroll is the most expensive thing here.**
  A Gaussian blur is re-rendered whenever its radius changes, so
  `filter: blur()` driven by scroll progress means a full-card blur *per
  background card, per frame*. Services now applies it on desktop only.
- **`backdrop-filter` is charged per element, per frame, even when it is
  invisible.** The Tools chips had one each — eight on screen at rest, fifteen
  more inside an open card — all recomputed while a card resized. Off on mobile.
- **Animating layout (`width` / `flex-basis`) is a per-frame layout + paint.**
  The Tools accordion has to, so mobile shortens it to `MOBILE_OPEN_MS` and
  transitions *only* those two properties. Anything transitioning alongside it
  is one more property checked every frame of an already expensive animation.

Two related traps in the same sections:

- **A spring on scroll progress is latency.** A wheel arrives in jumps and wants
  smoothing; a thumb does not. Mobile reads `scrollYProgress` directly, or the
  cards visibly trail the finger — which reads as lag, not smoothness.
- **Never scroll to a position measured mid-animation.** The Tools gallery used
  to wait 120ms and then read `card.offsetLeft` while the widths were still
  moving, so it chased a stale target. Every collapsed card is
  `MOBILE_CARD_WIDTH` wide, so the destination is `index * (width + gap)` —
  known before the animation starts, and issued in the same tick.

## The video-in-text title (`src/components/ui/video-text.tsx`)

"MY PROJECT" is a video showing through SVG-masked text. Two rules keep its
edges clean, and both were learned from a bright line running down the side of
the block:

- **Nothing may be painted at the `<foreignObject>` boundary.** A foreignObject
  is rasterised as its own layer, and the stage's CSS `zoom` puts that layer's
  bounds on fractional device pixels — so its outermost row can survive the mask
  and draw a 1px line, on whichever edge happens to land on a half pixel. The
  fallback fill is therefore a plain SVG `<rect>` (masked in the same raster, cut
  exactly), the foreignObject and its wrapper are transparent, and the video is
  clipped `EDGE_GUARD` px inside it. The guard is added back onto the video's
  height, so the picture inside the letters is unchanged.
- **The mask is `maskUnits="userSpaceOnUse"` with a region 10% past the
  viewport.** The default `objectBoundingBox` region ends just past each masked
  element's own box, which is one more edge to get wrong.

## Load performance

The first visit used to take three serial blocking chains before a single pixel
appeared. Each one is now closed, and each can be reopened by an innocent-looking
edit, so:

- **Webfonts belong in `index.html`, never in `@import`.** A CSS `@import` is
  discovered only after the 87 kB stylesheet has downloaded, and it blocks
  rendering too: HTML → stylesheet → Google's stylesheet → font files → paint.
  In the HTML they are found in the first scan. Load only the families a stack
  names *first* — Archivo and Inter are fallbacks and must not be downloaded —
  and ask for weight *ranges* (`wght@400..700`) so Google sends one variable file
  instead of one file per weight.
- **Never fetch anything the layout needs.** See *Visual editor* above.
- **The bundle is split** in `vite.config.ts`: react / gsap / motion / vendor,
  so a change to Frank's own code doesn't re-download 594 kB of libraries. The
  `chunkSizeWarningLimit` is 300 kB — a warning means something heavy has crept
  into the entry chunk.
- **Below the fold means `loading="lazy" decoding="async"`.** Only the hero
  portrait is `eager` + `fetchPriority="high"`, and it is preloaded from the HTML.
- **Run `npm run optimize:images` after adding any image.** It re-encodes
  `public/` to the size things are actually drawn at — tool icons render in an
  18–24 design-px box, and shipping the 1024 px original costs ~40× the bytes.
  It is re-runnable and never enlarges or renames a file.

## Debugging from the console

```js
__viewportStage.state()  // canvas, zoom, window, crop
__viewportStage.sync()   // re-measure now (the listeners normally do this)
ScrollTrigger.getAll()   // dev builds only
```
