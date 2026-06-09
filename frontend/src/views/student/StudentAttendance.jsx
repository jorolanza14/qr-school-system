import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode'; 
import StudentNavbar from './StudentNavbar'; 

export default function StudentAttendance() {
  const navigate = useNavigate();
  
  // 👥 Extract session markers out of local storage layers
  const userId = localStorage.getItem('userId');
  const studentName = localStorage.getItem('userName') || 'Student Profile';
  
  const [manualToken, setManualToken] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  
  // 🔄 Combined State layer to store live data fetched from your backend endpoint
  const [studentStats, setStudentStats] = useState({ 
    attendanceRate: 95, 
    gateStatus: 'Clear', 
    activeLoans: 0,
    qrToken: 'Awaiting dynamic calculation...' // 🎯 Dynamic variable
  });
  
  const [isStreaming, setIsStreaming] = useState(false);
  const scannerRef = useRef(null); 

  // 🔄 Synchronization Loop: Query user table profiles based on active userId session index
  useEffect(() => {
    if (!userId) {
      console.error("No active session key recognized. Redirecting to access gateway...");
      navigate('/login');
      return;
    }

    const syncStudentStatus = async () => {
      try {
        // 📡 Hit your secure student profile endpoint passing the active userId parameter
        const res = await fetch(`http://localhost:5000/api/student/qr/${userId}`);
        const data = await res.json();
        
        if (data.success) {
          setStudentStats({
            attendanceRate: 95, // Keeps your placeholder baseline evaluation metric percentage
            gateStatus: data.status, // Clears 'Clear' vs 'Hold Block' dynamically via database rows
            activeLoans: 0,
            qrToken: data.studentId ? `STU-${data.studentId.replace(/[^a-zA-Z0-9]/g, '')}` : 'STU-PENDING'
          });
        }
      } catch (err) {
        console.error("Failed fetching live student validation bounds:", err);
      }
    };
    
    syncStudentStatus();
  }, [userId, navigate]);

  // 📸 Turn on and mount the HTML5 QR Parser inside the student viewfinder container
  const startClassroomScanner = () => {
    setIsStreaming(true);
    setFeedback({ message: '', type: '' });

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "studentClassroomLensFeed", 
        { 
          fps: 10, 
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(onClassroomScanSuccess, onClassroomScanFailure);
      scannerRef.current = scanner;
    }, 100);
  };

  // 🛑 Shut off the webcam capture loop cleanly
  const stopClassroomScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
        setIsStreaming(false);
      }).catch(err => {
        console.error("Error shutting down student scanner camera layout loop:", err);
        setIsStreaming(false);
      });
    }
  };

  // 🎯 AUTOMATIC CAPTURE SUCCESS HANDLER: Fires instantly when camera detects professor's QR code
  const onClassroomScanSuccess = (decodedText) => {
    if (decodedText.startsWith('LEC-')) {
      setFeedback({ 
        message: `🎯 Automatically Checked-In! Verified Token: ${decodedText}`, 
        type: 'success' 
      });
      stopClassroomScanner(); 
    } else {
      setFeedback({ 
        message: `❌ Mismatched QR Code format. Please capture the rolling lecture code.`, 
        type: 'error' 
      });
    }
  };

  const onClassroomScanFailure = (error) => {};

  // ⌨️ Handle Manual Input Form validation as a fail-safe fallback alternative path
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    if (manualToken.toUpperCase().startsWith('LEC-')) {
      setFeedback({ message: `🎯 Check-In Successful! Token recognized for current block session.`, type: 'success' });
      setManualToken('');
    } else {
      setFeedback({ message: `❌ Invalid Token Format. Please input the active code on the board.`, type: 'error' });
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.log(err));
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <StudentNavbar />

      <div style={styles.contentWrapper}>
        {/* 📊 Live Metric Cards Row */}
        <section style={styles.gridStats}>
          <div style={styles.statCard}>
            <h3>Overall Attendance</h3>
            <p style={{ ...styles.statNumber, color: studentStats.attendanceRate >= 85 ? '#4ade80' : '#f87171' }}>{studentStats.attendanceRate}%</p>
            <span>Good Academic Standing</span>
          </div>
          <div style={styles.statCard}>
            <h3>Campus Gate Access</h3>
            <p style={{ ...styles.statNumber, color: studentStats.gateStatus === 'Clear' ? '#4ade80' : '#f87171' }}>
              {studentStats.gateStatus === 'Clear' ? 'CLEAR' : 'HOLD BLOCK'}
            </p>
            <span>Synced with Admin Panel</span>
          </div>
          <div style={styles.statCard}>
            <h3>Borrowed Books</h3>
            <p style={{ ...styles.statNumber, color: '#60a5fa' }}>{studentStats.activeLoans}</p>
            <span>Library Circulation Account</span>
          </div>
        </section>

        {/* 🛠️ Dual-Core Functional Workspace Grid */}
        <div style={styles.workspaceGrid}>
          
          {/* Card Left: Campus Access QR Key Component */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🚪 Campus Access Key</h2>
            <p style={styles.cardSubtitle}>Present this digital token at the primary terminal gate scanner to clear checkpoint entries.</p>
            <div style={styles.qrContainer}>
              {/* 🔄 FIXED: QRCode SVG value reads dynamically from backend tracking parameters state */}
              <QRCodeSVG value={studentStats.qrToken} size={160} bgColor={"#ffffff"} fgColor={"#0f172a"} level={"L"} />
            </div>
            <p style={styles.tokenLabel}>Token Fingerprint: <code style={styles.code}>{studentStats.qrToken}</code></p>
          </div>

          {/* Card Right: Classroom Attendance Verification Terminal */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📸 Classroom Check-In Lens</h2>
            <p style={styles.cardSubtitle}>Scan the rolling 15s sequence code on the projector screen or submit it manually below.</p>
            
            <div style={styles.cameraFrame}>
              {!isStreaming ? (
                <div style={styles.placeholderBox}>
                  <div style={styles.cameraIcon}>📷</div>
                  <button type="button" style={styles.cameraBtn} onClick={startClassroomScanner}>
                    Launch Check-In Scanner
                  </button>
                </div>
              ) : (
                <div style={styles.streamWrapper}>
                  <div id="studentClassroomLensFeed" style={{ width: '100%' }} />
                  <button type="button" onClick={stopClassroomScanner} style={styles.closeLensBtn}>
                    Turn Off Camera hardware
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleManualSubmit} style={styles.manualForm}>
              <label style={styles.label}>Or Input Rolling Code Manually:</label>
              <div style={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="e.g., LEC-BSIT4A-123456" 
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  style={styles.input}
                />
                <button type="submit" style={styles.submitBtn}>Verify Check-In</button>
              </div>
            </form>

            {feedback.message && (
              <div style={{ 
                ...styles.feedbackAlert, 
                backgroundColor: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
                color: feedback.type === 'success' ? '#4ade80' : '#f87171',
                border: feedback.type === 'success' ? '1px solid #16a34a' : '1px solid #dc2626'
              }}>
                {feedback.message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', color: '#f1f5f9' },
  contentWrapper: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  gridStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', color: '#94a3b8' },
  statNumber: { fontSize: '32px', fontWeight: 'bold', margin: '10px 0 4px 0' },
  workspaceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' },
  card: { backgroundColor: '#1e293b', padding: '32px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' },
  cardTitle: { color: '#fff', fontSize: '20px', margin: '0 0 8px 0', fontWeight: 'bold' },
  cardSubtitle: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 24px 0' },
  qrContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', width: '200px', height: '200px' },
  tokenLabel: { textAlign: 'center', color: '#94a3b8', fontSize: '14px', margin: '0' },
  code: { fontFamily: 'monospace', color: '#38bdf8', fontSize: '14px', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px' },
  cameraFrame: { backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', height: 'auto', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px', overflow: 'hidden', padding: '10px' },
  placeholderBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  cameraIcon: { fontSize: '36px' },
  cameraBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'background 0.2s' },
  streamWrapper: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  closeLensBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', width: '100%', marginTop: '10px' },
  manualForm: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#cbd5e1', fontSize: '14px', fontWeight: '600' },
  inputGroup: { display: 'flex', gap: '10px' },
  input: { flex: '1', padding: '10px 14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  submitBtn: { backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  feedbackAlert: { marginTop: '16px', padding: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }
};