import React, { useState, useEffect } from 'react';
import StudentNavbar from './StudentNavbar';

export default function StudentEvents() {
  const [events, setEvents] = useState([]);

  // 🔄 Synchronization Engine: Real-Time Network Polling Sync Link
  useEffect(() => {
    const fetchLiveEventsFromServerDatabase = async () => {
      try {
        // 🎯 FIXED: Relocated request pipeline to point to live production servers
        const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
        const res = await fetch(`${baseUrl}/api/student/events-list`);
        const data = await res.json();
        if (data.success) {
          setEvents(data.list);
        }
      } catch (error) {
        console.error("Network communication failure fetching synchronized system events matrix:", error);
      }
    };

    // Pull immediately on initial component mount wrapper
    fetchLiveEventsFromServerDatabase();

    // ⏱️ Auto-sync tick: Polls the server every 2 seconds for hands-free live updates cross-browser
    const liveServerPollInterval = setInterval(fetchLiveEventsFromServerDatabase, 2000);

    return () => clearInterval(liveServerPollInterval);
  }, []);

  return (
    <div style={styles.container}>
      {/* Pinned Shared Navigation Bar */}
      <StudentNavbar />
      
      <div style={styles.contentWrapper}>
        <h2 style={styles.mainTitle}>📅 Campus Events & Seminars</h2>
        <p style={styles.mainSubtitle}>
          Stay updated on mandatory university activities requiring automated QR code check-ins.
        </p>
        
        <div style={styles.feedWrapper}>
          {events.length === 0 ? (
            <div style={styles.emptyNotice}>No upcoming campus events scheduled at this time.</div>
          ) : (
            events.map((event) => (
              <div key={event.id || Math.random()} style={styles.eventCard}>
                <span style={styles.badge}>UPCOMING</span>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                
                <div style={styles.metaRow}>
                  <span style={styles.metaItem}>📍 Location: <strong>{event.location}</strong></span>
                  <span style={styles.metaItem}> | 📅 Date: <strong>{event.date}</strong></span>
                  <span style={styles.metaItem}> | ⏱️ Time: <strong>{event.time}</strong></span>
                </div>
                
                <p style={styles.eventDesc}>
                  {event.desc || 'No additional descriptive text provided for this calendar entry.'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif' },
  contentWrapper: { 
    padding: '40px', 
    maxWidth: '1200px', 
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  mainTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0', textAlign: 'center' },
  mainSubtitle: { color: '#94a3b8', fontSize: '14px', margin: '0 0 30px 0', textAlign: 'center' },
  feedWrapper: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px',
    width: '100%',
    alignItems: 'center'
  },
  eventCard: { padding: '25px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', width: '100%', maxWidth: '750px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  badge: { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #f59e0b', letterSpacing: '0.5px', display: 'inline-block' },
  eventTitle: { margin: '15px 0 6px 0', color: '#fff', fontSize: '18px', fontWeight: 'bold' },
  metaRow: { margin: '0 0 15px 0', fontSize: '13px', color: '#94a3b8', display: 'flex', flexWrap: 'wrap', gap: '4px' },
  metaItem: { color: '#94a3b8' },
  eventDesc: { fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: '0' },
  emptyNotice: { color: '#64748b', fontStyle: 'italic', padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center', width: '100%', maxWidth: '750px' }
};