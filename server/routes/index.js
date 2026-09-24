const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const householdRoutes = require('./households');
const applicantRoutes = require('./applicants');
const assessmentRoutes = require('./assessments');
const beneficiaryRoutes = require('./beneficiaries');
const assistanceRoutes = require('./assistance');
const dashboardRoutes = require('./dashboard');
const reportRoutes = require('./reports');

router.use('/auth', authRoutes);
router.use('/households', householdRoutes);
router.use('/applicants', applicantRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/assistance', assistanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
