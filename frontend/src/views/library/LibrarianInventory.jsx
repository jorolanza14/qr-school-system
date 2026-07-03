import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LibrarianInventory() {
  const navigate = useNavigate();
  const librarianName = localStorage.getItem('userName') || 'Ms. Rachel';
  
  // 🧭 Control Navigation Tabs State
  const [activeTab, setActiveTab] = useState('database'); // 'database' or 'checkout'

  // 📚 Library Book Inventory State Layer
  const [inventory, setInventory] = useState({});
  const [newBook, setNewBook] = useState({ barcode: '', title: '', author: '' });
  
  // 🎟️ Checkout System Form State Layer
  const [checkoutData, setCheckoutData] = useState({ studentToken: '', bookTitle: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // 🔄 Synchronization Loop: Sync live inventory indices from database rows
  const fetchLibraryCatalog = async () => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/library/books`);
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error("Failed syncing library database indexes:", err);
    }
  };

  useEffect(() => {
    fetchLibraryCatalog();
    
    // Auto-refresh tick loop every 3 seconds to preserve cross-device integrity
    const syncInterval = setInterval(fetchLibraryCatalog, 3000);
    return () => clearInterval(syncInterval);
  }, []);

  // 📝 Save New Book Entry straight to your cloud backend
  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    if (!newBook.barcode.trim() || !newBook.title.trim()) return;

    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const response = await fetch(`${baseUrl}/api/library/add-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: newBook.barcode.trim(),
          title: newBook.title.trim(),
          author: newBook.author.trim()
        })
      });
      const data = await response.json();

      if (response.ok) {
        setInventory(data.inventory);
        setNewBook({ barcode: '', title: '', author: '' });
        setFeedback({ message: '🎉 Asset cataloged cleanly into master inventory rows!', type: 'success' });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      } else {
        setFeedback({ message: `❌ Refused: ${data.message}`, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ message: '💥 Failed connecting to database repository layers.', type: 'error' });
    }
  };

  // 🎟️ Dispatches a transactional student checkout borrow record
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutData.studentToken.trim() || !checkoutData.bookTitle.trim()) return;

    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const response = await fetch(`${baseUrl}/api/library/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentToken: checkoutData.studentToken.trim(),
          manualBookTitle: checkoutData.bookTitle.trim()
        })
      });
      const data = await response.json();

      if (response.ok) {
        setCheckoutData({ studentToken: '', bookTitle: '' });
        setFeedback({ message: '🎯 Checkout trace successfully logged to student card index!', type: 'success' });
        fetchLibraryCatalog();
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      } else {
        setFeedback({ message: `❌ Refused: ${data.message}`, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ message: '💥 Communication failure over network streams.', type: 'error' });
    }
  };

  // Calculate high-level summary metadata
  const totalBooksCount = Object.keys(inventory).length;
  const totalBorrowedCount = Object.values(inventory).filter(b => b.status === 'Borrowed').length;

  return (
    <div style={styles.container}>
      {/* 🧭 Responsive Upper Navigation Sub-header Bar */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>📚 Library Desk Console</h1>
          <p style={styles.subtitle}>Operator Mode: <span style={{ color: '#38bdf8' }}>{librarianName}</span></p>
        </div>
        <div style={styles.navActionRow}>
          <button onClick={() => setActiveTab('database')} style={{ ...styles.toggleTabBtn, ...(activeTab === 'database' ? styles.activeTab : {}) }}>Digital Database</button>
          <button onClick={() => setActiveTab('checkout')} style={{ ...styles.toggleTabBtn, ...(activeTab === 'checkout' ? styles.activeTab : {}) }}>View Asset Logs</button>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div style={styles.contentWrapper}>
        
        {/* ==========================================
            TAB VALUE MAP A: LIVE INVENTORY DATABASE
           ========================================== */}
        {activeTab === 'database' && (
          <div style={styles.tabGridBody}>
            {/* Form Left: Add Book */}
            <div style={styles.card}>
              <h3 style={styles.cardHeader}>📥 Catalog New Library Book</h3>
              <form onSubmit={handleAddBookSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unique Barcode ID Asset Tag:</label>
                  <input type="text" placeholder="e.g., BOOK-QA-DB-555" value={newBook.barcode} onChange={e => setNewBook({...newBook, barcode: e.target.value})} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Book Literature Title Name:</label>
                  <input type="text" placeholder="e.g., Intro to Financial Technology" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Author / Publishing Editorial:</label>
                  <input type="text" placeholder="e.g., Cengage, Robert C. Martin" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} style={styles.input} />
                </div>
                <button type="submit" style={styles.submitBtn}>Register Asset into System</button>
              </form>
            </div>

            {/* Table Right: Active Ledger Matrix */}
            <div style={styles.tableCardOuterWrapper}>
              <h3 style={styles.cardHeader}>📋 Live Master Catalog Index ({totalBooksCount} Entries)</h3>
              <div style={styles.horizontalScrollTableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Barcode ID</th>
                      <th style={styles.th}>Title</th>
                      <th style={styles.th}>Author</th>
                      <th style={styles.th}>Status Block</th>
                      <th style={styles.th}>Current Custodian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalBooksCount === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ ...styles.tdText, textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '24px' }}>
                          No books logged inside database index rows.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(inventory).map(([barcode, item]) => (
                        <tr key={barcode} style={styles.tdRow}>
                          <td style={{ ...styles.tdText, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 'bold' }}>{barcode}</td>
                          <td style={styles.tdName}>{item.title}</td>
                          <td style={styles.tdText}>{item.author || 'N/A'}</td>
                          <td style={styles.tdText}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: item.status === 'Available' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: item.status === 'Available' ? '#4ade80' : '#f87171',
                              border: item.status === 'Available' ? '1px solid #16a34a' : '1px solid #dc2626'
                            }}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ ...styles.tdText, color: item.borrowedBy ? '#fff' : '#64748b' }}>
                            👤 {item.borrowedBy || 'Shelved Catalog'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB VALUE MAP B: OPERATIONAL CHECKOUT ACTION
           ========================================== */}
        {activeTab === 'checkout' && (
          <div style={{ width: '100%' }}>
            {/* KPI Stat Block Summary Row */}
            <section style={styles.gridStats}>
              <div style={styles.statCard}><h3>Total Active Entries</h3><p style={styles.statNumber}>{totalBooksCount} Books</p><span>In cloud registry</span></div>
              <div style={styles.statCard}><h3>Current Issued Loans</h3><p style={{ ...styles.statNumber, color: '#f59e0b' }}>{totalBorrowedCount} Assets</p><span>Circulating out-of-bounds</span></div>
            </section>

            <div style={styles.cardFullScreenMobile}>
              <h3 style={styles.cardHeader}>📝 Operational Control Desk</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '-5px 0 20px 0' }}>Process active book checkouts using real-time user validation fields.</p>
              
              <form onSubmit={handleCheckoutSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Scanned Student Passport Code / ID:</label>
                  <input type="text" placeholder="Scan QR Token fingerprint or input STU-ID" value={checkoutData.studentToken} onChange={e => setCheckoutData({...checkoutData, studentToken: e.target.value})} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Enter Book Title Name:</label>
                  <input type="text" placeholder="e.g., Full-Stack Software Architecture" value={checkoutData.bookTitle} onChange={e => setCheckoutData({...checkoutData, bookTitle: e.target.value})} style={styles.input} required />
                </div>
                <button type="submit" style={styles.submitCheckoutBtn}>Confirm & Issue Checked Loan Outbound</button>
              </form>
            </div>
          </div>
        )}

        {/* Global Floating Notification Display */}
        {feedback.message && (
          <div style={{
            ...styles.feedbackAlert,
            backgroundColor: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
            color: feedback.type === 'success' ? '#4ade80' : '#f87171',
            border: feedback.type === 'success' ? '1px solid #16a34a' : '1px solid #dc2626'
          }}>{feedback.message}</div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    backgroundColor: '#0f172a', 
    fontFamily: 'sans-serif', 
    color: '#f1f5f9', 
    boxSizing: 'border-box',
    paddingBottom: '120px' // 🎯 FIXED: Forces safety canvas bottom spacing to eliminate fixed mobile browser tray collisions
  },
  contentWrapper: { 
    width: '100%', 
    maxWidth: '96%', 
    margin: '0 auto', 
    padding: '20px 10px', 
    boxSizing: 'border-box' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1e293b', 
    padding: '16px 4%', 
    borderBottom: '1px solid #334155', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
    flexWrap: 'wrap', 
    gap: '15px' 
  },
  title: { color: '#fff', margin: '0', fontSize: '20px', fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px' },
  navActionRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  toggleTabBtn: { padding: '6px 12px', background: 'rgba(15, 23, 42, 0.4)', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  activeTab: { backgroundColor: '#0f172a', color: '#38bdf8', borderColor: '#38bdf8' },
  logoutBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  
  // Responsive Dual Columns Form Layout Grid
  tabGridBody: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '25px', width: '100%', alignItems: 'start', boxSizing: 'border-box' },
  card: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', flex: '1 1 320px', width: '100%', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' },
  cardFullScreenMobile: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', width: '100%', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' },
  
  // 🎯 FIXED: Scroll protection rules for tables on narrow phone layouts
  tableCardOuterWrapper: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', flex: '2 1 450px', width: '100%', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' },
  horizontalScrollTableContainer: { width: '100%', overflowX: 'auto', boxSizing: 'border-box', marginTop: '10px' },
  
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }, // 🎯 FIXED: Locks internal min-width so cell layout parameters wrap text beautifully instead of squeezing columns
  thRow: { borderBottom: '2px solid #334155' },
  th: { padding: '10px 12px', color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tdRow: { borderBottom: '1px solid #233147', transition: 'background 0.2s' },
  tdName: { padding: '12px', color: '#fff', fontSize: '14px', fontWeight: '600' },
  tdText: { padding: '12px', color: '#cbd5e1', fontSize: '13px' },
  statusBadge: { fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px', display: 'inline-block' },

  gridStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px', width: '100%' },
  statCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', color: '#94a3b8', boxSizing: 'border-box' },
  statNumber: { fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: '6px 0 2px 0' },

  cardHeader: { color: '#fff', fontSize: '15px', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid #334155', paddingBottom: '10px', width: '100%' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' },
  label: { color: '#cbd5e1', fontSize: '13px', fontWeight: '600' },
  input: { padding: '10px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px', width: '100%' },
  submitCheckoutBtn: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '6px', width: '100%' },
  feedbackAlert: { marginTop: '16px', padding: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }
};