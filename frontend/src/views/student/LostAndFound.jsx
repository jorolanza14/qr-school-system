import React from 'react';
import StudentNavbar from './StudentNavbar';

export default function LostAndFound() {
  return (
    <div>
      <StudentNavbar />
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <h2>🎒 Campus Lost & Found Terminal</h2>
        <p style={{ color: '#64748b' }}>Report missing personal items or look through recent school repository logs here.</p>
        
        <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <h3>📋 Recent Logs</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>No matching lost items logged in your section today.</p>
        </div>
      </div>
    </div>
  );
}