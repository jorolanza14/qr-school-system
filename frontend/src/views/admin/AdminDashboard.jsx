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

  // 🔄 Synchronization Engine
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
      console.error("Telemetry pipeline sync fault:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveEventsList = async () => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/student/events-list`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.list);
      }
    } catch (err) {
      console.error("Events sync fault:", err);
    }
  };

  const fetchLostAndFoundItems = async () => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const res = await fetch(`${baseUrl}/api/lost-found/list`);
      const data = await res.json();
      if (data.success) {
        setLostItems(data.list);
      }
    } catch (err) {
      console.error("Lost & Found sync fault:", err);
    }
  };

  useEffect(() => {
    fetchSystemTelemetry();
    fetchLiveEventsList();
    fetchLostAndFoundItems();
    
    const backgroundSyncInterval = setInterval(() => {
      fetchSystemTelemetry();
      fetchLiveEventsList();
      fetchLostAndFoundItems();
    }, 3000);
    
    return () => clearInterval(backgroundSyncInterval);
  }, []);

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

  const toggleUserStatus = async (userIdNumber, currentStatus) => {
    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const nextStatus = currentStatus === 'Clear' ? 'Hold' : 'Clear';
      
      const response = await fetch(`${baseUrl}/api/admin/toggle-hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: userIdNumber, newStatus: nextStatus })
      });

      if (response.ok) {
        fetchSystemTelemetry();
      }
    } catch (err) {
      console.error("Failed executing user access block toggle parameter:", err);
    }
  };

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
      {/* 🧭 Responsive Control Topbar Header */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>👑 Root Administrator | <span style={{ color: '#38bdf8', fontWeight: 'normal' }}>{adminName}</span></div>
        <div style={styles.navMetaGroup}>
          <span style={styles.systemStatusBadge}>● System Server: Operational</span>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Container Wrapper - Responsive Layout Flow */}
      <div style={styles.layoutBody}>
        {/* 🗺️ Navigation Link Track (Side-by-side on desktop, standalone blocks stacked on mobile) */}
        <aside style={styles.sidebar}>
          <div style={styles.menuLabel}>ADMIN PLATFORM NAVIGATION</div>
          <div style={styles.sidebarLinkGroup}>
            <button onClick={() => setActiveTab('overview')} style={{ ...styles.sidebarLink, ...(activeTab === 'overview' ? styles.activeLink : {}) }}>📊 Analytics Overview</button>
            <button onClick={() => setActiveTab('users')} style={{ ...styles.sidebarLink, ...(activeTab === 'users' ? styles.activeLink : {}) }}>👥 User Account Control</button>
            <button onClick={() => setActiveTab('events')} style={{ ...styles.sidebarLink, ...(activeTab === 'events' ? styles.activeLink : {}) }}>📣 Event Broadcaster</button>
            <button onClick={() => setActiveTab('lostfound')} style={{ ...styles.sidebarLink, ...(activeTab === 'lostfound' ? styles.activeLink : {}) }}>🕵️‍♂️ Lost & Found Desk</button>
          </div>
          
          <div style={{ ...styles.menuLabel, marginTop: '15px' }}>CROSS-PORTAL DIRECT ACCESS</div>
          <div style={styles.sidebarLinkGroup}>
            <button onClick={() => navigate('/faculty')} style={styles.sidebarLink}>👨‍🏫 Launch Faculty Suite</button>
            <button onClick={() => navigate('/student/attendance')} style={styles.sidebarLink}>🎒 Launch Student Hub</button>
          </div>
        </aside>

        {/* 🛠️ Widescreen Workspace Main Content Window Container */}
        <main style={styles.workspace}>
          
          {/* ==========================================
              TAB 1: ANALYTICS OVERVIEW PANEL
             ========================================== */}
          {activeTab === 'overview' && (
            <div style={styles.contentWrapper}>
              <h2 style={styles.pageTitle}>Central Cockpit Metrics</h2>
              <p style={styles.pageSubtitle}>Real-time telemetry from across the registered system database frameworks.</p>
              
              <section style={styles.statsGrid}>
                <div style={styles.statCard}><h3>Active Registered Accounts</h3><p style={{ ...styles.statNum, color: '#38bdf8' }}>{loading ? '...' : telemetry.totalUsers}</p><span>Across 5 system roles</span></div>
                <div style={styles.statCard}><h3>Total Live Events Bulletin</h3><p style={{ ...styles.statNum, color: '#4ade80' }}>{events.length}</p><span>Active scheduling lines</span></div>
                <div style={styles.statCard}><h3>Terminal Gate Swipes</h3><p style={{ ...styles.statNum, color: '#f59e0b' }}>{loading ? '...' : telemetry.totalSwipes}</p><span>Synced with Security Index</span></div>
              </section>

              <div style={styles.overviewCard}>
                <h3 style={styles.cardHeader}>🛠️ Master System Overview</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                  Welcome back, Root Admin. This terminal layout grants you unchecked authorization boundaries across your thesis file system tree layers. Use the navigation panel items to review database fields, check client application instances, override security checkpoint blocks, or modify core account credentials dynamically.
                </p>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: USER ACCOUNT CONTROL MANAGEMENT
             ========================================== */}
          {activeTab === 'users' && (
            <div style={styles.contentWrapper}>
              <h2 style={styles.pageTitle}>User Account Access Control Deck</h2>
              <p style={styles.pageSubtitle}>Monitor credentials, check registration dates, and override student authorization parameters.</p>
              
              <div style={styles.tableCard}>
                <h3 style={styles.cardHeader}>📋 System Accounts Registry Index</h3>
                <div style={{ overflowX: 'auto', width: '100%' }}>
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
                                {user.status === 'Clear' ? 'Apply Hold' : 'Release'}
                              </button>
                            ) : <span style={{ color: '#475569', fontSize: '12px' }}>Immutable</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: EVENT BROADCASTER COMPONENT
             ========================================== */}
          {activeTab === 'events' && (
            <div style={styles.contentWrapper}>
              <h2 style={styles.pageTitle}>Campus Broadcast Controller</h2>
              <p style={styles.pageSubtitle}>Schedule massive calendar listings and notifications into the Student Portal feed arrays.</p>
              
              <div style={styles.dashboardGrid}>
                <div style={styles.formCard}>
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

                <div style={styles.formCard}>
                  <h3 style={styles.cardHeader}>🗓️ Live Broadcast Feed Logs ({events.length})</h3>
                  <div style={styles.scrollBox}>
                    {events.map(ev => (
                      <div key={ev.id || Math.random()} style={styles.eventRowItem}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '5px'}}>
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
            <div style={styles.contentWrapper}>
              <h2 style={styles.pageTitle}>Property Custodian Turn-in Ledger</h2>
              <p style={styles.pageSubtitle}>Review dynamic student surrender broadcasts and claim validations.</p>
              
              <div style={styles.tableCard}>
                <h3 style={styles.cardHeader}>📦 Surrendered Assets Ledger Inventory</h3>
                <div style={{ overflowX: 'auto', width: '100%' }}>
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
                                color: item.item_status === 'Unclaimed' ? '#f59e0b' : '#4ade80',
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
                                {item.item_status === 'Unclaimed' ? 'Claim' : 'Reopen'}
                              </button>
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

        </main>
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
    display: 'flex', 
    flexDirection: 'column',
    paddingBottom: '120px',
    boxSizing: 'border-box'
  },
  navbar: { 
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
  brand: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  navMetaGroup: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' },
  systemStatusBadge: { fontSize: '11px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '50px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' },
  
  // 🎯 FIXED: Changed to responsive layout architecture that stacks panels perfectly on mobile viewport widths
  layoutBody: { 
    display: 'flex', 
    flexDirection: 'row',
    flexWrap: 'wrap', 
    flex: '1',
    width: '100%',
    boxSizing: 'border-box'
  },
  sidebar: { 
    width: '100%', 
    flex: '1 1 250px', 
    maxWidth: '100%',
    backgroundColor: '#1e293b', 
    borderRight: '1px solid #334155', 
    borderBottom: '1px solid #334155', 
    padding: '20px 16px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px',
    boxSizing: 'border-box',
    // Desktop override handled via standard adaptive flexbox growth properties
  },
  sidebarLinkGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8px',
    width: '100%',
    marginBottom: '10px'
  },
  menuLabel: { fontSize: '10px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '6px', paddingLeft: '4px', width: '100%' },
  sidebarLink: { 
    padding: '8px 12px', 
    background: 'rgba(15, 23, 42, 0.3)', 
    border: '1px solid #334155', 
    color: '#94a3b8', 
    fontSize: '13px', 
    fontWeight: '500', 
    cursor: 'pointer', 
    borderRadius: '6px', 
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    flex: '1 1 auto',
    textAlign: 'center'
  },
  activeLink: { backgroundColor: '#0f172a', color: '#38bdf8', fontWeight: 'bold', borderColor: '#38bdf8' },
  
  workspace: { 
    flex: '3 1 500px', 
    padding: '20px 10px', 
    width: '100%',
    boxSizing: 'border-box'
  },
  contentWrapper: { width: '100%', maxWidth: '98%', margin: '0 auto', boxSizing: 'border-box' },
  pageTitle: { fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' },
  pageSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '15px', marginTop: '20px', width: '100%' },
  statCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', color: '#94a3b8', boxSizing: 'border-box' },
  statNum: { fontSize: '28px', fontWeight: 'bold', margin: '6px 0 4px 0' },
  
  overviewCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', height: 'auto', marginTop: '20px', boxSizing: 'border-box' },
  dashboardGrid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', marginTop: '20px', width: '100%' },
  formCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', minHeight: '440px', flex: '1 1 340px', boxSizing: 'border-box', width: '100%' },
  
  cardHeader: { color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: '0 0 14px 0', borderBottom: '1px solid #334155', paddingBottom: '8px', width: '100%' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', width: '100%' },
  formRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%' },
  label: { color: '#cbd5e1', fontSize: '12px', fontWeight: '600' },
  input: { padding: '8px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '8px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'none', width: '100%', boxSizing: 'border-box' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px', width: '100%' },
  successAlert: { marginTop: '10px', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#4ade80', border: '1px solid #16a34a', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' },
  
  scrollBox: { display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: '1', maxHeight: '380px' },
  eventRowItem: { backgroundColor: '#0f172a', border: '1px solid #233147', borderRadius: '8px', padding: '12px', width: '100%', boxSizing: 'border-box' },
  evTitleText: { color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  evOrganizerText: { fontSize: '10px', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' },
  evMetaText: { color: '#64748b', fontSize: '12px', marginTop: '4px' },
  
  tableCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', height: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', boxSizing: 'border-box', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '5px', textAlign: 'left', minWidth: '550px' },
  thRow: { borderBottom: '2px solid #334155' },
  th: { padding: '10px 12px', color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tdRow: { borderBottom: '1px solid #233147' },
  tdName: { padding: '12px', color: '#fff', fontSize: '13px', fontWeight: '600' },
  tdText: { padding: '12px', color: '#cbd5e1', fontSize: '13px' },
  roleBadge: { backgroundColor: '#334155', color: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' },
  statusTextLabel: { fontSize: '12px', fontWeight: '500' },
  actionBtn: { border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }
};