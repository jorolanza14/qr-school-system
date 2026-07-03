import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('userName') || 'System Administrator';
  
  // 🧭 Control Navigation Tabs State
  const [activeTab, setActiveTab] = useState('overview');

  // 👥 Dynamic System Users & Metrics States
  const [users, setUsers] = useState([]);
  const [telemetry, setTelemetry] = useState({ totalUsers: 0, totalSwipes: 0 });
  const [loading, setLoading] = useState(true);

  // 🗓️ Events State Layer
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', organizer: 'Admin Office', desc: '' });
  const [eventFeedback, setEventFeedback] = useState('');

  // 🔍 Lost & Found State Layer
  const [lostItems, setLostItems] = useState([]);

  // 🔄 Synchronization Engine: Fetch and pull metrics + accounts from production server
  const fetchSystemTelemetry = async () => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/admin/system-telemetry`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.accounts);
        setTelemetry(data.telemetry);
      }
    } catch (err) {
      console.error("Telemetry acquisition pipeline mismatch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current live events list from Node API
  const fetchLiveEventsList = async () => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/student/events-list`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.list);
      }
    } catch (err) {
      console.error("Events listing database sync fault:", err);
    }
  };

  // 🔍 Fetch active Lost & Found items
  const fetchLostAndFoundItems = async () => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/lost-found/list`);
      const data = await res.json();
      if (data.success) {
        setLostItems(data.list);
      }
    } catch (err) {
      console.error("Lost & Found panel synchronization error:", err);
    }
  };

  // Setup live background loop hooks to sync cross-browser edits immediately
  useEffect(() => {
    fetchSystemTelemetry();
    fetchLiveEventsList();
    fetchLostAndFoundItems();
    
    // Ticks every 3 seconds so dashboard telemetry mirrors live user traffic
    const backgroundSyncInterval = setInterval(() => {
      fetchSystemTelemetry();
      fetchLiveEventsList();
      fetchLostAndFoundItems();
    }, 3000);
    
    return () => clearInterval(backgroundSyncInterval);
  }, []);

  // 🚀 Connect Admin Event Publisher straight to the centralized API endpoint
  const handlePublishEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.location.trim()) return;

    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const response = await fetch(`${baseUrl}/api/admin/add-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.list);
        setNewEvent({ title: '', date: '', time: '', location: '', organizer: 'Admin Office', desc: '' });
        setEventFeedback('📢 Event broadcasted dynamically across the server network!');
        setTimeout(() => setEventFeedback(''), 3000);
      }
    } catch (err) {
      console.error("Backend transmission link failure:", err);
    }
  };

  // ⚡ Change User Account Standing (Clear vs Hold)
  const toggleUserStatus = async (userIdNumber, currentStatus) => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const nextStatus = currentStatus === 'Clear' ? 'Hold' : 'Clear';
      
      const response = await fetch(`${baseUrl}/api/admin/toggle-hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: userIdNumber,
          newStatus: nextStatus
        })
      });

      if (response.ok) {
        fetchSystemTelemetry(); // Re-trigger telemetry data pull to update view matrix instantly
      }
    } catch (err) {
      console.error("Failed executing user access block toggle parameter:", err);
    }
  };

  // 🤝 Process Lost Item Handover Claim States
  const handleToggleItemClaimStatus = async (itemId, currentStatus) => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const nextStatus = currentStatus === 'Unclaimed' ? 'Claimed' : 'Unclaimed';

      const response = await fetch(`${baseUrl}/api/lost-found/toggle-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, nextStatus })
      });

      if (response.ok) {
        fetchLostAndFoundItems();
      }
    } catch (err) {
      console.error("Failed to re-write asset resolution parameters:", err);
    }
  };

  return (
    <div style={styles.container}>
      {/* 🧭 Top Master Control Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>👑 Root Administrator | <span style={{ color: '#38bdf8' }}>{adminName}</span></div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={styles.systemStatusBadge}>● System Server: Operational</span>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.layoutBody}>
        {/* 🗺️ Sidebar Master Route Navigation */}
        <aside style={styles.sidebar}>
          <div style={styles.menuLabel}>ADMIN PLATFORM NAVIGATION</div>
          <button onClick={() => setActiveTab('overview')} style={{ ...styles.sidebarLink, ...(activeTab === 'overview' ? styles.activeLink : {}) }}>📊 Analytics Overview</button>
          <button onClick={() => setActiveTab('users')} style={{ ...styles.sidebarLink, ...(activeTab === 'users' ? styles.activeLink : {}) }}>👥 User Account Control</button>
          <button onClick={() => setActiveTab('events')} style={{ ...styles.sidebarLink, ...(activeTab === 'events' ? styles.activeLink : {}) }}>📣 Event Broadcaster</button>
          <button onClick={() => setActiveTab('lostfound')} style={{ ...styles.sidebarLink, ...(activeTab === 'lostfound' ? styles.activeLink : {}) }}>🕵️‍♂️ Lost & Found Desk</button>
          
          <div style={{ ...styles.menuLabel, marginTop: '20px' }}>CROSS-PORTAL DIRECT ACCESSS</div>
          <button onClick={() => navigate('/faculty')} style={styles.sidebarLink}>👨‍🏫 Launch Faculty Suite</button>
          <button onClick={() => navigate('/student/attendance')} style={styles.sidebarLink}>🎒 Launch Student Hub</button>
        </aside>

        {/* 🛠️ Dynamic Workspace Panel */}
        <main style={styles.workspace}>
          
          {/* ==========================================
              TAB 1: ANALYTICS OVERVIEW PANEL
             ========================================== */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={styles.pageTitle}>Central Cockpit Metrics</h2>
              <p style={styles.pageSubtitle}>Real-time telemetry from across the registered system database frameworks.</p>
              
              <section style={styles.statsGrid}>
                <div style={styles.statCard}><h3>Active Registered Accounts</h3><p style={{ ...styles.statNum, color: '#38bdf8' }}>{loading ? '...' : telemetry.totalUsers}</p><span>Across 5 system roles</span></div>
                <div style={styles.statCard}><h3>Total Live Events Bulletin</h3><p style={{ ...styles.statNum, color: '#4ade80' }}>{events.length}</p><span>Active scheduling lines</span></div>
                <div style={styles.statCard}><h3>Terminal Gate Swipes</h3><p style={{ ...styles.statNum, color: '#f59e0b' }}>{loading ? '...' : telemetry.totalSwipes}</p><span>Synced with Security Index</span></div>
              </section>

              <div style={{ ...styles.card, height: 'auto', marginTop: '20px' }}>
                <h3 style={styles.cardHeader}>🛠️ Master System Overview</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                  Welcome back, Root Admin. This terminal layout grants you unchecked authorization boundaries across your thesis file system tree layers. Use the navigation panel items on the left to review database fields, check client application instances, override security checkpoint blocks, or modify core account credentials dynamically.
                </p>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: USER ACCOUNT CONTROL MANAGEMENT
             ========================================== */}
          {activeTab === 'users' && (
            <div>
              <h2 style={styles.pageTitle}>User Account Access Control Deck</h2>
              <p style={styles.pageSubtitle}>Monitor credentials, check registration dates, and override student authorization parameters.</p>
              
              <div style={{ ...styles.card, height: 'auto', width: '100%', overflowY: 'auto' }}>
                <h3 style={styles.cardHeader}>📋 System Accounts Registry Index</h3>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email Vector</th>
                      <th style={styles.th}>System Role</th>
                      <th style={styles.th}>Account Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={styles.tdRow}>
                        <td style={styles.tdName}>{user.name}</td>
                        <td style={styles.tdText}>{user.email}</td>
                        <td style={styles.tdText}><span style={styles.roleBadge}>{user.role.toUpperCase()}</span></td>
                        <td style={styles.tdText}>
                          <span style={{
                            ...styles.statusTextLabel,
                            color: user.status === 'Clear' || user.status === 'Active' ? '#4ade80' : '#f87171'
                          }}>
                            ● {user.status === 'Clear' ? 'Active' : user.status}
                          </span>
                        </td>
                        <td style={styles.tdText}>
                          {user.role === 'student' ? (
                            <button onClick={() => toggleUserStatus(`STU-${user.id}`, user.status)} style={{
                              ...styles.actionBtn,
                              backgroundColor: user.status === 'Clear' ? '#7f1d1d' : '#16a34a'
                            }}>
                              {user.status === 'Clear' ? 'Apply System Hold' : 'Release Profile Hold'}
                            </button>
                          ) : <span style={{ color: '#475569', fontSize: '12px' }}>Immutable Role</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: EVENT BROADCASTER COMPONENT
             ========================================== */}
          {activeTab === 'events' && (
            <div>
              <h2 style={styles.pageTitle}>Campus Broadcast Controller</h2>
              <p style={styles.pageSubtitle}>Schedule massive calendar listings and notifications into the Student Portal feed arrays.</p>
              
              <div style={styles.dashboardGrid}>
                <div style={styles.card}>
                  <h3 style={styles.cardHeader}>📝 Broadcast New Event Notice</h3>
                  <form onSubmit={handlePublishEvent} style={styles.form}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Event Title:</label>
                      <input type="text" placeholder="e.g., General Assembly" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} style={styles.input} required />
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Date:</label>
                        <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} style={styles.input} required />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Time Window:</label>
                        <input type="text" placeholder="9:00 AM - 12:00 PM" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} style={styles.input} />
                      </div>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Venue Location:</label>
                      <input type="text" placeholder="Building B IT Lab 3" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Description Metadata:</label>
                      <textarea rows="2" placeholder="Provide guidelines, clothing code regulations, etc..." value={newEvent.desc} onChange={(e) => setNewEvent({...newEvent, desc: e.target.value})} style={styles.textarea} />
                    </div>
                    <button type="submit" style={styles.submitBtn}>Publish Live Bulletin Notice</button>
                  </form>
                  {eventFeedback && <div style={styles.successAlert}>{eventFeedback}</div>}
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardHeader}>🗓️ Live Broadcast Feed Logs ({events.length})</h3>
                  <div style={styles.scrollBox}>
                    {events.map(ev => (
                      <div key={ev.id || Math.random()} style={styles.eventRowItem}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                          <span style={styles.evTitleText}>{ev.title}</span>
                          <span style={styles.evOrganizerText}>🏢 {ev.organizer}</span>
                        </div>
                        <div style={styles.evMetaText}>📍 {ev.location} | 📅 {ev.date} ({ev.time})</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: CAMPUS PROPERTY CUSTODIAN DESK
             ========================================== */}
          {activeTab === 'lostfound' && (
            <div>
              <h2 style={styles.pageTitle}>Property Custodian Turn-in Ledger</h2>
              <p style={styles.pageSubtitle}>Review dynamic student surrender broadcasts and claim validations.</p>
              
              <div style={{ ...styles.card, height: 'auto', width: '100%', overflowY: 'auto' }}>
                <h3 style={styles.cardHeader}>📦 Surrendered Assets Ledger Inventory</h3>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Tracking Code</th>
                      <th style={styles.th}>Asset Item</th>
                      <th style={styles.th}>Classification</th>
                      <th style={styles.th}>Location Found</th>
                      <th style={styles.th}>Status Badge</th>
                      <th style={styles.th}>Action Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lostItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ ...styles.tdText, textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '24px' }}>
                          No surrendered logs reported on system notice matrices.
                        </td>
                      </tr>
                    ) : (
                      lostItems.map(item => (
                        <tr key={item.id} style={styles.tdRow}>
                          <td style={{ ...styles.tdText, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 'bold' }}>{item.tracking_tag_id}</td>
                          <td style={styles.tdName}>{item.item_name}</td>
                          <td style={styles.tdText}>{item.category_classification}</td>
                          <td style={styles.tdText}>📍 {item.location_found}</td>
                          <td style={styles.tdText}>
                            <span style={{
                              ...styles.roleBadge,
                              backgroundColor: item.item_status === 'Unclaimed' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                              color: item.item_status === 'Unclaimed' ? '#f59e0b' : '#44ade80',
                              border: item.item_status === 'Unclaimed' ? '1px solid #f59e0b' : '1px solid #16a34a'
                            }}>
                              {item.item_status.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.tdText}>
                            <button 
                              onClick={() => handleToggleItemClaimStatus(item.id, item.item_status)} 
                              style={{
                                ...styles.actionBtn,
                                backgroundColor: item.item_status === 'Unclaimed' ? '#16a34a' : '#475569'
                              }}
                            >
                              {item.item_status === 'Unclaimed' ? 'Mark As Claimed' : 'Reopen Record'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', color: '#f1f5f9', display: 'flex', flexDirection: 'column' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '16px 40px', borderBottom: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' },
  brand: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  systemStatusBadge: { fontSize: '12px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '50px', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  layoutBody: { display: 'flex', flex: '1' },
  sidebar: { width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '30px 16px', display: 'flex', flexDirection: 'column', gap: '6px' },
  menuLabel: { fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '6px', paddingLeft: '8px' },
  sidebarLink: { width: '100%', textAlign: 'left', padding: '11px 14px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' },
  activeLink: { backgroundColor: '#0f172a', color: '#38bdf8', fontWeight: 'bold', borderLeft: '3px solid #38bdf8', borderRadius: '0 6px 6px 0' },
  workspace: { flex: '1', padding: '40px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' },
  pageSubtitle: { color: '#94a3b8', fontSize: '14px', margin: '0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '24px' },
  statCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', color: '#94a3b8' },
  statNum: { fontSize: '32px', fontWeight: 'bold', margin: '8px 0 4px 0' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '30px', marginTop: '24px' },
  card: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', height: '480px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' },
  cardHeader: { color: '#fff', fontSize: '15px', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid #334155', paddingBottom: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' },
  formRow: { display: 'flex', gap: '12px' },
  label: { color: '#cbd5e1', fontSize: '12px', fontWeight: '600' },
  input: { padding: '8px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  textarea: { padding: '8px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'none' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '6px' },
  successAlert: { marginTop: '10px', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#4ade80', border: '1px solid #16a34a', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' },
  scrollBox: { display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: '1' },
  eventRowItem: { backgroundColor: '#0f172a', border: '1px solid #233147', borderRadius: '8px', padding: '12px' },
  evTitleText: { color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  evOrganizerText: { fontSize: '11px', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' },
  evMetaText: { color: '#64748b', fontSize: '12px', marginTop: '4px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' },
  thRow: { borderBottom: '2px solid #334155' },
  th: { padding: '12px 16px', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tdRow: { borderBottom: '1px solid #233147', transition: 'background 0.2s' },
  tdName: { padding: '14px 16px', color: '#fff', fontSize: '14px', fontWeight: '600' },
  tdText: { padding: '14px 16px', color: '#cbd5e1', fontSize: '14px' },
  roleBadge: { backgroundColor: '#334155', color: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' },
  statusTextLabel: { fontSize: '13px', fontWeight: '500' },
  actionBtn: { border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'background 0.2s' }
};