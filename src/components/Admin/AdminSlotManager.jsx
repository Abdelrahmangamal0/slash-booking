import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, AlertTriangle, Check, X, Users, Clock, Calendar, Search, Loader2 } from 'lucide-react';

export default function AdminSlotManager({
  slots = [],
  onCreateSlot,
  onUpdateCapacity,
  onToggleStatus,
  onDeleteSlot,
  isRefreshing
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editCapacitySlot, setEditCapacitySlot] = useState(null);
  const [newCapacityValue, setNewCapacityValue] = useState(1);
  const [deleteTargetSlot, setDeleteTargetSlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Slot Form State
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('10:00 AM');
  const [newEndTime, setNewEndTime] = useState('11:00 AM');
  const [newCapacity, setNewCapacity] = useState(3);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Capacity Edit State
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [capacityWarning, setCapacityWarning] = useState('');

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    if (statusFilter !== 'ALL' && slot.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        slot.slotId.toLowerCase().includes(q) ||
        slot.date.toLowerCase().includes(q) ||
        slot.startTime.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Create Slot Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      const res = await onCreateSlot({
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        capacity: parseInt(newCapacity, 10)
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        setNewDate('');
        setNewCapacity(3);
      } else {
        setCreateError(res.error || 'Failed to create slot');
      }
    } catch (err) {
      setCreateError(err.message || 'Error creating slot');
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Capacity Modal
  const openCapacityModal = (slot) => {
    setEditCapacitySlot(slot);
    setNewCapacityValue(slot.capacity);
    setCapacityWarning('');
  };

  // Handle Capacity Update
  const handleCapacitySubmit = async (e) => {
    e.preventDefault();
    if (!editCapacitySlot) return;

    setCapacityLoading(true);
    setCapacityWarning('');

    const parsedCap = parseInt(newCapacityValue, 10);

    try {
      const res = await onUpdateCapacity({
        slotId: editCapacitySlot.slotId,
        newCapacity: parsedCap
      });

      if (res.success) {
        if (res.warning) {
          alert(res.warning);
        }
        setEditCapacitySlot(null);
      } else {
        setCapacityWarning(res.error || 'Failed to update capacity');
      }
    } catch (err) {
      setCapacityWarning(err.message || 'Error updating capacity');
    } finally {
      setCapacityLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white font-display">
            Appointment Slot Management
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Create interview slots and independently regulate student capacity for each slot.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slot</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#08102B] border border-white/10">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by date or time..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Slots ({slots.length})</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Slots Table / Cards */}
      <div className="rounded-2xl bg-[#08102B] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050B1E] text-slate-400 uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Slot ID</th>
                <th className="py-3.5 px-4">Capacity & Bookings</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No appointment slots found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => {
                  const availableSeats = Math.max(0, slot.capacity - slot.bookedCount);
                  const isFull = availableSeats <= 0;
                  const isActive = slot.status === 'Active';

                  return (
                    <tr key={slot.slotId} className="hover:bg-white/[0.02] transition-colors">
                      {/* Date & Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">{slot.date}</div>
                        <div className="text-slate-400 flex items-center space-x-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>
                      </td>

                      {/* Slot ID */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {slot.slotId}
                      </td>

                      {/* Capacity & Bookings */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-white">
                              {slot.bookedCount} / {slot.capacity} Booked
                            </div>
                            <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                              <div
                                className={`h-full ${isFull ? 'bg-amber-400' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (slot.bookedCount / slot.capacity) * 100)}%` }}
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => openCapacityModal(slot)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 text-[11px] font-semibold transition-colors"
                            title="Edit Slot Capacity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isFull ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                            Fully Booked
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                            {availableSeats} seats open
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus({ slotId: slot.slotId, status: isActive ? 'Inactive' : 'Active' })}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-bold text-[11px] transition-colors ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{slot.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => openCapacityModal(slot)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-cyan-300 border border-blue-500/20 transition-colors"
                          title="Change Capacity"
                        >
                          Capacity ({slot.capacity})
                        </button>

                        <button
                          onClick={() => setDeleteTargetSlot(slot)}
                          className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE SLOT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#08102B] border border-white/10 shadow-2xl p-6 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h4 className="text-lg font-bold text-white font-display">Create Appointment Slot</h4>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Dynamic Capacity Field */}
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Maximum Slot Capacity (Students) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Each appointment has independent capacity. (e.g. 1 for 1-on-1, 3 for small group, 5 for cohort).
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition-all shadow-md shadow-blue-600/20"
                >
                  {createLoading ? 'Creating...' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CAPACITY MODAL */}
      {editCapacitySlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#08102B] border border-blue-500/30 shadow-2xl p-6 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-lg font-bold text-white font-display">Update Slot Capacity</h4>
              <button onClick={() => setEditCapacitySlot(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 mb-4 text-xs space-y-1">
              <div><span className="text-slate-400">Slot ID:</span> <span className="font-mono text-cyan-300">{editCapacitySlot.slotId}</span></div>
              <div><span className="text-slate-400">Date & Time:</span> <strong className="text-white">{editCapacitySlot.date} ({editCapacitySlot.startTime})</strong></div>
              <div><span className="text-slate-400">Current Confirmed Bookings:</span> <strong className="text-emerald-400">{editCapacitySlot.bookedCount} students</strong></div>
            </div>

            {parseInt(newCapacityValue, 10) < editCapacitySlot.bookedCount && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Capacity Warning:</strong> The new capacity ({newCapacityValue}) is lower than the current booking count ({editCapacitySlot.bookedCount}). Existing bookings will be preserved, but further bookings will be immediately blocked.
                </span>
              </div>
            )}

            <form onSubmit={handleCapacitySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  New Capacity (Number of Seats)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newCapacityValue}
                  onChange={(e) => setNewCapacityValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-bold text-base focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditCapacitySlot(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={capacityLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition-all shadow-md shadow-blue-600/20"
                >
                  {capacityLoading ? 'Updating...' : 'Save Capacity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#08102B] border border-rose-500/30 shadow-2xl p-6 overflow-hidden animate-slide-up">
            <h4 className="text-lg font-bold text-white font-display mb-2">Delete Appointment Slot?</h4>
            
            {deleteTargetSlot.bookedCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4">
                <strong>Cannot Delete:</strong> This slot has {deleteTargetSlot.bookedCount} active student booking(s). You must cancel the bookings first, or toggle this slot to <strong>Inactive</strong> instead.
              </div>
            ) : (
              <p className="text-xs text-slate-300 mb-4">
                Are you sure you want to delete slot <strong className="font-mono text-cyan-300">{deleteTargetSlot.slotId}</strong>? This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteTargetSlot(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
              {deleteTargetSlot.bookedCount === 0 && (
                <button
                  onClick={async () => {
                    await onDeleteSlot({ slotId: deleteTargetSlot.slotId });
                    setDeleteTargetSlot(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
