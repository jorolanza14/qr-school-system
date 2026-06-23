import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import StudentNavbar from './StudentNavbar';

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', category: 'Electronics / Gadgets', location: '', desc: '' });
  const [feedback, setFeedback] = useState({ msg: '', type: '' });

  // 🔄 Synchronization Engine: Query active campus property registry live from cloud backend
  const fetchLostFoundCatalog = async () => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/lost-found/list`);
      const data = await res.json();
      if (data.success && Array.isArray(data.list)) {
        setItems(data.list);
      }
    } catch (err) {
      console.error("Network baseline sync error fetching lost and found items:", err);
    }
  };

  useEffect(() => {
    fetchLostFoundCatalog();

    // ⏱️ Auto-sync tracking interval checks for status flips hands-free every 3 seconds
    const backgroundSync = setInterval(fetchLostFoundCatalog, 3000);
    return () => clearInterval(backgroundSync);
  }, []);

  // 📝 Handle Form Submission to Log a Found Asset Item permanently onto your cloud database tables
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setFeedback({ msg: '⏳ Communicating with secure server grid...', type: 'info' });

    if (!newItem.name.trim() || !newItem.location.trim()) {
      setFeedback({ msg: '❌ Please fill out all required descriptive parameters.', type: 'error' });
      return;
    }

    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const response = await fetch(`${baseUrl}/api/lost-found/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: newItem.name.trim(),
          category: newItem.category,
          location: newItem.location.trim(),
          details: newItem.desc.trim()
        })
      });
      
      const data = await response.json();

      if (data.success) {
        setItems(data.list || []); 
        setNewItem({ name: '', category: 'Electronics / Gadgets', location: '', desc: '' });
        setFeedback({ msg: '🎉 Item logged and unique asset tracking QR code issued successfully!', type: 'success' });
        setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
      } else {
        setFeedback({ msg: `❌ Submission rejected: ${data.message || 'Unknown server fault.'}`, type: 'error' });
      }
    } catch (err) {
      console.error("Failed submitting tracking asset:", err);
      setFeedback({ msg: '💥 Transmission error connecting to server pipelines.', type: 'error' });
    }
  };

  return (
    <div style={styles.container}>
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
                  <option value="Electronics / Gadgets">Electronics / Gadgets</option>
                  <option value="Documents">IDs / Wallets / Documents</option>
                  <option value="Books & Stationery">Books & Stationery</option>
                  <option value="Keys & Personal Tokens">Keys & Personal Tokens</option>
                  <option value="Other Accessories">Other Accessories</option>
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

            {feedback.msg && (
              <div style={{
                ...styles.successAlert,
                backgroundColor: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.15)' : feedback.type === 'info' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                color: feedback.type === 'success' ? '#4ade80' : feedback.type === 'info' ? '#38bdf8' : '#f87171',
                border: feedback.type === 'success' ? '1px solid #16a34a' : feedback.type === 'info' ? '1px solid #0284c7' : '1px solid #dc2626'
              }}>{feedback.msg}</div>
            )}
          </div>

          {/* Right Column: Dynamic Feed Bulletins List */}
          <div style={styles.feedColumn}>
            <h3 style={styles.sectionHeader}>📋 Active Notice Board ({items.length})</h3>
            
            <div style={styles.scrollContainer}>
              {items.length === 0 ? (
                <div style={styles.emptyNotice}>No property bulletin rows tracked inside database repository.</div>
              ) : (
                items.map(item => (
                  <div key={item.id} style={styles.itemCard}>
                    
                    <div style={styles.itemCardLayoutBody}>
                      
                      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={styles.itemCardHeader}>
                          <h4 style={styles.itemName}>{item.item_name}</h4>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: item.item_status === 'Claimed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: item.item_status === 'Claimed' ? '#10b981' : '#f59e0b',
                            border: item.item_status === 'Claimed' ? '1px solid #10b981' : '1px solid #f59e0b'
                          }}>
                            {(item.item_status || 'Unclaimed').toUpperCase()}
                          </span>
                        </div>

                        <div style={styles.metaRow}>
                          <span style={styles.metaLabel}>📁 {item.category_classification}</span>
                          <span style={styles.metaLabel}>📍 {item.location_found}</span>
                          <span style={styles.metaLabel}>📅 {item.formatted_date || 'Just Now'}</span>
                        </div>

                        <p style={styles.itemDesc}>{item.descriptive_details || 'No additional details provided.'}</p>
                      </div>

                      <div style={styles.qrBadgeWrapper}>
                        <div style={styles.qrBoxCanvasContainer}>
                          <QRCodeSVG 
                            value={item.tracking_tag_id || 'LNF-PENDING'}
                            size={90}
                            bgColor={"#ffffff"}
                            fgColor={"#0f172a"}
                            level={"L"}
                          />
                        </div>
                        <span style={styles.qrTokenTextLabel}>{item.tracking_tag_id}</span>
                      </div>

                    </div>
                    
                    <div style={styles.custodianFooter}>
                      🔒 Physical Storage Handover Location: <span style={{color: '#38bdf8', fontWeight: 'bold'}}>Property Custodian Desk</span>
                    </div>
                  </div>
                ))
              )}
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
  successAlert: { marginTop: '14px', padding: '10px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' },
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
  qrBadgeWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', minWidth: '120px' },
  qrBoxCanvasContainer: { backgroundColor: '#fff', padding: '6px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  qrTokenTextLabel: { fontSize: '10px', fontFamily: 'monospace', color: '#64748b', marginTop: '8px', textAlign: 'center', width: '100%', wordBreak: 'break-all' },
  custodianFooter: { fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '4px' },
  emptyNotice: { color: '#64748b', fontStyle: 'italic', padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center', width: '100%' }
};