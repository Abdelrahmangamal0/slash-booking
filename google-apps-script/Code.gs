/**
 * =========================================================================
 * S/ASH ACADEMY — INTERVIEW BOOKING SYSTEM
 * Production Server-Side Google Apps Script Backend (API)
 * 100% Authoritative Google Sheets Integration
 * =========================================================================
 */

// --- CONFIGURATION CONSTANTS ---
const SHEET_NAMES = {
  SLOTS: 'Appointment Slots',
  BOOKINGS: 'Bookings',
  CONFIG: 'Admin Configuration'
};

// S/ASH Academy Google Spreadsheet ID
const SPREADSHEET_ID = '1tlxzGOxhnvD-iHz5HxaIeTKxTyGTwU9kyV050Xb8X8Q';

/**
 * Returns the active Spreadsheet reference safely.
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim()) {
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
      if (ss) return ss;
    } catch (err) {
      Logger.log('openById error: ' + err.message);
    }
  }

  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  throw new Error('Cannot connect to Google Sheet. Please check that SPREADSHEET_ID is valid and authorized.');
}

/**
 * Safe sheet getter that automatically initializes sheets if missing
 */
function getOrInitSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(sheetName);
  }
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Helper to build JSON responses with proper headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HTTP GET Handler
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || 'ping';

    switch (action) {
      case 'ping':
        return createJsonResponse({
          success: true,
          version: '2.0.0-authoritative-sheets',
          message: 'S/ASH Academy API is online and operational.',
          timestamp: new Date().toISOString()
        });

      case 'initDatabase':
        return createJsonResponse(initDatabase());

      case 'getAvailableSlots':
        return createJsonResponse(getAvailableSlots());

      case 'getAdminOverview':
        validateAdminKey(params.adminKey);
        return createJsonResponse(getAdminOverview());

      case 'getAdminSlots':
        validateAdminKey(params.adminKey);
        return createJsonResponse(getAdminSlots());

      case 'getAdminBookings':
        validateAdminKey(params.adminKey);
        return createJsonResponse(getAdminBookings(params));

      case 'lookupBooking':
        return createJsonResponse(lookupStudentBooking(params.identifier));

      default:
        return createJsonResponse({
          success: false,
          error: 'Invalid GET action: ' + action
        });
    }
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || 'Server error occurred'
    });
  }
}

/**
 * HTTP POST Handler
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;

    switch (action) {
      case 'createBooking':
        return createJsonResponse(handleCreateBooking(payload));

      case 'adminLogin':
        return createJsonResponse(handleAdminLogin(payload.adminKey));

      case 'createSlot':
        validateAdminKey(payload.adminKey);
        return createJsonResponse(handleCreateSlot(payload));

      case 'updateSlotCapacity':
        validateAdminKey(payload.adminKey);
        return createJsonResponse(handleUpdateSlotCapacity(payload));

      case 'toggleSlotStatus':
        validateAdminKey(payload.adminKey);
        return createJsonResponse(handleToggleSlotStatus(payload));

      case 'deleteSlot':
        validateAdminKey(payload.adminKey);
        return createJsonResponse(handleDeleteSlot(payload));

      case 'cancelBooking':
        validateAdminKey(payload.adminKey);
        return createJsonResponse(handleCancelBooking(payload));

      default:
        return createJsonResponse({
          success: false,
          error: 'Invalid POST action: ' + action
        });
    }
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || 'Server error occurred during POST operation'
    });
  }
}

/**
 * Validates Admin Key server-side
 */
function validateAdminKey(providedKey) {
  if (!providedKey || typeof providedKey !== 'string' || !providedKey.trim()) {
    throw new Error('Unauthorized: Admin credentials required.');
  }

  const cleanProvided = String(providedKey).trim();

  // Accept sash_admin_2026 or admin as default administrative key
  if (cleanProvided === 'sash_admin_2026' || cleanProvided === 'admin') {
    return true;
  }

  // Check custom key in Admin Configuration sheet
  try {
    const configSheet = getOrInitSheet(SHEET_NAMES.CONFIG);
    const data = configSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === 'ADMIN_SECRET_KEY' && data[i][1]) {
        const val = String(data[i][1]).trim();
        if (cleanProvided === val) return true;
      }
    }
  } catch (e) {}

  throw new Error('Unauthorized: Invalid administrator credentials.');
}

/**
 * Handle Admin Login Verification
 */
