import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function SecurityIndex() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  // Send the captured QR code string to our Express API backend
  const verifyTokenWithBackend = async (tokenString) => {
    try {
      const response = await fetch('http://localhost:5000/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: tokenString }),
      });
      const data = await response.json();
      setScanResult(data);
    } catch (err) {
      console.error('Error communicating with backend:', err);
    }
  };

  useEffect(() => {
    // Initialize the HTML5 QR Code Scanner configuration
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 15,          // Scans 15 frames per second for lightning-fast reads
      qrbox: { width: 250, height: 250 }, // The square target box guidelines
    });

    scanner.render(
      (decodedText) => {
        // Success callback: A valid QR code structure was found in the frame
        verifyTokenWithBackend(decodedText);
      },
      (error) => {
        // Verbose scanning logs can be ignored to keep the console clean
        // console.warn(error);
      }
    );

    // Keep a reference to clear up the camera thread when leaving the view
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Failed to clear scanner:', err));
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>🛡️ Security Terminal</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Gate 1 Main Scanner</p>
        </div>
        <button onClick={() => navigate('/')} style={styles.logout}>Exit Terminal</button>
      </div>
      
      <div style={styles.main}>
        <div style={styles.scannerBox}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>📷 Active Camera Feed</h3>
          
          {/* This is the div target where HTML5-QRCode will render the camera canvas */}
          <div id="reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
          
          <div style={{ marginTop: '20px', padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px', color: '#64748b' }}>
            Position the student profile QR code within the highlighted viewfinder frame.
          </div>
        </div>

        {scanResult && (
          <div style={{ ...styles.resultCard, backgroundColor: scanResult.status === 'ALLOWED' ? '#e6f4ea' : '#fce8e6', borderColor: scanResult.status === 'ALLOWED' ? '#34a853' : '#ea4335' }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '24px' }}>
              Gate Status: <span style={{ color: scanResult.status === 'ALLOWED' ? '#137333' : '#c5221f' }}>{scanResult.status}</span>
            </h2>
            <hr style={{ border: '0', borderTop: '1px solid #cbd5e1', margin: '15px 0' }} />
            <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Student Name:</strong> {scanResult.name}</p>
            <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Academic ID:</strong> {scanResult.id}</p>
            <p style={{ fontSize: '16px', margin: '8px 0', fontWeight: '500', color: '#334155' }}><strong>Terminal Log:</strong> {scanResult.log}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' },
  sidebar: { width: '260px', background: '#0f172a', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  main: { flex: 1, padding: '40px', display: 'flex', gap: '30px', alignItems: 'flex-start' },
  scannerBox: { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  resultCard: { flex: 1, padding: '35px', borderRadius: '12px', border: '2px solid', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  logout: { padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }
};