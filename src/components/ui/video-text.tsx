import React from "react";

type VideoTextProps = {
  children: React.ReactNode;
  src: string;
  className?: string;
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
};

/**
 * How far the video is kept away from the `<foreignObject>` boundary, in design
 * pixels. See the comment on the mask below — nothing may touch that edge.
 * The clip is compensated on the video's own height, so the picture inside the
 * letters is drawn at exactly the same size as before.
 */
const EDGE_GUARD = 6;

export function VideoText({
  children,
  src,
  className = "",
  offsetX = 0,
  offsetY = 0,
  zoom = 1,
}: VideoTextProps) {
  const maskId = React.useId();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = () => {
      video.muted = true;
      video.play().catch(() => undefined);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) attemptPlay();
        else video.pause();
      },
      { rootMargin: "180px 0px", threshold: 0.05 },
    );

    const handleVisibility = () => {
      if (!document.hidden) attemptPlay();
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibility);
    video.addEventListener("canplay", attemptPlay);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      video.removeEventListener("canplay", attemptPlay);
    };
  }, []);

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-black pointer-events-none ${className}`}>
      <svg className="absolute inset-0 h-full w-full" aria-label={`${String(children)} animated video title`}>
        <defs>
          {/* userSpaceOnUse with a generous region: the default
              objectBoundingBox region stops 10% past each element's own box,
              which puts a mask edge in play for every masked child. */}
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="120%">
            <rect x="-20%" y="-20%" width="140%" height="140%" fill="black" />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              style={{
                fontSize: 'clamp(2.35rem, calc(9 * var(--vw)), 9rem)',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0',
                fontFamily: '"Archivo", "Arial Black", sans-serif'
              }}
            >
              {children}
            </text>
          </mask>
        </defs>
        {/* The fill the letters show before the video has loaded — and the
            colour the video's own letterboxing sits on. It used to be the
            BACKGROUND OF THE foreignObject, which is what put a bright line
            down the edge of this block: a `<foreignObject>` is rasterised as
            its own layer, and at fractional device-pixel bounds (which CSS
            `zoom` guarantees) its edge row can survive the mask. A plain SVG
            rect is painted into the same raster as the mask, so the mask cuts
            it exactly, every time. */}
        <rect width="100%" height="100%" fill="#e7ebe9" mask={`url(#${maskId})`} />

        <foreignObject width="100%" height="100%" mask={`url(#${maskId})`}>
          {/* Transparent, full-size, and holding nothing: the foreignObject's
              own edge now has no pixels to leak. */}
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
              style={{
                position: 'absolute',
                inset: `${EDGE_GUARD}px`,
                overflow: 'hidden',
                // Belt and braces: `overflow` alone is a compositor hint for a
                // hardware-decoded video, `clip-path` is a hard clip.
                clipPath: 'inset(0)',
              }}
            >
              <video
                ref={videoRef}
                loop
                muted
                playsInline
                /* `autoPlay` fetches the whole clip during the first paint no
                   matter what `preload` says, and this title sits far below the
                   fold. The observer above already starts playback when it comes
                   into view, and `play()` on a `preload="none"` element loads it
                   then — so the bytes are paid for only if the visitor scrolls
                   here. Until then the mask shows the solid #e7ebe9 rect behind
                   it, i.e. the title is readable the whole time. */
                preload="none"
                onCanPlay={() => setIsVideoReady(true)}
                onLoadedData={() => setIsVideoReady(true)}
                onPlaying={() => setIsVideoReady(true)}
                aria-hidden="true"
                className={`absolute w-auto max-w-none object-contain transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  left: `${50 + offsetX}%`,
                  top: `${50 + offsetY}%`,
                  // The guard is added back on, so the video is drawn at the
                  // full height of the block exactly as before — it is only
                  // clipped a few pixels short of the edge, where no letter
                  // reaches.
                  height: `calc(100% + ${EDGE_GUARD * 2}px)`,
                  transform: `translate3d(-50%, -50%, 0) scale(${zoom})`,
                  transformOrigin: 'center',
                }}
                src={src}
              />
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
