import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Assistance() {
  const [records, setRecords] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({ beneficiary_id: '', assistance_type: '', amount: '', distribution_date: '', program_source: '', reference_number: '', remarks: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assistance').then((res) => setRecords(res.data)).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/assistance/beneficiaries').then((res) => setBeneficiaries(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assistance', { ...form, amount: Number(form.amount) });
      setForm({ beneficiary_id: '', assistance_type: '', amount: '', distribution_date: '', program_source: '', reference_number: '', remarks: '' });
      const res = await api.get('/assistance');
      setRecords(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record assistance.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Assistance Tracking</h1>
      </div>

      <div className="two-column">
        <div className="card">
          <h2>Add Assistance Record</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Beneficiary</label>
              <select name="beneficiary_id" value={form.beneficiary_id} onChange={(e) => setForm((prev) => ({ ...prev, beneficiary_id: e.target.value }))} required>
                <option value="">Select...</option>
                {beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assistance Type</label>
              <input name="assistance_type" value={form.assistance_type} onChange={(e) => setForm((prev) => ({ ...prev, assistance_type: e.target.value }))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount (₱)</label>
                <input type="number" name="amount" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Distribution Date</label>
                <input type="date" name="distribution_date" value={form.distribution_date} onChange={(e) => setForm((prev) => ({ ...prev, distribution_date: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label>Program / Source</label>
              <input name="program_source" value={form.program_source} onChange={(e) => setForm((prev) => ({ ...prev, program_source: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Reference Number</label>
              <input name="reference_number" value={form.reference_number} onChange={(e) => setForm((prev) => ({ ...prev, reference_number: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <textarea name="remarks" value={form.remarks} onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary">Record Assistance</button>
          </form>
        </div>

        <div className="card">
          <h2>Distribution History</h2>
          {records.length === 0 ? <p>No records yet.</p> : (
            <table className="table">
              <thead><tr><th>Beneficiary</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.beneficiary_name}</td>
                    <td>{r.assistance_type}</td>
                    <td>₱{Number(r.amount).toLocaleString()}</td>
                    <td>{r.distribution_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
