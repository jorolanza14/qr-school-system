import React from 'react';
import StudentNavbar from './StudentNavbar';

export default function StudentResources() {
  const sampleResources = [
    { id: 1, title: "Syllabus - Software Engineering 101", author: "Prof. Smith", type: "PDF" },
    { id: 2, title: "Database Schema Practice Worksheet", author: "Prof. Smith", type: "DOCX" }
  ];

  return (
    <div>
      <StudentNavbar />
      <div style={styles.container}>
        <h2>📁 Classroom Resources</h2>
        <p style={styles.subtitle}>Download syllabus materials, lecture slides, and notes uploaded by your instructors.</p>
        
        <div style={styles.list}>
          {sampleResources.map(res => (
            <div key={res.id} style={styles.card}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{res.title}</h4>
                <span style={styles.author}>Posted by: {res.author}</span>
              </div>
              <span style={styles.badge}>{res.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' },
  subtitle: { color: '#64748b', marginBottom: '25px' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  author: { fontSize: '13px', color: '#94a3b8' },
  badge: { background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }
};