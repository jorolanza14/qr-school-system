import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FacultyAttendance() {
  const navigate = useNavigate();
  const [section, setSection] = useState('BSIT-4A');
  const [sessionToken, setSessionToken] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [qrImage, setQrImage] = useState('');

  const startClassSession = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/faculty/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section })
      });
      const data = await res.json();
      if (data.success) {
        setSessionToken(data.sessionToken);
        // Leverage the global QR generation URL block directly inside an image source element
        setQrImage(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data.sessionToken}`);
      }
    } catch (err) {
      console.error('Failed spinning up sync session context.', err);
    }
  };

  // Poll the database register logs every 3 seconds while the check-in window remains open
  useEffect(() => {
    if (!sessionToken) return;

    const interval = setInterval(() => {
      fetch(`http://localhost:5000/api/faculty/session-status/${section}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setAttendees(data.attendees);
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionToken, section]);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', display: 'flex', gap: '50px' }}>
      <div style={{ maxWidth: '400px' }}>
        <button onClick={() => navigate('/faculty')} style={{ marginBottom: '20px', padding: '6px 12px' }}>← Main Dashboard</button>
        <h2>⏱️ Live Lecture Attendance Generator</h2>
        <p style={{ color: '#64748b' }}>Select your lecture block to project an entrance verification token loop directly onto the class display screen.</p>
        
        <label style={{ display: 'block', margin: '15px 0 5px 0', fontWeight: 'bold' }}>Target Section:</label>
        <select value={section} onChange={(e) => setSection(e.target.value)} style={{ padding: '10px', width: '100%', marginBottom: '15px', borderRadius: '4px' }}>
          <option value="BSIT-4A">BSIT - 4A</option>
          <option value="BSIT-4B">BSIT - 4B</option>
        </select>

        <button onClick={startClassSession} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {sessionToken ? '🔄 Rotate Live Session Token' : '⚡ Initialize Session Window'}
        </button>
      </div>

      {sessionToken && (
        <div style={{ flex: 1, display: 'flex', gap: '30px' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', width: '280px' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Classroom Projection View</h4>
            <img src={qrImage} alt="Live Session QR Grid" style={{ border: '3px solid #0f172a', padding: '5px', borderRadius: '4px' }} />
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b', marginTop: '10px' }}>{sessionToken}</p>
          </div>

          <div style={{ flex: 1, background: '#f8fafc', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>📋 Real-Time Present Register ({attendees.length})</h3>
            {attendees.length === 0 ? <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Awaiting local student mobile scanning check-ins...</p> : (
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#1e293b', fontWeight: '500' }}>
                {attendees.map((name, i) => <li key={i} style={{ color: '#16a34a' }}>✔️ {name}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}