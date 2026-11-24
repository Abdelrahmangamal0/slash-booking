import React, { useState } from 'react';
import { X, Search, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';

export default function BookingLookupModal({ isOpen, onClose }) {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await apiService.lookupBooking(identifier.trim());
      if (res.success) {
        if (res.bookings && res.bookings.length > 0) {
          setResults(res.bookings);
        } else {
          setError('No bookings found matching this reference ID or phone number.');
        }
      } else {
        setError(res.error || 'Lookup failed.');
      }
    } catch (err) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#08102B] border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Lookup Your Booking
              </h3>
              <p className="text-xs text-slate-400">Enter your Reference ID or Phone number</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. SASH-BK-261124-7102 or phone number"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm flex items-center space-x-2 transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <div className="space-y-3 pt-2 max-h-80 overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Matching Booking ({results.length})
              </div>

              {results.map((b) => (
                <div key={b.bookingId} className="p-4 rounded-2xl bg-[#0E1A3C] border border-blue-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-300 text-sm">{b.bookingId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Student:</span>
                      <strong className="text-white">{b.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone:</span>
                      <span>{b.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date:</span>
                      <strong className="text-white">{b.date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Time:</span>
                      <strong className="text-cyan-300">{b.startTime}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
