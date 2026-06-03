import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminIndex() {
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>⚙️ Central System Admin Control</h1>
      <nav style={{ display: 'flex', gap: '15px', margin: '20px 0', flexWrap: 'wrap' }}>
        <Link to="/admin/users">Manage Users</Link> | <Link to="/admin/attendance">Attendance Checker</Link> | 
        <Link to="/admin/excuses">Process Excuses</Link> | <Link to="/admin/holds">Student Account Holds</Link> | 
        <Link to="/admin/library">Library Audits</Link> | <Link to="/admin/settings">Global Configs</Link> | 
        <Link to="/">Logout</Link>
      </nav>
      <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '6px' }}>
        <h3>System Diagnostics Status</h3>
        <p>All core API router endpoints operating perfectly on Port 5000.</p>
      </div>
    </div>
  );
}