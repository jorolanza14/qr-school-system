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

-- 6. CAMPUS LOST & FOUND ASSET REGISTRY TABLE (Handles property tracking)
CREATE TABLE IF NOT EXISTS lost_and_found_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category_classification VARCHAR(100) NOT NULL,
    location_found VARCHAR(150) NOT NULL,
    descriptive_details TEXT,
    tracking_tag_id VARCHAR(100) UNIQUE NOT NULL,
    item_status ENUM('Unclaimed', 'Claimed') DEFAULT 'Unclaimed',
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. CENTRALIZED CAMPUS ANNOUNCEMENTS TABLE (Prevents serverless dashboard flashing)
CREATE TABLE IF NOT EXISTS campus_announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) DEFAULT 'All Day',
    location VARCHAR(150) NOT NULL,
    organizer VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CLASSROOM COURSEWARE MATRIX TABLE (Makes Faculty upload persistent for Students)
CREATE TABLE IF NOT EXISTS classroom_courseware (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    professor_name VARCHAR(100) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    file_size VARCHAR(20) NOT NULL,
    download_url TEXT NOT NULL,
    date_added DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. DYNAMIC OTP SESSION REGISTRY (Prevents serverless RAM drops during verification)
CREATE TABLE IF NOT EXISTS temporary_otp_verifications (
    email VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    student_id_number VARCHAR(50) DEFAULT NULL,
    section_block VARCHAR(20) DEFAULT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at BIGINT NOT NULL
);

-- =========================================================================
-- 🧪 SEED DATA GENERATION: PRE-POPULATE LIVE SYSTEM PROFILES FOR DEFENSE
-- =========================================================================

-- Seed Accounts into Master Users
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('System Admin', 'admin@school.edu', 'password123', 'admin'),
('Prof. Smith', 'faculty@school.edu', 'password123', 'faculty'),
('Ms. Rachel', 'librarian@school.edu', 'password123', 'library'),
('Officer Gate 1', 'security@school.edu', 'password123', 'security'),
('Josef Anza', 'student@school.edu', 'password123', 'student');

-- Connect user Josef Anza to the explicit Student profile ledger matching your frontend keys
INSERT IGNORE INTO students (user_id, student_id_number, section_block, qr_token_fingerprint, account_status) VALUES
((SELECT id FROM users WHERE email = 'student@school.edu'), '2026-10432', 'BSIT-4A', 'STU-TOKEN-ENZO-789456', 'Clear');

-- Add standard physical library books matching our active QR tracking scans
INSERT IGNORE INTO library_books (book_barcode_id, title, author, availability_status) VALUES
('BOOK-QA-SW-444', 'Full-Stack Software Architecture', 'Robert C. Martin', 'Available'),
('BOOK-QA-DB-555', 'Relational Database Design Systems', 'C.J. Date', 'Available');

-- Seed Lost & Found Ledger (Populates Student Notice Board natively on mount)
INSERT IGNORE INTO lost_and_found_items (item_name, category_classification, location_found, descriptive_details, tracking_tag_id, item_status) VALUES 
('Apple Pencil', 'Electronics / Gadgets', 'Lobby', 'Apple pencil 2 with pink case', 'LNF-ITEM-APPL-41738', 'Unclaimed'),
('RFID Student ID Card', 'Documents', 'Building A Room 302', 'Belongs to a 3rd Year student. Found near the projector podium desk.', 'LNF-ITEM-RFID-88392', 'Unclaimed');

-- Seed Campus Announcements Ledger (Secures base values on your live feed tables)
INSERT IGNORE INTO campus_announcements (id, title, event_date, event_time, location, organizer, description) VALUES
(1, 'BSIT Capstone Final Defense', '2026-06-15', '08:00 AM', 'IT Lab 3, Building B', 'Dean Office', 'Final grading presentation loop for all 4th-year technology projects.'),
(2, 'Campus Sports Festival 2026', '2026-06-22', '01:00 PM', 'Grand Gymnasium', 'Student Council', 'Annual inter-college athletic tournaments and opening ceremonies.');

-- Seed Classroom Courseware Matrix (Pre-populates the shared resources tab)
INSERT IGNORE INTO classroom_courseware (id, title, professor_name, file_type, file_size, download_url, date_added) VALUES
(1, 'Syllabus - Software Engineering 101', 'Prof. Smith', 'PDF', '1.4 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '2026-06-01'),
(2, 'Database Schema Practice Worksheet', 'Prof. Smith', 'DOCX', '842 KB', 'https://calibre-ebook.com/downloads/demos/demo.docx', '2026-06-04');