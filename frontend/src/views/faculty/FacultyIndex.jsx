import React from 'react';
import { Link } from 'react-router-dom';

export default function FacultyIndex() {
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>👨‍🏫 Faculty Dashboard</h1>
      <nav style={{ margin: '20px 0', display: 'flex', gap: '15px' }}>
        <Link to="/faculty/attendance">Classroom QR Sessions</Link> | 
        <Link to="/faculty/filtered">Filter Student Records</Link> | 
        <Link to="/faculty/resources">Syllabus Resources</Link> |
        <Link to="/">Logout</Link>
      </nav>
      <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '6px' }}>
        <h3>Instructor Control Summary</h3>
        <p>Generate time-sensitive classroom QR codes or monitor track records here.</p>
      </div>
    </div>
  );
}