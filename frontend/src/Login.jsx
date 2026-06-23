import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 🎯 FIXED: Uses dynamic backticks to fetch the environment variable cleanly.
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user.id);

        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'faculty') navigate('/faculty');
        else if (data.user.role === 'library') navigate('/library');
        else if (data.user.role === 'security') navigate('/security');
        else if (data.user.role === 'student') navigate('/student/attendance');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to backend server right now.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>QR School System</h2>
        <p style={styles.subtitle}>Sign in to your specific dashboard panel</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input 
            type="email" 
            placeholder="e.g., student@school.edu" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Login to System</button>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  card: { background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { margin: '0 0 10px 0', textAlign: 'center', color: '#1f2937' },
  subtitle: { margin: '0 0 20px 0', textAlign: 'center', color: '#6b7280', fontSize: '14px' },
  error: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' },
  inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '14px', color: '#4b5563', fontWeight: '500' },
  input: { padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none' },
  button: { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  registerText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#4b5563' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }
};