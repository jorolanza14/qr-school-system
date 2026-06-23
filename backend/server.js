const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode'); // 🎯 FIXED: Top-level declaration forces Vercel to bundle the package
require('dotenv').config();

// Pull in our database connection pool reference
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================================================
// 🌐 GLOBAL CROSS-ORIGIN CONFIGURATION (CORS Security Override)
// =========================================================================
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 🌐 Baseline Health Route
app.get('/', (req, res) => {
  res.send('QR School Management Production Database API is running cleanly...');
});

// =========================================================================
// 🗓️ CENTRALIZED CAMPUS EVENTS & SEMINARS LEDGER 
// =========================================================================
let campusEvents = [
  { id: 1, title: 'BSIT Capstone Final Defense', date: '2026-06-15', time: '08:00 AM', location: 'IT Lab 3, Building B', organizer: 'Dean Office', desc: 'Final grading presentation loop for all 4th-year technology projects.' },
  { id: 2, title: 'Campus Sports Festival 2026', date: '2026-06-22', time: '01:00 PM', location: 'Grand Gymnasium', organizer: 'Student Council', desc: 'Annual inter-college athletic tournaments and opening ceremonies.' }
];

app.post('/api/admin/add-event', (req, res) => {
  const { title, date, time, location, desc, organizer } = req.body;
  if (!title || !date || !location) {
    return res.status(400).json({ success: false, message: "Required event fields missing." });
  }
  const eventRecord = {
    id: Date.now(),
    title,
    date,
    time: time || 'All Day',
    location,
    organizer: organizer || 'Admin Office',
    desc: desc || 'No additional details provided.'
  };
  campusEvents = [eventRecord, ...campusEvents];
  res.json({ success: true, message: 'Event broadcasted to centralized backend memory array!', list: campusEvents });
});

app.get('/api/student/events-list', (req, res) => {
  res.json({ success: true, list: campusEvents });
});

// =========================================================================
// 📁 CENTRALIZED ACADEMIC CLASSROOM RESOURCES MATRIX
// =========================================================================
let classroomResources = [
  { id: 1, title: 'Syllabus - Software Engineering 101', professor: 'Prof. Smith', type: 'PDF', fileSize: '1.4 MB', dateAdded: '2026-06-01', downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: 2, title: 'Database Schema Practice Worksheet', professor: 'Prof. Smith', type: 'DOCX', fileSize: '842 KB', dateAdded: '2026-06-04', downloadUrl: 'https://calibre-ebook.com/downloads/demos/demo.docx' }
];

app.get('/api/resources/list', (req, res) => {
  res.json({ success: true, resources: classroomResources });
});

app.post('/api/resources/upload', (req, res) => {
  const { title, professor, type, downloadUrl } = req.body;
  if (!title || !type || !downloadUrl) {
    return res.status(400).json({ success: false, message: "Required file resource parameters missing." });
  }
  const newResourceFile = {
    id: Date.now(),
    title: title.trim(),
    professor: professor || 'Faculty Member',
    type: type.toUpperCase(),
    fileSize: `${Math.floor(1 + Math.random() * 4)}.${Math.floor(1 + Math.random() * 9)} MB`,
    dateAdded: new Date().toISOString().split('T')[0],
    downloadUrl: downloadUrl.trim()
  };
  classroomResources = [newResourceFile, ...classroomResources];
  res.json({ success: true, message: "Document successfully dispatched to the student portals!", resources: classroomResources });
});

// =========================================================================
// 🔑 1. AUTHENTICATION ENDPOINTS (Login & Registration Ecosystem)
// =========================================================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }
    const user = rows[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: "Incorrect password selection." });
    }
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server authentication error." });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, studentId, section } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Missing required profile registration parameters." });
  }
  try {
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "This email address is already registered." });
    }

    const [userResult] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), password, role]
    );
    const newUserId = userResult.insertId;

    if (role === 'student') {
      if (!studentId || !section) {
        return res.status(400).json({ success: false, message: "Student accounts require an ID code and Section Block configuration." });
      }
      const cleanStudentToken = `STU-${studentId.trim().replace(/[^a-zA-Z0-9]/g, '')}`;
      await db.execute(
        'INSERT INTO students (user_id, student_id_number, section_block, qr_token_fingerprint, account_status) VALUES (?, ?, ?, ?, ?)',
        [newUserId, studentId.trim(), section.trim().toUpperCase(), cleanStudentToken, 'Clear']
      );
    }
    res.status(201).json({ success: true, message: `Account successfully provisioned for ${name}! Redirecting to console workspace...` });
  } catch (err) {
    console.error("Database registration insertion anomaly failure:", err);
    res.status(500).json({ success: false, message: "Internal server repository registration fault." });
  }
});

