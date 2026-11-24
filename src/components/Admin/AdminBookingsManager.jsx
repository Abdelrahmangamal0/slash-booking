import React, { useState } from 'react';
import { Search, Calendar, Phone, User, Ban, CheckCircle2, Download, AlertCircle, X, Loader2 } from 'lucide-react';

export default function AdminBookingsManager({ bookings = [], slots = [], onCancelBooking, isRefreshing }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelingBooking, setCancelingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Extract unique dates from bookings for filter dropdown
  const uniqueDates = Array.from(new Set(bookings.map((b) => b.date))).filter(Boolean).sort();

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (dateFilter && b.date !== dateFilter) return false;
    if (slotFilter && b.slotId !== slotFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      return (
        b.bookingId.toLowerCase().includes(q) ||
        b.studentName.toLowerCase().includes(q) ||
        b.phoneNumber.includes(q)
      );
    }
    return true;
  });

  // Handle CSV Export
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) return;

    const headers = ['Booking ID', 'Student Name', 'Phone Number', 'Slot ID', 'Appointment Date', 'Start Time', 'Status', 'Created At'];
    const rows = filteredBookings.map((b) => [
      `"${b.bookingId}"`,
      `"${b.studentName}"`,
      `"${b.phoneNumber}"`,
      `"${b.slotId}"`,
      `"${b.date}"`,
      `"${b.startTime}"`,
      `"${b.status}"`,
      `"${b.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `slash_academy_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Cancel Booking Execution
  const handleConfirmCancel = async () => {
    if (!cancelingBooking) return;
    setCancelLoading(true);

    try {
      await onCancelBooking({ bookingId: cancelingBooking.bookingId });
      setCancelingBooking(null);
    } catch (err) {
      alert('Error cancelling booking: ' + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white font-display">
            Student Bookings Master Table
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor, filter, and manage confirmed interview bookings. Cancelling a booking immediately reopens the seat.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredBookings.length === 0}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export CSV ({filteredBookings.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#08102B] border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="">All Dates</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Slot Filter */}
        <div>
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="">All Slots</option>
            {slots.map((s) => (
              <option key={s.slotId} value={s.slotId}>
                {s.date} - {s.startTime} ({s.slotId})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="Confirmed">Confirmed Only</option>
            <option value="Cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-[#08102B] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050B1E] text-slate-400 uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Appointment Date & Time</th>
                <th className="py-3.5 px-4">Slot Ref</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No bookings found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isConfirmed = b.status === 'Confirmed';

                  return (
                    <tr key={b.bookingId} className="hover:bg-white/[0.02] transition-colors">
                      {/* Booking ID */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-cyan-300 text-xs">
                        {b.bookingId}
                      </td>

                      {/* Student Name */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">{b.studentName}</div>
                        {b.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{b.notes}</div>
                        )}
                      </td>

                      {/* Phone Number */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300">
                        {b.phoneNumber}
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{b.date}</div>
                        <div className="text-slate-400 text-[11px]">{b.startTime}</div>
                      </td>

                      {/* Slot ID */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {b.slotId}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          isConfirmed
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        {isConfirmed && (
                          <button
                            onClick={() => setCancelingBooking(b)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 font-semibold text-[11px] transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCEL BOOKING CONFIRMATION MODAL */}
      {cancelingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#08102B] border border-rose-500/30 shadow-2xl p-6 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-lg font-bold text-white font-display">Cancel Student Booking?</h4>
              <button onClick={() => setCancelingBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 mb-4 text-xs space-y-1">
              <div><span className="text-slate-400">Booking Ref:</span> <span className="font-mono text-cyan-300">{cancelingBooking.bookingId}</span></div>
              <div><span className="text-slate-400">Student:</span> <strong className="text-white">{cancelingBooking.studentName}</strong></div>
              <div><span className="text-slate-400">Phone:</span> <span className="text-slate-300">{cancelingBooking.phoneNumber}</span></div>
              <div><span className="text-slate-400">Appointment:</span> <strong className="text-white">{cancelingBooking.date} at {cancelingBooking.startTime}</strong></div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs mb-4">
              <strong>Notice:</strong> Cancelling this booking will mark its status as Cancelled and immediately restore 1 available seat in the associated slot.
            </div>

            <div className="flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setCancelingBooking(null)}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md shadow-rose-600/20"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
