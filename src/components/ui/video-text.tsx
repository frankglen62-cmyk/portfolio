import React from "react";

type VideoTextProps = {
  children: React.ReactNode;
  src: string;
  className?: string;
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
};

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
          <mask id={maskId}>
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
        <foreignObject width="100%" height="100%" mask={`url(#${maskId})`}>
          <div className="relative h-full w-full overflow-hidden bg-[#e7ebe9]">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={() => setIsVideoReady(true)}
              onLoadedData={() => setIsVideoReady(true)}
              onPlaying={() => setIsVideoReady(true)}
              aria-hidden="true"
              className={`absolute h-full w-auto max-w-none object-contain transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
              style={{
                left: `${50 + offsetX}%`,
                top: `${50 + offsetY}%`,
                transform: `translate3d(-50%, -50%, 0) scale(${zoom})`,
                transformOrigin: 'center',
              }}
              src={src}
            />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