// =========================================================================
// 📱 2. SECURE STUDENT QR CARD ENDPOINT (Aggregates Active Library Book Loans)
// =========================================================================
app.get('/api/student/qr/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT s.student_id_number, s.section_block, s.qr_token_fingerprint, s.account_status, u.name,
             (SELECT COUNT(*) FROM library_books WHERE current_borrower_student_id = s.id) AS active_loans
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student record profile not found." });
    }
    const profile = rows[0];
    
    const qrDataUrl = await qrcode.toDataURL(profile.qr_token_fingerprint);

    res.json({
      success: true,
      qrCodeUrl: qrDataUrl,
      studentId: profile.student_id_number,
      section: profile.section_block,
      status: profile.account_status,
      name: profile.name,
      activeLoans: profile.active_loans
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error compiling database QR stream." });
  }
});

// =========================================================================
// 🛑 3. ADMIN CONTROL ENDPOINTS: TOGGLE ACCESS OVERRIDES & TELEMETRY
// =========================================================================
app.post('/api/admin/toggle-hold', async (req, res) => {
  const { token, newStatus } = req.body;
  
  // Accept standard or composite token representations securely
  const targetToken = token.startsWith('STU-') ? token : `STU-${token.trim()}`;
  try {
    const [result] = await db.execute(
      'UPDATE students SET account_status = ? WHERE qr_token_fingerprint = ? OR id = ?',
      [newStatus, targetToken, token.replace('STU-', '')]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Target student verification token failed." });
    }
    res.json({ success: true, message: `Student status successfully rewritten to ${newStatus}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database update transaction error." });
  }
});

// Admin Cocktail Telemetry loop computes global registration and swipe metrics live
app.get('/api/admin/system-telemetry', async (req, res) => {
  try {
    const [userRows] = await db.execute('SELECT COUNT(*) as total_users FROM users');
    const [swipeRows] = await db.execute('SELECT COUNT(*) as total_swipes FROM gate_attendance_logs');
    
    const [accountRows] = await db.execute(`
      SELECT u.id, u.name, u.email, u.role, 
             COALESCE(s.account_status, 'Clear') as status
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      ORDER BY u.id DESC
    `);

    res.json({
      success: true,
      telemetry: {
        totalUsers: userRows[0].total_users,
        totalSwipes: swipeRows[0].total_swipes
      },
      accounts: accountRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "System dashboard telemetry failure." });
  }
});

// =========================================================================
// 🗃️ FACULTY SUITE ROUTING PORTALS: ROSTER & DIRECTORY MATRICES
// =========================================================================
app.get('/api/admin/students-list', async (req, res) => {
  try {
    const query = `
      SELECT s.id, s.student_id_number, s.section_block, s.qr_token_fingerprint, s.account_status, u.name 
      FROM students s
      JOIN users u ON s.user_id = u.id
    `;
    const [rows] = await db.execute(query);
    res.json({ success: true, list: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Directory data acquisition fault." });
  }
});

app.get('/api/faculty/section/:sectionBlock', async (req, res) => {
  const { sectionBlock } = req.params;
  const upperSection = sectionBlock.trim().toUpperCase();
  try {
    const rosterQuery = `
      SELECT s.id, s.student_id_number, s.section_block, s.account_status, u.name, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE UPPER(s.section_block) = ?
    `;
    const [rosterRows] = await db.execute(rosterQuery, [upperSection]);

    const verifiedTodayQuery = `
      SELECT COUNT(DISTINCT l.student_id) as verified_today
      FROM gate_attendance_logs l
      JOIN students s ON l.student_id = s.id
      WHERE UPPER(s.section_block) = ? 
        AND l.terminal_status = 'ALLOWED'
        AND DATE(l.timestamp) = CURDATE()
        AND l.action_description LIKE 'Classroom Check-in%'
    `;
    const [verifiedRows] = await db.execute(verifiedTodayQuery, [upperSection]);

    const atRiskQuery = `
      SELECT COUNT(id) as at_risk FROM students 
      WHERE UPPER(section_block) = ? AND account_status = 'Hold'
    `;
    const [atRiskRows] = await db.execute(atRiskQuery, [upperSection]);

    const totalRoster = rosterRows.length;
    const verifiedToday = verifiedRows[0]?.verified_today || 0;
    const atRiskCount = atRiskRows[0]?.at_risk || 0;
    const performanceRate = totalRoster > 0 ? Math.round((verifiedToday / totalRoster) * 100) : 0;

    res.json({ 
      success: true, 
      list: rosterRows,
      metrics: { totalRoster, verifiedToday, atRiskCount, performanceRate }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Faculty tracking matrix compilation error." });
  }
});

app.post('/api/attendance/classroom-checkin', async (req, res) => {
  const { studentToken, lectureCode } = req.body;
  if (!studentToken || !lectureCode) {
    return res.status(400).json({ success: false, message: "Missing required tracking parameters." });
  }
  try {
    const [students] = await db.execute(
      'SELECT id, section_block FROM students WHERE qr_token_fingerprint = ? OR UPPER(student_id_number) = ?',
      [studentToken.trim(), studentToken.trim().toUpperCase()]
    );
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: "Student record authentication token mismatch." });
    }
    const student = students[0];

    await db.execute(
      'INSERT INTO gate_attendance_logs (student_id, terminal_status, action_description) VALUES (?, ?, ?)',
      [student.id, 'ALLOWED', `Classroom Check-in for Lecture Code: ${lectureCode.toUpperCase().trim()}`]
    );

    res.json({ success: true, message: "Check-in database entry recorded successfully!", section: student.section_block });
  } catch (err) {
    console.error("Database checkin log failure:", err);
    res.status(500).json({ success: false, message: "Internal repository insertion failure." });
  }
});

// =========================================================================
// 🛡️ 4. SECURITY TERMINAL ENDPOINT: SCAN GATE TERMINAL LOGS
// =========================================================================
app.post('/api/security/scan', async (req, res) => {
  const { qrToken } = req.body;
  try {
    const query = `
      SELECT s.id, s.student_id_number, s.account_status, u.name 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.qr_token_fingerprint = ?
    `;
    const [rows] = await db.execute(query, [qrToken]);
    if (rows.length === 0) {
      return res.json({ status: 'DENIED', name: 'Unknown User', id: 'N/A', log: 'Invalid authorization token fingerprint presented.' });
    }
    const student = rows[0];
    let accessStatus = 'ALLOWED';
    let systemLog = 'Gate Entrance Validation Confirmed.';

    if (student.account_status === 'Hold') {
      accessStatus = 'DENIED';
      systemLog = 'Access Rejected: Outstanding system restriction or account hold active.';
    }

    await db.execute(
      'INSERT INTO gate_attendance_logs (student_id, terminal_status, action_description) VALUES (?, ?, ?)',
      [student.id, accessStatus, systemLog]
    );

    res.json({ status: accessStatus, name: student.name, id: student.student_id_number, log: systemLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Security terminal logging error." });
  }
});

// =========================================================================
// 📚 5. LIBRARIAN ENDPOINTS: REAL-TIME SECURE DATABASE INTEGRATION
// =========================================================================
app.get('/api/library/books', async (req, res) => {
  try {
    const query = `
      SELECT b.book_barcode_id, b.title, b.author, b.availability_status, u.name AS borrowed_by
      FROM library_books b
      LEFT JOIN students s ON b.current_borrower_student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
    `;
    const [rows] = await db.execute(query);
    
    const catalogLedger = {};
    rows.forEach(book => {
      catalogLedger[book.book_barcode_id] = {
        title: book.title,
        author: book.author,
        status: book.availability_status === 'Borrowed' ? 'Borrowed' : 'Available',
        borrowedBy: book.borrowed_by
      };
    });
    
    return res.json({ success: true, inventory: catalogLedger });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed fetching library records." });
  }
});

app.post('/api/library/add-book', async (req, res) => {
  const { barcode, title, author } = req.body;
  if (!barcode || !title) {
    return res.status(400).json({ success: false, message: "Required parameters missing." });
  }
  const cleanBarcode = barcode.toUpperCase().trim();
  try {
    const [existing] = await db.execute('SELECT id FROM library_books WHERE book_barcode_id = ?', [cleanBarcode]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Barcode asset already cataloged." });
    }

    await db.execute(
      'INSERT INTO library_books (book_barcode_id, title, author, availability_status) VALUES (?, ?, ?, "Available")',
      [cleanBarcode, title.trim(), author ? author.trim() : 'Unknown Author']
    );

    const [freshRows] = await db.execute(`
      SELECT b.book_barcode_id, b.title, b.author, b.availability_status, u.name AS borrowed_by
      FROM library_books b
      LEFT JOIN students s ON b.current_borrower_student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
    `);
    
    const catalogLedger = {};
    freshRows.forEach(book => {
      catalogLedger[book.book_barcode_id] = {
        title: book.title,
        author: book.author,
        status: book.availability_status === 'Borrowed' ? 'Borrowed' : 'Available',
        borrowedBy: book.borrowed_by
      };
    });

    res.json({ success: true, message: `Asset registered successfully!`, inventory: catalogLedger });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Library writing transaction fault." });
  }
});

app.post('/api/library/checkout', async (req, res) => {
  const { studentToken, manualBookTitle } = req.body;
  if (!manualBookTitle || manualBookTitle.trim() === '') {
    return res.status(400).json({ success: false, message: "Please specify the book title being borrowed." });
  }
  try {
    const [students] = await db.execute(`
      SELECT s.id, u.name FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.qr_token_fingerprint = ? OR s.student_id_number = ?
    `, [studentToken.trim(), studentToken.trim()]);
    
    if (students.length === 0) return res.status(404).json({ success: false, message: "Scanned student authorization pass token is invalid." });
    const student = students[0];

    const [books] = await db.execute(
      'SELECT book_barcode_id FROM library_books WHERE UPPER(title) = ? AND availability_status = "Available" LIMIT 1',
      [manualBookTitle.trim().toUpperCase()]
    );

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: "No available instances found matching that book title." });
    }

    const targetBarcode = books[0].book_barcode_id;

    await db.execute(
      'UPDATE library_books SET availability_status = "Borrowed", current_borrower_student_id = ? WHERE book_barcode_id = ?',
      [student.id, targetBarcode]
    );

    res.json({ success: true, message: `Successfully checked out to student account ${student.name}!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Library engine checkout transaction fault." });
  }
});

// =========================================================================
// 🔍 6. CAMPUS LOST & FOUND INTEGRATED ASSET MATRIX (🎯 DYNAMIC PERSISTENCE)
// =========================================================================
app.get('/api/lost-found/list', async (req, res) => {
  try {
    // 🎯 FIXED: Stripped volatile backend date format wrappers to prevent runtime string escape faults
    const query = `
      SELECT id, item_name, category_classification, location_found, descriptive_details, tracking_tag_id, item_status, logged_at
      FROM lost_and_found_items 
      ORDER BY logged_at DESC
    `;
    const [rows] = await db.execute(query);
    res.json({ success: true, list: rows });
  } catch (err) {
    console.error("Error compiling campus property indexes:", err);
    res.status(500).json({ success: false, message: "Error compiling campus property indexes." });
  }
});

app.post('/api/lost-found/report', async (req, res) => {
  try {
    const { itemName, category, location, details } = req.body;
    
    if (!itemName || !location) {
      return res.status(400).json({ success: false, message: "Required reporting descriptors missing." });
    }

    // Safe fallback formatting for clean tracking tags
    const cleanPrefix = (itemName || "ITEM").replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || "ITEM";
    const uniqueCode = `LNF-ITEM-${cleanPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const safeDetails = details && details.trim() !== "" ? details.trim() : "No additional details provided.";
    const safeCategory = category || "Other Accessories";

    await db.execute(
      'INSERT INTO lost_and_found_items (item_name, category_classification, location_found, descriptive_details, tracking_tag_id) VALUES (?, ?, ?, ?, ?)',
      [itemName.trim(), safeCategory, location.trim(), safeDetails, uniqueCode]
    );
    
    // 🎯 FIXED: Clean return selection query allows data payloads to map out natively on client screens
    const [freshRows] = await db.execute(`
      SELECT id, item_name, category_classification, location_found, descriptive_details, tracking_tag_id, item_status, logged_at
      FROM lost_and_found_items 
      ORDER BY logged_at DESC
    `);
    
    res.json({ success: true, message: "Asset registered to persistent cloud index tables!", list: freshRows });
  } catch (err) {
    console.error("CRITICAL LOST AND FOUND SAVE FAULT:", err);
    res.status(500).json({ success: false, message: "Failed writing tracking entry records.", error: err.message });
  }
});

app.post('/api/lost-found/toggle-claim', async (req, res) => {
  const { itemId, nextStatus } = req.body;
  try {
    await db.execute('UPDATE lost_and_found_items SET item_status = ? WHERE id = ?', [nextStatus, itemId]);
    res.json({ success: true, message: `Asset record status rewritten to ${nextStatus.toUpperCase()}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database update transaction error." });
  }
});

// =========================================================================
// 🌐 STANDARD CLOUD SERVER INITIATION BLOCK
// =========================================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[CORE] Local Backend active on network port: ${PORT}`);
  });
}

module.exports = app;