const express = require('express');
const supabase = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { data: beneficiaries, error } = await supabase
    .from('beneficiaries')
    .select(`
      *,
      applicants(first_name, last_name),
      households(household_code)
    `)
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const formatted = (beneficiaries || []).map(b => ({
    ...b,
    beneficiary_name: b.applicants ? `${b.applicants.first_name} ${b.applicants.last_name}` : null,
    household_code: b.households ? b.households.household_code : null,
    applicant_id: b.applicant_id
  }));
  res.json(formatted);
});

router.post('/:applicant_id/register', authenticateToken, async (req, res) => {
  const applicant_id = req.params.applicant_id;
  const { data: approved, error: approvedError } = await supabase
    .from('assessments')
    .select('id')
    .eq('applicant_id', applicant_id)
    .eq('decision', 'ELIGIBLE')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  if (approvedError || !approved) return res.status(400).json({ error: 'A human ELIGIBLE decision is required before registering a beneficiary.' });

  const { data: existing, error: existingError } = await supabase
    .from('beneficiaries')
    .select('id')
    .eq('applicant_id', applicant_id)
    .single();
  if (existing) return res.status(400).json({ error: 'Beneficiary already registered.' });

  const { data, error } = await supabase
    .from('beneficiaries')
    .insert({ applicant_id, registered_by: req.user.id })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ id: data.id });
});

module.exports = router;
