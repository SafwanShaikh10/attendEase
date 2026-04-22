const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const upload = require('../config/multer');

const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const submitValidation = [
  body('leaveType').isIn(['OD', 'MEDICAL', 'SPECIAL_OD']).withMessage('Invalid leave type'),
  body('fromDate').isISO8601().withMessage('Invalid from date'),
  body('toDate').isISO8601().withMessage('Invalid to date'),
  body('daysCount').isInt({ min: 1, max: 30 }).withMessage('Days count must be between 1 and 30'),
  body('reason').trim().notEmpty().isLength({ max: 1000 }).withMessage('Reason is required and max 1000 chars'),
  body('letterType').isIn(['DIGITAL', 'PHYSICAL']).withMessage('Invalid letter type'),
  body('semester').notEmpty().withMessage('Semester is required'),
];

// Student endpoints
router.get('/me', authenticateToken, requireRole(['STUDENT']), requestController.getMyRequests);
router.post('/submit', authenticateToken, requireRole(['STUDENT']), submitValidation, validate, requestController.submitRequest);
router.post('/:id/resubmit', authenticateToken, requireRole(['STUDENT']), submitValidation, validate, requestController.resubmitRequest);
router.patch('/:id/cancel', authenticateToken, requireRole(['STUDENT']), requestController.cancelRequest);
const { validateFileSignature } = require('../utils/fileValidator');
const fs = require('fs');
const path = require('path');

router.post('/upload-proof', authenticateToken, requireRole(['STUDENT']), upload.single('proof'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Security: Magic Bytes Validation
  const isValid = await validateFileSignature(req.file.path);
  if (!isValid) {
    fs.unlinkSync(req.file.path); // Delete malicious file
    return res.status(400).json({ error: 'Invalid file format. Only real PDF, JPG, and PNG are allowed.' });
  }

  res.json({ fileUrl: `/uploads/proof/${req.file.filename}` });
});

// Shared/Detail endpoints
router.get('/:id', authenticateToken, requestController.getRequestById);

// Class Coordinator endpoints
router.get('/pending', authenticateToken, requireRole(['CLASS_COORD']), requestController.getPendingRequests);
router.get('/coordinator/stats', authenticateToken, requireRole(['CLASS_COORD', 'YEAR_COORD']), requestController.getCoordinatorStats);
router.get('/coordinator/excel', authenticateToken, requireRole(['CLASS_COORD']), requestController.getCoordinatorExcel);
router.post('/:id/approve', authenticateToken, requireRole(['CLASS_COORD']), requestController.approveClassCoord);
router.post('/:id/reject', authenticateToken, requireRole(['CLASS_COORD', 'YEAR_COORD', 'CHAIRPERSON']), requestController.rejectRequest);

// Year Coordinator endpoints
router.get('/year-coord/pending', authenticateToken, requireRole(['YEAR_COORD']), requestController.getPendingYearRequests);
router.post('/:id/year-coord/approve', authenticateToken, requireRole(['YEAR_COORD']), requestController.approveYearCoord);
router.post('/:id/year-coord/reject', authenticateToken, requireRole(['YEAR_COORD']), requestController.rejectYearCoord);
router.post('/:id/year-coord/request-resubmission', authenticateToken, requireRole(['YEAR_COORD']), requestController.requestResubmissionYearCoord);
router.get('/year-coord/reports', authenticateToken, requireRole(['YEAR_COORD']), requestController.getYearRecordTable);

// Blank template download for physical letter option
router.get('/letter-template/:leaveType', authenticateToken, async (req, res) => {
  try {
    const { leaveType } = req.params;
    const templateMap = {
      'OD': 'OD_template.docx',
      'MEDICAL': 'Medical_template.docx',
      'SPECIAL_OD': 'SpecialOD_template.docx'
    };

    const fileName = templateMap[leaveType];
    if (!fileName) return res.status(400).json({ error: 'Invalid leave type' });

    const filePath = path.resolve(__dirname, '../templates', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Template file not found on server' });
    }

    res.download(filePath, fileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to serve template' });
  }
});

module.exports = router;