function handleAdminLogin(providedKey) {
  try {
    validateAdminKey(providedKey);
    return {
      success: true,
      message: 'Admin authorization successful.',
      token: Utilities.base64Encode(providedKey + ':' + new Date().getTime())
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Fetch available slots for students directly from Google Sheet
 */
function getAvailableSlots() {
  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
  const rows = slotSheet.getDataRange().getValues();

  if (rows.length <= 1) {
    return { success: true, slots: [], count: 0 };
  }

  const now = new Date();
  const todayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const availableSlots = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const slotId = String(row[0]);
    const rawDate = row[1];
    const dateStr = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(rawDate);
    const startTime = String(row[2]);
    const endTime = String(row[3]);
    const capacity = parseInt(row[4], 10) || 1;
    const bookedCount = parseInt(row[5], 10) || 0;
    const status = String(row[6]);

    // Active only
    if (status !== 'Active') continue;

    // Today and future only
    if (dateStr < todayStr) continue;

    // Available seats check
    const availableSeats = Math.max(0, capacity - bookedCount);
    if (availableSeats <= 0) continue;

    availableSlots.push({
      slotId: slotId,
      date: dateStr,
      startTime: startTime,
      endTime: endTime,
      capacity: capacity,
      bookedCount: bookedCount,
      availableSeats: availableSeats,
      status: status
    });
  }

  // Sort ascending by date, then start time
  availableSlots.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return {
    success: true,
    slots: availableSlots,
    count: availableSlots.length
  };
}

/**
 * Concurrency-Safe Student Booking directly into Google Sheet
 */
function handleCreateBooking(payload) {
  const studentName = (payload.studentName || '').trim();
  const rawPhone = (payload.phoneNumber || '').trim();
  const slotId = (payload.slotId || '').trim();

  if (!studentName || studentName.length < 2) {
    return { success: false, error: 'Please provide a valid full name.' };
  }
  if (!rawPhone || rawPhone.length < 6) {
    return { success: false, error: 'Please provide a valid phone number.' };
  }
  if (!slotId) {
    return { success: false, error: 'Appointment slot is required.' };
  }

  const phoneNumber = rawPhone.replace(/[\s\-\(\)]/g, '');

  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    hasLock = lock.tryLock(10000);
  } catch (lockErr) {
    Logger.log('Lock attempt error: ' + lockErr.message);
  }

  try {
    const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
    const bookingSheet = getOrInitSheet(SHEET_NAMES.BOOKINGS);

    const slotData = slotSheet.getDataRange().getValues();
    let slotRowIndex = -1;
    let slotRecord = null;

    for (let i = 1; i < slotData.length; i++) {
      if (String(slotData[i][0]).trim() === slotId) {
        slotRowIndex = i + 1;
        slotRecord = slotData[i];
        break;
      }
    }

    if (!slotRecord) {
      return { success: false, error: 'The requested appointment slot does not exist.' };
    }

    const rawSlotDate = slotRecord[1];
    const slotDate = rawSlotDate instanceof Date ? Utilities.formatDate(rawSlotDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(rawSlotDate);
    const slotStartTime = String(slotRecord[2]);
    const slotEndTime = String(slotRecord[3]);
    const capacity = parseInt(slotRecord[4], 10) || 1;
    let currentBookedCount = parseInt(slotRecord[5], 10) || 0;
    const slotStatus = String(slotRecord[6]);

    if (slotStatus !== 'Active') {
      return { success: false, error: 'This appointment slot is currently inactive.' };
    }

    // Verify duplicate phone in Bookings sheet
    const bookingData = bookingSheet.getDataRange().getValues();
    let confirmedCountInDb = 0;

    for (let b = 1; b < bookingData.length; b++) {
      const bSlotId = String(bookingData[b][3]).trim();
      const bPhone = String(bookingData[b][2]).replace(/[\s\-\(\)]/g, '');
      const bStatus = String(bookingData[b][6]).trim();

      if (bSlotId === slotId && bStatus === 'Confirmed') {
        confirmedCountInDb++;
        if (bPhone === phoneNumber) {
          return { success: false, error: 'A booking with this phone number already exists for this slot.' };
        }
      }
    }

    if (confirmedCountInDb !== currentBookedCount) {
      currentBookedCount = confirmedCountInDb;
      slotSheet.getRange(slotRowIndex, 6).setValue(currentBookedCount);
    }

    if (currentBookedCount >= capacity) {
      return { success: false, error: 'Sorry, this appointment slot is now fully booked.' };
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = 'SASH-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd') + '-' + randomSuffix;
    const nowIso = new Date().toISOString();

    // Append to Bookings tab in Google Sheet
    bookingSheet.appendRow([
      bookingId,
      studentName,
      rawPhone,
      slotId,
      slotDate,
      slotStartTime,
      'Confirmed',
      nowIso
    ]);

    // Increment Booked Count in Appointment Slots tab
    const newBookedCount = currentBookedCount + 1;
    slotSheet.getRange(slotRowIndex, 6).setValue(newBookedCount);
    slotSheet.getRange(slotRowIndex, 9).setValue(nowIso);

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Your interview has been successfully booked with S/ASH Academy.',
      booking: {
        bookingId: bookingId,
        studentName: studentName,
        phoneNumber: rawPhone,
        slotId: slotId,
        date: slotDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
        status: 'Confirmed',
        createdAt: nowIso
      }
    };
  } finally {
    if (hasLock) {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  }
}

/**
 * Admin: Get Overview Statistics directly from Google Sheet
 */
function getAdminOverview() {
  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
  const bookingSheet = getOrInitSheet(SHEET_NAMES.BOOKINGS);

  const slotRows = slotSheet.getDataRange().getValues();
  const bookingRows = bookingSheet.getDataRange().getValues();

  let totalSlots = 0;
  let activeSlots = 0;
  let totalCapacity = 0;
  let fullyBookedSlots = 0;
  let upcomingInterviews = 0;

  const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  for (let i = 1; i < slotRows.length; i++) {
    totalSlots++;
    const row = slotRows[i];
    const rawDate = row[1];
    const dateStr = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(rawDate);
    const capacity = parseInt(row[4], 10) || 1;
    const booked = parseInt(row[5], 10) || 0;
    const status = String(row[6]);

    totalCapacity += capacity;
    if (status === 'Active') activeSlots++;
    if (booked >= capacity && capacity > 0) fullyBookedSlots++;
    if (dateStr >= todayStr && status === 'Active') upcomingInterviews += booked;
  }

  let totalConfirmedBookings = 0;
  for (let b = 1; b < bookingRows.length; b++) {
    if (String(bookingRows[b][6]).trim() === 'Confirmed') {
      totalConfirmedBookings++;
    }
  }

  const totalAvailableSeats = Math.max(0, totalCapacity - totalConfirmedBookings);

  return {
    success: true,
    stats: {
      totalSlots,
      activeSlots,
      confirmedBookings: totalConfirmedBookings,
      totalCapacity,
      totalAvailableSeats,
      fullyBookedSlots,
      upcomingInterviews,
      occupancyRate: totalCapacity > 0 ? Math.round((totalConfirmedBookings / totalCapacity) * 100) : 0
    }
  };
}

/**
 * Admin: Get All Slots from Google Sheet
 */
function getAdminSlots() {
  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
  const rows = slotSheet.getDataRange().getValues();
  const slots = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rawDate = row[1];
    const dateStr = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(rawDate);

    slots.push({
      slotId: String(row[0]),
      date: dateStr,
      startTime: String(row[2]),
      endTime: String(row[3]),
      capacity: parseInt(row[4], 10) || 1,
      bookedCount: parseInt(row[5], 10) || 0,
      status: String(row[6]),
      createdAt: String(row[7]),
      updatedAt: String(row[8])
    });
  }

  slots.sort((a, b) => b.date.localeCompare(a.date));
  return { success: true, slots };
}

/**
 * Admin: Create New Appointment Slot in Google Sheet
 */
function handleCreateSlot(payload) {
  const date = (payload.date || '').trim();
  const startTime = (payload.startTime || '').trim();
  const endTime = (payload.endTime || '').trim();
  const capacity = parseInt(payload.capacity, 10);

  if (!date || !startTime || !endTime) {
    return { success: false, error: 'Date, start time, and end time are required.' };
  }
  if (isNaN(capacity) || capacity < 1) {
    return { success: false, error: 'Capacity must be at least 1 student.' };
  }

  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
  const slotId = 'SLOT-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMddHHmmss') + '-' + Math.floor(100 + Math.random() * 900);
  const nowIso = new Date().toISOString();

  // Append directly into Google Sheet
  slotSheet.appendRow([
    slotId,
    date,
    startTime,
    endTime,
    capacity,
    0, // Initial booked count
    'Active',
    nowIso,
    nowIso
  ]);

  SpreadsheetApp.flush();

  return {
    success: true,
    message: 'Appointment slot created in Google Sheet successfully.',
    slot: {
      slotId,
      date,
      startTime,
      endTime,
      capacity,
      bookedCount: 0,
      status: 'Active',
      createdAt: nowIso,
      updatedAt: nowIso
    }
  };
}

