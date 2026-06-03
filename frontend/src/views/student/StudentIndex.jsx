import React from 'react';
import StudentNavbar from './StudentNavbar';
import { useNavigate } from 'react-router-dom';

export default function StudentIndex() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Student';

  return (
    <div>
      <StudentNavbar />
      <div style={styles.container}>
        <h1 style={styles.welcomeTitle}>Welcome back, {userName}!</h1>
        <p style={styles.welcomeSub}>Quick access to your terminal operations, academic logs, and entry validation tokens.</p>

        <div style={styles.grid}>
          <div style={styles.card} onClick={() => navigate('/student/attendance')}>
            <h3>📱 My Gate QR Code</h3>
            <p>Generate your instant terminal entry key to tap into the university campus gates or log classroom attendance.</p>
          </div>
          
          <div style={styles.card} onClick={() => navigate('/student/library')}>
            <h3>📚 Library Account</h3>
            <p>View your active book borrowings, upcoming return deadlines, and resource logs dynamically.</p>
          </div>

          <div style={styles.card} onClick={() => navigate('/student/events')}>
            <h3>📅 Campus Events</h3>
            <p>Check ongoing or required university activities with active automated attendance scanning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' },
  welcomeTitle: { color: '#0f172a', marginBottom: '5px' },
  welcomeSub: { color: '#64748b', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  card: { padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }
};