const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { 
  assignSubstitute, deactivateSubstitute, listSubstitutes,
  getOverview, getStalePending, getHighUsage, getApprovalRates,
  getUsers
} = require('../controllers/admin.controller');

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.post('/substitutes/assign', assignSubstitute);
router.delete('/substitutes/:id/deactivate', deactivateSubstitute);
router.get('/substitutes', listSubstitutes);
router.get('/users', getUsers);

// Reports
router.get('/reports/overview', getOverview);
router.get('/reports/pending-stale', getStalePending);
router.get('/reports/high-usage', getHighUsage);
router.get('/reports/approval-rates', getApprovalRates);

module.exports = router;
