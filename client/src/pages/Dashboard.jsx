import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="loading">No data available.</div>;

  const { statistics, priorityCounts, recentAssessments, recentDistributions } = data;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{statistics.totalApplicants}</h3>
          <p>Total Applicants</p>
        </div>
        <div className="stat-card">
          <h3>{statistics.totalAssessments}</h3>
          <p>Assessments</p>
        </div>
        <div className="stat-card warning">
          <h3>{statistics.pendingDecisions}</h3>
          <p>Pending Decisions</p>
        </div>
        <div className="stat-card success">
          <h3>{statistics.totalBeneficiaries}</h3>
          <p>Beneficiaries</p>
        </div>
        <div className="stat-card info">
          <h3>₱{Number(statistics.totalAssistance).toLocaleString()}</h3>
          <p>Assistance Distributed</p>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h2>Priority Summary</h2>
          <table className="table">
            <thead><tr><th>Priority</th><th>Count</th></tr></thead>
            <tbody>
              {priorityCounts.map((p) => (
                <tr key={p.recommended_priority}>
                  <td><span className={`badge badge-${p.recommended_priority.toLowerCase()}`}>{p.recommended_priority}</span></td>
                  <td>{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Recent Assessments</h2>
          {recentAssessments.length === 0 ? <p>No assessments yet.</p> : (
            <table className="table">
              <thead><tr><th>Applicant</th><th>Priority</th><th>Decision</th></tr></thead>
              <tbody>
                {recentAssessments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.applicant_name}</td>
                    <td><span className={`badge badge-${a.recommended_priority.toLowerCase()}`}>{a.recommended_priority}</span></td>
                    <td>{a.decision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Recent Distributions</h2>
        {recentDistributions.length === 0 ? <p>No distributions yet.</p> : (
          <table className="table">
            <thead><tr><th>Beneficiary</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {recentDistributions.map((a) => (
                <tr key={a.id}>
                  <td>{a.beneficiary_name}</td>
                  <td>{a.assistance_type}</td>
                  <td>₱{Number(a.amount).toLocaleString()}</td>
                  <td>{a.distribution_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
