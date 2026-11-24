import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, ArrowLeft, Settings, Check, ExternalLink } from 'lucide-react';
import { apiService } from '../../services/api';

export default function AdminLoginPage({ onLoginSuccess }) {
  const [adminKey, setAdminKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Apps Script Endpoint URL state
  const [showUrlConfig, setShowUrlConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => apiService.getApiUrl());
  const [urlSaved, setUrlSaved] = useState(false);

  const handleSaveUrl = () => {
    apiService.setApiUrl(apiUrl.trim());
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    setIsLoading(true);
    setError('');

    // Ensure any entered URL is saved before authenticating
    if (apiUrl.trim() !== apiService.getApiUrl()) {
      apiService.setApiUrl(apiUrl.trim());
    }

    try {
      const res = await apiService.adminLogin(adminKey.trim());
      if (res.success) {
        apiService.setAdminKey(adminKey.trim());
        onLoginSuccess();
      } else {
        setError(res.error || 'Unauthorized: Invalid admin credentials');
      }
    } catch (err) {
      setError(err.message || 'Authorization failed. Please verify your Web App URL and connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))]" />

      <div className="relative w-full max-w-md rounded-3xl bg-[#08102B]/95 border border-blue-500/30 shadow-2xl overflow-hidden backdrop-blur-xl animate-slide-up z-10">
        
        {/* Top Header with Academy Logo */}
        <div className="p-8 pb-6 border-b border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-blue-500/40 shadow-lg shadow-blue-500/20 mx-auto mb-4">
            <img 
              src="/assets/slash-logo.jpg" 
              alt="S/ASH Academy Logo" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-center space-x-2 mb-1">
            <h1 className="font-display font-extrabold text-2xl tracking-wider text-white">
              S/ASH ACADEMY
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ADMIN
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Interview Management & Admissions Console
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Restricted area. All administrative transactions are authenticated and verified server-side.
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Administrator Access Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                required
                autoFocus
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter your administrative secret key"
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Optional: Update Google Apps Script URL (When recreated) */}
          <div className="border-t border-white/5 pt-3">
            <button
              type="button"
              onClick={() => setShowUrlConfig(!showUrlConfig)}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showUrlConfig ? 'Hide API URL Settings' : 'Update Google Apps Script URL'}</span>
            </button>

            {showUrlConfig && (
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2 animate-fade-in text-xs">
                <label className="block text-slate-300 font-semibold">
                  New Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Paste the new URL from Google Deploy
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveUrl}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center space-x-1"
                  >
                    {urlSaved ? <Check className="w-3 h-3 text-emerald-300" /> : null}
                    <span>{urlSaved ? 'Saved!' : 'Save URL'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !adminKey.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <span>Authorize & Access Console</span>
            )}
          </button>

          <div className="pt-2 text-center">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Website</span>
            </a>
          </div>
        </form>

      </div>
    </div>
  );
}
