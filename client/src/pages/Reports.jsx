import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reports() {
  const [applicants, setApplicants] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', date_from: '', date_to: '' });
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    try {
      const res = await api.get(`/reports?${params}`);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, []);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const header = 'Name,Household Code,Monthly Income,Priority,Decision,Assessment Date\n';
    const rows = applicants.map((a) =>
      `"${a.first_name} ${a.last_name}","${a.household_code}",${a.monthly_income || 0},"${a.recommended_priority || ''}","${a.decision || ''}","${a.assessment_date || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aidpriority-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports</h1>
        <div>
          <button onClick={handlePrint} className="btn btn-outline btn-sm">Print</button>
          <button onClick={exportCSV} className="btn btn-outline btn-sm">Export CSV</button>
        </div>
      </div>

      <div className="card">
        <h2>Filters</h2>
        <div className="filter-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date From</label>
            <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>Date To</label>
            <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
          </div>
          <button onClick={loadReport} className="btn btn-primary">Apply</button>
        </div>
      </div>

      {loading ? <div className="loading">Loading report...</div> : (
        <div className="card">
          <h2>Applicant/Beneficiary List ({applicants.length})</h2>
          {applicants.length === 0 ? <p>No records match the filters.</p> : (
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Household</th><th>Income</th><th>Priority</th><th>Decision</th><th>Date</th></tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id}>
                    <td>{a.first_name} {a.last_name}</td>
                    <td>{a.household_code}</td>
                    <td>₱{Number(a.monthly_income || 0).toLocaleString()}</td>
                    <td>{a.recommended_priority ? <span className={`badge badge-${a.recommended_priority.toLowerCase()}`}>{a.recommended_priority}</span> : '—'}</td>
                    <td>{a.decision || '—'}</td>
                    <td>{a.assessment_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
