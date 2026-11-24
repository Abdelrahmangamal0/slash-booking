import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentBookingView from './components/StudentBooking/StudentBookingView';
import BookingLookupModal from './components/StudentBooking/BookingLookupModal';
import AdminLoginPage from './components/Admin/AdminLoginPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import { apiService } from './services/api';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  // Check if current URL path corresponds to the dedicated Admin route
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      path.endsWith('/admin.html') ||
      hash === '#/admin' ||
      hash.startsWith('#/admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return Boolean(apiService.getAdminKey());
  });
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  // Listen to browser forward/back buttons and hash navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
      setIsAdminLoggedIn(Boolean(apiService.getAdminKey()));
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    apiService.clearAdminSession();
    setIsAdminLoggedIn(false);
  };

  const handleBackToSite = () => {
    if (window.history.pushState) {
      window.history.pushState({}, '', '/');
      setIsAdminRoute(false);
    } else {
      window.location.href = '/';
    }
  };

  // =========================================================================
  // DEDICATED ADMIN PORTAL ROUTE (https://your-domain.com/admin)
  // Completely isolated from the student-facing website
  // =========================================================================
  if (isAdminRoute) {
    if (isAdminLoggedIn) {
      return (
        <AdminDashboard
          onLogout={handleAdminLogout}
          onBackToSite={handleBackToSite}
        />
      );
    }

    return (
      <AdminLoginPage
        onLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // =========================================================================
  // STUDENT PUBLIC WEBSITE (https://your-domain.com/)
  // Contains zero admin buttons, zero admin keys, and zero staff controls
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Clean Student Header */}
      <Navbar
        currentView="booking"
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenLookup={() => setIsLookupModalOpen(true)}
      />

      {/* Main Student Booking Experience */}
      <main className="flex-1">
        <StudentBookingView />
      </main>

      {/* Official S/ASH Academy Footer (Purely Student / Informational) */}
      <footer className="w-full border-t border-white/5 bg-[#050B1E]/90 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Brand & Identity */}
            <div className="flex items-center space-x-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-500/20">
                <img 
                  src="/assets/slash-logo.jpg" 
                  alt="S/ASH Academy Logo" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <div className="font-display font-extrabold text-sm tracking-wider text-white">
                  S/ASH ACADEMY
                </div>
                <p className="text-xs text-slate-400">
                  Empowering next-generation technology leaders.
                </p>
              </div>
            </div>

            {/* Information & Policies */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Official Admissions Portal</span>
              </span>
              <span>•</span>
              <span>Secure Server-Validated Bookings</span>
              <span>•</span>
              <span>Admissions Evaluation Committee</span>
            </div>

            {/* Copyright */}
            <div className="text-xs text-slate-500 text-center md:text-right">
              © {new Date().getFullYear()} S/ASH Academy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Student Booking Lookup Dialog */}
      <BookingLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
      />
    </div>
  );
}
