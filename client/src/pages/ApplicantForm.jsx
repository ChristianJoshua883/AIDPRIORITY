import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ApplicantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [households, setHouseholds] = useState([]);
  const [form, setForm] = useState({
    household_id: '', first_name: '', middle_name: '', last_name: '',
    birth_date: '', sex: '', civil_status: '', contact_number: '', occupation: ''
  });
  const [householdForm, setHouseholdForm] = useState({
    household_code: '', address: '', barangay: '', city: '', province: '',
    monthly_income: '', household_size: '', housing_status: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/households').then((res) => setHouseholds(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/applicants/${id}`).then((res) => {
        const a = res.data;
        setForm({
          household_id: a.household_id, first_name: a.first_name, middle_name: a.middle_name || '',
          last_name: a.last_name, birth_date: a.birth_date, sex: a.sex,
          civil_status: a.civil_status, contact_number: a.contact_number, occupation: a.occupation
        });
        setHouseholdForm({
          household_code: a.household_code || '', address: a.address || '',
          barangay: a.barangay || '', city: a.city || '', province: a.province || '',
          monthly_income: a.monthly_income || '', household_size: a.household_size || '',
          housing_status: a.housing_status || ''
        });
      }).catch(() => {});
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let householdId = form.household_id;
      if (!householdId) {
        const res = await api.post('/households', householdForm);
        householdId = res.data.id;
      } else {
        await api.patch(`/households/${householdId}`, householdForm);
      }

      if (id) {
        await api.patch(`/applicants/${id}`, { ...form, household_id: householdId });
      } else {
        await api.post('/applicants', { ...form, household_id: householdId });
      }
      navigate('/applicants');
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving.');
    }
    setLoading(false);
  };

  const updateForm = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{id ? 'Edit Applicant' : 'New Applicant'}</h1>
        <Link to="/applicants" className="btn btn-outline">Back</Link>
      </div>
      <form onSubmit={handleSubmit} className="card">
        <h2>Household Information</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Household Code</label>
            <input name="household_code" value={householdForm.household_code} onChange={updateForm(setHouseholdForm)} required />
          </div>
          <div className="form-group">
            <label>Monthly Income</label>
            <input type="number" name="monthly_income" value={householdForm.monthly_income} onChange={updateForm(setHouseholdForm)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={householdForm.address} onChange={updateForm(setHouseholdForm)} />
          </div>
          <div className="form-group">
            <label>Barangay</label>
            <input name="barangay" value={householdForm.barangay} onChange={updateForm(setHouseholdForm)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input name="city" value={householdForm.city} onChange={updateForm(setHouseholdForm)} />
          </div>
          <div className="form-group">
            <label>Province</label>
            <input name="province" value={householdForm.province} onChange={updateForm(setHouseholdForm)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Household Size</label>
            <input type="number" name="household_size" value={householdForm.household_size} onChange={updateForm(setHouseholdForm)} />
          </div>
          <div className="form-group">
            <label>Housing Status</label>
            <input name="housing_status" value={householdForm.housing_status} onChange={updateForm(setHouseholdForm)} />
          </div>
        </div>

        <h2>Personal Information</h2>
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input name="first_name" value={form.first_name} onChange={updateForm(setForm)} required />
          </div>
          <div className="form-group">
            <label>Middle Name</label>
            <input name="middle_name" value={form.middle_name} onChange={updateForm(setForm)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Last Name *</label>
            <input name="last_name" value={form.last_name} onChange={updateForm(setForm)} required />
          </div>
          <div className="form-group">
            <label>Birth Date</label>
            <input type="date" name="birth_date" value={form.birth_date} onChange={updateForm(setForm)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Sex</label>
            <select name="sex" value={form.sex} onChange={updateForm(setForm)}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Civil Status</label>
            <select name="civil_status" value={form.civil_status} onChange={updateForm(setForm)}>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Contact Number</label>
            <input name="contact_number" value={form.contact_number} onChange={updateForm(setForm)} />
          </div>
          <div className="form-group">
            <label>Occupation</label>
            <input name="occupation" value={form.occupation} onChange={updateForm(setForm)} />
          </div>
        </div>
        <div className="form-group">
          <label>Household</label>
          <select name="household_id" value={form.household_id} onChange={updateForm(setForm)}>
            <option value="">Create new household</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>{h.household_code} ({h.barangay}, {h.city})</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : id ? 'Update' : 'Register'}
        </button>
      </form>
    </div>
  );
}
