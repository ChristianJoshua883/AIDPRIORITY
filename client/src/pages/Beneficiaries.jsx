import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/beneficiaries').then((res) => {
      setBeneficiaries(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Beneficiaries</h1>
      </div>
      {beneficiaries.length === 0 ? (
        <div className="card"><p>No beneficiaries registered yet.</p></div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Beneficiary</th><th>Household</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {beneficiaries.map((b) => (
                <tr key={b.id}>
                  <td>{b.beneficiary_name}</td>
                  <td>{b.household_code}</td>
                  <td><span className={`badge ${b.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span></td>
                  <td>{b.registered_at}</td>
                  <td><Link to={`/applicants/${b.applicant_id}`} className="btn btn-sm btn-outline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="card">
        <h2>How to Register a Beneficiary</h2>
        <p className="note">1. Complete an applicant assessment.</p>
        <p className="note">2. An authorized worker must record an ELIGIBLE decision on the assessment.</p>
        <p className="note">3. Register the applicant as a beneficiary from the applicant detail page.</p>
      </div>
    </div>
  );
}
