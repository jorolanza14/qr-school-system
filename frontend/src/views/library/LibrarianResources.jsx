import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LibrarianResources() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Balanced Master Ribbon Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>📚 Library Desk Console | <span style={{ fontWeight: 'normal' }}>System Resources</span></div>
        <div style={styles.navLinks}>
          <button onClick={() => navigate('/library')} style={styles.navBtn}>View Asset Logs</button>
          <button onClick={() => navigate('/library/inventory')} style={styles.navBtn}>Digital Database</button>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.contentWrapper}>
        <div style={{ marginBottom: '25px' }}>
          <h2 style={styles.pageTitle}>System Support Guidelines</h2>
          <p style={styles.pageSubtitle}>Operational protocols and troubleshooting references regarding automated barcode acquisitions.</p>
        </div>

        <div style={styles.workspaceGrid}>
          
          {/* Card 1: Scanning Procedures Reference */}
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>📖 QR Check-in Protocol</h3>
            <ul style={styles.list}>
              <li>Ensure the camera feed window is initialized correctly inside the central cockpit view block.</li>
              <li>Always process the **Student Verification Card** first to authenticate identity metrics.</li>
              <li>Verify that book barcode asset stickers follow the strict `BOOK-XXXX` or `BK-XXXX` encoding standard.</li>
              <li>A successful dual match auto-updates rows instantly across backend nodes.</li>
            </ul>
          </div>

          {/* Card 2: Technical Troubleshooting Parameters */}
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>🛠️ Hardware & Status Codes</h3>
            <div style={styles.codeBlock}>
              <strong>Status: ALLOWED</strong> - Student account profile is clear; asset loan matches bounds.<br/><br/>
              <strong>Status: HOLD DETECTED</strong> - Account suspension flag triggered via Admin desk panel block overrides. Entry revoked.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '16px 40px', borderBottom: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  brand: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  navLinks: { display: 'flex', gap: '10px', alignItems: 'center' },
  navBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px' },
  activeBtn: { backgroundColor: '#0f172a', color: '#38bdf8' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginLeft: '10px' },
  
  contentWrapper: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' },
  pageSubtitle: { color: '#94a3b8', fontSize: '14px', margin: '0' },
  
  layoutGrid: { display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '25px' },
  workspaceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginTop: '25px' },
  card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '26px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', boxSizing: 'border-box' },
  cardHeader: { color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid #334155', paddingBottom: '10px' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#cbd5e1', fontSize: '12px', fontWeight: '600' },
  input: { padding: '10px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '6px' },
  alert: { marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#4ade80', border: '1px solid #16a34a', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' },
  
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { borderBottom: '2px solid #334155' },
  th: { padding: '12px 14px', color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #233147' },
  tdBarcode: { padding: '14px', color: '#38bdf8', fontFamily: 'monospace' },
  tdTitle: { padding: '14px', color: '#fff', fontSize: '14px', fontWeight: '600' },
  tdText: { padding: '14px', color: '#cbd5e1', fontSize: '13px' },
  badge: { fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' },
  
  list: { paddingLeft: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', margin: '0' },
  codeBlock: { backgroundColor: '#0f172a', border: '1px solid #233147', borderRadius: '8px', padding: '16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }
};