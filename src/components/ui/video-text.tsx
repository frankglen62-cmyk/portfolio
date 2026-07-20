import React from "react";

export function VideoText({ children, src, className = "" }: { children: React.ReactNode; src: string; className?: string }) {
  const maskId = React.useId();
  const [isVideoReady, setIsVideoReady] = React.useState(false);

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full">
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
                fontSize: 'clamp(3rem, 8vw, 8rem)', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '0',
                fontFamily: 'inherit'
              }}
            >
              {children}
            </text>
          </mask>
        </defs>
        <foreignObject width="100%" height="100%" mask={`url(#${maskId})`}>
          <div className="h-full w-full bg-[#1596a8]">
            <video
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={() => setIsVideoReady(true)}
              className={`h-full w-full object-cover transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
              src={src}
            />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
