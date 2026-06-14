import React, { useState } from 'react';

interface CustomIconProps {
  src: string;
  alt: string;
  className?: string;
}

export const CustomIcon: React.FC<CustomIconProps> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-full text-center p-1 border border-dashed border-dark/20">
        <span className="text-[8px] leading-[1.2] font-ui text-dark/40 uppercase font-semibold">
          Insert Logo
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};