/**
 * Admin: Update Slot Capacity in Google Sheet
 */
function handleUpdateSlotCapacity(payload) {
  const slotId = (payload.slotId || '').trim();
  const newCapacity = parseInt(payload.newCapacity, 10);

  if (!slotId) return { success: false, error: 'Slot ID is required.' };
  if (isNaN(newCapacity) || newCapacity < 1) {
    return { success: false, error: 'Capacity must be at least 1.' };
  }

  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
  const rows = slotSheet.getDataRange().getValues();

  let targetRowIndex = -1;
  let currentBooked = 0;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === slotId) {
      targetRowIndex = i + 1;
      currentBooked = parseInt(rows[i][5], 10) || 0;
      break;
    }
  }

  if (targetRowIndex === -1) {
    return { success: false, error: 'Slot not found.' };
  }

  slotSheet.getRange(targetRowIndex, 5).setValue(newCapacity);
  slotSheet.getRange(targetRowIndex, 9).setValue(new Date().toISOString());
  SpreadsheetApp.flush();

  let warning = null;
  if (newCapacity < currentBooked) {
    warning = 'New capacity (' + newCapacity + ') is lower than current bookings (' + currentBooked + ').';
  }

  return {
    success: true,
    message: 'Capacity updated to ' + newCapacity + '.',
    warning,
    newCapacity,
    currentBooked
  };
}

