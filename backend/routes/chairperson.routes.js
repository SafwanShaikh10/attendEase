const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { getPending, approve, reject, requestResubmission } = require('../controllers/chairperson.controller');

// All routes require CHAIRPERSON role
router.use(authenticateToken);
router.use(requireRole(['CHAIRPERSON']));

router.get('/pending', getPending);
router.post('/approve/:id', approve);
router.post('/reject/:id', reject);
router.post('/request-resubmission/:id', requestResubmission);

module.exports = router;
