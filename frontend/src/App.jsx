import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔑 Authentication Views Layout Panel
import Login from './Login';
import Register from './Register';

// 💻 Central System Admin Control Center
import AdminDashboard from './views/admin/AdminDashboard';
import AdminHolds from './views/admin/AdminHolds';

// 👨‍🏫 Faculty Lecture & Roster Monitoring Suite
import FacultyDashboard from './views/faculty/FacultyDashboard';
import FacultyAttendance from './views/faculty/FacultyAttendance';

// 📱 Student Portal Modular View Collection
import StudentAttendance from './views/student/StudentAttendance';
import StudentEvents from './views/student/StudentEvents';
import StudentLibrary from './views/student/StudentLibrary';
import LostAndFound from './views/student/LostAndFound';
import StudentResources from './views/student/StudentResources';

// 🛡️ Campus Infrastructure Terminal View
import SecurityIndex from './views/security/SecurityIndex';

// 📖 Library Resource Management Subsystem (Librarian Desk)
import LibrarianIndex from './views/library/LibrarianIndex';
import LibrarianInventory from './views/library/LibrarianInventory';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* =========================================================================
            🔑 CORE SYSTEM PORTALS & ENTRY POINTS
           ========================================================================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =========================================================================
            💻 SYSTEM ADMINISTRATIVE OPERATIONS SUITE
           ========================================================================= */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/holds" element={<AdminHolds />} />

        {/* =========================================================================
            👨‍🏫 FACULTY ACADEMIC MONITORING MATRIX
           ========================================================================= */}
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/attendance" element={<FacultyAttendance />} />

        {/* =========================================================================
            📱 INDIVIDUAL STUDENT PORTAL RUNWAYS (All Tabs Registered!)
           ========================================================================= */}
        <Route path="/student" element={<Navigate to="/student/attendance" replace />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/events" element={<StudentEvents />} />
        <Route path="/student/library" element={<StudentLibrary />} />
        <Route path="/student/lost-found" element={<LostAndFound />} />
        <Route path="/student/resources" element={<StudentResources />} />

        {/* =========================================================================
            🛡️ & 📖 CAMPUS INFRASTRUCTURE OPERATIONAL TERMINALS
           ========================================================================= */}
        <Route path="/security" element={<SecurityIndex />} />
        <Route path="/library" element={<LibrarianIndex />} />
        <Route path="/library/inventory" element={<LibrarianInventory />} />

        {/* =========================================================================
            ⚠️ FALLBACK GUARD PROTECTION
           ========================================================================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}