import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DateSelector({ dates = [], selectedDate, onSelectDate }) {
  if (dates.length === 0) return null;

  // Helper to format date details nicely
  const formatDateParts = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

      return { weekday, dayNum, monthName };
    } catch {
      return { weekday: 'Date', dayNum: '', monthName: dateStr };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
          <CalendarIcon className="w-4 h-4 text-cyan-400" />
          <span>Select an Interview Date</span>
        </div>
        <span className="text-xs text-slate-400">
          {dates.length} {dates.length === 1 ? 'Date' : 'Dates'} Available
        </span>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
        {/* 'All Dates' Button */}
        <button
          onClick={() => onSelectDate(null)}
          className={`flex-shrink-0 px-4 py-3 rounded-2xl text-xs font-semibold border transition-all text-center min-w-[90px] ${
            selectedDate === null
              ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/30'
              : 'bg-[#08102B] text-slate-300 border-white/10 hover:border-white/20 hover:bg-[#0E1A3C]'
          }`}
        >
          <div className="uppercase tracking-wider text-[10px] opacity-75">View</div>
          <div className="text-base font-bold my-0.5">All</div>
          <div className="text-[10px] opacity-75">Dates</div>
        </button>

        {/* Date Cards */}
        {dates.map(({ date, count }) => {
          const { weekday, dayNum, monthName } = formatDateParts(date);
          const isSelected = selectedDate === date;

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border transition-all text-center min-w-[95px] relative group ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-cyan-400 shadow-xl shadow-blue-600/30 ring-2 ring-cyan-400/40 transform -translate-y-0.5'
                  : 'bg-[#08102B]/90 text-slate-300 border-white/10 hover:border-cyan-500/40 hover:bg-[#0E1A3C] hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-cyan-300">
                {weekday}
              </div>
              <div className="text-xl font-extrabold my-0.5 font-display text-white">
                {dayNum}
              </div>
              <div className="text-xs font-medium text-slate-300">
                {monthName}
              </div>

              {/* Slot count pill */}
              <div className={`mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-blue-500/10 text-cyan-400 border border-blue-500/20'
              }`}>
                {count} {count === 1 ? 'slot' : 'slots'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
