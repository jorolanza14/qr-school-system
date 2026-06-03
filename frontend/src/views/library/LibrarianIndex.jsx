import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function LibrarianIndex() {
  const [studentToken, setStudentToken] = useState('');
  const [bookToken, setBookToken] = useState('');
  const [logMessage, setLogMessage] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('library-scanner', {
      fps: 10,
      qrbox: { width: 220, height: 220 }
    });

    scanner.render((decodedText) => {
      // Logic split: Detect if scanned code is a student identity token or a asset text token
      if (decodedText.startsWith('STU-')) {
        setStudentToken(decodedText);
      } else if (decodedText.startsWith('BOOK-')) {
        setBookToken(decodedText);
      } else {
        setLogMessage('Error: Unknown barcode configuration.');
      }
    }, () => {});

    scannerRef.current = scanner;
    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(err => console.log(err));
    };
  }, []);

  const handleCheckout = async () => {
    if (!studentToken || !bookToken) {
      setLogMessage('Error: Please populate both student credentials and asset barcode IDs.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/library/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentToken: studentToken, bookId: bookToken })
      });
      const data = await response.json();
      
      if (data.success) {
        setLogMessage(data.message);
        // Clear transaction input values
        setStudentToken('');
        setBookToken('');
      } else {
        setLogMessage(`Transaction Rejected: ${data.message}`);
      }
    } catch (err) {
      setLogMessage('Backend server connectivity failure.');
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', display: 'flex', gap: '40px' }}>
      <div style={{ width: '400px' }}>
        <h1>📖 Library Desk Console</h1>
        <nav style={{ margin: '15px 0', display: 'flex', gap: '15px' }}>
          <Link to="/library/inventory" style={{ fontWeight: 'bold', color: '#2563eb' }}>View Asset Logs</Link> | 
          <Link to="/library/resources" style={{ color: '#64748b' }}>Digital Database</Link> |
          <Link to="/" style={{ color: '#dc2626' }}>Logout</Link>
        </nav>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
          <h3>Transaction Inputs</h3>
          <p style={{ fontSize: '14px' }}><strong>Scanned Student Code:</strong> {studentToken ? <span style={{color:'green'}}>{studentToken}</span> : 'Awaiting Card Scan...'}</p>
          <p style={{ fontSize: '14px' }}><strong>Scanned Asset Barcode:</strong> {bookToken ? <span style={{color:'blue'}}>{bookToken}</span> : 'Awaiting Sticker Scan...'}</p>
          
          <button onClick={handleCheckout} style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            Confirm Asset Checkout Link
          </button>
        </div>

        {logMessage && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#eff6ff', color: '#1e40af', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
            {logMessage}
          </div>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: '400px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>📷 Library Service Lens</h3>
        <div id="library-scanner" style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}></div>
      </div>
    </div>
  );
}