const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Pull in our database connection pool reference
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================================================
// 🌐 GLOBAL CROSS-ORIGIN CONFIGURATION (CORS Security Override)
// =========================================================================
// Allows your Vercel frontend link to break through production security gates smoothly
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
// 🗓️ CENTRALIZED CAMPUS EVENTS & SEMINARS LEDGER (Cross-Browser Fix)
// =========================================================================

// Global In-Memory Events Ledger Array (Initial state fallback seeds)
let campusEvents = [
  { id: 1, title: 'BSIT Capstone Final Defense', date: '2026-06-15', time: '08:00 AM', location: 'IT Lab 3, Building B', organizer: 'Dean Office', desc: 'Final grading presentation loop for all 4th-year technology projects.' },
  { id: 2, title: 'Campus Sports Festival 2026', date: '2026-06-22', time: '01:00 PM', location: 'Grand Gymnasium', organizer: 'Student Council', desc: 'Annual inter-college athletic tournaments and opening ceremonies.' }
];

// 🚀 Admin posts a brand-new event notice record to the centralized server ledger
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

// 📡 Students pull the complete, synchronized campus events list live
app.get('/api/student/events-list', (req, res) => {
  res.json({ success: true, list: campusEvents });
});


// =========================================================================
// 📚 CENTRALIZED IN-MEMORY LIBRARY STATE LEDGER (Persistent Across Tab Swaps)
// =========================================================================

let dynamicLibraryCatalog = {
  "BK-FULLSTACK-01": { title: "Full-Stack Software Architecture", author: "Enzo Rolando", status: "Available", borrowedBy: null },
  "BK-NETWORKS-02": { title: "Cisco Routing Foundations", author: "Dr. A. Cruz", status: "Available", borrowedBy: null }
};

// 🆕 Librarian registers a brand new asset row permanently to server state
app.post('/api/library/add-book', (req, res) => {
  const { barcode, title, author } = req.body;

  if (!barcode || !title) {
    return res.status(400).json({ success: false, message: "Required asset parameters missing (Barcode/Title)." });
  }

  const cleanBarcode = barcode.toUpperCase().trim();

  if (dynamicLibraryCatalog[cleanBarcode]) {
    return res.status(400).json({ success: false, message: "This asset barcode identifier is already registered." });
  }

  dynamicLibraryCatalog[cleanBarcode] = {
    title: title.trim(),
    author: author ? author.trim() : 'Unknown Author',
    status: 'Available',
    borrowedBy: null
  };

  res.json({ 
    success: true, 
    message: `Asset successfully cataloged under tag ${cleanBarcode}!`,
    inventory: dynamicLibraryCatalog 
  });
});


// =========================================================================
// 📁 CENTRALIZED ACADEMIC CLASSROOM RESOURCES MATRIX
// =========================================================================

let classroomResources = [
  {
    id: 1,
    title: 'Syllabus - Software Engineering 101',
    professor: 'Prof. Smith',
    type: 'PDF',
    fileSize: '1.4 MB',
    dateAdded: '2026-06-01',
    downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 2,
    title: 'Database Schema Practice Worksheet',
    professor: 'Prof. Smith',
    type: 'DOCX',
    fileSize: '842 KB',
    dateAdded: '2026-06-04',
    downloadUrl: 'https://calibre-ebook.com/downloads/demos/demo.docx'
  }
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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

    res.status(201).json({ 
      success: true, 
      message: `Account successfully provisioned for ${name}! Redirecting to console workspace...` 
    });

  } catch (err) {
    console.error("Database registration insertion anomaly failure:", err);
    res.status(500).json({ success: false, message: "Internal server repository registration fault." });
  }
});


// =========================================================================
// 📱 2. SECURE STUDENT QR CARD ENDPOINT (Joins Users & Students Tables)
// =========================================================================
app.get('/api/student/qr/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT s.student_id_number, s.section_block, s.qr_token_fingerprint, s.account_status, u.name 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student record profile not found." });
    }

    const profile = rows[0];
    const qrDataUrl = await require('qrcode').toDataURL(profile.qr_token_fingerprint);

    res.json({
      success: true,
      qrCodeUrl: qrDataUrl,
      studentId: profile.student_id_number,
      section: profile.section_block,
      status: profile.account_status,
      name: profile.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error compiling database QR stream." });
  }
});

// =========================================================================
// 🛑 3. ADMIN CONTROL ENDPOINT: TOGGLE ACCOUNT RESTRICTIONS
// =========================================================================
app.post('/api/admin/toggle-hold', async (req, res) => {
  const { token, newStatus } = req.body;
  
  try {
    const [result] = await db.execute(
      'UPDATE students SET account_status = ? WHERE qr_token_fingerprint = ?',
      [newStatus, token]
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

// =========================================================================
// 🗃️ ADMIN VIEW: FETCH ENTIRE REGISTERED STUDENT DIRECTORY
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

// =========================================================================
// 🛡️ 4. SECURITY TERMINAL ENDPOINT: SCAN GATE & WRITE ENTRY PERMANENT LOGS
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
      return res.json({ 
        status: 'DENIED', name: 'Unknown User', id: 'N/A', log: 'Invalid authorization token fingerprint presented.' 
      });
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

    res.json({
      status: accessStatus,
      name: student.name,
      id: student.student_id_number,
      log: systemLog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Security terminal logging error." });
  }
});

// =========================================================================
// 📚 5. LIBRARIAN ENDPOINTS: MANAGING BORROW TRANSACTIONS
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
    
    const catalog = { ...dynamicLibraryCatalog };
    
    rows.forEach(book => {
      if (!catalog[book.book_barcode_id]) {
        catalog[book.book_barcode_id] = {
          title: book.title,
          author: book.author,
          status: book.availability_status,
          borrowedBy: book.borrowed_by
        };
      }
    });

    // 🟢 Dispatches database state catalog payload cleanly back to UI components
    return res.json({ success: true, inventory: catalog });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed fetching library records." });
  }
});

app.post('/api/library/checkout', async (req, res) => {
  const { studentToken, manualBookTitle } = req.body;

  if (!manualBookTitle || manualBookTitle.trim() === '') {
    return res.status(400).json({ success: false, message: "Please specify the book title being borrowed." });
  }

  try {
    const [students] = await db.execute(`
      SELECT s.id, u.name 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.qr_token_fingerprint = ?
    `, [studentToken]);
    
    if (students.length === 0) return res.status(404).json({ success: false, message: "Scanned student authorization pass token is invalid." });
    const student = students[0];

    const dynamicTransactionKey = `BK-LOAN-${Math.floor(10000 + Math.random() * 90000)}`;

    dynamicLibraryCatalog[dynamicTransactionKey] = {
      title: manualBookTitle.trim(),
      author: "Circulation Desk Entry",
      status: 'Borrowed',
      borrowedBy: student.name
    };

    res.json({ 
      success: true, 
      message: `Successfully checked out "${manualBookTitle}" to student account ${student.name}!`, 
      inventory: dynamicLibraryCatalog 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Library engine transaction fault." });
  }
});

// =========================================================================
// 🌐 STANDARD CLOUD SERVER INITIATION BLOCK
// =========================================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CORE] Local Backend active on network port: ${PORT}`);
  });
}

// Export the express engine wrapped as a Vercel Serverless Function
const serverless = require('serverless-http');
module.exports = app;
module.exports = serverless(app);