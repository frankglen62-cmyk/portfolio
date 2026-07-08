import React from "react";

export function VideoText({ children, src, className = "" }: { children: React.ReactNode; src: string; className?: string }) {
  const maskId = React.useId();

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
                letterSpacing: '-0.05em',
                fontFamily: 'inherit'
              }}
            >
              {children}
            </text>
          </mask>
        </defs>
        <foreignObject width="100%" height="100%" mask={`url(#${maskId})`}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src={src}
          />
        </foreignObject>
      </svg>
    </div>
  );
}
