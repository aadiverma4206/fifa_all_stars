import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-white pt-12 pb-8 transition-colors">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-semibold text-slate-400">
          <div className="space-y-3">
            <h4 className="text-white font-extrabold uppercase text-xs">New to FIFA All Stars?</h4>
            <ul className="space-y-2">
              <li><Link to="/community" className="hover:text-sport-500 transition-colors">What is FIFA All Stars</Link></li>
              <li><Link to="/games" className="hover:text-sport-500 transition-colors">What to expect</Link></li>
              <li><Link to="/community" className="hover:text-sport-500 transition-colors">Code of conduct</Link></li>
              <li><Link to="/community" className="hover:text-sport-500 transition-colors">Contact us</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-extrabold uppercase text-xs">About FIFA All Stars</h4>
            <ul className="space-y-2">
              <li><Link to="/community" className="hover:text-sport-500 transition-colors">Our story</Link></li>
              <li><Link to="/community" className="hover:text-sport-500 transition-colors">Impact</Link></li>
              <li><Link to="/games" className="hover:text-sport-500 transition-colors">Play football</Link></li>
              <li><Link to="/courts" className="hover:text-sport-500 transition-colors">Store</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-extrabold uppercase text-xs">Popular links</h4>
            <ul className="space-y-2">
              <li><Link to="/games" className="hover:text-sport-500 transition-colors">Game organizer</Link></li>
              <li><Link to="/courts" className="hover:text-sport-500 transition-colors">Game host</Link></li>
              <li><Link to="/community" className="hover:text-sport-500 transition-colors">Good causes</Link></li>
              <li><Link to="/tournaments" className="hover:text-sport-500 transition-colors">Partnerships</Link></li>
            </ul>
          </div>

          {/* Powered by Botivate Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-sport-500" />
              <span className="font-extrabold text-white uppercase tracking-wider">FIFA ALL STARS</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Premier Pickup Football & Arena Management Platform across India.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Powered by <strong className="text-sport-400">Botivate</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Ribbon */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-slate-500 gap-2">
          <span>2026 © FIFA All Stars, Ltd. All rights reserved • Powered by <strong className="text-slate-300">Botivate</strong></span>
          <div className="flex space-x-4">
            <span className="hover:underline cursor-pointer">Terms of use</span>
            <span className="hover:underline cursor-pointer">Privacy policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
