-- Active: 1782199478939@@mysql-3a527387-thesis5.h.aivencloud.com@22574@defaultdb

-- =========================================================================
-- 🏫 SYSTEM DATABASE SCHEMATIC BLUEPRINT FOR QR SCHOOL MANAGEMENT SYSTEM
-- =========================================================================

-- 1. MASTER USERS TABLE (Handles cross-dashboard credentials)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'library', 'security', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENT EXTENSION TABLE (Tracks section blocks and unique dynamic QR profiles)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    student_id_number VARCHAR(50) UNIQUE NOT NULL,
    section_block VARCHAR(20) NOT NULL,
    qr_token_fingerprint VARCHAR(255) UNIQUE NOT NULL,
    account_status ENUM('Clear', 'Hold') DEFAULT 'Clear',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. GATE ATTENDANCE ENTRY LOGS TABLE (Fed directly by Security Scanner module)
CREATE TABLE IF NOT EXISTS gate_attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    terminal_status ENUM('ALLOWED', 'DENIED') NOT NULL,
    action_description VARCHAR(255) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 4. CLASSROOM ATTENDANCE LOGS TABLE (Fed directly by Faculty Rolling Projector screen)
CREATE TABLE IF NOT EXISTS classroom_attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    section_code VARCHAR(20) NOT NULL,
    session_token VARCHAR(100) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 5. LIBRARY ASSET INVENTORY TABLE (Monitored via Librarian Console view)
CREATE TABLE IF NOT EXISTS library_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_barcode_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    availability_status ENUM('Available', 'Borrowed') DEFAULT 'Available',
    current_borrower_student_id INT DEFAULT NULL,
    FOREIGN KEY (current_borrower_student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- =========================================================================
-- 🧪 SEED DATA GENERATION: PRE-POPULATE LIVE SYSTEM PROFILES FOR DEFENSE
-- =========================================================================

-- Seed Accounts into Master Users
INSERT INTO users (name, email, password_hash, role) VALUES
('System Admin', 'admin@school.edu', 'password123', 'admin'),
('Prof. Smith', 'faculty@school.edu', 'password123', 'faculty'),
('Ms. Rachel', 'librarian@school.edu', 'password123', 'library'),
('Officer Gate 1', 'security@school.edu', 'password123', 'security'),
('Josef Anza', 'student@school.edu', 'password123', 'student');

-- Connect user Josef Anza to the explicit Student profile ledger matching your frontend keys
-- (Uses LAST_INSERT_ID() to dynamically fetch Josef's auto-assigned ID safely)
INSERT INTO students (user_id, student_id_number, section_block, qr_token_fingerprint, account_status) VALUES
((SELECT id FROM users WHERE email = 'student@school.edu'), '2026-10432', 'BSIT-4A', 'STU-TOKEN-ENZO-789456', 'Clear');

-- Add standard physical library books matching our active QR tracking scans
INSERT INTO library_books (book_barcode_id, title, author, availability_status) VALUES
('BOOK-QA-SW-444', 'Full-Stack Software Architecture', 'Robert C. Martin', 'Available'),
('BOOK-QA-DB-555', 'Relational Database Design Systems', 'C.J. Date', 'Available');