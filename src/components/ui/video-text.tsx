import React from 'react';

export function VideoText({ children, src, className = "" }: { children: React.ReactNode; src: string; className?: string }) {
  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-black ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-[2px] bottom-[2px] left-[2px] right-[2px] h-[calc(100%-4px)] w-[calc(100%-4px)] object-cover"
        src={src}
      />
      <div className="absolute -inset-1 flex items-center justify-center bg-black text-white mix-blend-multiply">
        <h1 className="text-[clamp(3.5rem,10vw,10rem)] font-black uppercase tracking-tighter text-white leading-none text-center">
          {children}
        </h1>
      </div>
    </div>
  );
}