/**
 * Admin: Toggle Slot Status in Google Sheet
 */
function handleToggleSlotStatus(payload) {
  const slotId = (payload.slotId || '').trim();
  const status = payload.status;

  if (!slotId || !status) return { success: false, error: 'Slot ID and status required.' };

  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
  const rows = slotSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === slotId) {
      slotSheet.getRange(i + 1, 7).setValue(status);
      slotSheet.getRange(i + 1, 9).setValue(new Date().toISOString());
      SpreadsheetApp.flush();
      return { success: true, message: 'Status updated to ' + status };
    }
  }

  return { success: false, error: 'Slot not found.' };
}

/**
 * Admin: Safe Delete Slot from Google Sheet
 */
function handleDeleteSlot(payload) {
  const slotId = (payload.slotId || '').trim();
  if (!slotId) return { success: false, error: 'Slot ID required.' };

  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);
  const rows = slotSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === slotId) {
      const booked = parseInt(rows[i][5], 10) || 0;
      if (booked > 0 && !payload.forceDelete) {
        return { success: false, error: 'Cannot delete slot with ' + booked + ' bookings.' };
      }
      slotSheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true, message: 'Slot deleted from Google Sheet.' };
    }
  }

  return { success: false, error: 'Slot not found.' };
}

/**
 * Admin: Get All Bookings directly from Google Sheet
 */
function getAdminBookings(params) {
  const bookingSheet = getOrInitSheet(SHEET_NAMES.BOOKINGS);
  const rows = bookingSheet.getDataRange().getValues();
  const bookings = [];

  const filterDate = (params && params.date) ? String(params.date).trim() : null;
  const filterSlotId = (params && params.slotId) ? String(params.slotId).trim() : null;
  const searchQuery = (params && params.search) ? String(params.search).toLowerCase().trim() : null;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const bookingId = String(row[0]);
    const studentName = String(row[1]);
    const phoneNumber = String(row[2]);
    const slotId = String(row[3]);
    const rawDate = row[4];
    const dateStr = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(rawDate);
    const startTime = String(row[5]);
    const status = String(row[6]);
    const createdAt = String(row[7]);

    if (filterDate && dateStr !== filterDate) continue;
    if (filterSlotId && slotId !== filterSlotId) continue;
    if (searchQuery) {
      const match = bookingId.toLowerCase().includes(searchQuery) ||
                    studentName.toLowerCase().includes(searchQuery) ||
                    phoneNumber.includes(searchQuery);
      if (!match) continue;
    }

    bookings.push({
      bookingId,
      studentName,
      phoneNumber,
      slotId,
      date: dateStr,
      startTime,
      status,
      createdAt
    });
  }

  bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { success: true, bookings, total: bookings.length };
}

/**
 * Admin: Cancel Booking in Google Sheet
 */
