import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Copy, Check, Printer, Calendar, ArrowLeft, ShieldCheck, Clock, MapPin, Phone, User } from 'lucide-react';

export default function BookingSuccess({ booking, onBackHome }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if canvas-confetti is not loaded
    }
  }, []);

  if (!booking) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Google Calendar Link Generator
  const generateGoogleCalendarUrl = () => {
    try {
      const title = encodeURIComponent('S/ASH Academy — Admissions Interview');
      const details = encodeURIComponent(
        `Your official interview appointment with S/ASH Academy.\nStudent: ${booking.studentName}\nReference ID: ${booking.bookingId}\nStatus: Confirmed`
      );
      const location = encodeURIComponent('S/ASH Academy Virtual Campus');
      
      // Approximate ISO format for event
      const dateClean = booking.date.replace(/-/g, '');
      const datesParam = `${dateClean}T090000Z/${dateClean}T100000Z`;

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${datesParam}`;
    } catch {
      return '#';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Printable Confirmation Card */}
      <div className="relative rounded-3xl bg-[#08102B] border border-blue-500/30 shadow-2xl p-6 sm:p-10 overflow-hidden printable-card">
        
        {/* Glow backdrop behind badge */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-blue-500/30">
              <img src="/assets/slash-logo.jpg" alt="S/ASH Academy Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white tracking-wider">
                S/ASH ACADEMY
              </h2>
              <p className="text-xs text-slate-400">Admissions & Technical Evaluations</p>
            </div>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRMED</span>
          </div>
        </div>

        {/* Success Announcement */}
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
            Interview Successfully Booked!
          </h3>
          <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
            Your interview has been successfully booked with S/ASH Academy. A seat has been reserved in our system.
          </p>
        </div>

        {/* Reference Code Box */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between my-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Booking Reference ID
            </div>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-cyan-300 tracking-wide">
              {booking.bookingId}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="no-print flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-sm border-t border-b border-white/10">
          <div className="flex items-start space-x-3">
            <User className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Student Name</div>
              <div className="font-semibold text-white">{booking.studentName}</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Phone Number</div>
              <div className="font-semibold text-white">{booking.phoneNumber}</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Appointment Date</div>
              <div className="font-semibold text-white">{booking.date}</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Appointment Time</div>
              <div className="font-semibold text-white">{booking.startTime} {booking.endTime ? `– ${booking.endTime}` : ''}</div>
            </div>
          </div>

          <div className="flex items-start space-x-3 sm:col-span-2">
            <MapPin className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Interview Format & Platform</div>
              <div className="font-semibold text-slate-200">Online Evaluation (Meeting link will be shared via WhatsApp)</div>
            </div>
          </div>
        </div>

        {/* Preparation Guidelines */}
        <div className="mt-4 p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <div className="font-bold text-white flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Next Steps for S/ASH Academy Applicants:</span>
          </div>
          <p>• Save or screenshot your Booking Reference ID for your records.</p>
          <p>• Have a stable internet connection and quiet environment ready 10 minutes prior to your slot.</p>
          <p>• Questions? Contact admissions via official academy channels.</p>
        </div>

        {/* Actions */}
        <div className="no-print mt-8 pt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBackHome}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Book Another Interview</span>
          </button>

          <div className="flex items-center space-x-3">
            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Add to Calendar</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Confirmation</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
