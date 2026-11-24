import React, { useState } from 'react';
import { Calendar, Search, Menu, X } from 'lucide-react';
import { apiService } from '../services/api';

export default function Navbar({ onOpenLookup, onHome, currentView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLive = apiService.isLiveMode();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050B1E]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={onHome}
            className="flex items-center space-x-4 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-blue-500/30 group-hover:border-cyan-400 transition-colors shadow-lg shadow-blue-500/10">
                <img 
                  src="/assets/slash-logo.jpg" 
                  alt="S/ASH Academy Logo" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#050B1E]" title="Admissions Platform Active" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-xl tracking-wider text-white group-hover:text-cyan-400 transition-colors">
                  S/ASH
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  ACADEMY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Admissions & Interview Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Student Facing Only) */}
          <nav className="hidden md:flex items-center space-x-3">
            <button
              onClick={onHome}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'booking'
                  ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Book Interview</span>
            </button>

            <button
              onClick={onOpenLookup}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Lookup Booking</span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-2" />

            {/* Platform Operational Status Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-white/10 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span>{isLive ? 'Official Portal Live' : 'Admissions Active'}</span>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown (Student Facing Only) */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-2 animate-fade-in">
            <button
              onClick={() => { onHome(); setMobileMenuOpen(false); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-slate-200 hover:bg-white/5"
            >
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Book Interview</span>
            </button>

            <button
              onClick={() => { onOpenLookup(); setMobileMenuOpen(false); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-slate-200 hover:bg-white/5"
            >
              <Search className="w-5 h-5 text-slate-400" />
              <span>Lookup Booking</span>
            </button>

            <div className="px-4 py-2 text-xs text-slate-400 flex items-center space-x-2 border-t border-white/5 mt-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span>Admissions System Operational</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
