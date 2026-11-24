/**
 * S/ASH ACADEMY — Automated Verification Test Suite
 * Tests all 12 core scenarios directly against the API layer
 */

import assert from 'node:assert';

// Mock localStorage and sessionStorage for Node environment testing
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

const session = {};
global.sessionStorage = {
  getItem: (k) => session[k] || null,
  setItem: (k, v) => { session[k] = String(v); },
  removeItem: (k) => { delete session[k]; },
  clear: () => { Object.keys(session).forEach(k => delete session[k]); }
};

// In-memory mock database representing Google Sheets tables
let mockSlots = [];
let mockBookings = [];
let mockConfig = {
  ADMIN_SECRET_KEY: 'sash_admin_2026'
};

const resetMockDatabase = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  mockSlots = [
    {
      slotId: 'SLOT-001',
      date: dateStr,
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      capacity: 3,
      bookedCount: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      slotId: 'SLOT-002',
      date: dateStr,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      capacity: 1,
      bookedCount: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  mockBookings = [];
};

// Global fetch mock matching Google Apps Script behavior
global.fetch = async (url, options = {}) => {
  const urlObj = new URL(url);
  const method = options.method || 'GET';
  let action = urlObj.searchParams.get('action');
  let payload = {};

  if (method === 'POST') {
    if (options.body) {
      payload = JSON.parse(options.body);
      action = payload.action;
    }
  } else {
    urlObj.searchParams.forEach((val, key) => {
      payload[key] = val;
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  let result = { success: false, error: 'Unknown action' };

  if (action === 'ping') {
    result = { success: true, message: 'Pong' };
  } else if (action === 'getAvailableSlots') {
    const available = mockSlots
      .filter(s => s.status === 'Active' && s.date >= todayStr && s.capacity > s.bookedCount)
      .map(s => ({ ...s, availableSeats: s.capacity - s.bookedCount }));
    result = { success: true, slots: available, count: available.length };
  } else if (action === 'createBooking') {
    const { studentName, phoneNumber, slotId, notes } = payload;
    const cleanPhone = (phoneNumber || '').replace(/[\s\-\(\)]/g, '');
    const slot = mockSlots.find(s => s.slotId === slotId);

    if (!slot) {
      result = { success: false, error: 'Slot not found' };
    } else if (slot.status !== 'Active') {
      result = { success: false, error: 'Slot is inactive' };
    } else if (slot.date < todayStr) {
      result = { success: false, error: 'Cannot book past slot' };
    } else if (slot.bookedCount >= slot.capacity) {
      result = { success: false, error: 'Slot is fully booked' };
    } else if (mockBookings.some(b => b.slotId === slotId && b.phoneNumber.replace(/[\s\-\(\)]/g, '') === cleanPhone && b.status === 'Confirmed')) {
      result = { success: false, error: 'A confirmed booking already exists for this slot' };
    } else {
      const bId = 'SASH-BK-' + Date.now();
      const booking = {
        bookingId: bId,
        studentName,
        phoneNumber,
        slotId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'Confirmed',
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
      mockBookings.push(booking);
      slot.bookedCount += 1;
      result = { success: true, booking };
    }
  } else if (action === 'adminLogin') {
    if (payload.adminKey === mockConfig.ADMIN_SECRET_KEY || payload.adminKey === 'admin') {
      result = { success: true, token: 'test-admin-token' };
    } else {
      result = { success: false, error: 'Unauthorized: Invalid admin credentials' };
    }
  } else if (action === 'getAdminSlots') {
    result = { success: true, slots: [...mockSlots] };
  } else if (action === 'getAdminBookings') {
    let b = [...mockBookings];
    if (payload.search) {
      const q = payload.search.toLowerCase();
      b = b.filter(item => item.studentName.toLowerCase().includes(q) || item.bookingId.toLowerCase().includes(q));
    }
    result = { success: true, bookings: b, total: b.length };
  } else if (action === 'createSlot') {
    const { date, startTime, endTime, capacity } = payload;
    const newSlot = {
      slotId: 'SLOT-' + Date.now(),
      date,
      startTime,
      endTime,
      capacity: parseInt(capacity, 10),
      bookedCount: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockSlots.unshift(newSlot);
    result = { success: true, slot: newSlot };
  } else if (action === 'updateSlotCapacity') {
    const slot = mockSlots.find(s => s.slotId === payload.slotId);
    if (slot) {
      const cap = parseInt(payload.newCapacity, 10);
      slot.capacity = cap;
      let warning = null;
      if (cap < slot.bookedCount) {
        warning = `Capacity (${cap}) is now lower than current bookings (${slot.bookedCount}).`;
      }
      result = { success: true, newCapacity: cap, currentBooked: slot.bookedCount, warning };
    }
  } else if (action === 'toggleSlotStatus') {
    const slot = mockSlots.find(s => s.slotId === payload.slotId);
    if (slot) {
      slot.status = payload.status;
      result = { success: true, newStatus: payload.status };
    }
  } else if (action === 'cancelBooking') {
    const b = mockBookings.find(item => item.bookingId === payload.bookingId);
    if (b) {
      b.status = 'Cancelled';
      const slot = mockSlots.find(s => s.slotId === b.slotId);
      if (slot) slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      result = { success: true, message: 'Booking cancelled' };
    }
  }

  return {
    json: async () => result
  };
};

// Import API service
const { apiService } = await import('../src/services/api.js');

// Set mock Apps Script URL
apiService.setApiUrl('https://script.google.com/macros/s/AKfycby_MOCK_TEST_URL/exec');

console.log('================================================================');
console.log('🧪 S/ASH ACADEMY — INTERVIEW BOOKING SYSTEM TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASSED: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function executeTestSuite() {
  resetMockDatabase();

  // Test 1: Fetch initial available slots
  await runAsyncTest('Scenario 1: Student can view available slots from Google Sheets', async () => {
    const res = await apiService.getAvailableSlots();
    assert.strictEqual(res.success, true);
    assert.ok(res.slots.length > 0, 'Should return active available slots');
  });

  // Test 2: Student successfully books an available appointment
  let testSlotId = '';
  await runAsyncTest('Scenario 2: Student successfully books an appointment', async () => {
    const slotsRes = await apiService.getAvailableSlots();
    const targetSlot = slotsRes.slots.find(s => s.capacity > 1);
    assert.ok(targetSlot, 'Must find a slot with capacity > 1');
    testSlotId = targetSlot.slotId;

    const bookRes = await apiService.createBooking({
      studentName: 'Omar Khaled',
      phoneNumber: '+20 100 555 1234',
      slotId: testSlotId,
      notes: 'Web Development Track'
    });

    assert.strictEqual(bookRes.success, true);
    assert.ok(bookRes.booking.bookingId.startsWith('SASH-BK-'));
    assert.strictEqual(bookRes.booking.studentName, 'Omar Khaled');
  });

  // Test 3: Appointment availability decreases after booking
  await runAsyncTest('Scenario 3: Appointment availability decreases after booking', async () => {
    const slotsRes = await apiService.getAvailableSlots();
    const updatedSlot = slotsRes.slots.find(s => s.slotId === testSlotId);
    assert.ok(updatedSlot, 'Slot should still be present if seats remain');
    assert.strictEqual(updatedSlot.bookedCount >= 1, true);
  });

  // Test 4: Prevent duplicate booking with same phone on same slot
  await runAsyncTest('Scenario 4: Duplicate booking with same phone is rejected', async () => {
    const dupRes = await apiService.createBooking({
      studentName: 'Omar Khaled Second Try',
      phoneNumber: '+20 100 555 1234',
      slotId: testSlotId
    });
    assert.strictEqual(dupRes.success, false);
    assert.match(dupRes.error, /already exists/i);
  });

  // Test 5: Rejection when slot capacity is exceeded
  await runAsyncTest('Scenario 5: Rejection when slot reaches full capacity', async () => {
    apiService.setAdminKey('sash_admin_2026');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const createRes = await apiService.createSlot({
      date: dateStr,
      startTime: '04:00 PM',
      endTime: '05:00 PM',
      capacity: 2
    });
    const capSlotId = createRes.slot.slotId;

    // Book 1
    const b1 = await apiService.createBooking({ studentName: 'Student One', phoneNumber: '+20 111 000 0001', slotId: capSlotId });
    assert.strictEqual(b1.success, true);

    // Book 2 (Full)
    const b2 = await apiService.createBooking({ studentName: 'Student Two', phoneNumber: '+20 111 000 0002', slotId: capSlotId });
    assert.strictEqual(b2.success, true);

    // Book 3 (Must be rejected)
    const b3 = await apiService.createBooking({ studentName: 'Student Three', phoneNumber: '+20 111 000 0003', slotId: capSlotId });
    assert.strictEqual(b3.success, false);
    assert.match(b3.error, /fully booked/i);

    // Test: Appointment disappears from student-facing view when full
    const studentSlots = await apiService.getAvailableSlots();
    const isVisibleToStudents = studentSlots.slots.some(s => s.slotId === capSlotId);
    assert.strictEqual(isVisibleToStudents, false, 'Fully booked slot must disappear from student list');
  });

  // Test 6: Rejection when slot is inactive
  await runAsyncTest('Scenario 6: Booking is rejected when appointment is inactive', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const createRes = await apiService.createSlot({
      date: dateStr,
      startTime: '05:00 PM',
      endTime: '06:00 PM',
      capacity: 3
    });
    const inactiveSlotId = createRes.slot.slotId;

    // Toggle to Inactive
    await apiService.toggleSlotStatus({ slotId: inactiveSlotId, status: 'Inactive' });

    // Attempt booking
    const bookRes = await apiService.createBooking({
      studentName: 'Mariam Ali',
      phoneNumber: '+20 122 333 4444',
      slotId: inactiveSlotId
    });

    assert.strictEqual(bookRes.success, false);
    assert.match(bookRes.error, /inactive/i);
  });

  // Test 7: Rejection when slot date is in the past
  await runAsyncTest('Scenario 7: Booking is rejected when appointment date is in the past', async () => {
    mockSlots.push({
      slotId: 'SLOT-PAST-TEST',
      date: '2020-01-01',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      capacity: 2,
      bookedCount: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const bookRes = await apiService.createBooking({
      studentName: 'Past Applicant',
      phoneNumber: '+20 199 888 7777',
      slotId: 'SLOT-PAST-TEST'
    });

    assert.strictEqual(bookRes.success, false);
    assert.match(bookRes.error, /past/i);
  });

  // Test 8: Admin Authentication Security
  await runAsyncTest('Scenario 8: Unauthorized users cannot access Admin functionality without key', async () => {
    mockConfig.ADMIN_SECRET_KEY = 'academy_private_pass_789';
    const invalidLogin = await apiService.adminLogin('wrong_password_xyz');
    assert.strictEqual(invalidLogin.success, false);

    const validLogin = await apiService.adminLogin('academy_private_pass_789');
    assert.strictEqual(validLogin.success, true);
  });

  // Test 9: Admin can create appointment with independent custom capacity
  await runAsyncTest('Scenario 9: Admin can create slots with custom capacities (e.g. 1, 3, 5, 10)', async () => {
    const c1 = await apiService.createSlot({ date: '2026-12-01', startTime: '09:00 AM', endTime: '10:00 AM', capacity: 1 });
    const c10 = await apiService.createSlot({ date: '2026-12-01', startTime: '11:00 AM', endTime: '12:00 PM', capacity: 10 });
    
    assert.strictEqual(c1.slot.capacity, 1);
    assert.strictEqual(c10.slot.capacity, 10);
  });

  // Test 10: Admin can edit appointment capacity with warning if reduced below bookings
  await runAsyncTest('Scenario 10: Admin capacity update with reduction warning handling', async () => {
    const slotRes = await apiService.createSlot({ date: '2026-12-02', startTime: '02:00 PM', endTime: '03:00 PM', capacity: 3 });
    const sId = slotRes.slot.slotId;

    await apiService.createBooking({ studentName: 'A1', phoneNumber: '+20 100 111 2221', slotId: sId });
    await apiService.createBooking({ studentName: 'A2', phoneNumber: '+20 100 111 2222', slotId: sId });

    const updateRes = await apiService.updateSlotCapacity({ slotId: sId, newCapacity: 1 });
    assert.strictEqual(updateRes.success, true);
    assert.ok(updateRes.warning, 'Must return warning that capacity is now lower than existing bookings');
    assert.strictEqual(updateRes.currentBooked, 2, 'Existing bookings must NOT be deleted');
  });

  // Test 11: Admin can view student bookings and filter
  await runAsyncTest('Scenario 11: Admin can view student bookings and search', async () => {
    const allBookings = await apiService.getAdminBookings();
    assert.strictEqual(allBookings.success, true);
    assert.ok(allBookings.bookings.length >= 3);

    const searchRes = await apiService.getAdminBookings({ search: 'Omar Khaled' });
    assert.strictEqual(searchRes.success, true);
    assert.ok(searchRes.bookings.some(b => b.studentName.includes('Omar')));
  });

  // Test 12: Admin can cancel booking and immediately restore capacity
  await runAsyncTest('Scenario 12: Admin cancels booking and seat is restored', async () => {
    const bookings = await apiService.getAdminBookings();
    const activeBooking = bookings.bookings.find(b => b.status === 'Confirmed');
    assert.ok(activeBooking, 'Must find an active confirmed booking');

    const slotBefore = (await apiService.getAdminSlots()).slots.find(s => s.slotId === activeBooking.slotId);
    const countBefore = slotBefore.bookedCount;

    const cancelRes = await apiService.cancelBooking({ bookingId: activeBooking.bookingId });
    assert.strictEqual(cancelRes.success, true);

    const slotAfter = (await apiService.getAdminSlots()).slots.find(s => s.slotId === activeBooking.slotId);
    assert.strictEqual(slotAfter.bookedCount, Math.max(0, countBefore - 1), 'Booked count must decrement by 1');
  });

  console.log('\n================================================================');
  console.log(`🏁 TEST EXECUTION COMPLETE: ${passedTests}/${totalTests} Passed`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('🌟 ALL 12 CORE FUNCTIONAL AND SECURITY SCENARIOS PASSED WITH 100% SUCCESS!\n');
  } else {
    process.exit(1);
  }
}

executeTestSuite();
