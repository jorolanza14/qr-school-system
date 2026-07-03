const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode'); // 🎯 Top-level declaration forces Vercel to bundle the package
const nodemailer = require('nodemailer'); // 🎯 Required to route emails to real inboxes or Yopmail
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

// Set up the secure email transmission transporter using secret environment keys
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🌐 Baseline Health Route
app.get('/', (req, res) => {
  res.send('QR School Management Production Database API is running cleanly...');
});

// =========================================================================
// 🔑 AUTHENTICATION & DATABASE-BACKED OTP VERIFICATION SYSTEM
// =========================================================================

// STEP A: Validate inputs, generate code, and save to DB
app.post('/api/auth/request-otp', async (req, res) => {
  const { name, email, password, role, studentId, section } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Missing required profile parameters." });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // Check if the user already exists in the real MySQL table first
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "This email address is already registered." });
    }

    // Generate a clean random 6-digit number string
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 30 * 60 * 1000; // 🎯 UPDATED: Extended to 30 minutes for presentation safety

    // Save or replace the verification session entry directly inside MySQL database disk rows
    await db.execute(`
      INSERT INTO temporary_otp_verifications (email, name, password_hash, role, student_id_number, section_block, otp_code, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role),
        student_id_number = VALUES(student_id_number), section_block = VALUES(section_block),
        otp_code = VALUES(otp_code), expires_at = VALUES(expires_at)
    `, [cleanEmail, name.trim(), password, role, studentId ? studentId.trim() : null, section ? section.trim() : null, otpCode, expiresAt]);

    // Dispatch the actual email payload to the user
    const mailOptions = {
      from: `"QR School System" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: '🏫 Verification Pass Code - QR School Management Portal',
      html: `
        <div style="font-family: sans-serif; padding: 30px; background-color: #0f172a; color: #f1f5f9; border-radius: 12px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #8b5cf6; text-align: center; font-size: 22px; margin-bottom: 20px;">Account Verification</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">You are receiving this code because you are registering an account into the QR Campus Management System.</p>
          <div style="background-color: #1e293b; padding: 20px; text-align: center; border-radius: 8px; border: 1px solid #334155; margin: 25px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #4ade80;">${otpCode}</span>
          </div>
          <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 15px;">
            This verification string expires in 30 minutes. If you did not initiate this request, you can safely ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Verification pass code dispatched to your registered inbox!" });

  } catch (err) {
    console.error("OTP TRANSMISSION FAULT:", err);
    return res.status(500).json({ success: false, message: "Failed dispatching verification email." });
  }
});

// STEP B: Confirm the code (or master bypass code) from DB and save to users table
app.post('/api/auth/register', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Missing tracking verification arguments." });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // Pull the session record from the persistent database table
    const [rows] = await db.execute('SELECT * FROM temporary_otp_verifications WHERE email = ?', [cleanEmail]);
    
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Verification session expired or missing request fields." });
    }

    const cachedRecord = rows[0];

    if (Date.now() > cachedRecord.expires_at) {
      await db.execute('DELETE FROM temporary_otp_verifications WHERE email = ?', [cleanEmail]);
      return res.status(400).json({ success: false, message: "Verification token code has expired. Please try again." });
    }

    // Checks for the authentic sent OTP *OR* our emergency capstone defense code '999999'
    if (cachedRecord.otp_code !== code.trim() && code.trim() !== '999999') {
      return res.status(401).json({ success: false, message: "Incorrect security verification token pin input." });
    }

    // Verification passed! Commit records cleanly to active MySQL rows
    const [userResult] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [cachedRecord.name, cleanEmail, cachedRecord.password_hash, cachedRecord.role]
    );
    const newUserId = userResult.insertId;

    if (cachedRecord.role === 'student') {
      if (!cachedRecord.student_id_number || !cachedRecord.section_block) {
        return res.status(400).json({ success: false, message: "Student accounts require an ID and Section config." });
      }
      const cleanStudentToken = `STU-${cachedRecord.student_id_number.trim().replace(/[^a-zA-Z0-9]/g, '')}`;
      await db.execute(
        'INSERT INTO students (user_id, student_id_number, section_block, qr_token_fingerprint, account_status) VALUES (?, ?, ?, ?, ?)',
        [newUserId, cachedRecord.student_id_number, cachedRecord.section_block.toUpperCase(), cleanStudentToken, 'Clear']
      );
    }

    // Clean up the temporary verification table record completely
    await db.execute('DELETE FROM temporary_otp_verifications WHERE email = ?', [cleanEmail]);
    
    return res.status(201).json({ success: true, message: `Account successfully provisioned for ${cachedRecord.name}!` });
  } catch (err) {
    console.error("Database registration insertion anomaly failure:", err);
    return res.status(500).json({ success: false, message: "Internal server repository registration fault." });
  }
});

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

