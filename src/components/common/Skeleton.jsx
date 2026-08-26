import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl ${className}`}
    />
  );
};

export const GameCardSkeleton = () => {
  return (
    <div className="footy-card p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="w-16 h-6" />
        <Skeleton className="w-20 h-5" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-1/2 h-4" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-8" />
      </div>
    </div>
  );
};

export default Skeleton;
