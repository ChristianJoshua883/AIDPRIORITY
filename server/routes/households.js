const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { data: households, error } = await supabase
    .from('households')
    .select('*')
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const householdsWithCount = await Promise.all((households || []).map(async (h) => {
    const { count } = await supabase
      .from('applicants')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', h.id);
    return { ...h, applicant_count: count || 0 };
  }));
  res.json(householdsWithCount);
});

router.get('/:id/applicants', authenticateToken, async (req, res) => {
  const { data: applicants, error } = await supabase
    .from('applicants')
    .select('*')
    .eq('household_id', req.params.id)
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(applicants);
});

router.post('/', authenticateToken, async (req, res) => {
  const { household_code, address, barangay, city, province, monthly_income, household_size, housing_status } = req.body;
  if (!household_code) return res.status(400).json({ error: 'Household code is required.' });
  const { data: existing } = await supabase
    .from('households')
    .select('id')
    .eq('household_code', household_code)
    .single();
  if (existing) return res.status(400).json({ error: 'Household code already exists.' });

  const { data, error } = await supabase
    .from('households')
    .insert({ household_code, address, barangay, city, province, monthly_income, household_size, housing_status })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ id: data.id, household_code });
});

router.patch('/:id', authenticateToken, async (req, res) => {
  const { household_code, address, barangay, city, province, monthly_income, household_size, housing_status } = req.body;
  const { data, error } = await supabase
    .from('households')
    .update({ household_code, address, barangay, city, province, monthly_income, household_size, housing_status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ id: req.params.id });
});

module.exports = router;