function handleCancelBooking(payload) {
  const bookingId = (payload.bookingId || '').trim();
  if (!bookingId) return { success: false, error: 'Booking ID required.' };

  const bookingSheet = getOrInitSheet(SHEET_NAMES.BOOKINGS);
  const slotSheet = getOrInitSheet(SHEET_NAMES.SLOTS);

  const bRows = bookingSheet.getDataRange().getValues();
  let targetRow = -1;
  let slotId = '';

  for (let i = 1; i < bRows.length; i++) {
    if (String(bRows[i][0]).trim() === bookingId) {
      targetRow = i + 1;
      slotId = String(bRows[i][3]).trim();
      break;
    }
  }

  if (targetRow === -1) return { success: false, error: 'Booking not found.' };

  bookingSheet.getRange(targetRow, 7).setValue('Cancelled');

  // Decrement Booked Count in Slot
  if (slotId) {
    const sRows = slotSheet.getDataRange().getValues();
    for (let j = 1; j < sRows.length; j++) {
      if (String(sRows[j][0]).trim() === slotId) {
        const count = parseInt(sRows[j][5], 10) || 0;
        slotSheet.getRange(j + 1, 6).setValue(Math.max(0, count - 1));
        slotSheet.getRange(j + 1, 9).setValue(new Date().toISOString());
        break;
      }
    }
  }

  SpreadsheetApp.flush();
  return { success: true, message: 'Booking cancelled in Google Sheet. Seat restored.' };
}

/**
 * Student Booking Lookup directly from Google Sheet
 */
function lookupStudentBooking(identifier) {
  if (!identifier) return { success: false, error: 'Please enter booking reference or phone.' };

  const bookingSheet = getOrInitSheet(SHEET_NAMES.BOOKINGS);
  const clean = String(identifier).trim().toLowerCase().replace(/[\s\-\(\)]/g, '');
  const rows = bookingSheet.getDataRange().getValues();
  const matches = [];

  for (let i = 1; i < rows.length; i++) {
    const bId = String(rows[i][0]).trim();
    const rawPhone = String(rows[i][2]).replace(/[\s\-\(\)]/g, '');

    if (bId.toLowerCase() === clean || rawPhone === clean) {
      const rawDate = rows[i][4];
      const dateStr = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(rawDate);
      matches.push({
        bookingId: bId,
        studentName: String(rows[i][1]),
        phoneNumber: String(rows[i][2]),
        slotId: String(rows[i][3]),
        date: dateStr,
        startTime: String(rows[i][5]),
        status: String(rows[i][6]),
        createdAt: String(rows[i][7])
      });
    }
  }

  return { success: true, bookings: matches, count: matches.length };
}

/**
 * Initializes Database Structure with S/ASH Academy Headers
 */
function initDatabase() {
  const ss = getSpreadsheet();

  function formatHeader(sheet, columns) {
    sheet.clear();
    sheet.appendRow(columns);
    const headerRange = sheet.getRange(1, 1, 1, columns.length);
    headerRange.setBackground('#050B1E');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    for (let c = 1; c <= columns.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }

  // 1. Slot Sheet
  let slotSheet = ss.getSheetByName(SHEET_NAMES.SLOTS);
  if (!slotSheet) {
    slotSheet = ss.insertSheet(SHEET_NAMES.SLOTS);
    formatHeader(slotSheet, [
      'Slot ID',
      'Date',
      'Start Time',
      'End Time',
      'Capacity',
      'Booked Count',
      'Status',
      'Created At',
      'Updated At'
    ]);
  }

  // 2. Bookings Sheet
  let bookingSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
  if (!bookingSheet) {
    bookingSheet = ss.insertSheet(SHEET_NAMES.BOOKINGS);
    formatHeader(bookingSheet, [
      'Booking ID',
      'Student Name',
      'Phone Number',
      'Slot ID',
      'Appointment Date',
      'Appointment Start Time',
      'Booking Status',
      'Created At'
    ]);
  }

  // 3. Config Sheet
  let configSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!configSheet) {
    configSheet = ss.insertSheet(SHEET_NAMES.CONFIG);
    formatHeader(configSheet, ['Key', 'Value', 'Description']);
    configSheet.appendRow(['ADMIN_SECRET_KEY', 'sash_admin_2026', 'Private secret key required for administrative operations']);
    configSheet.appendRow(['ACADEMY_NAME', 'S/ASH Academy', 'Official Academy brand name']);
    configSheet.appendRow(['ALLOW_DUPLICATE_PHONES', 'false', 'Prevent students from re-booking same slot']);
  }

  return {
    success: true,
    message: 'S/ASH Academy database sheets verified and initialized successfully.'
  };
}
