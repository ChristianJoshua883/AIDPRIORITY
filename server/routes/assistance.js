const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const records = await db.all(`
    SELECT ar.*, ap.first_name || ' ' || ap.last_name AS beneficiary_name, h.household_code, u.full_name AS released_by_name
    FROM assistance_records ar
    JOIN beneficiaries b ON b.id = ar.beneficiary_id
    JOIN applicants ap ON ap.id = b.applicant_id
    JOIN households h ON h.id = ap.household_id
    LEFT JOIN users u ON u.id = ar.released_by
    ORDER BY ar.id DESC
  `);
  res.json(records);
}));

router.get('/beneficiaries', authenticateToken, asyncHandler(async (req, res) => {
  const beneficiaries = await db.all(`
    SELECT b.id, ap.first_name || ' ' || ap.last_name AS name
    FROM beneficiaries b
    JOIN applicants ap ON ap.id = b.applicant_id
    WHERE b.status = 'ACTIVE'
    ORDER BY name
  `);
  res.json(beneficiaries);
}));

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { beneficiary_id, assistance_type, amount, distribution_date, program_source, reference_number, status, remarks } = req.body;
  if (!beneficiary_id || !assistance_type || !distribution_date) {
    return res.status(400).json({ error: 'Beneficiary, assistance type, and distribution date are required.' });
  }
  const result = await db.run(
    "INSERT INTO assistance_records (beneficiary_id, assistance_type, amount, distribution_date, program_source, reference_number, status, released_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [beneficiary_id, assistance_type, amount || 0, distribution_date, program_source || null, reference_number || null, status || 'RELEASED', req.user.id, remarks || null]
  );
  res.status(201).json({ id: result.lastID });
}));

module.exports = router;