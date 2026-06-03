import React from 'react';

export default function FacultyFiltered() {
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h2>🔍 Filtered Section Records</h2>
      <p>Sort student profiles by standard attendance percentages or course section blocks.</p>
      <select style={{ padding: '8px', marginRight: '10px' }}>
        <option>BSIT - 4A</option>
        <option>BSIT - 4B</option>
      </select>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#e2e8f0' }}><th style={{ padding: '10px' }}>Student</th><th>Gate Check-Ins</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr><td style={{ padding: '10px' }}>Enzo Anza</td><td>14 / 14 Sessions</td><td style={{ color: 'green' }}>Perfect</td></tr>
        </tbody>
      </table>
    </div>
  );
}