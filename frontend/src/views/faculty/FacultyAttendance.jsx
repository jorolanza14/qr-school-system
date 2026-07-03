import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // 🔄 Import the dynamic QR code drawing library

export default function FacultyAttendance() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('BSIT-4A');
  const [rotationInterval, setRotationInterval] = useState(30); // 🎯 NEW: Dropdown tracking state (defaulting to 30s)
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSessionToken, setCurrentSessionToken] = useState('');
  const [countdown, setCountdown] = useState(30);

  // 🔄 Generate a fresh, rolling cryptographic attendance token string
  const generateNewToken = (intervalDuration = rotationInterval) => {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const compactSection = selectedSection.replace(/[^a-zA-Z0-9]/g, '');
    setCurrentSessionToken(`LEC-${compactSection}-${randomHex}`);
    setCountdown(intervalDuration); // 🎯 FIXED: Reset countdown precisely to the selected time boundary
  };

  // ⏱️ Handle the active ticking down of the rolling token window
  useEffect(() => {
    let intervalId = null;

    if (isSessionActive) {
      intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            generateNewToken(rotationInterval); // Clock hit zero, dynamically roll token using active value
            return rotationInterval;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isSessionActive, selectedSection, rotationInterval]);

  // 🚀 Initialize the session projection modal
  const handleStartSession = (e) => {
    e.preventDefault();
    generateNewToken(rotationInterval);
    setIsSessionActive(true);
  };

  // ⏳ Helper utility function to turn raw numeric seconds into clean screen readouts
  const formatTimeDisplay = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardLayout}>
        {/* 🗺️ Redirects back to the Faculty Dashboard */}
        <button onClick={() => navigate('/faculty')} style={styles.backBtn}>
          ← Back to Faculty Dashboard
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={styles.title}>⏱️ Live Lecture Attendance Generator</h2>
          <p style={styles.subtitle}>
            Select your lecture block to project an entrance verification token loop directly onto the class display screen.
          </p>
        </div>

        <form onSubmit={handleStartSession} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Target Section:</label>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)} 
              style={styles.selectInput}
            >
              <option value="BSIT-4A">BSIT - 4A</option>
              <option value="BSIT-4B">BSIT - 4B</option>
              <option value="BSIT-3A">BSIT - 3A</option>
              <option value="BSIT-3B">BSIT - 3B</option>
            </select>
          </div>

          {/* 🎯 NEW DROP-DOWN: Allows complete dynamic timer configuration mapping */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Key Rotation Interval:</label>
            <select 
              value={rotationInterval} 
              onChange={(e) => setRotationInterval(Number(e.target.value))} 
              style={styles.selectInput}
            >
              <option value={15}>15 Seconds (Rapid Security Loop)</option>
              <option value={30}>30 Seconds (Balanced Fleet Mode)</option>
              <option value={60}>1 Minute (Standard Verification)</option>
              <option value={120}>2 Minutes (Extended Input Window)</option>
              <option value={300}>5 Minutes (Lecture Projection Lock)</option>
              <option value={600}>10 Minutes (Manual Entry Safe)</option>
              <option value={1800}>30 Minutes (Stable Permanent Slide)</option>
            </select>
          </div>

          <button type="submit" style={styles.submitBtn}>
            ⚡ Initialize Session Window
          </button>
        </form>
      </div>

      {/* =========================================================================
          🖥️ THE LIVE PROJECTION MODAL LAYER (Visible when Session is Active)
         ========================================================================= */}
      {isSessionActive && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <span style={styles.liveBadge}>● LIVE PROJECTION ACTIVE</span>
            <h2 style={styles.modalTitle}>Section: {selectedSection}</h2>
            <p style={styles.modalInstructions}>Scan this dynamic QR code or use the token string below via your student portal.</p>

            {/* 🔄 Real-time scannable QR code block linked to the rolling token text value */}
            <div style={styles.qrDisplayBox}>
              <QRCodeSVG 
                value={currentSessionToken}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"M"}
                includeMargin={true}
              />
            </div>

            {/* Text Token Row Box */}
            <div style={styles.tokenDisplayBox}>
              <code style={styles.tokenText}>{currentSessionToken}</code>
            </div>

            <div style={styles.timerTrack}>
              Session keys rotating dynamically in: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{formatTimeDisplay(countdown)}</span>
            </div>

            <button onClick={() => setIsSessionActive(false)} style={styles.closeBtn}>
              Terminate Active Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' },
  cardLayout: { background: '#1e293b', padding: '40px', borderRadius: '12px', border: '1px solid #334155', maxWidth: '500px', width: '100%' },
  backBtn: { background: '#334155', color: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold', fontSize: '13px', transition: 'background 0.2s' },
  title: { color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0' },
  subtitle: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#f1f5f9', fontSize: '15px', fontWeight: '600' },
  selectInput: { padding: '12px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '15px', outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
  submitBtn: { padding: '12px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px', width: '100%' },
  
  // Modal Style System Configuration
  modalOverlay: { position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'rgba(15, 23, 42, 0.96)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '9999', padding: '20px' },
  modalContent: { backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: '16px', padding: '35px', width: '100%', maxWidth: '550px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  liveBadge: { color: '#ef4444', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: '50px' },
  modalTitle: { color: '#fff', fontSize: '26px', margin: '0 0 6px 0' },
  modalInstructions: { color: '#94a3b8', fontSize: '14px', marginBottom: '20px' },
  
  // New QR block structural alignment style
  qrDisplayBox: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  
  tokenDisplayBox: { backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '15px' },
  tokenText: { color: '#38bdf8', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' },
  timerTrack: { color: '#94a3b8', fontSize: '14px', marginBottom: '25px' },
  closeBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%' }
};