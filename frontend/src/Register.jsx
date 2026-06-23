import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', studentId: '', section: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // 🎯 REVERTED: Pointing back to your stable local backend port
      const res = await fetch('import.meta.env.VITE_API_BASE_URL1mr.preview.c36.airoapp.ai68.101:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 2500); // Send them to login after success
      } else {
        setIsSuccess(false);
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Server connection lost.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>📝 Create Account</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Register directly into the central school system ledger.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '380px', border: '1px solid #e2e8f0' },
  input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' },
  btn: { padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '5px' }
};