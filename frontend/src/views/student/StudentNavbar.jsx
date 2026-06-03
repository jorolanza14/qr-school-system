import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentNavbar() {
  const navigate = useNavigate();
  const name = localStorage.getItem('userName') || 'Student';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🎒 Student Portal | <span style={{fontWeight:'normal'}}>{name}</span></div>
      <div style={styles.links}>
        <Link to="/student" style={styles.link}>Dashboard</Link>
        <Link to="/student/attendance" style={styles.link}>My QR Code</Link>
        <Link to="/student/events" style={styles.link}>Events</Link>
        <Link to="/student/library" style={styles.link}>Library</Link>
        <Link to="/student/lost-found" style={styles.link}>Lost & Found</Link>
        <Link to="/student/resources" style={styles.link}>Resources</Link>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: '#1e293b', color: '#fff', fontFamily: 'sans-serif' },
  brand: { fontSize: '18px', fontWeight: 'bold' },
  links: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }
};