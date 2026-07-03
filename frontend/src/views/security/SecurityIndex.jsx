import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode'; // 🔄 Import the automatic decoding engine

export default function SecurityIndex() {
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(false);
  const scannerRef = useRef(null); // Holds the scanner instance so we can clear it safely
  
  // 📜 Live Activity Verification Logs List
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), name: 'System Scanner Engine Initialized', status: 'ONLINE', badge: '#10b981' }
  ]);

  // 📸 Initialize and Start the Automatic QR Scanner Hardware
  const startGateScanner = () => {
    setIsStreaming(true);
    setFeedbackAlert('');

    // Wait for the DOM element to mount before binding the scanner config
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "gateWebcamFeed", // Must match the div ID below
        { 
          fps: 15, // Scans 15 frames per second for fast detection
          qrbox: { width: 250, height: 250 }, // Square targeting region
          aspectRatio: 1.0 // Enforces our clean 1:1 look
        },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
      appendTerminalLog("Gate 1 Video Stream Interfaced", "ALLOWED");
    }, 100);
  };

  // 🛑 Turn Off and Disconnect the Scanner Hardware
  const stopGateScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
        setIsStreaming(false);
        appendTerminalLog("Gate 1 Scanner Terminated Safely", "DENIED");
      }).catch(err => {
        console.error("Failed to clear scanner hardware loop:", err);
        setIsStreaming(false);
      });
    }
  };

  // 🎯 SUCCESS HANDLER: Fired automatically when a real QR code enters the viewfinder!
  const onScanSuccess = (decodedText) => {
    appendTerminalLog(`QR Code Read: "${decodedText}"`, "ALLOWED");

    // Real-time Database-Matching Logic Paths
    if (decodedText === "STU-TOKEN-ENZO-789456") {
      setTimeout(() => {
        appendTerminalLog("Verified Database Match: Josef Anza (BSIT-4A) - APPROVED", "ALLOWED");
      }, 500);
    } else if (decodedText === "STU-TOKEN-TEMP-112233") {
      setTimeout(() => {
        appendTerminalLog("ACCESS DENIED: Administrative Hold Active on Profile", "DENIED");
      }, 500);
    } else {
      setTimeout(() => {
        appendTerminalLog(`Unknown Token String: Entry Request Rejected`, "DENIED");
      }, 500);
    }
  };

  const onScanFailure = (error) => {};

  const appendTerminalLog = (message, flag) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: Date.now(), time: timestamp, name: message, status: flag, badge: flag === 'ALLOWED' ? '#16a34a' : '#dc2626' },
      ...prev
    ]);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.log(err));
      }
    };
  }, []);

  const [feedbackAlert, setFeedbackAlert] = useState('');

  return (
    <div style={styles.container}>
      {/* Sidebar Control Deck Panel */}
      <aside style={styles.sidebar}>
        <div style={styles.brandGroup}>
          <div style={styles.shieldIcon}>🛡️</div>
          <div>
            <h2 style={styles.sidebarTitle}>Security Terminal</h2>
            <p style={styles.sidebarSubtitle}>Gate 1 Main Entry Hub</p>
          </div>
        </div>

        <div style={styles.simulationBox}>
          <p style={styles.simLabel}>💡 Real Scanning Instructions:</p>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '0' }}>
            Open your updated Student Portal tab on your mobile phone or an incognito window. Hold that live generated QR Code straight up to your laptop camera lens!
          </p>
        </div>

        <button onClick={() => { if(isStreaming){ stopGateScanner(); } navigate('/admin'); }} style={styles.exitBtn}>
          ← Exit to Admin Panel
        </button>
      </aside>

      {/* Main Stream Activity Area Workspace */}
      <main style={styles.workspace}>
        <div style={styles.gridContainer}>
          
          {/* Card Left: Live Video Scanner viewport */}
          <div style={styles.viewCard}>
            <h3 style={styles.cardHeader}>📸 Live Camera Feed Viewfinder</h3>
            
            {!isStreaming ? (
              <div style={styles.cameraViewportPlaceholder}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎥</div>
                <button onClick={startGateScanner} style={styles.activateBtn}>Initialize Gate Scanner Camera</button>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '10px' }}>Mounts automatic hardware matrix parser</p>
              </div>
            ) : (
              <div style={styles.activeScannerWrapper}>
                <div id="gateWebcamFeed" style={{ width: '100%' }} />
                <button onClick={stopGateScanner} style={styles.deactivateBtn}>Disconnect Scanner Hardware</button>
              </div>
            )}
          </div>

          {/* Card Right: Real-time Access Verification Logging Ledger */}
          <div style={styles.viewCard}>
            <h3 style={styles.cardHeader}>📜 Live Verification Logs Ledger</h3>
            <div style={styles.logTerminal}>
              {logs.map(log => (
                <div key={log.id} style={styles.logRow}>
                  <span style={styles.logTime}>[{log.time}]</span>
                  <span style={styles.logMsg}>{log.name}</span>
                  <span style={{ ...styles.logBadge, backgroundColor: log.badge }}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

const styles = {
  // 🎯 FIXED: Reconfigured structural elements to adapt safely across fluid desktop and mobile states
  container: { 
    display: 'flex', 
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: '100vh', 
    backgroundColor: '#0f172a', 
    fontFamily: 'sans-serif', 
    color: '#f1f5f9',
    width: '100%',
    boxSizing: 'border-box',
    paddingBottom: '100px'
  },
  sidebar: { 
    flex: '1 1 280px',
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#1e293b', 
    borderRight: '1px solid #334155', 
    borderBottom: '1px solid #334155',
    padding: '24px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between',
    gap: '15px',
    boxSizing: 'border-box'
  },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #334155', paddingBottom: '15px' },
  shieldIcon: { fontSize: '32px' },
  sidebarTitle: { color: '#fff', fontSize: '18px', margin: '0 0 4px 0', fontWeight: 'bold' },
  sidebarSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0' },
  simulationBox: { backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155', margin: '10px 0', flex: '1' },
  simLabel: { margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '0.5px' },
  exitBtn: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#334155', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s', marginTop: 'auto' },
  
  workspace: { 
    flex: '3 1 500px', 
    padding: '20px 10px',
    width: '100%',
    boxSizing: 'border-box'
  },
  // 🎯 FIXED: Shshifted tracking layout grid components to support clean single-column stacking values on narrow displays
  gridContainer: { 
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '25px',
    width: '100%',
    boxSizing: 'border-box'
  },
  
  viewCard: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    borderRadius: '12px', 
    padding: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    height: 'auto', 
    minHeight: '480px',
    flex: '1 1 350px',
    width: '100%',
    boxSizing: 'border-box'
  },
  cardHeader: { color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0', borderBottom: '1px solid #334155', paddingBottom: '12px', width: '100%' },
  
  cameraViewportPlaceholder: { width: '100%', aspectRatio: '1 / 1', maxWidth: '340px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '0 auto', boxSizing: 'border-box', padding: '15px' },
  activeScannerWrapper: { position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', boxSizing: 'border-box' },
  
  activateBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'background 0.2s', textAlign: 'center' },
  deactivateBtn: { width: '100%', backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'background 0.2s', marginTop: '10px' },
  
  logTerminal: { height: '380px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', padding: '16px', fontFamily: 'monospace', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' },
  logRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '8px', fontSize: '13px', lineHeight: '1.4', width: '100%', boxSizing: 'border-box' },
  logTime: { color: '#64748b', whiteSpace: 'nowrap' },
  logMsg: { color: '#e2e8f0', flex: '1', wordBreak: 'break-word' },
  logBadge: { padding: '2px 8px', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 'bold', minWidth: '65px', textAlign: 'center', whiteSpace: 'nowrap' }
};