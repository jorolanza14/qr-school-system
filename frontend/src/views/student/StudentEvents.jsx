import React from 'react';
import StudentNavbar from './StudentNavbar';

export default function StudentEvents() {
  return (
    <div>
      <StudentNavbar />
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <h2>📅 Campus Events & Seminars</h2>
        <p style={{ color: '#64748b' }}>Stay updated on mandatory university activities requiring automated QR code check-ins.</p>
        
        <div style={{ marginTop: '25px', padding: '25px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
          <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>UPCOMING</span>
          <h3 style={{ margin: '10px 0 5px 0', color: '#0f172a' }}>College of IT Innovation Summit 2026</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b' }}>Location: University Gymnasium | Time: 9:00 AM</p>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>Ensure you have your <strong>Gate QR Code</strong> ready on your mobile device screen at the entrance check-point for automatic credit tracking.</p>
        </div>
      </div>
    </div>
  );
}