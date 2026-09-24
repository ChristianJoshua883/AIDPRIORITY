const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const households = await db.all(`
    SELECT h.*, (SELECT COUNT(*) FROM applicants a WHERE a.household_id = h.id) AS applicant_count
    FROM households h
    ORDER BY h.id DESC
  `);
  res.json(households);
}));

router.get('/:id/applicants', authenticateToken, asyncHandler(async (req, res) => {
  const applicants = await db.all(
    "SELECT * FROM applicants WHERE household_id = ? ORDER BY id DESC",
    [req.params.id]
  );
  res.json(applicants);
}));

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { household_code, address, barangay, city, province, monthly_income, household_size, housing_status } = req.body;
  if (!household_code) return res.status(400).json({ error: 'Household code is required.' });
  const existing = await db.get("SELECT id FROM households WHERE household_code = ?", [household_code]);
  if (existing) return res.status(400).json({ error: 'Household code already exists.' });
  const result = await db.run(
    "INSERT INTO households (household_code, address, barangay, city, province, monthly_income, household_size, housing_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [household_code, address, barangay, city, province, monthly_income, household_size, housing_status]
  );
  res.status(201).json({ id: result.lastID, household_code });
}));

router.patch('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { household_code, address, barangay, city, province, monthly_income, household_size, housing_status } = req.body;
  await db.run(
    "UPDATE households SET household_code = ?, address = ?, barangay = ?, city = ?, province = ?, monthly_income = ?, household_size = ?, housing_status = ? WHERE id = ?",
    [household_code, address, barangay, city, province, monthly_income, household_size, housing_status, req.params.id]
  );
  res.json({ id: req.params.id });
}));

module.exports = router;