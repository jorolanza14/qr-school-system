import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function LibrarianIndex() {
  const navigate = useNavigate();
  const librarianName = localStorage.getItem('userName') || 'Campus Librarian';
  
  const [metrics, setMetrics] = useState({ totalCatalog: 0, checkedOut: 0 });
  const [scannedStudent, setScannedStudent] = useState('Awaiting Card Scan...');
  const [manualBookTitle, setManualBookTitle] = useState(''); // 🔄 Text input state layer
  const [feedback, setFeedback] = useState({ msg: '', type: '' });
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef(null);

  // Sync current totals from backend memory
  const syncDeskMetrics = async () => {
    try {
      // 🎯 FIXED: Directs metrics pulling queries to your active production cloud server links
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/library/books`);
      const data = await res.json();
      if (data.success) {
        const catalog = data.inventory;
        const total = Object.keys(catalog).length;
        const borrowed = Object.values(catalog).filter(b => b.status === 'Borrowed').length;
        setMetrics({ totalCatalog: total, checkedOut: borrowed });
      }
    } catch (err) {
      console.error("Metrics sync error:", err);
    }
  };

  useEffect(() => {
    syncDeskMetrics();
    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(e => console.log(e));
    };
  }, []);

  // Initialize camera lens
  const startLibrarianLens = () => {
    setIsScannerActive(true);
    setFeedback({ msg: '', type: '' });

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "librarianDeskViewfinderFeed",
        { fps: 12, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        false
      );
      
      scanner.render((text) => {
        // Enforce student card validation criteria rule
        if (text.startsWith('STU-')) {
          setScannedStudent(text);
          setFeedback({ msg: '🎯 Student Pass Token Captured!', type: 'success' });
        } else {
          setFeedback({ msg: '⚠️ Please scan a valid student portal QR code pass.', type: 'error' });
        }
      }, (err) => {});
      
      scannerRef.current = scanner;
    }, 150);
  };

  const stopLibrarianLens = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
        setIsScannerActive(false);
      }).catch(() => setIsScannerActive(false));
    }
  };

  // Authorize checkout via newly streamlined server schema endpoint parameters
  const handleAuthorizeTransaction = async () => {
    if (scannedStudent.startsWith('Awaiting') || !manualBookTitle.trim()) {
      setFeedback({ msg: '❌ Missing details: Provide both scanned student token and book title name.', type: 'error' });
      return;
    }

    try {
      // 🎯 FIXED: Relocates request pipelines to execute directly inside production network bounds
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const response = await fetch(`${baseUrl}/api/library/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentToken: scannedStudent,
          manualBookTitle: manualBookTitle // Sends text title cleanly
        })
      });
      const data = await response.json();

      if (response.ok) {
        setFeedback({ msg: `🎉 Success: ${data.message}`, type: 'success' });
        setManualBookTitle('');
        setScannedStudent('Awaiting Card Scan...');
        syncDeskMetrics();
        stopLibrarianLens();
      } else {
        setFeedback({ msg: `❌ Rejected: ${data.message}`, type: 'error' });
      }
    } catch (err) {
      setFeedback({ msg: '💥 Server synchronization anomaly.', type: 'error' });
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.brand}>📚 Library Desk Console | <span style={{ color: '#38bdf8' }}>{librarianName}</span></div>
        <div style={styles.navLinks}>
          <button onClick={() => navigate('/library')} style={{...styles.navBtn, ...styles.activeBtn}}>View Asset Logs</button>
          <button onClick={() => navigate('/library/inventory')} style={styles.navBtn}>Digital Database</button>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.contentWrapper}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={styles.pageTitle}>Operational Control Desk</h2>
          <p style={styles.pageSubtitle}>Process active book checkouts using real-time user validation fields.</p>
        </div>

        <section style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>TOTAL ACTIVE ENTRIES</span>
            <div style={styles.metricNum}>{metrics.totalCatalog} Books</div>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>CURRENT ISSUED LOANS</span>
            <div style={{...styles.metricNum, color: '#f59e0b'}}>{metrics.checkedOut} Assets</div>
          </div>
        </section>

        <div style={styles.workspaceGrid}>
          
          {/* Card Left: Input Fields Container Workspace */}
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>📝 Checkout Details</h3>
            <p style={styles.cardSubtitle}>Scan the student's card pass using the webcam lens and type the book asset title manually below.</p>
            
            <div style={styles.inputLogBox}>
              <div style={styles.logGroup}>
                <span style={styles.logLabel}>SCANNED STUDENT PASSPORT CODE:</span>
                <div style={{ ...styles.logValue, color: scannedStudent.startsWith('STU') ? '#4ade80' : '#64748b' }}>{scannedStudent}</div>
              </div>
              
              <div style={styles.logGroup}>
                <label style={{...styles.logLabel, marginBottom: '6px', display: 'block'}}>ENTER BOOK TITLE NAME manually:</label>
                <input 
                  type="text" 
                  placeholder="e.g., Full-Stack Software Architecture" 
                  value={manualBookTitle} 
                  onChange={e => setManualBookTitle(e.target.value)}
                  style={styles.formInput}
                />
              </div>
            </div>

            <button type="button" onClick={handleAuthorizeTransaction} style={styles.actionBtn}>
              Confirm Asset Checkout Link
            </button>
            
            <button type="button" onClick={() => { setScannedStudent('Awaiting Card Scan...'); setManualBookTitle(''); }} style={styles.resetBtn}>
              Reset Workspace Fields
            </button>

            {feedback.msg && (
              <div style={{
                ...styles.alertBanner,
                backgroundColor: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                color: feedback.type === 'success' ? '#4ade80' : '#f87171',
                border: feedback.type === 'success' ? '1px solid #16a34a' : '1px solid #dc2626'
              }}>{feedback.msg}</div>
            )}
          </div>

          {/* Card Right: Live Camera Viewport Box */}
          <div style={{ ...styles.card, height: 'auto', minHeight: '440px' }}>
            <h3 style={styles.cardHeader}>📷 Library Service Lens Scanner</h3>
            <p style={styles.cardSubtitle}>Position the student portal identification screen code squarely inside the tracking box area loop.</p>
            
            <div style={styles.cameraViewport}>
              {!isScannerActive ? (
                <div style={styles.placeholderBox}>
                  <div style={{ fontSize: '40px' }}>📹</div>
                  <button type="button" onClick={startLibrarianLens} style={styles.launchBtn}>
                    Launch Student Card Reader
                  </button>
                </div>
              ) : (
                <div style={styles.streamWrapper}>
                  <div id="librarianDeskViewfinderFeed" style={{ width: '100%' }} />
                  <button type="button" onClick={stopLibrarianLens} style={styles.killBtn}>
                    Shut Off Webcam Stream Hardware
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    backgroundColor: '#0f172a', 
    color: '#f1f5f9', 
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
    paddingBottom: '120px' // 🎯 FIXED: Cushion space clears fixed mobile tray elements
  },
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1e293b', 
    padding: '16px 4%', 
    borderBottom: '1px solid #334155', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    flexWrap: 'wrap', // 🎯 FIXED: Wraps layout cleanly on small mobile viewports
    gap: '15px'
  },
  brand: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  navLinks: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  navBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', whiteSpace: 'nowrap' },
  activeBtn: { backgroundColor: '#0f172a', color: '#38bdf8' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginLeft: '0px', whiteSpace: 'nowrap' },
  
  contentWrapper: { width: '100%', maxWidth: '96%', margin: '0 auto', padding: '20px 0px', boxSizing: 'border-box' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' },
  pageSubtitle: { color: '#94a3b8', fontSize: '14px', margin: '0' },
  
  metricsRow: { 
    display: 'flex', 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: '20px', 
    margin: '25px 0',
    width: '100%',
    boxSizing: 'border-box'
  },
  metricCard: { backgroundColor: '#1e293b', padding: '16px 20px', borderRadius: '10px', border: '1px solid #334155', flex: '1 1 200px', boxSizing: 'border-box' },
  metricLabel: { fontSize: '10px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px' },
  metricNum: { fontSize: '22px', fontWeight: 'bold', color: '#38bdf8', marginTop: '6px' },
  
  workspaceGrid: { 
    display: 'flex', 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: '30px',
    width: '100%',
    boxSizing: 'border-box'
  },
  card: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    borderRadius: '12px', 
    padding: '26px', 
    display: 'flex', 
    flexDirection: 'column', 
    height: 'auto', 
    minHeight: '440px',
    flex: '1 1 400px', 
    width: '100%',
    boxSizing: 'border-box' 
  },
  cardHeader: { color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0' },
  cardSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '6px 0 20px 0', lineHeight: '1.4' },
  inputLogBox: { display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #233147', marginBottom: '16px', boxSizing: 'border-box', width: '100%' },
  logGroup: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' },
  logLabel: { fontSize: '10px', color: '#64748b', fontWeight: 'bold' },
  logValue: { fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold', wordBreak: 'break-all' },
  formInput: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' },
  actionBtn: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' },
  resetBtn: { backgroundColor: 'transparent', color: '#64748b', border: '1px solid #334155', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', width: '100%', boxSizing: 'border-box' },
  alertBanner: { padding: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', marginTop: '12px', width: '100%', boxSizing: 'border-box' },
  cameraViewport: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px', overflow: 'hidden', width: '100%', boxSizing: 'border-box', minHeight: '250px' },
  placeholderBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0' },
  launchBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' },
  streamWrapper: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  killBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', width: '100%', marginTop: '10px' }
};