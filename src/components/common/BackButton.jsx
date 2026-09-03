import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { canNavigate } from '../../utils/navigationGuardian';

/**
 * Smart BackButton component that safely handles browser history and fallback URLs.
 * If user opened direct URL or refreshed (history state idx is 0), it navigates to the fallback path.
 */
export const BackButton = ({ to, fallback = '/player/home', label = 'Back', className = '' }) => {
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    if (!canNavigate(to || 'BACK_NAVIGATION')) return;

    if (to) {
      navigate(to);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-sport-500 transition-colors cursor-pointer ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
