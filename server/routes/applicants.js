const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const applicants = await db.all(`
    SELECT a.*, h.household_code, h.barangay, h.city, h.monthly_income, h.household_size,
           a2.recommended_priority, a2.decision, a2.created_at AS assessment_date
    FROM applicants a
    JOIN households h ON h.id = a.household_id
    LEFT JOIN (SELECT * FROM assessments WHERE id IN (SELECT MAX(id) FROM assessments GROUP BY applicant_id)) a2 ON a2.applicant_id = a.id
    ORDER BY a.id DESC
  `);
  res.json(applicants);
}));

router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const applicant = await db.get(
    "SELECT a.*, h.* FROM applicants a JOIN households h ON h.id = a.household_id WHERE a.id = ?",
    [req.params.id]
  );
  if (!applicant) return res.status(404).json({ error: 'Applicant not found.' });

  const members = await db.all(
    "SELECT * FROM household_members WHERE household_id = ? ORDER BY age DESC",
    [applicant.household_id]
  );

  const assessments = await db.all(`
    SELECT a.*, u.full_name AS assessor_full_name
    FROM assessments a
    LEFT JOIN users u ON u.id = a.assessed_by
    WHERE a.applicant_id = ?
    ORDER BY a.id DESC
  `, [req.params.id]);

  const beneficiary = await db.get(
    "SELECT * FROM beneficiaries WHERE applicant_id = ?",
    [req.params.id]
  );

  res.json({
    ...applicant,
    household_members: members,
    assessments,
    beneficiary: beneficiary || null
  });
}));

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation } = req.body;
  if (!household_id || !first_name || !last_name) {
    return res.status(400).json({ error: 'Household, first name, and last name are required.' });
  }
  const hh = await db.get("SELECT id FROM households WHERE id = ?", [household_id]);
  if (!hh) return res.status(400).json({ error: 'Household does not exist.' });
  const result = await db.run(
    "INSERT INTO applicants (household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation]
  );
  res.status(201).json({ id: result.lastID });
}));

router.patch('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation } = req.body;
  await db.run(
    "UPDATE applicants SET household_id = ?, first_name = ?, middle_name = ?, last_name = ?, birth_date = ?, sex = ?, civil_status = ?, contact_number = ?, occupation = ? WHERE id = ?",
    [household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation, req.params.id]
  );
  res.json({ id: req.params.id });
}));

module.exports = router;