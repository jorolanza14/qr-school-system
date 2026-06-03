import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminHolds() {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('Clear');
  const [message, setMessage] = useState('');

  const handleToggleHold = async (statusToSet) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/toggle-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: 'STU-TOKEN-ENZO-789456', // Enzo's token
          newStatus: statusToSet 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentStatus(statusToSet);
        setMessage(`Success: Student is now set to ${statusToSet}`);
      }
    } catch (err) {
      setMessage('Error connecting to backend.');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/admin')} style={{ marginBottom: '20px', padding: '5px 10px' }}>← Back to Admin</button>
      <h2>🛑 System-Wide Account Holds</h2>
      <p>Flag or unflag student profiles. Active restrictions instantly sync to the security gate scanner terminal.</p>
      
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '500px', marginTop: '20px' }}>
        <h3>Target Student: Enzo Anza (2026-10432)</h3>
        <p>Current Status: <strong style={{ color: currentStatus === 'Clear' ? 'green' : 'red' }}>{currentStatus}</strong></p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => handleToggleHold('Hold')} style={{ padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Place Account Hold
          </button>
          <button onClick={() => handleToggleHold('Clear')} style={{ padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Release / Clear Hold
          </button>
        </div>
        {message && <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#2563eb' }}>{message}</p>}
      </div>
    </div>
  );
}