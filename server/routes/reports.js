const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { priority, date_from, date_to } = req.query;
    let query = supabase
      .from('applicants')
      .select('*, households(household_code, barangay, city, monthly_income, household_size)')
      .order('id', { ascending: false });

    const { data: applicants, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    let filtered = applicants || [];
    if (priority || date_from || date_to) {
      filtered = await Promise.all(filtered.map(async (a) => {
        const { data: assessment } = await supabase
          .from('assessments')
          .select('recommended_priority, decision, created_at')
          .eq('applicant_id', a.id)
          .order('id', { ascending: false })
          .limit(1)
          .single();
        a._assessment = assessment;
        return a;
      }));

      filtered = filtered.filter((a) => {
        if (priority && a._assessment?.recommended_priority !== priority) return false;
        if (date_from && a._assessment?.created_at < date_from) return false;
        if (date_to && a._assessment?.created_at > date_to) return false;
        return true;
      });
    } else {
      filtered = await Promise.all(filtered.map(async (a) => {
        const { data: assessment } = await supabase
          .from('assessments')
          .select('recommended_priority, decision, created_at')
          .eq('applicant_id', a.id)
          .order('id', { ascending: false })
          .limit(1)
          .single();
        a._assessment = assessment;
        return a;
      }));
    }

    res.json(filtered.map(a => ({
      ...a,
      household_code: a.households?.household_code || null,
      barangay: a.households?.barangay || null,
      city: a.households?.city || null,
      monthly_income: a.households?.monthly_income || null,
      household_size: a.households?.household_size || null,
      recommended_priority: a._assessment?.recommended_priority || null,
      decision: a._assessment?.decision || null,
      assessment_date: a._assessment?.created_at || null
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
