# S/ASH Academy — Interview Booking System

![S/ASH Academy Brand Identity](public/assets/slash-logo.jpg)

A production-ready, high-performance **Interview Booking System** designed and built for **S/ASH Academy**. 

The platform allows prospective students to reserve admissions and technical evaluation slots with zero friction (no account creation required), while empowering Academy Administrators with full control over slot creation, independent seat capacity per appointment, and student booking management—backed by **Google Sheets as the database** and **Google Apps Script as the serverless API**.

---

## 🚀 Key Features

### 1. Student Experience
- **Zero Login Friction:** Students access the portal directly via a shared link without needing to register or authenticate.
- **Dynamic Live Availability:** Only active, future interview slots with open seats are displayed. Fully booked slots automatically vanish from the student view.
- **Urgency & Availability Badges:** Real-time feedback showing "Only 1 Seat Left!", "3 Seats Open", or cohort slot details.
- **Anti-Duplicate Booking Protection:** Prevents duplicate reservations from the same phone number for the same interview slot.
- **Official Booking Confirmation Screen:**
  - Unique Booking Reference ID (e.g., `SASH-BK-261124-7102`) with copy-to-clipboard.
  - Formatted printable / PDF receipt (`window.print()`).
  - One-click "Add to Google Calendar" button.
- **Self-Service Booking Lookup:** Students can input their Reference ID or phone number at any time to verify their scheduled time and status.

### 2. Dynamic Appointment & Capacity Management
- **Independent Capacity Control:** Capacity is never hardcoded. Each slot has its own independent capacity configured by the Admin (e.g., 1 for 1-on-1, 3 for small group, 5 for cohort, 10 for assessment).
- **Dynamic Availability Formula:** `Available Seats = Maximum Capacity - Confirmed Bookings`.
- **Intelligent Capacity Reduction Handling:** If the Admin reduces capacity below the current confirmed booking count, existing bookings are preserved safely, further bookings are blocked, and an explicit alert is presented.
- **Concurrency & Overbooking Shield:** Uses Google Apps Script `LockService` to guarantee zero overbooking during simultaneous submissions.

### 3. Executive Admin Dashboard
- **Protected Access:** Passkey authentication verified server-side against the Google Sheet configuration.
- **5 Key Real-Time Metrics:** Total Slots, Confirmed Bookings, Available Seats, Fully Booked Slots, and Upcoming Interviews.
- **Seat Capacity Utilization Bar:** Real-time occupancy percentage.
- **Full Slot Lifecycle:** Create slots, edit capacities, toggle Active/Inactive, and safely delete empty slots.
- **Bookings Master Table:** Instant search by student name, phone, or reference, with date and slot filters, status indicators, and booking cancellation (which immediately reopens the seat).
- **1-Click CSV Export:** Export filtered student records for admissions records.
- **Google Sheets Integration Wizard:** Built-in tester to connect, verify, and monitor the Google Apps Script Web App URL with live ping.

---

## 🎨 Brand Identity & Visual Direction

The visual direction directly adopts the official **S/ASH Academy** identity:
- **Primary Obsidian Navy Palette:** `#030712`, `#050B1E`, `#08102B`, `#0E1A3C`.
- **Accents:** Electric Blue (`#2563EB`) and Celestial Cyan (`#38BDF8`).
- **Typography:** Display titles in *Outfit* with body typography in *Plus Jakarta Sans*.
- **Subtle Glassmorphism:** Clean borders, soft backdrops, and purposeful micro-interactions with reduced-motion support.

---

## 📁 Project Architecture

```
manege/
├── public/
│   └── assets/
│       └── slash-logo.jpg            # Official S/ASH Academy Logo
├── google-apps-script/
│   ├── Code.gs                       # Production Apps Script API & LockService
│   └── appsscript.json               # Apps Script Manifest
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                # Official Academy Header & Mode Status
│   │   ├── StudentBooking/
│   │   │   ├── Hero.jsx              # Admissions Hero with trust badges
│   │   │   ├── DateSelector.jsx      # Horizontal date ribbon with slot counts
│   │   │   ├── SlotCard.jsx          # Slot card with dynamic capacity badge
│   │   │   ├── BookingModal.jsx      # Student booking form with validation
│   │   │   ├── BookingSuccess.jsx    # Confirmation receipt & calendar integration
│   │   │   └── BookingLookupModal.jsx# Student self-service status lookup
│   │   └── Admin/
│   │       ├── AdminLoginModal.jsx   # Passkey authentication modal
│   │       ├── AdminDashboard.jsx    # Tabbed executive administration portal
│   │       ├── AdminOverview.jsx     # 5 Metric cards & occupancy utilization
│   │       ├── AdminSlotManager.jsx  # Slot creation & capacity editor
│   │       ├── AdminBookingsManager.jsx # Searchable bookings table & CSV export
│   │       └── AdminGoogleSheetsGuide.jsx # Integration test & deployment wizard
│   ├── services/
│   │   └── api.js                    # Unified API (Google Apps Script + Local Mock Engine)
│   ├── App.jsx                       # Root application view router
│   ├── main.jsx                      # Vite React entrypoint
│   └── index.css                     # Design tokens & glassmorphism styling
├── test/
│   └── verify-scenarios.js           # Automated test suite (12 core scenarios)
├── GOOGLE_SHEETS_SETUP.md            # Complete Google Sheets setup guide
├── DEPLOYMENT_GUIDE.md               # Cloudflare / Vercel deployment guide
└── vite.config.js                    # Vite configuration
```

---

## 💻 Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
node test/verify-scenarios.js

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` to interact with the system.

### Admin Portal & Authentication
- **Dedicated Admin URL:** `https://your-domain.com/admin` (completely hidden and separated from the student public website).
- **Authentication:** Validated server-side against Google Apps Script Script Properties or the private `Admin Configuration` Google Sheet tab. No hardcoded credentials exist in client code.

---

## 📄 Documentation Links
- [Google Sheets Database & Apps Script API Setup Guide](GOOGLE_SHEETS_SETUP.md)
- [Production Static Frontend Deployment Guide](DEPLOYMENT_GUIDE.md)
