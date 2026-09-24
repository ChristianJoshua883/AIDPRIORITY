const express = require('express');
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [applicantsRes, assessmentsRes, pendingRes, beneficiariesRes, assistanceRes] = await Promise.all([
      supabase.from('applicants').select('*', { count: 'exact', head: true }),
      supabase.from('assessments').select('*', { count: 'exact', head: true }),
      supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('decision', 'PENDING'),
      supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('assistance_records').select('amount').eq('status', 'RELEASED')
    ]);

    const totalAssistance = (assistanceRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);

    const { data: priorityRaw } = await supabase
      .from('assessments')
      .select('recommended_priority')
      .group('recommended_priority');
    const priorityCounts = (priorityRaw || []).map(p => ({ recommended_priority: p.recommended_priority, total: p.count }));

    const { data: recentAssessments } = await supabase
      .from('assessments')
      .select('id, recommended_priority, decision, created_at, applicants(first_name, last_name)')
      .order('id', { ascending: false })
      .limit(10);

    const { data: recentDistributions } = await supabase
      .from('assistance_records')
      .select('id, assistance_type, amount, distribution_date, status, beneficiaries(applicants(first_name, last_name))')
      .order('id', { ascending: false })
      .limit(10);

    res.json({
      statistics: {
        totalApplicants: applicantsRes.count || 0,
        totalAssessments: assessmentsRes.count || 0,
        pendingDecisions: pendingRes.count || 0,
        totalBeneficiaries: beneficiariesRes.count || 0,
        totalAssistance
      },
      priorityCounts,
      recentAssessments: (recentAssessments || []).map(a => ({
        ...a,
        applicant_name: a.applicants ? `${a.applicants.first_name} ${a.applicants.last_name}` : null
      })),
      recentDistributions: (recentDistributions || []).map(d => ({
        ...d,
        beneficiary_name: d.beneficiaries?.applicants
          ? `${d.beneficiaries.applicants.first_name} ${d.beneficiaries.applicants.last_name}`
          : null
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
