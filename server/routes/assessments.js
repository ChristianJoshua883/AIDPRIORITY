const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

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

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const assessments = await db.all(`
    SELECT a.*, u.full_name AS assessor_name, ap.first_name || ' ' || ap.last_name AS applicant_name
    FROM assessments a
    LEFT JOIN users u ON u.id = a.assessed_by
    LEFT JOIN applicants ap ON ap.id = a.applicant_id
    ORDER BY a.id DESC
  `);
  res.json(assessments);
}));

router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const assessment = await db.get(`
    SELECT a.*, u.full_name AS assessor_name, ap.first_name || ' ' || ap.last_name AS applicant_name
    FROM assessments a
    LEFT JOIN users u ON u.id = a.assessed_by
    LEFT JOIN applicants ap ON ap.id = a.applicant_id
    WHERE a.id = ?
  `, [req.params.id]);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });
  res.json(assessment);
}));

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { applicant_id, income_per_capita, low_income, vulnerable_member, disability_or_senior, dependent_children, housing_insecurity, emergency_situation, notes } = req.body;
  if (!applicant_id) return res.status(400).json({ error: 'Applicant is required.' });
  const ap = await db.get("SELECT id FROM applicants WHERE id = ?", [applicant_id]);
  if (!ap) return res.status(400).json({ error: 'Applicant does not exist.' });

  const { score, recommended_priority } = calculatePriority({ low_income, vulnerable_member, disability_or_senior, dependent_children, housing_insecurity, emergency_situation });
  const result = await db.run(
    `INSERT INTO assessments (applicant_id, assessed_by, income_per_capita, low_income, vulnerable_member, disability_or_senior, dependent_children, housing_insecurity, emergency_situation, criteria_score, recommended_priority, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [applicant_id, req.user.id, income_per_capita || 0, low_income || 0, vulnerable_member || 0, disability_or_senior || 0, dependent_children || 0, housing_insecurity || 0, emergency_situation || 0, score, recommended_priority, notes || null]
  );
  res.status(201).json({ id: result.lastID, recommended_priority, criteria_score: score, applicant_id });
}));

router.post('/:id/decision', authenticateToken, asyncHandler(async (req, res) => {
  const { decision } = req.body;
  const allowed = ['ELIGIBLE', 'NOT_ELIGIBLE', 'FOR_REVIEW', 'PENDING'];
  if (!allowed.includes(decision)) return res.status(400).json({ error: 'Invalid decision.' });
  const assessment = await db.get("SELECT id FROM assessments WHERE id = ?", [req.params.id]);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });

  await db.run(
    "UPDATE assessments SET decision = ?, decision_by = ?, decision_at = datetime('now') WHERE id = ?",
    [decision, req.user.id, req.params.id]
  );
  res.json({ id: req.params.id, decision });
}));

module.exports = router;