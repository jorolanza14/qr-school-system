import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // 🔄 Import our dynamic QR code rendering library
import StudentNavbar from './StudentNavbar';

export default function LostAndFound() {
  const [items, setItems] = useState([
    { id: 101, token: 'LNF-ITEM-RFID-88392', name: 'RFID Student ID Card', category: 'Documents', location: 'Building A Room 302', date: 'June 05, 2026', status: 'Unclaimed', desc: 'Belongs to a 3rd Year student. Found near the projector podium desk.', contact: 'Property Custodian Desk' },
    { id: 102, token: 'LNF-ITEM-PNC-47291', name: 'Black Mechanical Pencil', category: 'Stationery', location: 'Campus Library Bench', date: 'June 04, 2026', status: 'Claimed', desc: 'Pilot Rexgrip 0.5mm. Safely returned to owner.', contact: 'None' },
    { id: 103, token: 'LNF-ITEM-EAR-31049', name: 'Wireless Earbud Case', category: 'Electronics', location: 'Gymnasium Bleachers', date: 'June 02, 2026', status: 'Unclaimed', desc: 'White matte charging case. No brand name visible.', contact: 'Guard Post 2' }
  ]);

  const [newItem, setNewItem] = useState({ name: '', category: 'Electronics', location: '', desc: '' });
  const [feedback, setFeedback] = useState('');

  // 📝 Handle Form Submission to Log a Found Asset Item
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.location.trim()) return;

    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });

    const uniqueId = Date.now();
    // 🛠️ Generate a specific tracking token formula for this item registry row
    const generatedToken = `LNF-ITEM-${newItem.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const itemLog = {
      id: uniqueId,
      token: generatedToken,
      name: newItem.name,
      category: newItem.category,
      location: newItem.location,
      date: formattedDate,
      status: 'Unclaimed',
      desc: newItem.desc || 'No additional details provided.',
      contact: 'Surrendered by Student Finder'
    };

    setItems([itemLog, ...items]);
    setNewItem({ name: '', category: 'Electronics', location: '', desc: '' });
    setFeedback('🎉 Item logged and unique asset tracking QR code issued successfully!');
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div style={styles.container}>
      {/* Pinned Shared Navigation Menu Header bar */}
      <StudentNavbar />

      <div style={styles.contentWrapper}>
        <div style={styles.headerSection}>
          <h2 style={styles.pageTitle}>🔍 Campus Lost & Found Asset Ledger</h2>
          <p style={styles.pageSubtitle}>
            Surrender found items to the nearest Guard Post. Once logged, a secure tracking QR tag is generated to identify the item inside physical containment storage locker bins.
          </p>
        </div>

        <div style={styles.layoutGrid}>
          
          {/* Left Column: Report Found Item Form Component */}
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>📝 Report a Found Item</h3>
            <form onSubmit={handleSubmitReport} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Item Name / Title:</label>
                <input 
                  type="text" 
                  placeholder="e.g., Apple Pencil, Hydro Flask"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category Classification:</label>
                <select 
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  style={styles.select}
                >
                  <option value="Electronics">Electronics / Gadgets</option>
                  <option value="Documents">IDs / Wallets / Documents</option>
                  <option value="Stationery">Books & Stationery</option>
                  <option value="Keys">Keys & Personal Tokens</option>
                  <option value="Others">Other Accessories</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Approximate Location Found:</label>
                <input 
                  type="text" 
                  placeholder="e.g., Cafeteria Counter, Quadrangle"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Additional Descriptive Details:</label>
                <textarea 
                  rows="3"
                  placeholder="Mention color, brand tags, notable scratches, or distinguishing indicators..."
                  value={newItem.desc}
                  onChange={(e) => setNewItem({...newItem, desc: e.target.value})}
                  style={styles.textarea}
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                Broadcast & Generate Tracking Tag
              </button>
            </form>

            {feedback && <div style={styles.successAlert}>{feedback}</div>}
          </div>

          {/* Right Column: Dynamic Feed Bulletins List */}
          <div style={styles.feedColumn}>
            <h3 style={styles.sectionHeader}>📋 Active Notice Board ({items.length})</h3>
            
            <div style={styles.scrollContainer}>
              {items.map(item => (
                <div key={item.id} style={styles.itemCard}>
                  
                  {/* Outer flex row to hold data side-by-side with its custom QR asset token */}
                  <div style={styles.itemCardLayoutBody}>
                    
                    {/* Left text data content container block */}
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={styles.itemCardHeader}>
                        <h4 style={styles.itemName}>{item.name}</h4>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: item.status === 'Unclaimed' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: item.status === 'Unclaimed' ? '#f59e0b' : '#10b981',
                          border: item.status === 'Unclaimed' ? '1px solid #f59e0b' : '1px solid #10b981'
                        }}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={styles.metaRow}>
                        <span style={styles.metaLabel}>📁 {item.category}</span>
                        <span style={styles.metaLabel}>📍 {item.location}</span>
                        <span style={styles.metaLabel}>📅 {item.date}</span>
                      </div>

                      <p style={styles.itemDesc}>{item.desc}</p>
                    </div>

                    {/* 🔄 NEW FEATURE CARD RIGHT: Individual Item Inventory QR Code Block */}
                    <div style={styles.qrBadgeWrapper}>
                      <div style={styles.qrBoxCanvasContainer}>
                        <QRCodeSVG 
                          value={item.token}
                          size={90}
                          bgColor={"#ffffff"}
                          fgColor={"#0f172a"}
                          level={"L"}
                        />
                      </div>
                      <span style={styles.qrTokenTextLabel}>{item.token}</span>
                    </div>

                  </div>
                  
                  <div style={styles.custodianFooter}>
                    🔒 Physical Storage Handover Location: <span style={{color: '#38bdf8', fontWeight: 'bold'}}>{item.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', color: '#f1f5f9' },
  contentWrapper: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  headerSection: { marginBottom: '35px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' },
  pageSubtitle: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0' },
  layoutGrid: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px', alignItems: 'start' },
  
  card: { backgroundColor: '#1e293b', padding: '28px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' },
  cardHeader: { color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0', borderBottom: '1px solid #334155', paddingBottom: '12px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#cbd5e1', fontSize: '13px', fontWeight: '600' },
  input: { padding: '10px 14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  select: { padding: '10px 14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', cursor: 'pointer' },
  textarea: { padding: '10px 14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif', resize: 'none' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '8px', transition: 'background 0.2s' },
  successAlert: { marginTop: '14px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#4ade80', border: '1px solid #16a34a', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' },
  
  feedColumn: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionHeader: { color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0' },
  scrollContainer: { display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '650px', overflowY: 'auto', paddingRight: '6px' },
  
  itemCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  itemCardLayoutBody: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  itemCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { color: '#fff', fontSize: '16px', margin: '0', fontWeight: 'bold' },
  statusBadge: { fontSize: '11px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '4px', letterSpacing: '0.5px' },
  metaRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  metaLabel: { color: '#94a3b8', fontSize: '12px', backgroundColor: '#0f172a', padding: '3px 8px', borderRadius: '4px', border: '1px solid #1e293b' },
  itemDesc: { color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5', margin: '0', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #1e293b' },
  
  // New Inventory QR code block layout styling
  qrBadgeWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', minWidth: '120px' },
  qrBoxCanvasContainer: { backgroundColor: '#fff', padding: '6px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  qrTokenTextLabel: { fontSize: '10px', fontFamily: 'monospace', color: '#64748b', marginTop: '8px', textAlign: 'center', width: '100%', wordBreak: 'break-all' },
  
  custodianFooter: { fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '4px' }
};