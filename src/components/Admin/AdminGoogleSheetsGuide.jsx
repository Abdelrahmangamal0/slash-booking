import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, AlertCircle, Sparkles, ShieldCheck, KeyRound } from 'lucide-react';
import { apiService } from '../../services/api';

export default function AdminGoogleSheetsGuide({ onConnectionChange }) {
  const [apiUrlInput, setApiUrlInput] = useState(apiService.getApiUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const isLive = apiService.isLiveMode();

  const handleSaveAndTest = async () => {
    setTestingConnection(true);
    setTestResult(null);

    const cleanUrl = apiUrlInput.trim();
    apiService.setApiUrl(cleanUrl);

    if (!cleanUrl) {
      setTestResult({ success: true, message: 'Switched to Local Preview & Demo Engine.' });
      setTestingConnection(false);
      if (onConnectionChange) onConnectionChange();
      return;
    }

    try {
      const res = await apiService.testConnection(cleanUrl);
      setTestResult(res);
      if (onConnectionChange) onConnectionChange();
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Failed to connect to Apps Script URL' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCopyCode = () => {
    // We can fetch or provide the code
    navigator.clipboard.writeText(`// Refer to google-apps-script/Code.gs in the repository for the complete production Apps Script code.`);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const [initLoading, setInitLoading] = useState(false);
  const [initMessage, setInitMessage] = useState(null);

  const handleInitDatabase = async () => {
    setInitLoading(true);
    setInitMessage(null);
    try {
      const res = await apiService.initDatabase();
      if (res.success) {
        setInitMessage({ success: true, message: 'Google Sheets initialized successfully!' });
      } else {
        setInitMessage({ success: false, message: res.error || 'Failed to initialize sheets' });
      }
    } catch (err) {
      setInitMessage({ success: false, message: err.message });
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#08102B] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-1">
            <Database className="w-4 h-4" />
            <span>PRIMARY DATABASE ENGINE</span>
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            Google Sheets & Apps Script Integration
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Connect your live Google Spreadsheet to store student bookings and manage slots without running a traditional database server.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-2xl border font-bold flex items-center space-x-2 ${
          isLive 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
          <span>{isLive ? 'Live Google Sheets Active' : 'Offline / Preview Mode Active'}</span>
        </div>
      </div>

      {/* URL Configuration Card */}
      <div className="p-6 rounded-2xl bg-[#08102B] border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white font-display">
          Google Apps Script Web App Endpoint URL
        </h4>
        <p className="text-slate-400">
          Paste the Web App URL generated from your Google Apps Script deployment (must end in <code>/exec</code>).
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={apiUrlInput}
            onChange={(e) => setApiUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
          />

          <button
            onClick={handleSaveAndTest}
            disabled={testingConnection}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {testingConnection ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <span>Save & Test Connection</span>
            )}
          </button>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3.5 rounded-xl border flex items-center space-x-2 ${
            testResult.success 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <div>
              <span>{testResult.message}</span>
              {testResult.version && (
                <span className="block text-[11px] opacity-80 mt-0.5">Deployment Version: {testResult.version}</span>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-slate-400 border-t border-white/5 gap-2">
          <span>Make sure your Google Apps Script is deployed as a Web App with access for "Anyone".</span>
          <button
            onClick={handleInitDatabase}
            disabled={initLoading || !apiUrlInput.trim()}
            className="text-cyan-400 hover:text-cyan-300 underline font-medium disabled:opacity-40"
          >
            {initLoading ? 'Initializing Sheets...' : 'Initialize Sheets (initDatabase)'}
          </button>
        </div>
        {initMessage && (
          <div className={`p-3 rounded-xl border flex items-center space-x-2 ${
            initMessage.success ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            <span>{initMessage.message}</span>
          </div>
        )}
      </div>

      {/* Spreadsheet Structure Overview */}
      <div className="p-6 rounded-2xl bg-[#08102B] border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white font-display">
          Authoritative Google Sheets Database Schema
        </h4>
        <p className="text-slate-400">
          The Apps Script backend will automatically create and format these 3 sheets on first run (or via <code>initDatabase</code>):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sheet 1 */}
          <div className="p-4 rounded-xl bg-[#0E1A3C] border border-white/10 space-y-2">
            <div className="font-bold text-cyan-300 text-sm">1. Appointment Slots</div>
            <p className="text-slate-400 text-[11px]">Stores each interview slot with its independent capacity.</p>
            <ul className="text-slate-300 space-y-1 list-disc list-inside font-mono text-[10px]">
              <li>Slot ID</li>
              <li>Date (YYYY-MM-DD)</li>
              <li>Start Time & End Time</li>
              <li>Capacity (Integer)</li>
              <li>Booked Count (Integer)</li>
              <li>Status (Active / Inactive)</li>
              <li>Created At & Updated At</li>
            </ul>
          </div>

          {/* Sheet 2 */}
          <div className="p-4 rounded-xl bg-[#0E1A3C] border border-white/10 space-y-2">
            <div className="font-bold text-emerald-300 text-sm">2. Bookings</div>
            <p className="text-slate-400 text-[11px]">Stores student bookings with unique confirmation codes.</p>
            <ul className="text-slate-300 space-y-1 list-disc list-inside font-mono text-[10px]">
              <li>Booking ID (e.g. SASH-BK-...)</li>
              <li>Student Name</li>
              <li>Phone Number</li>
              <li>Slot ID</li>
              <li>Appointment Date & Time</li>
              <li>Booking Status (Confirmed / Cancelled)</li>
              <li>Created At (Timestamp)</li>
            </ul>
          </div>

          {/* Sheet 3 */}
          <div className="p-4 rounded-xl bg-[#0E1A3C] border border-white/10 space-y-2">
            <div className="font-bold text-amber-300 text-sm">3. Admin Configuration</div>
            <p className="text-slate-400 text-[11px]">Stores secure settings and authentication keys.</p>
            <ul className="text-slate-300 space-y-1 list-disc list-inside font-mono text-[10px]">
              <li>ADMIN_SECRET_KEY (Private server-configured secret key)</li>
              <li>ACADEMY_NAME: S/ASH Academy</li>
              <li>ALLOW_DUPLICATE_PHONES: false</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4-Step Deployment Walkthrough */}
      <div className="p-6 rounded-2xl bg-[#08102B] border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white font-display">
          Quick 3-Minute Deployment Instructions
        </h4>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start space-x-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <div>
              <strong className="text-white block">Create Google Sheet & Open Script Editor</strong>
              <span className="text-slate-400">Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">sheets.new</a>, name it <code>S/ASH Academy Appointments</code>, then click <strong>Extensions &gt; Apps Script</strong>.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start space-x-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <div>
              <strong className="text-white block">Paste Backend Code (google-apps-script/Code.gs)</strong>
              <span className="text-slate-400">Delete any code in the editor, copy the contents of <code>google-apps-script/Code.gs</code> from this repository, and paste it in. Save the project (Ctrl+S).</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start space-x-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
            <div>
              <strong className="text-white block">Deploy as Web App</strong>
              <span className="text-slate-400">Click <strong>Deploy &gt; New deployment</strong>. Select type: <strong>Web app</strong>. Execute as: <strong>Me</strong>. Who has access: <strong>Anyone</strong>. Click Deploy and authorize Google access.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start space-x-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">4</span>
            <div>
              <strong className="text-white block">Connect & Verify</strong>
              <span className="text-slate-400">Copy the Web App URL provided by Google, paste it into the input box above, and click <strong>Save & Test Connection</strong>. The database tabs will be automatically created and populated!</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
