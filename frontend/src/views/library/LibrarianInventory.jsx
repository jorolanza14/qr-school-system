import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LibrarianInventory() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState({});
  const [newBook, setNewBook] = useState({ barcode: '', title: '', author: '' });
  const [feedback, setFeedback] = useState({ msg: '', type: '' });

  // 🔄 Sync full inventory map directly from your centralized Express network endpoints
  const fetchInventory = async () => {
    try {
      const res = await fetch('import.meta.env.VITE_API_BASE_URL1mr.preview.c36.airoapp.ai68.101:5000/api/library/books');
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error("Error pulling central catalog parameters:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
    
    // Auto-refresh the view state list every 3 seconds to capture scanned checkouts live
    const autoSyncInterval = setInterval(fetchInventory, 3000);
    return () => clearInterval(autoSyncInterval);
  }, []);

  // 🚀 POST PIPELINE PIPING: Commits new assets directly to the server memory space permanently
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.barcode.trim() || !newBook.title.trim()) return;

    try {
      const response = await fetch('import.meta.env.VITE_API_BASE_URL1mr.preview.c36.airoapp.ai68.101:5000/api/library/add-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: newBook.barcode,
          title: newBook.title,
          author: newBook.author
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        // Hydrate the layout table state with the fresh dictionary ledger returned by the server
        setInventory(data.inventory);
        setNewBook({ barcode: '', title: '', author: '' });
        setFeedback({ msg: `🎉 Asset successfully registered to backend database matrix!`, type: 'success' });
        setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
      } else {
        setFeedback({ msg: `❌ Registration Rejected: ${data.message}`, type: 'error' });
        setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error("Transmission line architecture error:", err);
      setFeedback({ msg: '💥 Critical communication grid disconnect.', type: 'error' });
      setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
    }
  };

  return (
    <div style={styles.container}>
      {/* Balanced Master Ribbon Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>📚 Library Desk Console | <span style={{ fontWeight: 'normal' }}>Inventory Registry</span></div>
        <div style={styles.navLinks}>
          <button onClick={() => navigate('/library')} style={styles.navBtn}>View Asset Logs</button>
          <button onClick={() => navigate('/library/inventory')} style={{...styles.navBtn, ...styles.activeBtn}}>Digital Database</button>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.contentWrapper}>
        <div style={styles.layoutGrid}>
          
          {/* Left Column: Master Table Inventory List */}
          <div style={{...styles.card, flex: '2', height: 'auto'}}>
            <h3 style={styles.cardHeader}>📋 Live Master Catalog Index</h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Barcode ID</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Author</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Borrower</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(inventory).length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{...styles.tdText, textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '30px'}}>
                      No items found in system storage indexes.
                    </td>
                  </tr>
                ) : (
                  Object.keys(inventory).map((barcode) => (
                    <tr key={barcode} style={styles.tdRow}>
                      <td style={styles.tdBarcode}><code>{barcode}</code></td>
                      <td style={styles.tdTitle}>{inventory[barcode].title}</td>
                      <td style={styles.tdText}>{inventory[barcode].author}</td>
                      <td>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: inventory[barcode].status === 'Available' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: inventory[barcode].status === 'Available' ? '#4ade80' : '#f59e0b'
                        }}>{inventory[barcode].status}</span>
                      </td>
                      <td style={{...styles.tdText, color: inventory[barcode].borrowedBy ? '#38bdf8' : '#475569', fontWeight: inventory[barcode].borrowedBy ? 'bold' : 'normal'}}>
                        {inventory[barcode].borrowedBy || 'On Shelf'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Right Column: Add New Book Form Control */}
          <div style={{...styles.card, flex: '1', height: 'fit-content'}}>
            <h3 style={styles.cardHeader}>🆕 Add Asset Resource</h3>
            <form onSubmit={handleAddBook} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Barcode Custom Sticker ID:</label>
                <input type="text" placeholder="e.g., BOOK-COMP-04" value={newBook.barcode} onChange={e => setNewBook({...newBook, barcode: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Title Name:</label>
                <input type="text" placeholder="e.g., Intro to Networks" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author / Publisher:</label>
                <input type="text" placeholder="e.g., Cisco Press" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} style={styles.input} />
              </div>
              <button type="submit" style={styles.submitBtn}>Register Asset Row</button>
            </form>
            {feedback.msg && (
              <div style={{
                ...styles.alert,
                backgroundColor: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                color: feedback.type === 'success' ? '#4ade80' : '#f87171',
                border: feedback.type === 'success' ? '1px solid #16a34a' : '1px solid #dc2626'
              }}>{feedback.msg}</div>
            )}
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
  alert: { marginTop: '12px', padding: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' },
  
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { borderBottom: '2px solid #334155' },
  th: { padding: '12px 14px', color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  tdRow: { borderBottom: '1px solid #233147' },
  tdBarcode: { padding: '14px', color: '#38bdf8', fontFamily: 'monospace' },
  tdTitle: { padding: '14px', color: '#fff', fontSize: '14px', fontWeight: '600' },
  tdText: { padding: '14px', color: '#cbd5e1', fontSize: '13px' },
  badge: { fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }
};