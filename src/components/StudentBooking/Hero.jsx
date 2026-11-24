import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Shield } from 'lucide-react';

export default function Hero({ availableSlotsCount = 0 }) {
  return (
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 text-center max-w-4xl mx-auto px-4">
      {/* Brand Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold mb-6 shadow-inner">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>Official Admissions & Technical Interview Portal</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-tight mb-4">
        Book Your <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-200 bg-clip-text text-transparent">S/ASH Academy</span> Interview
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
        Reserve your interview slot with our academic evaluation committee. No student login required—select an available date, choose your time, and receive instant confirmation.
      </p>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#08102B]/80 border border-white/5 shadow-sm">
          <div className="p-2 rounded-lg bg-blue-600/10 text-cyan-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Flexible Format</div>
            <div className="text-xs font-semibold text-slate-200">1-on-1 & Cohort Slots</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#08102B]/80 border border-white/5 shadow-sm">
          <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Instant Booking</div>
            <div className="text-xs font-semibold text-slate-200">Official Reference ID</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#08102B]/80 border border-white/5 shadow-sm">
          <div className="p-2 rounded-lg bg-cyan-600/10 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Live Availability</div>
            <div className="text-xs font-semibold text-cyan-300">
              {availableSlotsCount} Open {availableSlotsCount === 1 ? 'Slot' : 'Slots'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
