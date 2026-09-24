const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const totalApplicants = db.get("SELECT COUNT(*) AS count FROM applicants").count;
  const totalAssessments = db.get("SELECT COUNT(*) AS count FROM assessments").count;
  const pendingDecisions = db.get("SELECT COUNT(*) AS count FROM assessments WHERE decision = 'PENDING'").count;
  const totalBeneficiaries = db.get("SELECT COUNT(*) AS count FROM beneficiaries WHERE status = 'ACTIVE'").count;
  const totalAssistance = db.get("SELECT COALESCE(SUM(amount), 0) AS total FROM assistance_records WHERE status = 'RELEASED'").total;
  const priorityCounts = db.all("SELECT recommended_priority, COUNT(*) AS total FROM assessments GROUP BY recommended_priority");

  const recentAssessments = db.all(`
    SELECT a.id, ap.first_name || ' ' || ap.last_name AS applicant_name,
           a.recommended_priority, a.decision, a.created_at
    FROM assessments a
    JOIN applicants ap ON ap.id = a.applicant_id
    ORDER BY a.id DESC LIMIT 10
  `);

  const recentDistributions = db.all(`
    SELECT ar.id, ap.first_name || ' ' || ap.last_name AS beneficiary_name,
           ar.assistance_type, ar.amount, ar.distribution_date, ar.status
    FROM assistance_records ar
    JOIN beneficiaries b ON b.id = ar.beneficiary_id
    JOIN applicants ap ON ap.id = b.applicant_id
    ORDER BY ar.id DESC LIMIT 10
  `);

  res.json({
    statistics: { totalApplicants, totalAssessments, pendingDecisions, totalBeneficiaries, totalAssistance },
    priorityCounts,
    recentAssessments,
    recentDistributions
  });
});

module.exports = router;
