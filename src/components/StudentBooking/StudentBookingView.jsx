import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import DateSelector from './DateSelector';
import SlotCard from './SlotCard';
import BookingModal from './BookingModal';
import BookingSuccess from './BookingSuccess';
import { Calendar, RefreshCw, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

export default function StudentBookingView() {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available slots from backend
  const fetchAvailableSlots = async () => {
    setIsRefreshing(true);
    try {
      const res = await apiService.getAvailableSlots();
      if (res.success) {
        setSlots(res.slots || []);
        setErrorMessage('');
      } else {
        const rawErr = res.error || '';
        const displayErr = (rawErr.includes('Admin settings') || rawErr.includes('not configured'))
          ? 'Unable to connect to the admissions scheduling service. Please retry in a moment.'
          : rawErr;
        setErrorMessage(displayErr || 'Unable to load available slots.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  // Compute available dates with slot counts
  const availableDates = React.useMemo(() => {
    const dateCounts = {};
    slots.forEach((s) => {
      dateCounts[s.date] = (dateCounts[s.date] || 0) + 1;
    });

    return Object.keys(dateCounts)
      .sort()
      .map((date) => ({
        date,
        count: dateCounts[date]
      }));
  }, [slots]);

  // Filter slots by selected date
  const displayedSlots = React.useMemo(() => {
    if (!selectedDate) return slots;
    return slots.filter((s) => s.date === selectedDate);
  }, [slots, selectedDate]);

  // Handle booking submission
  const handleBookingSubmit = async (bookingData) => {
    const res = await apiService.createBooking(bookingData);
    if (res.success) {
      setConfirmedBooking(res.booking);
      setSelectedSlotForBooking(null);
      // Re-fetch slots so seat availability immediately reflects changes
      fetchAvailableSlots();
    }
    return res;
  };

  // If student just confirmed a booking, display confirmation receipt
  if (confirmedBooking) {
    return (
      <BookingSuccess
        booking={confirmedBooking}
        onBackHome={() => {
          setConfirmedBooking(null);
          setSelectedDate(null);
          fetchAvailableSlots();
        }}
      />
    );
  }

  return (
    <div className="pb-20">
      {/* Academy Hero Section */}
      <Hero availableSlotsCount={slots.length} />

      {/* Date Selector Ribbon */}
      <DateSelector
        dates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Main Slots Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-display">
              {selectedDate ? `Available Slots for ${selectedDate}` : 'All Upcoming Available Interview Slots'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20 font-mono font-bold">
              {displayedSlots.length}
            </span>
          </div>

          <button
            onClick={fetchAvailableSlots}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            title="Refresh availability"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Checking live seat availability...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-rose-200 text-sm font-semibold mb-3">{errorMessage}</p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={fetchAvailableSlots}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                Retry Connecting
              </button>
            </div>
          </div>
        ) : displayedSlots.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-3xl bg-[#08102B]/60 border border-white/5 text-center max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              No Appointments Currently Available
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              All interview slots for this timeframe are currently booked or have concluded. Please check back soon or select another date.
            </p>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
              >
                View All Upcoming Dates
              </button>
            )}
          </div>
        ) : (
          /* Slots Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedSlots.map((slot) => (
              <SlotCard
                key={slot.slotId}
                slot={slot}
                onSelect={(chosenSlot) => setSelectedSlotForBooking(chosenSlot)}
              />
            ))}
          </div>
        )}

      </section>

      {/* Booking Form Modal */}
      <BookingModal
        slot={selectedSlotForBooking}
        isOpen={Boolean(selectedSlotForBooking)}
        onClose={() => setSelectedSlotForBooking(null)}
        onBookingSuccess={handleBookingSubmit}
      />
    </div>
  );
}
