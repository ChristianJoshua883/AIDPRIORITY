import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import supabase from './services/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applicants from './pages/Applicants';
import ApplicantForm from './pages/ApplicantForm';
import Assessment from './pages/Assessment';
import Beneficiaries from './pages/Beneficiaries';
import Assistance from './pages/Assistance';
import Reports from './pages/Reports';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userData = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email,
          role: session.user.user_metadata?.role || 'social_worker',
          username: session.user.email
        };
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const userData = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email,
          role: session.user.user_metadata?.role || 'social_worker',
          username: session.user.email
        };
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (data) => {
    const { data: sessionData, error } = await supabase.auth.signUp({
      email: data.username,
      password: data.password,
      options: { data: { full_name: data.full_name, role: data.role || 'social_worker' } }
    });
    if (error) throw error;
    return sessionData;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login onLogin={login} onRegister={register} />;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">AidPriority</div>
        <div className="nav-user">
          <span>{user.full_name} ({user.role})</span>
          <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/applicants/new" element={<ApplicantForm />} />
          <Route path="/applicants/:id" element={<ApplicantForm />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/assistance" element={<Assistance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
