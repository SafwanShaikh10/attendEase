const prisma = require('../config/prisma');
const { generateExcelRow } = require('../services/excelService');
const { syncExcelToDrive } = require('../services/googleDriveService');
const { sendEmail, templates, createInAppNotification } = require('../services/notification.service');

// ============================================
// GET /pending — SPECIAL_OD + YEAR_COORD_APPROVED only
// ============================================
const getPending = async (req, res) => {
  try {
    const requests = await prisma.attendanceRequest.findMany({
      where: {
        status: 'YEAR_COORD_APPROVED',
        leaveType: 'SPECIAL_OD'           // STRICT filter
      },
      include: { 
        student: { 
          select: { name: true, email: true, department: true, year: true, division: true } 
        } 
      }
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ============================================
// POST /approve/:id — Final approval for SPECIAL_OD
// Triggers Excel + Drive sync, NO balance deduction
// ============================================
const approve = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.attendanceRequest.findUnique({ 
      where: { id: Number(id) } 
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'YEAR_COORD_APPROVED' || request.leaveType !== 'SPECIAL_OD') {
      return res.status(400).json({ error: 'Only SPECIAL_OD requests at YEAR_COORD_APPROVED can be approved by Chairperson.' });
    }

    await prisma.attendanceRequest.update({
      where: { id: Number(id) },
      data: { status: 'CHAIRPERSON_APPROVED' }  // Terminal status for SPECIAL_OD
    });

    // No balance deduction — Special OD is unlimited

    // Audit log
    await prisma.auditLog.create({
      data: {
        requestId: Number(id),
        action: 'CHAIRPERSON_APPROVED',
        performedBy: req.user.id,
        performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role
      }
    });

    // Notifications
    const student = await prisma.user.findUnique({ where: { id: request.studentId } });
    const { subject, body } = templates.finalApproved(student.name);
    await sendEmail(student.email, subject, body);
    await createInAppNotification(student.id, `Special OD request approved by Chairperson. Attendance records updated.`, parseInt(id));

    // Trigger Excel append + Drive sync (same services from Phase 2)
    try {
      const { department, division, semester, rowData, subjectCount } = await generateExcelRow(Number(id));
      await syncExcelToDrive(department, division, semester, rowData, subjectCount);
    } catch (excelErr) {
      console.error('[CHAIRPERSON] Excel/Drive sync error (non-blocking):', excelErr);
    }

    res.json({ message: 'Special OD approved. Records updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ============================================
// POST /reject/:id — Mandatory reason
// ============================================
const reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ error: 'Rejection reason is mandatory.' });

    await prisma.attendanceRequest.update({
      where: { id: Number(id) },
      data: {
        status: 'REJECTED',
        rejectedBy: req.user.role,
        rejectionReason: reason
      }
    });

    await prisma.auditLog.create({
      data: {
        requestId: Number(id),
        action: 'REJECTED',
        performedBy: req.user.id,
        performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role,
        note: reason
      }
    });

    // Notifications
    const student = await prisma.user.findUnique({ where: { id: request.studentId } });
    const { subject, body } = templates.rejected(student.name, req.user.role, reason);
    await sendEmail(student.email, subject, body);
    await createInAppNotification(student.id, `Special OD request rejected by Chairperson: ${reason}`, parseInt(id));

    res.json({ message: 'Request rejected.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ============================================
// POST /request-resubmission/:id
// Stores resubmission_requested_by: CHAIRPERSON (critical for routing)
// ============================================
const requestResubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) return res.status(400).json({ error: 'Resubmission note is mandatory.' });

    await prisma.attendanceRequest.update({
      where: { id: Number(id) },
      data: {
        status: 'RESUBMISSION_REQUESTED',
        resubmissionNote: note,
        resubmissionRequestedBy: req.user.role  // Critical for routing on resubmit
      }
    });

    await prisma.auditLog.create({
      data: {
        requestId: Number(id),
        action: 'RESUBMISSION_REQUESTED',
        performedBy: req.user.id,
        performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role,
        note: note
      }
    });

    // Notifications
    const student = await prisma.user.findUnique({ where: { id: request.studentId } });
    const { subject, body } = templates.resubmissionRequested(student.name, req.user.role, note);
    await sendEmail(student.email, subject, body);
    await createInAppNotification(student.id, `Resubmission requested by Chairperson: ${note}`, parseInt(id));

    res.json({ message: 'Resubmission requested.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getPending, approve, reject, requestResubmission };
