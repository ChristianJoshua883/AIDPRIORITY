const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { data: applicants, error } = await supabase
    .from('applicants')
    .select('*, households(*)')
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const formatted = await Promise.all((applicants || []).map(async (a) => {
    const { data: latestAssessment } = await supabase
      .from('assessments')
      .select('recommended_priority, decision, created_at')
      .eq('applicant_id', a.id)
      .order('id', { ascending: false })
      .limit(1)
      .single();
    return {
      ...a,
      household_code: a.households?.household_code || null,
      barangay: a.households?.barangay || null,
      city: a.households?.city || null,
      monthly_income: a.households?.monthly_income || null,
      household_size: a.households?.household_size || null,
      recommended_priority: latestAssessment?.recommended_priority || null,
      decision: latestAssessment?.decision || null,
      assessment_date: latestAssessment?.created_at || null
    };
  }));
  res.json(formatted);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { data: applicant, error } = await supabase
    .from('applicants')
    .select('*, households(*)')
    .eq('id', req.params.id)
    .single();
  if (error || !applicant) return res.status(404).json({ error: 'Applicant not found.' });

  const { data: members } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', applicant.household_id)
    .order('age', { ascending: false });

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*, users(full_name)')
    .eq('applicant_id', req.params.id)
    .order('id', { ascending: false });

  const { data: beneficiary } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('applicant_id', req.params.id)
    .single();

  res.json({
    ...applicant,
    household_members: members || [],
    assessments: (assessments || []).map(a => ({ ...a, assessor_full_name: a.users?.full_name || null })),
    beneficiary: beneficiary || null
  });
});

router.post('/', authenticateToken, async (req, res) => {
  const { household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation } = req.body;
  if (!household_id || !first_name || !last_name) {
    return res.status(400).json({ error: 'Household, first name, and last name are required.' });
  }
  const { data: hh } = await supabase
    .from('households')
    .select('id')
    .eq('id', household_id)
    .single();
  if (!hh) return res.status(400).json({ error: 'Household does not exist.' });

  const { data, error } = await supabase
    .from('applicants')
    .insert({ household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ id: data.id });
});

router.patch('/:id', authenticateToken, async (req, res) => {
  const { household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation } = req.body;
  const { data, error } = await supabase
    .from('applicants')
    .update({ household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ id: req.params.id });
});

module.exports = router;
