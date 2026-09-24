const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const applicants = db.all(`
    SELECT a.*, h.household_code, h.barangay, h.city, h.monthly_income, h.household_size
    FROM applicants a
    JOIN households h ON h.id = a.household_id
    ORDER BY a.id DESC
  `);
  res.json(applicants);
});

router.get('/:id', authenticateToken, (req, res) => {
  const applicant = db.get(`
    SELECT a.*, h.*
    FROM applicants a
    JOIN households h ON h.id = a.household_id
    WHERE a.id = ?
  `, [req.params.id]);

  if (!applicant) return res.status(404).json({ error: 'Applicant not found.' });

  const members = db.all("SELECT * FROM household_members WHERE household_id = ? ORDER BY age DESC", [applicant.household_id]);
  const assessments = db.all(`
    SELECT a.*, u.full_name AS assessor
    FROM assessments a
    JOIN users u ON u.id = a.assessed_by
    WHERE a.applicant_id = ?
    ORDER BY a.id DESC
  `, [req.params.id]);
  const beneficiary = db.get("SELECT * FROM beneficiaries WHERE applicant_id = ?", [req.params.id]);

  res.json({ ...applicant, household_members: members, assessments, beneficiary });
});

router.post('/', authenticateToken, (req, res) => {
  const { household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation } = req.body;
  db.run(`
    INSERT INTO applicants (household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

module.exports = router;

router.patch('/:id', authenticateToken, (req, res) => {
  const { household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation } = req.body;
  db.run(
    `UPDATE applicants SET household_id = ?, first_name = ?, middle_name = ?, last_name = ?, birth_date = ?, sex = ?, civil_status = ?, contact_number = ?, occupation = ? WHERE id = ?`,
    [household_id, first_name, middle_name, last_name, birth_date, sex, civil_status, contact_number, occupation, req.params.id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Applicant not found.' });
      res.json({ id: req.params.id });
    }
  );
});
