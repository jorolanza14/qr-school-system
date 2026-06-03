import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LibrarianInventory() {
  const navigate = useNavigate();
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/library/books')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBooks(data.inventory);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/library')} style={{ marginBottom: '20px', padding: '6px 12px' }}>← Back to Index</button>
      <h2>📦 Library Inventory Management System</h2>
      <p style={{ color: '#64748b' }}>Monitor book listings, individual catalog IDs, and live check-out ownership parameters below.</p>
      
      {loading ? <p>Loading inventory registers...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Asset QR Code ID</th>
              <th>Book Title</th>
              <th>Author Reference</th>
              <th>Availability Status</th>
              <th>Current Borrower</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(books).map(key => (
              <tr key={key} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{key}</td>
                <td style={{ fontWeight: '500' }}>{books[key].title}</td>
                <td>{books[key].author}</td>
                <td>
                  <span style={{ 
                    background: books[key].status === 'Available' ? '#d1fae5' : '#fee2e2', 
                    color: books[key].status === 'Available' ? '#065f46' : '#991b1b',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold'
                  }}>{books[key].status}</span>
                </td>
                <td style={{ color: '#475569', fontStyle: 'italic' }}>{books[key].borrowedBy || 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}