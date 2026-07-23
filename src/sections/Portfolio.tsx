import React from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { MasonryProjectGrid } from '../components/ui/masonry-project-grid';
import { VideoText } from '../components/ui/video-text';

type MaskSettings = { offsetX: number; offsetY: number; zoom: number };

const MASK_SETTINGS_KEY = 'portfolio-project-mask-transform-v3';
const DEFAULT_MASK_SETTINGS: MaskSettings = { offsetX: 0, offsetY: 0, zoom: 1 };

const loadMaskSettings = (): MaskSettings => {
  if (typeof window === 'undefined') return DEFAULT_MASK_SETTINGS;

  const savedSettings = window.localStorage.getItem(MASK_SETTINGS_KEY);
  if (!savedSettings) return DEFAULT_MASK_SETTINGS;

  try {
    const parsedSettings = JSON.parse(savedSettings) as Partial<MaskSettings>;
    return { ...DEFAULT_MASK_SETTINGS, ...parsedSettings };
  } catch {
    window.localStorage.removeItem(MASK_SETTINGS_KEY);
    return DEFAULT_MASK_SETTINGS;
  }
};

export const Portfolio: React.FC = () => {
  const [debugMode, setDebugMode] = React.useState(false);
  const [savedSettings, setSavedSettings] = React.useState<MaskSettings>(loadMaskSettings);
  const [draftSettings, setDraftSettings] = React.useState<MaskSettings>(savedSettings);
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'unsaved'>('saved');
  const videoSrc = `${import.meta.env.BASE_URL}projects/project-title-mask.mp4`;
  const visibleSettings = debugMode ? draftSettings : savedSettings;

  const updateMaskSetting = (key: keyof MaskSettings, value: number) => {
    setDraftSettings((current) => ({ ...current, [key]: value }));
    setSaveStatus('unsaved');
  };

  const moveMask = (xChange: number, yChange: number) => {
    setDraftSettings((current) => ({
      ...current,
      offsetX: Math.max(-100, Math.min(100, current.offsetX + xChange)),
      offsetY: Math.max(-100, Math.min(100, current.offsetY + yChange)),
    }));
    setSaveStatus('unsaved');
  };

  const toggleDebugMode = () => {
    if (debugMode) {
      setDraftSettings(savedSettings);
      setSaveStatus('saved');
    } else {
      setDraftSettings(savedSettings);
    }
    setDebugMode((current) => !current);
  };

  const saveMaskPosition = () => {
    setSavedSettings(draftSettings);
    window.localStorage.setItem(MASK_SETTINGS_KEY, JSON.stringify(draftSettings));
    setSaveStatus('saved');
  };

  return (
    <section id="portfolio" className="relative w-full overflow-hidden bg-black py-10 sm:py-14 md:py-16">
      <ScrollReveal blur={false} className="relative z-10 mx-auto mb-9 w-full max-w-6xl px-4 sm:mb-12 md:mb-16">
        <div className="relative h-[128px] w-full overflow-hidden sm:h-[150px] md:h-[250px]">
          <VideoText
            src={videoSrc}
            offsetX={visibleSettings.offsetX}
            offsetY={visibleSettings.offsetY}
            zoom={visibleSettings.zoom}
          >
            My Project
          </VideoText>
        </div>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={toggleDebugMode}
            aria-expanded={debugMode}
            className={`min-h-10 rounded-full border px-4 py-2 font-ui text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              debugMode
                ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                : 'border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30 hover:text-white'
            }`}
          >
            {debugMode ? 'Close position debug' : 'Debug video position'}
          </button>
        </div>

        {debugMode && (
          <div className="mx-auto mt-5 grid max-w-4xl gap-5 rounded-2xl border border-emerald-400/25 bg-[#0b0d0c] p-4 shadow-[0_0_40px_rgba(52,211,153,0.08)] sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Source video preview
                </p>
                <span className="font-mono text-[10px] text-white/45">Press Save to keep changes</span>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
                <video
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute h-full w-auto max-w-none object-contain"
                  style={{
                    left: `${50 + draftSettings.offsetX}%`,
                    top: `${50 + draftSettings.offsetY}%`,
                    transform: `translate3d(-50%, -50%, 0) scale(${draftSettings.zoom})`,
                    transformOrigin: 'center',
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-emerald-300/70" />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-emerald-300/70" />
                <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 font-ui text-[9px] uppercase tracking-[0.12em] text-white/70 backdrop-blur">
                  Live crop
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/45">
                The large “MY PROJECT” title above is the exact final mask output. Use this preview to locate the model,
                then check the letters while adjusting.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4">
              <div>
                <span className="mb-2 block font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">
                  Move video
                </span>
                <div className="grid w-fit grid-cols-3 gap-1.5">
                  <span />
                  <button
                    type="button"
                    onClick={() => moveMask(0, -3)}
                    aria-label="Move video up"
                    className="h-10 w-11 rounded-lg border border-white/15 bg-white/[0.05] text-white/70 transition hover:border-emerald-400/50 hover:text-emerald-300"
                  >
                    ↑
                  </button>
                  <span />
                  <button
                    type="button"
                    onClick={() => moveMask(-3, 0)}
                    aria-label="Move video left"
                    className="h-10 w-11 rounded-lg border border-white/15 bg-white/[0.05] text-white/70 transition hover:border-emerald-400/50 hover:text-emerald-300"
                  >
                    ←
                  </button>
                  <span className="flex h-10 w-11 items-center justify-center text-white/25">•</span>
                  <button
                    type="button"
                    onClick={() => moveMask(3, 0)}
                    aria-label="Move video right"
                    className="h-10 w-11 rounded-lg border border-white/15 bg-white/[0.05] text-white/70 transition hover:border-emerald-400/50 hover:text-emerald-300"
                  >
                    →
                  </button>
                  <span />
                  <button
                    type="button"
                    onClick={() => moveMask(0, 3)}
                    aria-label="Move video down"
                    className="h-10 w-11 rounded-lg border border-white/15 bg-white/[0.05] text-white/70 transition hover:border-emerald-400/50 hover:text-emerald-300"
                  >
                    ↓
                  </button>
                  <span />
                </div>
              </div>

              {[
                { key: 'offsetX' as const, label: 'Left / right', min: -100, max: 100, step: 1, suffix: '%' },
                { key: 'offsetY' as const, label: 'Up / down', min: -100, max: 100, step: 1, suffix: '%' },
                { key: 'zoom' as const, label: 'Zoom in / out', min: 0.25, max: 8, step: 0.05, suffix: '×' },
              ].map((control) => (
                <label key={control.key} className="block">
                  <span className="mb-2 flex items-center justify-between font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">
                    {control.label}
                    <output className="rounded bg-white/[0.07] px-2 py-1 font-mono text-emerald-300">
                      {draftSettings[control.key] > 0 && control.key !== 'zoom' ? '+' : ''}
                      {draftSettings[control.key].toFixed(control.key === 'zoom' ? 2 : 0)}
                      {control.suffix}
                    </output>
                  </span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={draftSettings[control.key]}
                    onChange={(event) => updateMaskSetting(control.key, Number(event.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </label>
              ))}

              <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div>
                  <code className="block text-[10px] text-white/65">
                    X {draftSettings.offsetX > 0 ? '+' : ''}{draftSettings.offsetX}% · Y {draftSettings.offsetY > 0 ? '+' : ''}{draftSettings.offsetY}% · Zoom {draftSettings.zoom.toFixed(2)}
                  </code>
                  <span className={`mt-1 block font-ui text-[9px] uppercase tracking-[0.12em] ${saveStatus === 'saved' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {saveStatus === 'saved' ? 'Position saved' : 'Unsaved changes'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftSettings(DEFAULT_MASK_SETTINGS);
                      setSaveStatus('unsaved');
                    }}
                    className="min-h-10 rounded-full border border-white/15 px-3 py-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-white/55 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={saveMaskPosition}
                    className="min-h-10 rounded-full border border-emerald-300/50 bg-emerald-400/15 px-3 py-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-200 transition-colors hover:bg-emerald-400/25"
                  >
                    Save position
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto mt-5 flex max-w-3xl flex-col items-center text-center sm:mt-7">
          <p className="font-body text-sm leading-relaxed text-white/58 sm:text-base">
            A growing collection of ecommerce UGC ads and short-form product creatives,
            built to capture attention and present products clearly.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {['5 video creatives', 'Mobile-first ads', 'UGC for ecommerce'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 font-ui text-[8px] font-semibold uppercase tracking-[0.16em] text-white/48"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <MasonryProjectGrid />
      </div>
    </section>
  );
};

