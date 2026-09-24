const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function calculatePriority(data) {
  let score = 0;
  if (data.low_income) score += 3;
  if (data.vulnerable_member) score += 2;
  if (data.disability_or_senior) score += 2;
  if (data.dependent_children) score += 1;
  if (data.housing_insecurity) score += 2;
  if (data.emergency_situation) score += 3;
  let recommended_priority = 'LOW';
  if (score >= 7) recommended_priority = 'HIGH';
  else if (score >= 4) recommended_priority = 'MEDIUM';
  return { score, recommended_priority };
}

router.get('/', authenticateToken, async (req, res) => {
  const { data: assessments, error } = await supabase
    .from('assessments')
    .select(`
      *,
      users(full_name: full_name),
      applicants(first_name, last_name)
    `)
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const formatted = (assessments || []).map(a => ({
    ...a,
    assessor_name: a.users ? a.users.full_name : null,
    applicant_name: a.applicants ? `${a.applicants.first_name} ${a.applicants.last_name}` : null
  }));
  res.json(formatted);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      *,
      users(full_name: full_name),
      applicants(first_name, last_name)
    `)
    .eq('id', req.params.id)
    .single();
  if (error || !assessment) return res.status(404).json({ error: 'Assessment not found.' });
  const formatted = {
    ...assessment,
    assessor_name: assessment.users ? assessment.users.full_name : null,
    applicant_name: assessment.applicants ? `${assessment.applicants.first_name} ${assessment.applicants.last_name}` : null
  };
  res.json(formatted);
});

router.post('/', authenticateToken, async (req, res) => {
  const { applicant_id, income_per_capita, low_income, vulnerable_member, disability_or_senior, dependent_children, housing_insecurity, emergency_situation, notes } = req.body;
  const { score, recommended_priority } = calculatePriority({ low_income, vulnerable_member, disability_or_senior, dependent_children, housing_insecurity, emergency_situation });
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      applicant_id, assessed_by: req.user.id, income_per_capita,
      low_income, vulnerable_member, disability_or_senior,
      dependent_children, housing_insecurity, emergency_situation,
      criteria_score: score, recommended_priority,
      notes: notes || null
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ ...data, recommended_priority, criteria_score: score });
});

router.post('/:id/decision', authenticateToken, async (req, res) => {
  const { decision } = req.body;
  const allowed = ['ELIGIBLE', 'NOT_ELIGIBLE', 'FOR_REVIEW', 'PENDING'];
  if (!allowed.includes(decision)) return res.status(400).json({ error: 'Invalid decision.' });
  const { data, error } = await supabase
    .from('assessments')
    .update({ decision, decision_by: req.user.id, decision_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
