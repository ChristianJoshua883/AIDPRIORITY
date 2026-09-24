const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { data: records, error } = await supabase
    .from('assistance_records')
    .select('*, applicants(first_name, last_name), households(household_code), users(full_name)')
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json((records || []).map(r => ({
    ...r,
    beneficiary_name: r.applicants ? `${r.applicants.first_name} ${r.applicants.last_name}` : null,
    household_code: r.households?.household_code || null,
    released_by_name: r.users?.full_name || null
  })));
});

router.get('/beneficiaries', authenticateToken, async (req, res) => {
  const { data: beneficiaries, error } = await supabase
    .from('beneficiaries')
    .select('id, applicants(first_name, last_name)')
    .eq('status', 'ACTIVE')
    .order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json((beneficiaries || []).map(b => ({
    id: b.id,
    name: b.applicants ? `${b.applicants.first_name} ${b.applicants.last_name}` : null
  })));
});

router.post('/', authenticateToken, async (req, res) => {
  const { beneficiary_id, assistance_type, amount, distribution_date, program_source, reference_number, status, remarks } = req.body;
  if (!beneficiary_id || !assistance_type || !distribution_date) {
    return res.status(400).json({ error: 'Beneficiary, assistance type, and distribution date are required.' });
  }
  const { data, error } = await supabase
    .from('assistance_records')
    .insert({
      beneficiary_id, assistance_type, amount: amount || 0, distribution_date,
      program_source: program_source || null, reference_number: reference_number || null,
      status: status || 'RELEASED', released_by: req.user.id, remarks: remarks || null
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ id: data.id });
});

module.exports = router;
