const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { data: applicants, error } = await supabase
    .from('applicants')
    .select(`
      *,
      households(*),
      assessments(
        id, applicant_id, recommended_priority, decision, created_at
      )
    `)
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const formatted = (applicants || []).map(a => ({
    ...a,
    household_code: a.households ? a.households.household_code : null,
    barangay: a.households ? a.households.barangay : null,
    city: a.households ? a.households.city : null,
    monthly_income: a.households ? a.households.monthly_income : null,
    household_size: a.households ? a.households.household_size : null,
    recommended_priority: a.assessments && a.assessments.length > 0 ? a.assessments[0].recommended_priority : null,
    decision: a.assessments && a.assessments.length > 0 ? a.assessments[0].decision : null,
    assessment_date: a.assessments && a.assessments.length > 0 ? a.assessments[0].created_at : null
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

  const { data: members, error: membersError } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', applicant.household_id)
    .order('age', { ascending: false });

  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessments')
    .select(`
      *,
      users(full_name: full_name)
    `)
    .eq('applicant_id', req.params.id)
    .order('id', { ascending: false });

  const { data: beneficiary, error: beneficiaryError } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('applicant_id', req.params.id)
    .single();

  res.json({
    ...applicant,
    household_members: members || [],
    assessments: assessments || [],
    beneficiary: beneficiary || null
  });
});

router.post('/', authenticateToken, async (req, res) => {
  const { household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation } = req.body;
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
