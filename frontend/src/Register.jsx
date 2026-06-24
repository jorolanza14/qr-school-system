import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', studentId: '', section: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // 📁 Verification Modal Flow States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const baseUrl = 'https://qr-school-system-7fp2.vercel.app'; 

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // STEP A: Request the 6-Digit Email Code from the Backend
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${baseUrl}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSuccess(true);
        setShowOtpModal(true); // Launch the popup input overlay
        setModalMessage('📧 Passcode sent! Check your personal, school, or Yopmail inbox.');
      } else {
        setIsSuccess(false);
        setMessage(data.message);
      }
    } catch (err) {
      console.error("Caught Frontend OTP Request Error Exception:", err);
      setMessage('Server connection lost.');
    }
  };

  // STEP B: Validate Code (or Backup Token '999999') and Complete Creation
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setModalMessage('');
    setIsVerifying(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode })
      });
      const data = await res.json();

      if (data.success) {
        setModalMessage('🎉 Verification Complete! Account provisioned.');
        setTimeout(() => {
          setShowOtpModal(false);
          navigate('/login');
        }, 2000);
      } else {
        setModalMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error("Caught Verification Exception Check:", err);
      setModalMessage('Verification pipeline channel timed out.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>📝 Create Account</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Register directly into the central school system ledger.</p>
        
        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required style={styles.input} />
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={styles.input} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={styles.input} />
          
          <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
            <option value="student">Student Account</option>
            <option value="faculty">Faculty Instructor</option>
            <option value="library">Librarian Clerk</option>
            <option value="security">Security Guard</option>
          </select>

          {formData.role === 'student' && (
            <>
              <input type="text" name="studentId" placeholder="Student ID Number (e.g., 2026-1111)" onChange={handleChange} required style={styles.input} />
              <input type="text" name="section" placeholder="Section Block (e.g., BSIT-4A)" onChange={handleChange} required style={styles.input} />
            </>
          )}

          <button type="submit" style={styles.btn}>Submit Registration</button>
        </form>

        {message && (
          <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: isSuccess ? '#16a34a' : '#dc2626' }}>
            {message}
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>

      {/* 🎯 NEW: POPUP OTP EMAIL VERIFICATION MODAL COCKPIT OVERLAY */}
      {showOtpModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>🔒 Enter Verification Code</h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
              We sent a validation request to <strong>{formData.email}</strong>. Enter the 6-digit pin to authorize deployment.
            </p>

            <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                maxLength="6" 
                placeholder="e.g., 123456" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                required 
                style={{ ...styles.input, textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontWeight: 'bold' }} 
              />
              
              <button type="submit" disabled={isVerifying} style={styles.modalBtn}>
                {isVerifying ? 'Confirming code...' : 'Verify Code & Finalize Account'}
              </button>
            </form>

            {modalMessage && (
              <p style={{ marginTop: '14px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', color: modalMessage.startsWith('❌') ? '#dc2626' : '#16a34a' }}>
                {modalMessage}
              </p>
            )}

            <button 
              onClick={() => setShowOtpModal(false)} 
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', width: '100%', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel Registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '380px', border: '1px solid #e2e8f0' },
  input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' },
  btn: { padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '5px' },
  
  // Modal Backdrop View Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
  modalCard: { background: '#fff', padding: '30px', borderRadius: '12px', width: '340px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  modalBtn: { padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }
};