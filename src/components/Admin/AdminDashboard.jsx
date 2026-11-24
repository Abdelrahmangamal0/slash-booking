import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, Database, LogOut, RefreshCw, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminSlotManager from './AdminSlotManager';
import AdminBookingsManager from './AdminBookingsManager';
import AdminGoogleSheetsGuide from './AdminGoogleSheetsGuide';
import { apiService } from '../../services/api';

export default function AdminDashboard({ onLogout, onBackToSite }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch all admin data
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, slotsRes, bookingsRes] = await Promise.all([
        apiService.getAdminOverview(),
        apiService.getAdminSlots(),
        apiService.getAdminBookings()
      ]);

      if (overviewRes.success) setStats(overviewRes.stats);
      if (slotsRes.success) setSlots(slotsRes.slots || []);
      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
    } catch (err) {
      console.error('Admin Data Fetch Error:', err);
      setStatusMessage('Error synchronizing admin data: ' + err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Slot handlers
  const handleCreateSlot = async (slotData) => {
    const res = await apiService.createSlot(slotData);
    if (res.success) {
      await fetchData();
    }
    return res;
  };

  const handleUpdateCapacity = async ({ slotId, newCapacity }) => {
    const res = await apiService.updateSlotCapacity({ slotId, newCapacity });
    if (res.success) {
      await fetchData();
    }
    return res;
  };

  const handleToggleStatus = async ({ slotId, status }) => {
    const res = await apiService.toggleSlotStatus({ slotId, status });
    if (res.success) {
      await fetchData();
    }
    return res;
  };

  const handleDeleteSlot = async ({ slotId, forceDelete }) => {
    const res = await apiService.deleteSlot({ slotId, forceDelete });
    if (res.success) {
      await fetchData();
    }
    return res;
  };

  // Booking handlers
  const handleCancelBooking = async ({ bookingId }) => {
    const res = await apiService.cancelBooking({ bookingId });
    if (res.success) {
      await fetchData();
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050B1E]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Identity */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToSite}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Return to Student Booking Website"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-500/30">
                <img src="/assets/slash-logo.jpg" alt="S/ASH Academy Logo" className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-display font-bold text-lg text-white">S/ASH ACADEMY</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    ADMIN CONSOLE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Appointment Management & Real-Time Sync</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition-all disabled:opacity-50"
                title="Synchronize Data from Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Data</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto pb-3 text-xs font-semibold scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Executive Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('slots')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'slots'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointment Slots ({slots.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Bookings ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'sheets'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Google Sheets & API Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading Admissions Data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverview
                stats={stats}
                onNavigateTab={setActiveTab}
                onCreateSlotModal={() => setActiveTab('slots')}
              />
            )}

            {activeTab === 'slots' && (
              <AdminSlotManager
                slots={slots}
                onCreateSlot={handleCreateSlot}
                onUpdateCapacity={handleUpdateCapacity}
                onToggleStatus={handleToggleStatus}
                onDeleteSlot={handleDeleteSlot}
                isRefreshing={isRefreshing}
              />
            )}

            {activeTab === 'bookings' && (
              <AdminBookingsManager
                bookings={bookings}
                slots={slots}
                onCancelBooking={handleCancelBooking}
                isRefreshing={isRefreshing}
              />
            )}

            {activeTab === 'sheets' && (
              <AdminGoogleSheetsGuide
                onConnectionChange={fetchData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
