import React from 'react';
import { Calendar, Users, CheckCircle2, AlertCircle, Clock, TrendingUp, Plus, Database } from 'lucide-react';

export default function AdminOverview({ stats, onNavigateTab, onCreateSlotModal }) {
  const {
    totalSlots = 0,
    activeSlots = 0,
    confirmedBookings = 0,
    totalCapacity = 0,
    totalAvailableSeats = 0,
    fullyBookedSlots = 0,
    upcomingInterviews = 0,
    occupancyRate = 0
  } = stats || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Executive Admissions Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring of interview slots, seat capacity, and student bookings.
          </p>
        </div>

        <button
          onClick={onCreateSlotModal}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Appointment Slot</span>
        </button>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Slots */}
        <div className="p-5 rounded-2xl bg-[#08102B]/90 border border-white/10 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Slots</span>
            <div className="p-2 rounded-xl bg-blue-600/10 text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-display mb-1">
            {totalSlots}
          </div>
          <div className="text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{activeSlots} Active</span> ({totalSlots - activeSlots} inactive)
          </div>
        </div>

        {/* Card 2: Confirmed Bookings */}
        <div className="p-5 rounded-2xl bg-[#08102B]/90 border border-white/10 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Bookings</span>
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-display mb-1">
            {confirmedBookings}
          </div>
          <div className="text-xs text-slate-400">
            Total students reserved
          </div>
        </div>

        {/* Card 3: Available Seats */}
        <div className="p-5 rounded-2xl bg-[#08102B]/90 border border-white/10 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Seats</span>
            <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-display mb-1">
            {totalAvailableSeats}
          </div>
          <div className="text-xs text-slate-400">
            Out of {totalCapacity} total capacity
          </div>
        </div>

        {/* Card 4: Fully Booked Slots */}
        <div className="p-5 rounded-2xl bg-[#08102B]/90 border border-white/10 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fully Booked</span>
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-display mb-1">
            {fullyBookedSlots}
          </div>
          <div className="text-xs text-slate-400">
            Automatically hidden from public
          </div>
        </div>

        {/* Card 5: Upcoming Interviews */}
        <div className="p-5 rounded-2xl bg-[#08102B]/90 border border-white/10 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Interviews</span>
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-display mb-1">
            {upcomingInterviews}
          </div>
          <div className="text-xs text-slate-400">
            Scheduled for today or future
          </div>
        </div>
      </div>

      {/* Capacity & Occupancy Overview Card */}
      <div className="p-6 rounded-3xl bg-[#08102B] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Academy Seat Capacity Utilization</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current ratio of booked candidates relative to total configured slot capacity.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-2xl font-extrabold text-white font-display">
              {occupancyRate}%
            </span>
            <span className="text-xs font-medium text-slate-400">Occupied</span>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-4">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-300 transition-all duration-700"
            style={{ width: `${Math.min(100, occupancyRate)}%` }}
          />
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-white/5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400 text-[11px]">Total Capacity</div>
            <div className="text-base font-bold text-white mt-0.5">{totalCapacity} seats</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400 text-[11px]">Booked Seats</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{confirmedBookings} seats</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400 text-[11px]">Remaining Open</div>
            <div className="text-base font-bold text-cyan-300 mt-0.5">{totalAvailableSeats} seats</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400 text-[11px]">Active Slots</div>
            <div className="text-base font-bold text-white mt-0.5">{activeSlots} of {totalSlots}</div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('slots')}
          className="p-5 rounded-2xl bg-[#0E1A3C]/80 border border-blue-500/20 hover:border-cyan-400/50 text-left transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">Manage Slots & Capacity</span>
            <Calendar className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create custom appointment slots, edit slot capacities independently, and activate or deactivate schedules.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('bookings')}
          className="p-5 rounded-2xl bg-[#0E1A3C]/80 border border-blue-500/20 hover:border-cyan-400/50 text-left transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">Student Bookings Master</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Search candidates by phone or name, filter appointments by date, and cancel bookings to reopen seats.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('sheets')}
          className="p-5 rounded-2xl bg-[#0E1A3C]/80 border border-blue-500/20 hover:border-cyan-400/50 text-left transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">Google Sheets API Setup</span>
            <Database className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure your Apps Script Web App URL, test live connectivity, and inspect spreadsheet synchronization.
          </p>
        </button>
      </div>

    </div>
  );
}
