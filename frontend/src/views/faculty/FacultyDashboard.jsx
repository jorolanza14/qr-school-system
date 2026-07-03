import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const professorName = localStorage.getItem('userName') || 'Prof. Smith';
  const [selectedSection, setSelectedSection] = useState('BSIT-4A');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📈 Analytics State Calculations tied directly to your live API aggregate engine response
  const [stats, setStats] = useState({ totalEnrolled: 0, presentToday: 0, attendanceRate: 0, warningCount: 0 });

  // 📁 Academic Upload Form State Layers
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'PDF', downloadUrl: '' });
  const [uploadFeedback, setUploadFeedback] = useState('');

  // 🔄 Synchronization Engine: Sync roster details out of the SQL data pool
  useEffect(() => {
    const fetchFacultyData = async () => {
      setLoading(true);
      try {
        const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
        
        // Directs request handling to the targeted faculty metrics calculation endpoint
        const res = await fetch(`${baseUrl}/api/faculty/section/${selectedSection}`);
        const data = await res.json();
        
        if (data.success) {
          // Computes representation metrics safely on top of your actual real database rows
          const structuredRoster = data.list.map((student) => {
            // 🎯 FIXED: Pull real metrics from database fields if present, otherwise default to a clean 0 base layer
            const attended = student.attended_sessions || 0;
            const total = student.total_sessions || 0;
            const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

            return {
              ...student,
              attendanceRate: rate,
              totalSessions: total,
              attendedSessions: attended
            };
          });

          setRoster(structuredRoster);

          // Pulls computed analytic values dynamically out of your backend database CURDATE calculation payload
          setStats({
            totalEnrolled: data.metrics?.totalRoster || structuredRoster.length,
            presentToday: data.metrics?.verifiedToday || 0,
            attendanceRate: data.metrics?.performanceRate || 0,
            warningCount: data.metrics?.atRiskCount || 0
          });
        }
      } catch (err) {
        console.error("Error connecting to faculty database pipelines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [selectedSection]);

  // 🚀 Form Submission Handler: Dispatches dynamic material out to your student portals
  const handleResourceUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim() || !uploadForm.downloadUrl.trim()) return;

    try {
      const baseUrl = 'https://qr-school-system-7fp2.vercel.app';
      const response = await fetch(`${baseUrl}/api/resources/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          type: uploadForm.type,
          downloadUrl: uploadForm.downloadUrl,
          professor: professorName
        })
      });
      const data = await response.json();

      if (response.ok) {
        setUploadFeedback('🎉 Material broadcasted to dynamic student directories!');
        setUploadForm({ title: '', type: 'PDF', downloadUrl: '' });
        setTimeout(() => setUploadFeedback(''), 4000);
      } else {
        setUploadFeedback(`❌ Broadcast Aborted: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setUploadFeedback('💥 Error connecting to central server channels.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Upper Navigation Row Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>👨‍🏫 Faculty Command</h1>
            <p style={styles.subtitle}>Welcome Back, <span style={{ color: '#a78bfa' }}>{professorName}</span>.</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={() => navigate('/faculty/attendance')} style={styles.tokenBtn}>⏱️ Token Gen</button>
            <button onClick={() => navigate('/')} style={styles.logoutBtn}>Sign Out</button>
          </div>
        </header>

        {/* Roster Filter Control Module Row */}
        <div style={styles.filterBar}>
          <label style={styles.filterLabel}>Class Section:</label>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={styles.selectInput}>
            <option value="BSIT-4A">BSIT - 4A</option>
            <option value="BSIT-4B">BSIT - 4B</option>
            <option value="BSIT-3A">BSIT - 3A</option>
          </select>
        </div>

        {/* KPI Stats Analytics Cards Row */}
        <section style={styles.gridStats}>
          <div style={styles.statCard}><h3>Total Class Roster</h3><p style={styles.statNumber}>{loading ? '...' : stats.totalEnrolled}</p><span>Enrolled Students</span></div>
          <div style={styles.statCard}><h3 style={{ color: '#4ade80' }}>Verified Today</h3><p style={{ ...styles.statNumber, color: '#4ade80' }}>{stats.presentToday}</p><span>Scanned via QR Code</span></div>
          <div style={styles.statCard}><h3 style={{ color: '#60a5fa' }}>Average Attendance</h3><p style={{ ...styles.statNumber, color: '#60a5fa' }}>{stats.attendanceRate}%</p><span>Term Performance Rate</span></div>
          <div style={styles.statCard}><h3 style={{ color: '#f87171' }}>At-Risk Profiles</h3><p style={{ ...styles.statNumber, color: '#f87171' }}>{stats.warningCount}</p><span>Low Progress / Holds</span></div>
        </section>

        {/* Layout Workspace Dual Split Block */}
        <div style={styles.splitRow}>
          
          {/* Workspace Column Left: Dynamic Progress Table Card */}
          <div style={{ flex: '2', minWidth: '300px', width: '100%' }}>
            <h2 style={styles.sectionHeaderTitle}>📋 Student Tracking Matrix: {selectedSection}</h2>
            {loading ? (
              <p style={{ color: '#94a3b8', marginTop: '20px' }}>Syncing student performance vectors...</p>
            ) : roster.length === 0 ? (
              <div style={styles.emptyCard}>No students are currently registered in Section {selectedSection}.</div>
            ) : (
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Student Profile</th>
                      <th style={styles.th}>ID Code</th>
                      <th style={styles.th}>Attendance Progress Bar</th>
                      <th style={styles.th}>Sessions</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => (
                      <tr key={student.id} style={styles.trRow}>
                        <td style={styles.td}><strong>{student.name}</strong></td>
                        <td style={styles.td}><code style={styles.code}>{student.student_id_number}</code></td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={styles.progressTrack}>
                              <div style={{ 
                                ...styles.progressBar, 
                                width: `${student.attendanceRate}%`,
                                backgroundColor: student.attendanceRate >= 85 ? '#16a34a' : student.attendanceRate >= 75 ? '#eab308' : '#dc2626'
                              }} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{student.attendanceRate}%</span>
                          </div>
                        </td>
                        <td style={styles.td}>{student.attendedSessions}/{student.totalSessions}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: student.account_status === 'Clear' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                            color: student.account_status === 'Clear' ? '#4ade80' : '#f87171'
                          }}>
                            {student.account_status === 'Clear' ? 'Active' : 'Hold'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Workspace Column Right: New Classroom File Resource Upload Panel Card Component */}
          <div style={{ flex: '1', minWidth: '300px', width: '100%' }}>
            <h2 style={styles.sectionHeaderTitle}>📤 Dispatch Digital Courseware</h2>
            <div style={styles.uploadCard}>
              <form onSubmit={handleResourceUpload} style={styles.uploadForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabelText}>Resource Document Title Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Lecture Note 03" 
                    value={uploadForm.title} 
                    onChange={e => setUploadForm({...uploadForm, title: e.target.value})} 
                    style={styles.formInputBox} 
                    required 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabelText}>File Extension Suffix Group:</label>
                  <select 
                    value={uploadForm.type} 
                    onChange={e => setUploadForm({...uploadForm, type: e.target.value})} 
                    style={styles.formSelectBox}
                  >
                    <option value="PDF">PDF (Portable Document File)</option>
                    <option value="DOCX">DOCX (Word Document)</option>
                    <option value="PPTX">PPTX (Powerpoint Presentation)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabelText}>Asset Storage Download URL Route Link:</label>
                  <input 
                    type="url" 
                    placeholder="https://example-school-bucket.s3.amazonaws.com/notes.pdf" 
                    value={uploadForm.downloadUrl} 
                    onChange={e => setUploadForm({...uploadForm, downloadUrl: e.target.value})} 
                    style={styles.formInputBox} 
                    required 
                  />
                </div>

                <button type="submit" style={styles.submitUploadBtn}>Publish Courseware Asset</button>
              </form>
              
              {uploadFeedback && (
                <div style={{
                  ...styles.feedbackAlert,
                  backgroundColor: uploadFeedback.startsWith('🎉') ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                  color: uploadFeedback.startsWith('🎉') ? '#4ade80' : '#f87171',
                  border: uploadFeedback.startsWith('🎉') ? '1px solid #16a34a' : '1px solid #dc2626'
                }}>{uploadFeedback}</div>
              )}
            </div>
          </div>

        </div>
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
    boxSizing: 'border-box',
    paddingBottom: '120px' // 🎯 FIXED: Adds safe scrolling space below the courseware card for mobile viewports
  },
  contentWrapper: { 
    width: '100%', 
    maxWidth: '96%', 
    margin: '0 auto', 
    padding: '20px 10px', // 🎯 FIXED: Balanced mobile padding constraints
    boxSizing: 'border-box' 
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  headerActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  title: { color: '#fff', margin: '0', fontSize: '22px', fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px' },
  tokenBtn: { background: '#8b5cf6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' },
  logoutBtn: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' },
  filterBar: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' },
  filterLabel: { fontWeight: '600', fontSize: '14px', color: '#cbd5e1' },
  selectInput: { backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none', cursor: 'pointer' },
  gridStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px', width: '100%', boxSizing: 'border-box' },
  statCard: { backgroundColor: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #334155', color: '#94a3b8', boxSizing: 'border-box' },
  statNumber: { fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: '6px 0 2px 0' },
  
  splitRow: { display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'flex-start', width: '100%' },
  sectionHeaderTitle: { color: '#fff', fontSize: '16px', marginBottom: '14px', fontWeight: '600' },
  
  tableCard: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', overflowX: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', width: '100%', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' },
  thRow: { borderBottom: '2px solid #334155' },
  th: { padding: '10px 12px', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  trRow: { borderBottom: '1px solid #1e293b' },
  td: { padding: '12px', fontSize: '14px', color: '#e2e8f0' },
  code: { fontFamily: 'monospace', color: '#38bdf8', backgroundColor: '#0f172a', padding: '2px 5px', borderRadius: '4px', fontSize: '13px' },
  progressTrack: { width: '100px', height: '6px', backgroundColor: '#0f172a', borderRadius: '10px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '10px', transition: 'width 0.4s ease' },
  badge: { padding: '3px 8px', borderRadius: '50px', fontSize: '11px', fontWeight: 'bold' },
  emptyCard: { backgroundColor: '#1e293b', border: '1px dashed #334155', borderRadius: '10px', padding: '30px', textAlign: 'center', color: '#94a3b8', width: '100%' },

  uploadCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', boxSizing: 'border-box', width: '100%' },
  uploadForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  formLabelText: { fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' },
  formInputBox: { padding: '8px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', minWidth: '0' },
  formSelectBox: { padding: '8px 12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '14px', outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
  submitUploadBtn: { backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px', transition: 'background-color 0.2s', width: '100%' },
  feedbackAlert: { padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', width: '100%', boxSizing: 'border-box' }
};