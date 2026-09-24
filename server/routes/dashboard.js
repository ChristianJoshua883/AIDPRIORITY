const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { count: totalApplicants } = await supabase.from('applicants').select('*', { count: 'exact', head: true });
    const { count: totalAssessments } = await supabase.from('assessments').select('*', { count: 'exact', head: true });
    const { count: pendingDecisions } = await supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('decision', 'PENDING');
    const { count: totalBeneficiaries } = await supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
    const { data: assistanceRecords } = await supabase.from('assistance_records').select('amount').eq('status', 'RELEASED');
    const totalAssistanceSum = assistanceRecords ? assistanceRecords.reduce((s, r) => s + (Number(r.amount) || 0), 0) : 0;
    const { data: priorityCountsRaw } = await supabase
      .from('assessments')
      .select('recommended_priority')
      .group('recommended_priority');
    const priorityCounts = (priorityCountsRaw || []).map(p => ({ recommended_priority: p.recommended_priority, total: p.count }));

    const { data: recentAssessments } = await supabase
      .from('assessments')
      .select(`
        id, recommended_priority, decision, created_at,
        applicants(first_name, last_name)
      `)
      .order('id', { ascending: false })
      .limit(10);

    const { data: recentDistributions } = await supabase
      .from('assistance_records')
      .select(`
        id, amount, distribution_date, status,
        beneficiaries(applicants(first_name, last_name))
      `)
      .order('id', { ascending: false })
      .limit(10);

    res.json({
      statistics: {
        totalApplicants: totalApplicants || 0,
        totalAssessments: totalAssessments || 0,
        pendingDecisions: pendingDecisions || 0,
        totalBeneficiaries: totalBeneficiaries || 0,
        totalAssistance: totalAssistanceSum
      },
      priorityCounts,
      recentAssessments: recentAssessments || [],
      recentDistributions: recentDistributions || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
