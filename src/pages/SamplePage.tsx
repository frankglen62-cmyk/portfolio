import React from 'react';

export const SamplePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold font-display uppercase tracking-widest text-white/50">
        Sample Page
      </h1>
      <p className="mt-4 text-white/30 font-body">This page is intentionally left blank.</p>
      
      <a href="/" className="mt-12 text-yellow font-ui text-sm uppercase tracking-wider hover:underline">
        ← Back to Portfolio
      </a>
    </div>
  );
};
