import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';

export default function Login({ onLogin, onRegister }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'social_worker' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.username,
          password: form.password
        });
        if (signInError) throw signInError;
        const userData = { id: data.user.id, full_name: data.user.user_metadata?.full_name || form.username, role: 'social_worker', username: form.username };
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        onLogin({ token: data.session.access_token, user: userData });
        navigate('/');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.username,
          password: form.password,
          options: { data: { full_name: form.full_name, role: form.role } }
        });
        if (signUpError) throw signUpError;
        setError('Account created! Please log in.');
        setTab('login');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏠 AidPriority</h1>
        <p className="subtitle">Social Welfare Priority Assessment System</p>
        <div className="tab-switch">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); }}>Login</button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); }}>Register</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} required autoFocus />
          </div>
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="social_worker">Social Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={4} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (tab === 'login' ? 'Logging in...' : 'Creating account...') : (tab === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>
        {tab === 'login' && (
          <p className="demo-hint">Demo: admin / admin123</p>
        )}
      </div>
    </div>
  );
}
