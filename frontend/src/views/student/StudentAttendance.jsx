import React, { useState, useEffect, useRef } from 'react';
import StudentNavbar from './StudentNavbar';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function StudentAttendance() {
  const [qrData, setQrData] = useState(null);
  const [checkinLog, setCheckinLog] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Gate Entry QR Credentials
    fetch('http://localhost:5000/api/student/qr/5')
      .then(res => res.json())
      .then(data => { if (data.success) setQrData(data); });

    // 2. Initialize Lens to scan the instructor's projector screen
    const scanner = new Html5QrcodeScanner('classroom-lens', { fps: 10, qrbox: 220 });
    
    scanner.render(async (decodedText) => {
      if (decodedText.startsWith('SESSION-')) {
        try {
          const res = await fetch('http://localhost:5000/api/student/checkin-class', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentToken: 'STU-TOKEN-ENZO-789456', // Josef Anza's token fingerprint
              classroomSessionToken: decodedText
            })
          });
          const serverResponse = await res.json();
          setCheckinLog(serverResponse.message);
        } catch (err) {
          setCheckinLog('Failed syncing entry validation.');
        }
      }
    }, () => {});

    scannerRef.current = scanner;
    return () => { if (scannerRef.current) scannerRef.current.clear().catch(e => console.log(e)); };
  }, []);

  return (
    <div>
      <StudentNavbar />
      <div style={{ padding: '40px', fontFamily: 'sans-serif', display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Left Side: Gate Verification QR */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '350px', textAlign: 'center' }}>
          <h3>🚪 Campus Access Key</h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Present this token at the primary campus entry gates.</p>
          {qrData && <img src={qrData.qrCodeUrl} alt="Gate QR" style={{ width: '180px', marginTop: '10px', border: '2px solid #0f172a', borderRadius: '6px', padding: '5px' }} />}
        </div>

        {/* Right Side: Lecture Session Camera Lens Scanner */}
        <div style={{ flex: 1, background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3>👨‍🏫 Classroom Check-In Lens</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Scan the rolling code projected on the classroom screen to submit your attendance log automatically.</p>
          
          <div style={{ display: 'flex', gap: '30px' }}>
            <div id="classroom-lens" style={{ width: '350px', borderRadius: '8px', overflow: 'hidden' }}></div>
            
            {checkinLog && (
              <div style={{ flex: 1, padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', height: 'fit-content', fontWeight: 'bold' }}>
                📡 System Feedback:<br />
                <span style={{ fontWeight: 'normal', color: '#1e293b', fontSize: '15px' }}>{checkinLog}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}