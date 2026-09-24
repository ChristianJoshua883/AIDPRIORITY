const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const beneficiaries = db.all(`
    SELECT b.*, ap.first_name || ' ' || ap.last_name AS beneficiary_name,
           h.household_code, a.id AS applicant_id
    FROM beneficiaries b
    JOIN applicants ap ON ap.id = b.applicant_id
    JOIN households h ON h.id = ap.household_id
    LEFT JOIN applicants a ON a.id = b.applicant_id
    ORDER BY b.id DESC
  `);
  res.json(beneficiaries);
});

router.post('/:applicant_id/register', authenticateToken, (req, res) => {
  const applicant_id = req.params.applicant_id;
  const approved = db.get(
    "SELECT id FROM assessments WHERE applicant_id = ? AND decision = 'ELIGIBLE' ORDER BY id DESC LIMIT 1",
    [applicant_id]
  );
  if (!approved) {
    return res.status(400).json({ error: 'A human ELIGIBLE decision is required before registering a beneficiary.' });
  }

  const existing = db.get("SELECT id FROM beneficiaries WHERE applicant_id = ?", [applicant_id]);
  if (existing) {
    return res.status(400).json({ error: 'Beneficiary already registered.' });
  }

  db.run("INSERT INTO beneficiaries (applicant_id, registered_by) VALUES (?, ?)", [applicant_id, req.user.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

module.exports = router;
