import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // 🔄 For generating dynamic book return tags
import StudentNavbar from './StudentNavbar';

export default function StudentLibrary() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [fullCatalog, setFullCatalog] = useState([]); // 🎯 NEW: Holds all books in the database
  const [searchQuery, setSearchQuery] = useState(''); // 🎯 NEW: Search input string
  const [loading, setLoading] = useState(true);
  const studentName = localStorage.getItem('userName') || 'Josef Anza';

  useEffect(() => {
    const fetchMyLibraryRecords = async () => {
      try {
        const res = await fetch('https://qr-school-system-7fp2.vercel.app/api/library/books');
        const data = await res.json();
        
        if (data.success) {
          const rawInventory = data.inventory;
          const myActiveLoans = [];
          const masterList = [];

          Object.keys(rawInventory).forEach((barcode) => {
            const book = rawInventory[barcode];
            
            // 🎯 NEW: Build a flattened master list array for the student directory grid
            masterList.push({
              barcode: barcode,
              title: book.title,
              author: book.author,
              status: book.status || 'Available'
            });

            // Keep your original filter logic for the student's personal active loans
            if (book.borrowedBy && book.borrowedBy.toLowerCase() === studentName.toLowerCase()) {
              myActiveLoans.push({
                barcode: barcode,
                title: book.title,
                author: book.author,
                borrowedDate: 'June 01, 2026', 
                dueDate: 'June 08, 2026',
                status: book.status || 'Borrowed',
                returnToken: `LIB-RET-${barcode}-${Math.floor(10000 + Math.random() * 90000)}`
              });
            }
          });

          setBorrowedBooks(myActiveLoans);
          setFullCatalog(masterList);
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

  // 🎯 NEW: Live search filtering against the general catalog
  const filteredCatalog = fullCatalog.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <StudentNavbar />

      <div style={styles.contentWrapper}>
        <div style={styles.headerSection}>
          <h2 style={styles.mainTitle}>📚 My Library Circulation Account</h2>
          <p style={styles.mainSubtitle}>
            Track your currently borrowed books, outstanding due dates, and browse the entire school asset repository catalog.
          </p>
        </div>

        {/* =======================================================
            SECTION 1: YOUR EXISTING CURRENTLY BORROWED LOANS MATRIX
           ======================================================= */}
        <h3 style={styles.sectionTitle}>📖 My Active Book Loans</h3>

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
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid #334155'
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
                      size={85}
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

        {/* =======================================================
            SECTION 2: NEW MASTER CATALOG LIST & FILTER MATRIX
           ======================================================= */}
        <h3 style={{ ...styles.sectionTitle, marginTop: '50px' }}>🔍 Search Campus Book Inventory</h3>
        
        {/* Search input textbox container wrapper */}
        <div style={styles.searchContainer}>
          <input 
            type="text"
            placeholder="Search catalog by book title or specific authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <p style={styles.statusText}>Loading full system catalog lines...</p>
        ) : filteredCatalog.length === 0 ? (
          <div style={styles.emptyNotice}>No catalog elements match your query string parameter fields.</div>
        ) : (
          <div style={styles.catalogGrid}>
            {filteredCatalog.map((book) => (
              <div key={book.barcode} style={styles.catalogCard}>
                <div style={styles.badgeRow}>
                  <span style={styles.barcodeLabel}>🏷️ {book.barcode}</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: book.status === 'Available' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: book.status === 'Available' ? '#4ade80' : '#f87171',
                    border: book.status === 'Available' ? '1px solid #16a34a' : '1px solid #dc2626'
                  }}>
                    {book.status.toUpperCase()}
                  </span>
                </div>
                <h4 style={styles.catalogBookTitle}>{book.title}</h4>
                <p style={styles.catalogBookAuthor}>by {book.author || 'Unknown Author'}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif', boxSizing: 'border-box', paddingBottom: '120px' },
  contentWrapper: { padding: '40px 10px', width: '100%', maxWidth: '96%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  headerSection: { marginBottom: '30px', textAlign: 'center', width: '100%' },
  mainTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' },
  mainSubtitle: { color: '#94a3b8', fontSize: '14px', margin: '0 auto', maxWidth: '600px', lineHeight: '1.5' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#94a3b8', width: '100%', maxWidth: '800px', margin: '0 0 16px 0', borderBottom: '1px solid #334155', paddingBottom: '10px', boxSizing: 'border-box' },
  statusText: { color: '#64748b', fontStyle: 'italic' },
  
  emptyNotice: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', color: '#94a3b8', width: '100%', maxWidth: '800px', boxSizing: 'border-box' },
  feedWrapper: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center', boxSizing: 'border-box' },
  
  bookCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', boxSizing: 'border-box', flexWrap: 'wrap' },
  bookDetails: { flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px' },
  badgeRow: { display: 'flex', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'space-between' },
  barcodeLabel: { fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', backgroundColor: '#0f172a', padding: '3px 8px', borderRadius: '4px', border: '1px solid #233147' },
  statusBadge: { fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' },
  bookTitle: { color: '#fff', fontSize: '18px', margin: '4px 0 0 0', fontWeight: 'bold' },
  bookAuthor: { color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0', fontStyle: 'italic' },
  
  datesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #233147', marginTop: '4px', width: '100%', boxSizing: 'border-box' },
  dateLabel: { fontSize: '9px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px' },
  dateValue: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500', marginTop: '2px' },
  
  qrWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px', minWidth: '120px', flex: '1 1 120px', boxSizing: 'border-box' },
  qrCanvasContainer: { backgroundColor: '#fff', padding: '6px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  qrTokenLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },

  // 🎯 NEW: Layout Styles for the Master General Catalog View Grid
  searchContainer: { width: '100%', maxWidth: '800px', marginBottom: '20px', boxSizing: 'border-box' },
  searchInput: { width: '100%', padding: '12px 16px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  catalogGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', width: '100%', maxWidth: '800px', boxSizing: 'border-box' },
  catalogCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', boxSizing: 'border-box' },
  catalogBookTitle: { color: '#fff', fontSize: '15px', fontWeight: 'bold', margin: '4px 0 0 0', lineHeight: '1.4' },
  catalogBookAuthor: { color: '#94a3b8', fontSize: '12px', margin: '0', fontStyle: 'italic' }
};