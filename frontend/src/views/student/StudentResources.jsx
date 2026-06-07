import React, { useState, useEffect } from 'react';
import StudentNavbar from './StudentNavbar';

export default function StudentResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Synchronization Loop: Pull classroom downloads from Node backend memory
  const fetchLiveCoursewareFeed = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/resources/list');
      const data = await res.json();
      if (data.success) {
        setResources(data.resources);
      }
    } catch (err) {
      console.error("Network communication failure fetching dynamic courseware registry logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCoursewareFeed();

    // Polling hook updates student files automatically every 3 seconds for seamless presentation syncing
    const livePollingInterval = setInterval(fetchLiveCoursewareFeed, 3000);
    return () => clearInterval(livePollingInterval);
  }, []);

  return (
    <div style={styles.container}>
      {/* Pinned Shared Navigation Bar */}
      <StudentNavbar />

      <div style={styles.contentWrapper}>
        <div style={styles.headerSection}>
          <h2 style={styles.mainTitle}>📁 Classroom Resources</h2>
          <p style={styles.mainSubtitle}>
            Download syllabus materials, lecture slides, and practice notes uploaded by your course instructors.
          </p>
        </div>

        <h3 style={styles.sectionTitle}>📥 Available Downloads</h3>

        <div style={styles.feedWrapper}>
          {loading ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Re-evaluating server courseware streams...</p>
          ) : resources.length === 0 ? (
            <div style={styles.emptyNotice}>No academic materials have been posted to this index by your instructors yet.</div>
          ) : (
            resources.map((file) => (
              <div key={file.id} style={styles.resourceCard}>
                
                {/* Left Side: Metadata File Context Cards */}
                <div style={styles.fileInfo}>
                  <div style={styles.metaRow}>
                    <span style={{
                      ...styles.fileTypeBadge,
                      backgroundColor: file.type === 'PDF' ? 'rgba(239, 68, 68, 0.15)' : file.type === 'PPTX' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: file.type === 'PDF' ? '#ef4444' : file.type === 'PPTX' ? '#f59e0b' : '#3b82f6',
                      border: file.type === 'PDF' ? '1px solid #ef4444' : file.type === 'PPTX' ? '1px solid #f59e0b' : '1px solid #3b82f6'
                    }}>
                      {file.type}
                    </span>
                    <span style={styles.metaText}>Posted by: <strong>{file.professor}</strong></span>
                    <span style={styles.metaDivider}>|</span>
                    <span style={styles.metaText}>Size: {file.fileSize}</span>
                  </div>
                  <h4 style={styles.resourceTitle}>{file.title}</h4>
                  <span style={styles.dateLabel}>Uploaded on {file.dateAdded}</span>
                </div>

                {/* Right Side: Functional HTML5 Download Link Anchor */}
                <a 
                  href={file.downloadUrl} 
                  download 
                  target="_blank" 
                  rel="noreferrer" 
                  style={styles.downloadBtn}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  📥 Download
                </a>

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
  contentWrapper: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  headerSection: { marginBottom: '30px', textAlign: 'center' },
  mainTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' },
  mainSubtitle: { color: '#94a3b8', fontSize: '14px', margin: '0', maxWidth: '600px', lineHeight: '1.5' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#94a3b8', width: '100%', maxWidth: '800px', margin: '0 0 16px 0', borderBottom: '1px solid #334155', paddingBottom: '10px' },
  feedWrapper: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', TriangleSign: 'center', alignItems: 'center' },
  
  resourceCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '22px 26px', width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', boxSizing: 'border-box' },
  fileInfo: { flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' },
  metaRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  fileTypeBadge: { fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' },
  metaText: { color: '#94a3b8', fontSize: '12px' },
  metaDivider: { color: '#334155', fontSize: '12px' },
  resourceTitle: { color: '#fff', fontSize: '16px', margin: '4px 0 2px 0', fontWeight: 'bold' },
  dateLabel: { fontSize: '11px', color: '#64748b', fontStyle: 'italic' },
  
  downloadBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', minWidth: '100px', transition: 'background-color 0.2s', textAlign: 'center' },
  emptyNotice: { color: '#64748b', fontStyle: 'italic', padding: '30px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', width: '100%', maxWidth: '800px', textAlign: 'center' }
};