const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const households = db.all(`
    SELECT h.*, a.id AS applicant_count
    FROM households h
    LEFT JOIN applicants a ON a.household_id = h.id
    GROUP BY h.id
    ORDER BY h.id DESC
  `);
  res.json(households);
});

router.get('/:id/applicants', authenticateToken, (req, res) => {
  const applicants = db.all(
    "SELECT * FROM applicants WHERE household_id = ? ORDER BY id DESC",
    [req.params.id]
  );
  res.json(applicants);
});

router.post('/', authenticateToken, (req, res) => {
  const { household_code, address, barangay, city, province, monthly_income, household_size, housing_status } = req.body;
  db.run(`
    INSERT INTO households (household_code, address, barangay, city, province, monthly_income, household_size, housing_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [household_code, address, barangay, city, province, monthly_income, household_size, housing_status], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID, household_code });
  });
});

module.exports = router;

router.patch('/:id', authenticateToken, (req, res) => {
  const { household_code, address, barangay, city, province, monthly_income, household_size, housing_status } = req.body;
  db.run(
    `UPDATE households SET household_code = ?, address = ?, barangay = ?, city = ?, province = ?, monthly_income = ?, household_size = ?, housing_status = ? WHERE id = ?`,
    [household_code, address, barangay, city, province, monthly_income, household_size, housing_status, req.params.id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Household not found.' });
      res.json({ id: req.params.id });
    }
  );
});
