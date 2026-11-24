import React from 'react';
import { Clock, Users, ArrowRight, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function SlotCard({ slot, onSelect }) {
  const { slotId, date, startTime, endTime, capacity, bookedCount, availableSeats } = slot;

  // Format date nicely: "Wednesday, Nov 26"
  const formattedDate = React.useMemo(() => {
    try {
      const [year, month, day] = date.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  }, [date]);

  const isLastSeat = availableSeats === 1;

  return (
    <div className="relative group rounded-2xl p-5 bg-[#08102B]/90 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 flex flex-col justify-between">
      {/* Top Banner & Urgency Flag */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300">
          {formattedDate}
        </span>

        {isLastSeat ? (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Only 1 Seat Left!</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>{availableSeats} Seats Open</span>
          </span>
        )}
      </div>

      {/* Time Range */}
      <div className="my-2">
        <div className="flex items-center space-x-2 text-white">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">
            {startTime}
          </span>
          <span className="text-slate-400 text-sm font-medium">to</span>
          <span className="text-lg sm:text-xl font-bold text-slate-200">
            {endTime}
          </span>
        </div>
      </div>

      {/* Capacity & Format Details */}
      <div className="pt-3 pb-4 border-t border-white/5 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Format:</span>
          </span>
          <span className="font-semibold text-slate-200">
            {capacity === 1 ? '1-on-1 Interview' : `Cohort Slot (${capacity} max)`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Occupancy</span>
            <span className="font-mono">{bookedCount} / {capacity} Booked</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isLastSeat ? 'bg-amber-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.round((bookedCount / capacity) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(slot)}
        className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-cyan-600 transition-all flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-blue-600/30 active:scale-[0.98]"
      >
        <span>Reserve This Slot</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
