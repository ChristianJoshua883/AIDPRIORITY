const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const beneficiaries = await db.all(`
    SELECT b.*, ap.first_name || ' ' || ap.last_name AS beneficiary_name, h.household_code, ap.id AS applicant_id
    FROM beneficiaries b
    JOIN applicants ap ON ap.id = b.applicant_id
    JOIN households h ON h.id = ap.household_id
    ORDER BY b.id DESC
  `);
  res.json(beneficiaries);
}));

router.post('/:applicant_id/register', authenticateToken, asyncHandler(async (req, res) => {
  const applicant_id = req.params.applicant_id;
  const approved = await db.get(
    "SELECT id FROM assessments WHERE applicant_id = ? AND decision = 'ELIGIBLE' ORDER BY id DESC LIMIT 1",
    [applicant_id]
  );
  if (!approved) return res.status(400).json({ error: 'A human ELIGIBLE decision is required before registering a beneficiary.' });

  const existing = await db.get("SELECT id FROM beneficiaries WHERE applicant_id = ?", [applicant_id]);
  if (existing) return res.status(400).json({ error: 'Beneficiary already registered.' });

  const result = await db.run(
    "INSERT INTO beneficiaries (applicant_id, registered_by) VALUES (?, ?)",
    [applicant_id, req.user.id]
  );
  res.status(201).json({ id: result.lastID });
}));

module.exports = router;