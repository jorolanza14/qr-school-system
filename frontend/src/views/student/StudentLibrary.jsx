import React from 'react';
import StudentNavbar from './StudentNavbar';

export default function StudentLibrary() {
  return (
    <div>
      <StudentNavbar />
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <h2>📚 My Library Account</h2>
        <p style={{ color: '#64748b' }}>Track your currently borrowed books, outstanding due dates, and fine logs.</p>
        
        <div style={{ marginTop: '25px' }}>
          <h3>📖 Currently Borrowed</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Book Title</th>
                <th>Borrowed Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>Full-Stack Software Architecture</td>
                <td>June 01, 2026</td>
                <td>June 08, 2026</td>
                <td><span style={{ color: '#2563eb', fontWeight: 'bold' }}>Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}