import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
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

  const login = async (data) => {
    await api.post('/auth/login', data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

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
