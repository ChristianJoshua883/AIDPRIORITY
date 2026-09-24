import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/applicants').then((res) => {
      setApplicants(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Applicants</h1>
        <Link to="/applicants/new" className="btn btn-primary">+ New Applicant</Link>
      </div>
      {applicants.length === 0 ? (
        <div className="card"><p>No applicants registered yet.</p></div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Household Code</th>
                <th>Monthly Income</th>
                <th>Priority</th>
                <th>Decision</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td>{a.first_name} {a.last_name}</td>
                  <td>{a.household_code}</td>
                  <td>₱{Number(a.monthly_income || 0).toLocaleString()}</td>
                  <td>{a.recommended_priority ? <span className={`badge badge-${a.recommended_priority.toLowerCase()}`}>{a.recommended_priority}</span> : '—'}</td>
                  <td>{a.decision || '—'}</td>
                  <td><Link to={`/applicants/${a.id}`} className="btn btn-sm btn-outline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
