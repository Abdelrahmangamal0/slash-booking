# S/ASH Academy — Google Sheets Database & Apps Script API Setup Guide

This document provides complete instructions for setting up the Google Sheets database and deploying the Google Apps Script serverless API for the **S/ASH Academy Interview Booking Platform**.

---

## 1. Google Sheets Database Architecture

The system uses a single Google Spreadsheet acting as an authoritative database, partitioned into three structured tabs.

### Sheet 1: `Appointment Slots`
Stores each interview appointment slot with independent capacity and live occupancy count.

| Column Index | Column Header | Data Type | Description |
|---|---|---|---|
| A (Col 1) | `Slot ID` | String | Unique slot identifier (e.g., `SLOT-2601-A1`) |
| B (Col 2) | `Date` | Date / String | Appointment date in `YYYY-MM-DD` format |
| C (Col 3) | `Start Time` | String | Starting time (e.g., `10:00 AM`) |
| D (Col 4) | `End Time` | String | Ending time (e.g., `11:00 AM`) |
| E (Col 5) | `Capacity` | Integer | Maximum students permitted for this slot (e.g., `1`, `3`, `5`, `10`) |
| F (Col 6) | `Booked Count` | Integer | Current confirmed bookings (calculated authoritatively) |
| G (Col 7) | `Status` | String | `Active` or `Inactive` |
| H (Col 8) | `Created At` | ISO String | Creation timestamp |
| I (Col 9) | `Updated At` | ISO String | Last modification timestamp |

---

### Sheet 2: `Bookings`
Stores student reservations with unique booking references and contact information.

| Column Index | Column Header | Data Type | Description |
|---|---|---|---|
| A (Col 1) | `Booking ID` | String | Unique candidate reference (e.g., `SASH-BK-261124-7102`) |
| B (Col 2) | `Student Name` | String | Full name of the applicant |
| C (Col 3) | `Phone Number` | String | Phone number (WhatsApp active) |
| D (Col 4) | `Slot ID` | String | Foreign key linking to `Appointment Slots` |
| E (Col 5) | `Appointment Date` | Date / String | Date of the interview |
| F (Col 6) | `Appointment Start Time` | String | Start time |
| G (Col 7) | `Booking Status` | String | `Confirmed` or `Cancelled` |
| H (Col 8) | `Created At` | ISO String | Timestamp when reservation was placed |

---

### Sheet 3: `Admin Configuration`
Stores environment settings and security credentials. Private and never exposed to students.

| Column Index | Column Header | Description | Default Value |
|---|---|---|---|
| A (Col 1) | `Key` | Configuration property name | `ADMIN_SECRET_KEY` |
| B (Col 2) | `Value` | Value | Your private secret passkey (set in Script Properties or this private sheet) |
| C (Col 3) | `Description` | Explanation of configuration | Secret key required for admin mutations |

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Create the Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) in your web browser.
2. Rename the spreadsheet to **`S/ASH Academy — Interview Database`**.
3. Keep the spreadsheet private (do not share publicly).

### Step 2: Open Google Apps Script Editor
1. In the spreadsheet menu, navigate to:
   **Extensions** &gt; **Apps Script**.
2. A new tab will open with the script editor. Rename the project to **`SASH-Academy-API`**.

### Step 3: Insert the Backend Code
1. Open the file [google-apps-script/Code.gs](google-apps-script/Code.gs) from this repository.
2. Copy the entire contents of `Code.gs`.
3. In the Apps Script editor, replace any existing code in `Code.gs` with the copied content.
4. Press `Ctrl + S` (or `Cmd + S` on macOS) to save.

### Step 4: Deploy as a Public Web App
1. At the top-right corner of the Apps Script editor, click the blue **Deploy** button and choose **New deployment**.
2. Click the gear icon (**Select type**) next to "Select type" and select **Web app**.
3. Configure the deployment settings:
   - **Description**: `S/ASH Academy Production API v1.0`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: allows students to book without Google login)*
4. Click **Deploy**.
5. Google will prompt you to **Authorize access**:
   - Click *Review permissions*.
   - Choose your Google account.
   - Click *Advanced* &gt; *Go to SASH-Academy-API (unsafe)*.
   - Click *Allow*.
6. Once deployed, Google will display your **Web App URL**:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. Copy this URL.

---

## 3. Connecting the Frontend to the Live Backend

### Method A: Via the Admin Portal (Instant 1-Click Setup)
1. Open your S/ASH Academy administration portal at `/admin` (e.g. `https://your-domain.com/admin`).
2. Log in using your server-configured admin secret key.
4. Go to the **Google Sheets & API Settings** tab.
5. Paste your Web App URL into the input field and click **Save & Test Connection**.
6. The system will ping the API, verify connectivity, and initialize the sheet structure automatically!

### Method B: Via Environment File
Create a `.env.production` file in the root of the project:
```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec
```
Rebuild the project:
```bash
npm run build
```

---

## 4. Concurrency & Overbooking Prevention Architecture

When high volumes of students attempt to book appointment slots at the same moment:

1. **Google Apps Script `LockService`:**
   Every booking transaction acquires an exclusive script lock (`LockService.getScriptLock()`) with a 15-second wait queue.
2. **Authoritative Server-Side Verification:**
   The server re-reads the active rows from Google Sheets under lock, calculates the exact confirmed booking count, checks remaining capacity (`availableSeats = capacity - bookedCount`), and rejects the transaction if capacity is full.
3. **Double-Booking Shield:**
   The applicant's phone number is verified against existing confirmed bookings for the same slot.
4. **Immediate Flush:**
   `SpreadsheetApp.flush()` ensures disk writes are committed immediately before the lock is released.
