import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔑 Authentication Views Layout Panel
import Login from './Login';
import Register from './Register';

// 📱 Student Portal View Collection
import StudentAttendance from './views/student/StudentAttendance';

// 🛡️ Campus Infrastructure Terminal View
import SecurityIndex from './views/security/SecurityIndex';

// 🛑 Administrative Operations Dashboard
import AdminHolds from './views/admin/AdminHolds';

// 📖 Library Resource Management Subsystem
import LibrarianIndex from './views/library/LibrarianIndex';
import LibrarianInventory from './views/library/LibrarianInventory';

// 👨‍🏫 Faculty Lecture Session Panel
import FacultyAttendance from './views/faculty/FacultyAttendance';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* =========================================================================
            🔑 CORE SYSTEM PORTALS & ENTRY POINTS
           ========================================================================= */}
        {/* Default Base Route: Automatically directs incoming traffic straight to Login portal */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Credentials Authentication Form Router Nodes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =========================================================================
            📱 INDIVIDUAL UTILITY ROLE DASHBOARD TRAFFIC RUNWAYS
           ========================================================================= */}
        {/* Student Runway: Generates Gate Key QR & opens Class Check-In Webcam Screen */}
        <Route path="/student/attendance" element={<StudentAttendance />} />

        {/* Security Terminal Runway: Turns on the active gate validation webcam framework */}
        <Route path="/security" element={<SecurityIndex />} />

        {/* Admin Holds Runway: Allows administrators to issue/release profile restrictions */}
        <Route path="/admin/holds" element={<AdminHolds />} />

        {/* Faculty Runway: Allows instructors to project rolling class session QR tokens */}
        <Route path="/faculty/attendance" element={<FacultyAttendance />} />

        {/* Library Runway: Contains the checkout scanning terminal desk and asset grid */}
        <Route path="/library" element={<LibrarianIndex />} />
        <Route path="/library/inventory" element={<LibrarianInventory />} />

        {/* =========================================================================
            ⚠️ FALLBACK GUARD PROTECTION
           ========================================================================= */}
        {/* Catch-All Safe Fallback: Redirects unknown URL inputs cleanly to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}