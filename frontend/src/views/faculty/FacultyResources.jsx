import React from 'react';

export default function FacultyResources() {
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h2>📁 Shared Syllabus Resources</h2>
      <p>Upload documentation links and class worksheets accessible directly within student dashboards.</p>
      <input type="file" style={{ margin: '15px 0', display: 'block' }} />
      <button style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px' }}>Post Resource Link</button>
    </div>
  );
}