// =========================================================================
// 📁 CENTRALIZED ACADEMIC CLASSROOM RESOURCES MATRIX (🎯 DATABASE PERSISTENT FIXED)
// =========================================================================
app.get('/api/resources/list', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, title, professor_name as professor, file_type as type, file_size as fileSize, 
             DATE_FORMAT(date_added, "%Y-%m-%d") as dateAdded, download_url as downloadUrl 
      FROM classroom_courseware 
      ORDER BY id DESC
    `);
    res.json({ success: true, resources: rows });
  } catch (err) {
    console.error("COURSEWARE FETCH FAULT:", err);
    res.status(500).json({ success: false, message: "Failed fetching database courseware indices." });
  }
});

app.post('/api/resources/upload', async (req, res) => {
  const { title, professor, type, downloadUrl } = req.body;
  if (!title || !type || !downloadUrl) {
    return res.status(400).json({ success: false, message: "Required file resource parameters missing." });
  }
  
  const computedSize = `${Math.floor(1 + Math.random() * 4)}.${Math.floor(1 + Math.random() * 9)} MB`;
  const currentDateStamp = new Date().toISOString().split('T')[0];

  try {
    await db.execute(
      'INSERT INTO classroom_courseware (title, professor_name, file_type, file_size, download_url, date_added) VALUES (?, ?, ?, ?, ?, ?)',
      [title.trim(), professor || 'Faculty Member', type.toUpperCase(), computedSize, downloadUrl.trim(), currentDateStamp]
    );

    const [freshRows] = await db.execute(`
      SELECT id, title, professor_name as professor, file_type as type, file_size as fileSize, 
             DATE_FORMAT(date_added, "%Y-%m-%d") as dateAdded, download_url as downloadUrl 
      FROM classroom_courseware 
      ORDER BY id DESC
    `);

    res.json({ success: true, message: "Document successfully dispatched to the student portals!", resources: freshRows });
  } catch (err) {
    console.error("COURSEWARE UPLOAD FAULT:", err);
    res.status(500).json({ success: false, message: "Database failure saving published asset records." });
  }
});

// =========================================================================
// 📱 2. SECURE STUDENT QR CARD ENDPOINT (🎯 METRICS CALCULATION FIXED)
// =========================================================================
app.get('/api/student/qr/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const profileQuery = `
      SELECT s.id AS student_table_id, s.student_id_number, s.section_block, s.qr_token_fingerprint, s.account_status, u.name,
             (SELECT COUNT(*) FROM library_books WHERE current_borrower_student_id = s.id) AS active_loans
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
    `;
    const [profileRows] = await db.execute(profileQuery, [userId]);
    if (profileRows.length === 0) {
      return res.status(404).json({ success: false, message: "Student record profile not found." });
    }
    const profile = profileRows[0];

    // Compute dynamic attendance rates based on real database entries for this student
    const attendanceQuery = `
      SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN terminal_status = 'ALLOWED' THEN 1 ELSE 0 END) as present_logs
      FROM gate_attendance_logs 
      WHERE student_id = ?
    `;
    const [attendanceRows] = await db.execute(attendanceQuery, [profile.student_table_id]);
    
    const totalLogs = attendanceRows[0]?.total_logs || 0;
    const presentLogs = attendanceRows[0]?.present_logs || 0;
    
    // 🎯 FIXED: Evaluates directly to 0 if no entries exist yet, completely bypassing UI fallback values
    const calculatedAttendanceRate = totalLogs > 0 
      ? Math.round((presentLogs / totalLogs) * 100) 
      : 0;

    const qrDataUrl = await qrcode.toDataURL(profile.qr_token_fingerprint);

    res.json({
      success: true,
      qrCodeUrl: qrDataUrl,
      studentId: profile.student_id_number,
      section: profile.section_block,
      status: profile.account_status,
      name: profile.name,
      activeLoans: profile.active_loans,
      overallAttendance: calculatedAttendanceRate // 🎯 Directly binds the structural metric fix
    });
  } catch (err) {
    console.error("METRICS ENGINE FAULT:", err);
    res.status(500).json({ success: false, message: "Error compiling database QR stream parameters." });
  }
});

// =========================================================================
// 🛑 3. ADMIN CONTROL ENDPOINTS: TOGGLE ACCESS OVERRIDES & TELEMETRY
// =========================================================================
app.post('/api/admin/toggle-hold', async (req, res) => {
  const { token, newStatus } = req.body;
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
    // 🎯 UPDATED: Computes structural real-time aggregates directly within SQL schema execution rows
    const rosterQuery = `
      SELECT 
        s.id, 
        s.student_id_number, 
        s.section_block, 
        s.account_status, 
        u.name, 
        u.email,
        COUNT(l.id) AS total_sessions,
        SUM(CASE WHEN l.terminal_status = 'ALLOWED' THEN 1 ELSE 0 END) AS attended_sessions
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN gate_attendance_logs l ON l.student_id = s.id
      WHERE UPPER(s.section_block) = ?
      GROUP BY s.id, u.id
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
    // 🎯 FIXED: Explicit table qualifiers resolve ambiguity in shared identity columns
    const query = `
      SELECT 
        b.book_barcode_id, 
        b.title, 
        b.author, 
        b.availability_status, 
        u.name AS borrowed_by
      FROM library_books b
      LEFT JOIN students s ON b.current_borrower_student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY b.id DESC
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

    // 🎯 FIXED: Enforced explicit row parameter selections to eliminate column collisions during map aggregation returns
    const [freshRows] = await db.execute(`
      SELECT 
        b.book_barcode_id, 
        b.title, 
        b.author, 
        b.availability_status, 
        u.name AS borrowed_by
      FROM library_books b
      LEFT JOIN students s ON b.current_borrower_student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY b.id DESC
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
    // 🎯 TEMPORARY DEBUG: Sends the exact database error back to the frontend UI
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
// 🔍 6. CAMPUS LOST & FOUND INTEGRATED ASSET MATRIX
// =========================================================================
app.get('/api/lost-found/list', async (req, res) => {
  try {
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

    const cleanPrefix = (itemName || "ITEM").replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || "ITEM";
    const uniqueCode = `LNF-ITEM-${cleanPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const safeDetails = details && details.trim() !== "" ? details.trim() : "No additional details provided.";
    const safeCategory = category || "Other Accessories";

    await db.execute(
      'INSERT INTO lost_and_found_items (item_name, category_classification, location_found, descriptive_details, tracking_tag_id) VALUES (?, ?, ?, ?, ?)',
      [itemName.trim(), safeCategory, location.trim(), safeDetails, uniqueCode]
    );
    
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