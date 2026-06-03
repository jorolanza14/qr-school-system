const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Pull in our database connection pool reference
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🌐 Baseline Health Route
app.get('/', (req, res) => {
  res.send('QR School Management Production Database API is running cleanly...');
});

// =========================================================================
// 🔑 1. AUTHENTICATION ENDPOINT (Queries Live MySQL Users Table)
// =========================================================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the users table securely using placeholders to prevent SQL injection
    const [rows] = await db.execute('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    
    if (rows.length === 0) {
      return res.status(44).json({ success: false, message: "User account not found." });
    }

    const user = rows[0];

    // Password verification against database entry
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
// 🛡️ 4. SECURITY TERMINAL ENDPOINT: SCAN GATE & WRITE ENTRY PERMANENT LOGS
// =========================================================================
app.post('/api/security/scan', async (req, res) => {
  const { qrToken } = req.body;

  try {
    // Look up the student and grab their corresponding table user name reference
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

    // Write this physical checkpoint action into the permanent database log ledger!
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
    // Grab all books along with the names of students who currently hold them
    const query = `
      SELECT b.book_barcode_id, b.title, b.author, b.availability_status, u.name AS borrowed_by
      FROM library_books b
      LEFT JOIN students s ON b.current_borrower_student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
    `;
    const [rows] = await db.execute(query);
    
    // Format response back into an object keyed by barcode to match frontend map handlers
    const catalog = {};
    rows.forEach(book => {
      catalog[book.book_barcode_id] = {
        title: book.title,
        author: book.author,
        status: book.availability_status,
        borrowedBy: book.borrowed_by
      };
    });

    res.json({ success: true, inventory: catalog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed fetching library records." });
  }
});

// =========================================================================
// 📝 NEW USER REGISTRATION ENDPOINT (Dynamically Writes to DB)
// =========================================================================
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, studentId, section } = req.body;

  try {
    // 1. Check if email already exists in our database
    const [existing] = await db.execute('SELECT id FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email address is already registered." });
    }

    // 2. Insert into the Master Users Table
    const [userResult] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase(), password, role]
    );

    const newUserId = userResult.insertId;

    // 3. If the role is a student, automatically build their QR profile extension
    if (role === 'student') {
      if (!studentId || !section) {
        return res.status(400).json({ success: false, message: "Student ID and Section Block are required for student accounts." });
      }

      // Generate a clean, unique cryptographic token fingerprint for their QR code
      const uniqueToken = `STU-TOKEN-${name.substring(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      await db.execute(
        'INSERT INTO students (user_id, student_id_number, section_block, qr_token_fingerprint, account_status) VALUES (?, ?, ?, ?, "Clear")',
        [newUserId, studentId, section, uniqueToken]
      );
    }

    res.json({ success: true, message: "Account successfully registered to database!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database registration transaction failed." });
  }
});

app.post('/api/library/checkout', async (req, res) => {
  const { studentToken, bookId } = req.body;

  try {
    // 1. Fetch Student ID
    const [students] = await db.execute('SELECT id FROM students WHERE qr_token_fingerprint = ?', [studentToken]);
    if (students.length === 0) return res.status(404).json({ success: false, message: "Student code invalid." });

    // 2. Fetch Book Status
    const [books] = await db.execute('SELECT * FROM library_books WHERE book_barcode_id = ?', [bookId]);
    if (books.length === 0) return res.status(404).json({ success: false, message: "Book barcode tag not recognized." });

    const book = books[0];
    if (book.availability_status === 'Borrowed') {
      return res.status(400).json({ success: false, message: "This asset is already checked out." });
    }

    // 3. Update book transaction assignment links
    await db.execute(
      'UPDATE library_books SET availability_status = "Borrowed", current_borrower_student_id = ? WHERE id = ?',
      [students[0].id, book.id]
    );

    res.json({ success: true, message: `Successfully logged asset checkout transaction link inside database!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Library engine transaction fault." });
  }
});

app.listen(PORT, () => {
  console.log(`Production Backend Engine successfully active on port ${PORT}`);
});