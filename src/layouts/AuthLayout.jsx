import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Background Stadium Glow & Grid */}
      <div className="absolute inset-0 dark-pitch-gradient opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
