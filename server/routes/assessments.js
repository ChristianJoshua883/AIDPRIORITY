const express = require('express');
const db = require('../db');
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

router.get('/', authenticateToken, (req, res) => {
  const assessments = db.all(`
    SELECT a.*, u.full_name AS assessor_name, ap.first_name || ' ' || ap.last_name AS applicant_name
    FROM assessments a
    JOIN applicants ap ON ap.id = a.applicant_id
    LEFT JOIN users u ON u.id = a.assessed_by
    ORDER BY a.id DESC
  `);
  res.json(assessments);
});

router.get('/:id', authenticateToken, (req, res) => {
  const assessment = db.get(`
    SELECT a.*, u.full_name AS assessor_name, ap.first_name || ' ' || ap.last_name AS applicant_name
    FROM assessments a
    JOIN applicants ap ON ap.id = a.applicant_id
    LEFT JOIN users u ON u.id = a.assessed_by
    WHERE a.id = ?
  `, [req.params.id]);

  if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });
  res.json(assessment);
});

router.post('/', authenticateToken, (req, res) => {
  const {
    applicant_id,
    income_per_capita,
    low_income,
    vulnerable_member,
    disability_or_senior,
    dependent_children,
    housing_insecurity,
    emergency_situation,
    notes
  } = req.body;

  const { score, recommended_priority } = calculatePriority({
    low_income, vulnerable_member, disability_or_senior,
    dependent_children, housing_insecurity, emergency_situation
  });

  db.run(`
    INSERT INTO assessments (
      applicant_id, assessed_by, income_per_capita,
      low_income, vulnerable_member, disability_or_senior,
      dependent_children, housing_insecurity, emergency_situation,
      criteria_score, recommended_priority, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    applicant_id, req.user.id, income_per_capita,
    low_income, vulnerable_member, disability_or_senior,
    dependent_children, housing_insecurity, emergency_situation,
    score, recommended_priority, notes || null
  ], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    const newAssessment = db.get("SELECT * FROM assessments WHERE id = ?", [this.lastID]);
    res.status(201).json({ ...newAssessment, recommended_priority, criteria_score: score });
  });
});

router.post('/:id/decision', authenticateToken, (req, res) => {
  const { decision } = req.body;
  const allowed = ['ELIGIBLE', 'NOT_ELIGIBLE', 'FOR_REVIEW', 'PENDING'];
  if (!allowed.includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision.' });
  }

  db.run(
    "UPDATE assessments SET decision = ?, decision_by = ?, decision_at = ? WHERE id = ?",
    [decision, req.user.id, new Date().toISOString(), req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Assessment not found.' });
      const updated = db.get("SELECT * FROM assessments WHERE id = ?", [req.params.id]);
      res.json(updated);
    }
  );
});

module.exports = router;
