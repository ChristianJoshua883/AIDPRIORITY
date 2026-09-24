import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { calculatePriority } from '../utils/assessment';

export default function Assessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [form, setForm] = useState({
    low_income: false, vulnerable_member: false, disability_or_senior: false,
    dependent_children: false, housing_insecurity: false, emergency_situation: false,
    notes: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/applicants/${id}`).then((res) => setApplicant(res.data)).catch(() => {});
  }, [id]);

  const toggle = (field) => setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/assessments', {
        applicant_id: id,
        income_per_capita: applicant?.household_size ? (applicant.monthly_income || 0) / applicant.household_size : 0,
        ...form
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Assessment failed.');
    }
    setLoading(false);
  };

  const preview = result || (() => {
    const { score, recommended_priority } = calculatePriority(form);
    return { criteria_score: score, recommended_priority, income_per_capita: applicant?.household_size ? (applicant.monthly_income || 0) / applicant.household_size : 0 };
  })();

  const isSubmitted = result !== null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Assessment</h1>
        <Link to={`/applicants/${id}`} className="btn btn-outline">Back</Link>
      </div>

      {applicant && (
        <div className="card applicant-summary">
          <h2>{applicant.first_name} {applicant.last_name}</h2>
          <p>Household: {applicant.household_code} | Barangay: {applicant.barangay} | Income: ₱{Number(applicant.monthly_income || 0).toLocaleString()}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <h2>Predefined Criteria</h2>
        <p className="note">Each criterion, if checked, contributes points to the system recommendation.</p>

        {[
          { key: 'low_income', label: 'Low Income (income per capita ≤ ₱5,000)', points: 3 },
          { key: 'vulnerable_member', label: 'Vulnerable Member', points: 2 },
          { key: 'disability_or_senior', label: 'Person with Disability or Senior Citizen', points: 2 },
          { key: 'dependent_children', label: 'Dependent Children', points: 1 },
          { key: 'housing_insecurity', label: 'Housing Insecurity', points: 2 },
          { key: 'emergency_situation', label: 'Emergency Situation', points: 3 },
        ].map((c) => (
          <label key={c.key} className="checkbox-group">
            <input type="checkbox" checked={form[c.key]} onChange={() => toggle(c.key)} disabled={isSubmitted} />
            <span>{c.label}</span>
            <span className="points">+{c.points} pts</span>
          </label>
        ))}

        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} disabled={isSubmitted} />
        </div>

        {!isSubmitted && (
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Calculating...' : 'Submit Assessment'}
          </button>
        )}
      </form>

      {result && (
        <div className="card result-card">
          <h2>System Recommendation</h2>
          <div className="result-summary">
            <div className="result-score">Score: {result.criteria_score}</div>
            <div className="result-priority">
              Recommended Priority: <span className={`badge badge-${result.recommended_priority.toLowerCase()}`}>{result.recommended_priority}</span>
            </div>
          </div>
          <div className="alert alert-warning">
            ⚠️ <strong>System Recommendation — Final decision required.</strong> An authorized social welfare worker must review and make the final decision. No automatic approval or rejection is performed.
          </div>

          <h3>Record Decision</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const decision = new FormData(e.target).get('decision');
            try {
              await api.post(`/assessments/${result.id}/decision`, { decision });
              alert('Decision recorded.');
              navigate(`/applicants/${id}`);
            } catch (err) {
              alert(err.response?.data?.error || 'Failed to record decision.');
            }
          }}>
            <div className="form-group">
              <label>Decision</label>
              <select name="decision" required>
                <option value="">Select...</option>
                <option value="ELIGIBLE">Eligible</option>
                <option value="NOT_ELIGIBLE">Not Eligible</option>
                <option value="FOR_REVIEW">For Review</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Submit Decision</button>
          </form>
        </div>
      )}
    </div>
  );
}
