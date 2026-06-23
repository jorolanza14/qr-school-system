import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // 🔄 For generating dynamic book return tags
import StudentNavbar from './StudentNavbar';

export default function StudentLibrary() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentName = localStorage.getItem('userName') || 'Josef Anza';

  useEffect(() => {
    const fetchMyLibraryRecords = async () => {
      try {
        // Querying the existing endpoint in your backend server.js
        const res = await fetch('import.meta.env.VITE_API_BASE_URL1mr.preview.c36.airoapp.ai68.101:5000/api/library/books');
        const data = await res.json();
        
        if (data.success) {
          // Filter the backend inventory object to only show books borrowed by this student
          const rawInventory = data.inventory;
          const myActiveLoans = [];

          Object.keys(rawInventory).forEach((barcode) => {
            const book = rawInventory[barcode];
            if (book.borrowedBy && book.borrowedBy.toLowerCase() === studentName.toLowerCase()) {
              myActiveLoans.push({
                barcode: barcode,
                title: book.title,
                author: book.author,
                borrowedDate: 'June 01, 2026', // Mock tracking metadata parameters
                dueDate: 'June 08, 2026',
                status: book.status || 'Borrowed',
                returnToken: `LIB-RET-${barcode}-${Math.floor(10000 + Math.random() * 90000)}`
              });
            }
          });

          setBorrowedBooks(myActiveLoans);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed fetching live library network bounds:", err);
        setLoading(false);
      }
    };

    fetchMyLibraryRecords();
    const syncInterval = setInterval(fetchMyLibraryRecords, 3000); // Auto-syncs every 3 seconds

    return () => clearInterval(syncInterval);
  }, [studentName]);

  return (
    <div style={styles.container}>
      <StudentNavbar />

      <div style={styles.contentWrapper}>
        <div style={styles.headerSection}>
          <h2 style={styles.mainTitle}>📚 My Library Circulation Account</h2>
          <p style={styles.mainSubtitle}>
            Track your currently borrowed books, outstanding due dates, and scan receipt tokens at the circulation desk.
          </p>
        </div>

        <h3 style={styles.sectionTitle}>📖 Currently Borrowed Assets</h3>

        {loading ? (
          <p style={styles.statusText}>Querying campus catalog data stream...</p>
        ) : borrowedBooks.length === 0 ? (
          <div style={styles.emptyNotice}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
            <h4>No Active Book Loans Detected</h4>
            <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Present your student QR pass at the counter to borrow resources.</p>
          </div>
        ) : (
          <div style={styles.feedWrapper}>
            {borrowedBooks.map((book) => (
              <div key={book.barcode} style={styles.bookCard}>
                
                {/* Left: Book Details */}
                <div style={styles.bookDetails}>
                  <div style={styles.badgeRow}>
                    <span style={styles.barcodeLabel}>🏷️ Barcode: {book.barcode}</span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: book.status === 'Borrowed' || book.status === 'Active' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: book.status === 'Borrowed' || book.status === 'Active' ? '#38bdf8' : '#10b981',
                      border: book.status === 'Borrowed' || book.status === 'Active' ? '1px solid #38bdf8' : '1px solid #10b981'
                    }}>
                      {book.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 style={styles.bookTitle}>{book.title}</h4>
                  <p style={styles.bookAuthor}>by {book.author}</p>
                  
                  <div style={styles.datesGrid}>
                    <div>
                      <div style={styles.dateLabel}>BORROWED DATE</div>
                      <div style={styles.dateValue}>{book.borrowedDate}</div>
                    </div>
                    <div>
                      <div style={styles.dateLabel}>DUE DATE</div>
                      <div style={{...styles.dateValue, color: '#f87171'}}>{book.dueDate}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Dynamic Return QR Code Component Block */}
                <div style={styles.qrWrapper}>
                  <div style={styles.qrCanvasContainer}>
                    <QRCodeSVG 
                      value={book.returnToken}
                      size={95}
                      bgColor={"#ffffff"}
                      fgColor={"#0f172a"}
                      level={"M"}
                    />
                  </div>
                  <span style={styles.qrTokenLabel}>Scan to Return</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif' },
  contentWrapper: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  headerSection: { marginBottom: '30px', textAlign: 'center' },
  mainTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' },
  mainSubtitle: { color: '#94a3b8', fontSize: '14px', margin: '0', maxWidth: '600px', lineHeight: '1.5' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#94a3b8', width: '100%', maxWidth: '800px', margin: '0 0 16px 0', borderBottom: '1px solid #334155', paddingBottom: '10px' },
  statusText: { color: '#64748b', fontStyle: 'italic' },
  
  emptyNotice: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', color: '#94a3b8', width: '100%', maxWidth: '800px' },
  feedWrapper: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' },
  
  // High fidelity grid item structure cards
  bookCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  bookDetails: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' },
  badgeRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  barcodeLabel: { fontSize: '11px', color: '#64748b', fontFamily: 'monospace', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px' },
  statusBadge: { fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' },
  bookTitle: { color: '#fff', fontSize: '18px', margin: '4px 0 0 0', fontWeight: 'bold' },
  bookAuthor: { color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0', fontStyle: 'italic' },
  
  datesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #233147', marginTop: '4px' },
  dateLabel: { fontSize: '9px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px' },
  dateValue: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500', marginTop: '2px' },
  
  // Canvas wrapper mechanics
  qrWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px', minWidth: '120px' },
  qrCanvasContainer: { backgroundColor: '#fff', padding: '6px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  qrTokenLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }
};