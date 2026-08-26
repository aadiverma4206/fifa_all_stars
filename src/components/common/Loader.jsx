import React from 'react';

export const SkeletonCard = () => (
  <div className="footy-card p-6 space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="footy-card p-4 flex items-center justify-between animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
  </div>
);

export const Loader = ({ text = "Loading pitch data...", type = "spinner" }) => {
  if (type === "skeleton-grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (type === "skeleton-list") {
    return (
      <div className="space-y-3 w-full">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-sport-500/20 animate-ping" />
        <div className="w-14 h-14 rounded-full border-4 border-t-sport-500 border-r-sport-500 border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default Loader;
