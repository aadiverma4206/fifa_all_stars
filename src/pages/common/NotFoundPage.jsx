import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import FootballScene from '../../components/football3d/FootballScene';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto">
      
      <div className="relative w-full max-w-xs h-64">
        <FootballScene />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black uppercase">
          <AlertCircle className="w-4 h-4" />
          <span>404 PAGE NOT FOUND</span>
        </div>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          OUT OF BOUNDS!
        </h1>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          The page or route you are looking for has been kicked off the pitch or doesn't exist.
        </p>
      </div>

      <Link to="/">
        <Button variant="primary" size="md" icon={Home} className="px-8">
          Back to FIFA All Stars Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
