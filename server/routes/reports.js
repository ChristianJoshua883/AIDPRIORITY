const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { status, priority, date_from, date_to } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND b.status = ?'; params.push(status); }
  if (priority) { where += ' AND a.recommended_priority = ?'; params.push(priority); }
  if (date_from) { where += ' AND a.created_at >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND a.created_at <= ?'; params.push(date_to); }

  const applicants = db.all(`
    SELECT a.*, h.household_code, h.barangay, h.city, h.monthly_income, h.household_size,
           a2.recommended_priority, a2.decision, a2.created_at AS assessment_date
    FROM applicants a
    JOIN households h ON h.id = a.household_id
    LEFT JOIN assessments a2 ON a2.applicant_id = a.id
    ${where}
    ORDER BY a.id DESC
  `, params);
  res.json(applicants);
});

module.exports = router;
