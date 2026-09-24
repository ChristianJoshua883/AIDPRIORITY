const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, date_from, date_to } = req.query;
    let query = supabase
      .from('applicants')
      .select(`
        *,
        households(household_code, barangay, city, monthly_income, household_size),
        assessments(recommended_priority, decision, created_at)
      `)
      .order('id', { ascending: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('assessments.recommended_priority', priority);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);

    const { data: applicants, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const formatted = (applicants || []).map(a => ({
      ...a,
      household_code: a.households ? a.households.household_code : null,
      barangay: a.households ? a.households.barangay : null,
      city: a.households ? a.households.city : null,
      monthly_income: a.households ? a.households.monthly_income : null,
      household_size: a.households ? a.households.household_size : null,
      recommended_priority: a.assessments && a.assessments.length > 0 ? a.assessments[0].recommended_priority : null,
      decision: a.assessments && a.assessments.length > 0 ? a.assessments[0].decision : null,
      assessment_date: a.assessments && a.assessments.length > 0 ? a.assessments[0].created_at : null
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
