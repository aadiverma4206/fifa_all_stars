import React, { useState } from 'react';

export const SafeImage = ({ src, alt = 'Image', className = '', fallbackText = 'FIFA All Stars', ...props }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-900 text-slate-400 p-4 text-center select-none ${className}`}>
        <span className="text-3xl mb-1">⚽</span>
        <span className="text-xs font-bold text-slate-200 line-clamp-1">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
};

export default SafeImage;
