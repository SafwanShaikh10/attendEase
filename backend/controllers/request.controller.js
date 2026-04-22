const prisma = require('../config/prisma');
const { generateLetterPDF } = require('../services/letter.service');
const { sendEmail, templates, createInAppNotification } = require('../services/notification.service');
const ExcelJS = require('exceljs');

// Helper to check same day submissions
const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

const submitRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { 
      leaveType, fromDate, toDate, daysCount, 
      reason, letterContent, letterType, 
      proofFileUrl, proofFileType, semester, parentRequestId
    } = req.body;

    // Audit Log and DB Operations in Transaction (Security Fix: Prevent Race Conditions)
    const result = await prisma.$transaction(async (tx) => {
      // 1. RULE: Max 3 submissions per student per day
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayCount = await tx.attendanceRequest.count({
        where: {
          studentId,
          submittedAt: { gte: todayStart }
        }
      });

      if (todayCount >= 3) {
        throw new Error('Maximum 3 submissions allowed per day');
      }

      // 2. RULE: OD and Medical limits
      if (leaveType !== 'SPECIAL_OD') {
        let balance = await tx.leaveBalance.findFirst({
          where: { studentId, semester }
        });
        
        if (!balance) {
          balance = await tx.leaveBalance.create({
            data: { studentId, semester, odUsed: 0, medicalUsed: 0 }
          });
        }

        if (leaveType === 'OD' && balance.odUsed + daysCount > 5) {
           throw new Error('OD limit (5 days) exceeded for this semester');
        }
        if (leaveType === 'MEDICAL' && balance.medicalUsed + daysCount > 5) {
           throw new Error('Medical leave limit (5 days) exceeded for this semester');
        }
      }

      // 3. Resubmission routing
      let startingStatus = 'SUBMITTED';
      if (parentRequestId) {
        const parent = await tx.attendanceRequest.findUnique({
          where: { id: parentRequestId }
        });
        if (parent && parent.resubmissionRequestedBy) {
          const statusMap = {
            CLASS_COORD:  'SUBMITTED',
            YEAR_COORD:   'CLASS_COORD_APPROVED',
            CHAIRPERSON:  'YEAR_COORD_APPROVED'
          };
          startingStatus = statusMap[parent.resubmissionRequestedBy] || 'SUBMITTED';
        }
      }

      // 4. Create the Request
      const requestData = await tx.attendanceRequest.create({
        data: {
          studentId,
          leaveType,
          fromDate: new Date(fromDate),
          toDate: new Date(toDate),
          daysCount,
          reason,
          letterContent: letterType === 'DIGITAL' ? JSON.stringify(letterContent) : null,
          letterType,
          proofFileUrl: letterType === 'PHYSICAL' ? proofFileUrl : null,
          proofFileType: letterType === 'PHYSICAL' ? proofFileType : 'PDF',
          semester,
          deadlineDate: deadline,
          parentRequestId: parentRequestId || null,
          status: startingStatus
        }
      });

      // 5. Audit Log Inside Transaction
      await tx.auditLog.create({
        data: {
          requestId: requestData.id,
          action: parentRequestId ? 'RESUBMITTED' : 'SUBMITTED',
          performedBy: studentId,
          note: letterType === 'DIGITAL' ? 'Digital letter auto-generated as PDF' : 'Physical letter uploaded by student'
        }
      });

      return requestData;
    });

    // Post-transaction operations
    const requestData = result;

    // If digital letter, auto-generate PDF using specialized generators
    if (letterType === 'DIGITAL') {
      const student = await prisma.user.findUnique({ where: { id: studentId } });
      const letterService = require('../services/letter.service');
      let genResult;
      
      if (leaveType === 'OD') {
        genResult = await letterService.generateODLetter(requestData, student, letterContent);
      } else if (leaveType === 'MEDICAL') {
        genResult = await letterService.generateMedicalLetter(requestData, student, letterContent);
      } else if (leaveType === 'SPECIAL_OD') {
        genResult = await letterService.generateSpecialODLetter(requestData, student, letterContent);
      }

      await prisma.attendanceRequest.update({
        where: { id: requestData.id },
        data: { proofFileUrl: `/uploads/letters/${genResult.fileName}` }
      });
    }

    res.status(201).json({ success: true, message: 'Request submitted successfully', request: requestData });

    // Background push notifications
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    const classCoords = await prisma.user.findMany({
      where: { role: 'CLASS_COORD', division: student.division, year: student.year }
    });
    for (const coord of classCoords) {
      const { subject, body } = templates.submitted(student.name, coord.name);
      await sendEmail(coord.email, subject, body);
      await createInAppNotification(coord.id, `New leave request submitted by ${student.name}`, newRequest.id);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while submitting request' });
  }
};

const getPendingRequests = async (req, res) => {
    try {
      // Logic for Class Coordinator fetching pending requests
      const coord = req.user;
      
      // Class Coord can only see requests from their division
      const studentsInDivision = await prisma.user.findMany({
          where: { role: 'STUDENT', division: coord.division, year: coord.year }
      });
      
      const studentIds = studentsInDivision.map(s => s.id);

      const pending = await prisma.attendanceRequest.findMany({
          where: {
             studentId: { in: studentIds },
             status: 'SUBMITTED' // Or resubmitted logic
          },
          include: { 
              student: { select: { name: true, email: true, rollNo: true } },
              parentRequest: { select: { status: true, rejectionReason: true, resubmissionNote: true } }
          }
      });

      res.json({
          requests: pending,
          actingAs: req.user.actingAs,
          substituteForName: req.user.substituteForName // assigned in auth middleware if Substitute
      });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const approveClassCoord = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.attendanceRequest.update({
            where: { id: parseInt(id) },
            data: { status: 'CLASS_COORD_APPROVED' }
        });

        await prisma.auditLog.create({
            data: {
                requestId: parseInt(id),
                action: 'CLASS_COORD_APPROVED',
                performedBy: req.user.id,
                performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role
            }
        });

        res.json({ success: true, message: 'Approved successfully' });

        // Notifications
        const requestToApprove = await prisma.attendanceRequest.findUnique({
            where: { id: parseInt(id) },
            include: { student: true }
        });
        const yearCoords = await prisma.user.findMany({
            where: { role: 'YEAR_COORD', year: requestToApprove.student.year }
        });
        for (const yc of yearCoords) {
            const { subject, body } = templates.classCoordApproved(requestToApprove.student.name, yc.name);
            await sendEmail(yc.email, subject, body);
            await createInAppNotification(yc.id, `Leave request from ${requestToApprove.student.name} approved by Class Coord, awaits your action.`, parseInt(id));
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, requestResubmission } = req.body;
        
        const status = requestResubmission ? 'RESUBMISSION_REQUESTED' : 'REJECTED';
        const actionType = requestResubmission ? 'RESUBMISSION_REQUESTED' : 'REJECTED';

        await prisma.attendanceRequest.update({
            where: { id: parseInt(id) },
            data: { 
                status, 
                rejectedBy: req.user.role, 
                rejectionReason: !requestResubmission ? reason : null,
                resubmissionNote: requestResubmission ? reason : null,
                resubmissionRequestedBy: requestResubmission ? req.user.role : null
            }
        });

        await prisma.auditLog.create({
            data: {
                requestId: parseInt(id),
                action: actionType,
                performedBy: req.user.id,
                performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role,
                note: reason
            }
        });

        res.json({ success: true, message: `Request ${status.toLowerCase()}` });

        // Notifications
        const requestRejected = await prisma.attendanceRequest.findUnique({
             where: { id: parseInt(id) },
             include: { student: true }
        });
        if (requestResubmission) {
            const { subject, body } = templates.resubmissionRequested(requestRejected.student.name, req.user.role, reason);
            await sendEmail(requestRejected.student.email, subject, body);
            await createInAppNotification(requestRejected.studentId, `Changes requested on your leave application by ${req.user.role}.`, parseInt(id));
        } else {
            const { subject, body } = templates.rejected(requestRejected.student.name, req.user.role, reason);
            await sendEmail(requestRejected.student.email, subject, body);
            await createInAppNotification(requestRejected.studentId, `Your leave application was rejected by ${req.user.role}.`, parseInt(id));
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPendingYearRequests = async (req, res) => {
    try {
      const coord = req.user;
      
      // Year Coord sees all requests in their year across all divisions
      // Status must be CLASS_COORD_APPROVED
      const studentsInYear = await prisma.user.findMany({
          where: { role: 'STUDENT', year: coord.year }
      });
      
      const studentIds = studentsInYear.map(s => s.id);

      const pending = await prisma.attendanceRequest.findMany({
          where: {
             studentId: { in: studentIds },
             status: 'CLASS_COORD_APPROVED'
          },
          include: { 
              student: { select: { name: true, email: true, division: true, rollNo: true } },
              auditLogs: {
                  where: { action: 'CLASS_COORD_APPROVED' },
                  take: 1,
                  include: { user: { select: { name: true } } }
              }
          }
      });

      // Map to include classCoordApproval info
      const formattedPending = pending.map(p => ({
          ...p,
          classCoordApproval: p.auditLogs[0] ? {
              name: p.auditLogs[0].user.name,
              at: p.auditLogs[0].createdAt
          } : null
      }));

      res.json({ requests: formattedPending });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const { generateExcelRow } = require('../services/excelService');
const { syncExcelToDrive } = require('../services/googleDriveService');

const approveYearCoord = async (req, res) => {
    try {
        const { id } = req.params;
        const requestToApprove = await prisma.attendanceRequest.findUnique({ where: { id: parseInt(id) } });

        if(!requestToApprove) return res.status(404).json({ error: 'Request not found' });

        const isSpecial = requestToApprove.leaveType === 'SPECIAL_OD';
        // If SPECIAL_OD, it routes to Chairperson. If OD/MEDICAL, it is FINAL.
        const newStatus = isSpecial ? 'YEAR_COORD_APPROVED' : 'YEAR_COORD_APPROVED'; // wait, for special OD it stays YEAR_COORD_APPROVED and waits for chairperson
        
        await prisma.attendanceRequest.update({
            where: { id: parseInt(id) },
            data: { status: 'YEAR_COORD_APPROVED' }
        });

        await prisma.auditLog.create({
            data: {
                requestId: parseInt(id),
                action: 'YEAR_COORD_APPROVED',
                performedBy: req.user.id,
                performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role
            }
        });

        // Split Logic: Final Approval processes
        if (!isSpecial) {
             // 1. Leave Balance Increment (Safety: Special OD skipped as per design)
             const amount = requestToApprove.daysCount;
             const balanceUpdateData = requestToApprove.leaveType === 'OD' 
                ? { odUsed: { increment: amount } }
                : { medicalUsed: { increment: amount } };
             
             await prisma.leaveBalance.updateMany({
                 where: { studentId: requestToApprove.studentId, semester: requestToApprove.semester },
                 data: balanceUpdateData
             });

             // 2. Excel & Google Drive Trigger
             try {
                const { department, division, semester, rowData, subjectCount } = await generateExcelRow(parseInt(id));
                await syncExcelToDrive(department, division, semester, rowData, subjectCount);
             } catch (excelError) {
                console.error("Critical: Attendance approved but Excel/Drive sync failed", excelError);
             }
        }

        res.json({ success: true, message: 'Approved successfully', isFinal: !isSpecial });

        // Notifications
        const student = await prisma.user.findUnique({ where: { id: requestToApprove.studentId } });
        if (!isSpecial) {
            const { subject, body } = templates.finalApproved(student.name);
            await sendEmail(student.email, subject, body);
            await createInAppNotification(student.id, `Your leave request has been approved and records updated.`, parseInt(id));
        } else {
            const chairs = await prisma.user.findMany({ where: { role: 'CHAIRPERSON' } });
            for (const chair of chairs) {
                const { subject, body } = templates.classCoordApproved(student.name, chair.name);
                await sendEmail(chair.email, subject, body);
                await createInAppNotification(chair.id, `Special OD request from ${student.name} was approved by Year Coord, awaits your final action.`, parseInt(id));
            }
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const rejectYearCoord = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        await prisma.attendanceRequest.update({
            where: { id: parseInt(id) },
            data: { 
                status: 'REJECTED', 
                rejectedBy: req.user.role, 
                rejectionReason: reason
            }
        });

        await prisma.auditLog.create({
            data: {
                requestId: parseInt(id),
                action: 'REJECTED',
                performedBy: req.user.id,
                performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role,
                note: reason
            }
        });

        res.json({ success: true, message: 'Request rejected by Year Coordinator' });

        // Notifications
        const requestRejected = await prisma.attendanceRequest.findUnique({
             where: { id: parseInt(id) },
             include: { student: true }
        });
        const { subject, body } = templates.rejected(requestRejected.student.name, req.user.role, reason);
        await sendEmail(requestRejected.student.email, subject, body);
        await createInAppNotification(requestRejected.studentId, `Your leave application was rejected by ${req.user.role}.`, parseInt(id));
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const requestResubmissionYearCoord = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        
        await prisma.attendanceRequest.update({
            where: { id: parseInt(id) },
            data: { 
                status: 'RESUBMISSION_REQUESTED', 
                rejectedBy: req.user.role, 
                resubmissionNote: note,
                resubmissionRequestedBy: req.user.role
            }
        });

        await prisma.auditLog.create({
            data: {
                requestId: parseInt(id),
                action: 'RESUBMISSION_REQUESTED',
                performedBy: req.user.id,
                performedAs: req.user.actingAs ? `SUBSTITUTE for user #${req.user.substituteFor}` : req.user.role,
                note: note
            }
        });

        res.json({ success: true, message: 'Resubmission requested by Year Coordinator' });

        // Notifications
        const requestRejected = await prisma.attendanceRequest.findUnique({
             where: { id: parseInt(id) },
             include: { student: true }
        });
        const { subject, body } = templates.resubmissionRequested(requestRejected.student.name, req.user.role, note);
        await sendEmail(requestRejected.student.email, subject, body);
        await createInAppNotification(requestRejected.studentId, `Changes requested on your leave application by ${req.user.role}.`, parseInt(id));
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const resubmitRequest = async (req, res) => {
    try {
        const originalId = parseInt(req.params.id);
        const student = req.user;
        const { reason, letterType, letterContent, proofFileUrl, proofFileType } = req.body;

        // Fetch original request
        const original = await prisma.attendanceRequest.findUnique({
            where: { id: originalId }
        });

        if (!original) return res.status(404).json({ error: 'Original request not found' });
        if (original.studentId !== student.id)
            return res.status(403).json({ error: 'This is not your request' });
        if (!['REJECTED', 'RESUBMISSION_REQUESTED'].includes(original.status))
            return res.status(400).json({ error: 'This request cannot be resubmitted' });

        // Check 3/day submission limit
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayCount = await prisma.attendanceRequest.count({
            where: {
                studentId: student.id,
                submittedAt: { gte: todayStart }
            }
        });
        if (todayCount >= 3)
            return res.status(429).json({ error: 'Max 3 submissions per day reached' });

        // Determine starting status
        const roleMap = {
            CLASS_COORD: 'SUBMITTED',
            YEAR_COORD: 'CLASS_COORD_APPROVED',
            CHAIRPERSON: 'YEAR_COORD_APPROVED'
        };
        const startingStatus = roleMap[original.resubmissionRequestedBy] || 'SUBMITTED';

        // Create new request linked to original
        const newRequest = await prisma.attendanceRequest.create({
            data: {
                studentId: student.id,
                leaveType: original.leaveType,
                fromDate: original.fromDate,
                toDate: original.toDate,
                daysCount: original.daysCount,
                reason: reason || original.reason,
                letterType: letterType || original.letterType,
                letterContent: letterContent || original.letterContent,
                proofFileUrl: proofFileUrl || original.proofFileUrl,
                proofFileType: proofFileType || original.proofFileType,
                semester: original.semester,
                deadlineDate: original.deadlineDate,
                parentRequestId: originalId,
                status: startingStatus
            }
        });

        // If digital letter, auto-generate PDF
        if ((letterType || original.letterType) === 'DIGITAL') {
            const studentData = await prisma.user.findUnique({ where: { id: student.id } });
            const { fileName } = await generateLetterPDF(newRequest, studentData);
            await prisma.attendanceRequest.update({
                where: { id: newRequest.id },
                data: { proofFileUrl: `/uploads/letters/${fileName}` }
            });
        }

        // Audit log
        await prisma.auditLog.create({
            data: {
                requestId: newRequest.id,
                action: 'RESUBMITTED',
                performedBy: student.id,
                performedAs: 'STUDENT',
                note: `Resubmission of request #${originalId}`
            }
        });

        res.json({ success: true, message: 'Request resubmitted successfully.', data: { newRequestId: newRequest.id } });

        // Notifications
        // Who requested the resubmission?
        const reqBy = original.resubmissionRequestedBy;
        if (reqBy) {
            const approvers = await prisma.user.findMany({
                where: {
                    role: reqBy,
                    year: reqBy === 'YEAR_COORD' || reqBy === 'CLASS_COORD' ? student.year : undefined,
                    division: reqBy === 'CLASS_COORD' ? student.division : undefined
                }
            });
            for (const approver of approvers) {
                const { subject, body } = templates.resubmitted(approver.name, student.name);
                await sendEmail(approver.email, subject, body);
                await createInAppNotification(approver.id, `${student.name} has resubmitted their leave request.`, originalId);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while resubmitting' });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const studentId = req.user.id;
        const [requests, balances] = await Promise.all([
            prisma.attendanceRequest.findMany({
                where: { studentId },
                orderBy: { submittedAt: 'desc' }
            }),
            prisma.leaveBalance.findMany({
                where: { studentId }
            })
        ]);
        res.json({ success: true, data: { requests, balances } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma.attendanceRequest.findUnique({
            where: { id: parseInt(id) },
            include: { 
                student: { select: { id: true, name: true, division: true, year: true, department: true } },
                auditLogs: { 
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true, role: true } } }
                }
            }
        });

        if (!request) return res.status(404).json({ error: 'Request not found' });

        // RBAC: Students see only their own. Coords/Admin can see others.
        if (req.user.role === 'STUDENT' && request.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access to this request' });
        }

        res.json({ success: true, data: request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        const request = await prisma.attendanceRequest.findUnique({
            where: { id: parseInt(id) }
        });

        if (!request) return res.status(404).json({ error: 'Request not found' });
        if (request.studentId !== studentId)
            return res.status(403).json({ error: 'You can only cancel your own requests' });
        if (request.status !== 'SUBMITTED')
            return res.status(400).json({ error: 'Only pending requests can be cancelled' });

        await prisma.attendanceRequest.update({
            where: { id: parseInt(id) },
            data: { status: 'CANCELLED' }
        });

        await prisma.auditLog.create({
            data: {
                requestId: parseInt(id),
                action: 'CANCELLED',
                performedBy: studentId,
                note: 'Request cancelled by student'
            }
        });

        res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getCoordinatorStats = async (req, res) => {
    try {
        const user = req.user;
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        if (user.role === 'YEAR_COORD') {
            const studentsInYear = await prisma.user.findMany({
                where: { role: 'STUDENT', year: user.year }
            });
            const studentIds = studentsInYear.map(s => s.id);

            const pendingReview = await prisma.attendanceRequest.count({
                where: { studentId: { in: studentIds }, status: 'CLASS_COORD_APPROVED' }
            });

            const auditLogsThisMonth = await prisma.auditLog.findMany({
                where: {
                    performedBy: user.id,
                    createdAt: { gte: startOfMonth }
                },
                include: { request: true }
            });

            const approvedThisMonth = auditLogsThisMonth.filter(l => l.action === 'YEAR_COORD_APPROVED').length;
            const rejectedThisMonth = auditLogsThisMonth.filter(l => l.action === 'REJECTED').length;
            const forwardedToChairperson = auditLogsThisMonth.filter(l => 
                l.action === 'YEAR_COORD_APPROVED' && l.request?.leaveType === 'SPECIAL_OD'
            ).length;

            return res.json({
                pendingReview,
                approvedThisMonth,
                rejectedThisMonth,
                forwardedToChairperson,
                avgResponseTimeHours: "N/A"
            });
        }

        // Logic for Class Coordinator fetching stats (existing)
        const studentsInDivision = await prisma.user.findMany({
            where: { role: 'STUDENT', division: coord.division, year: coord.year }
        });
        const studentIds = studentsInDivision.map(s => s.id);

        const pendingReview = await prisma.attendanceRequest.count({
            where: { studentId: { in: studentIds }, status: 'SUBMITTED' }
        });

        const auditLogsThisMonth = await prisma.auditLog.findMany({
            where: {
                performedBy: req.user.id,
                createdAt: { gte: startOfMonth },
                action: { in: ['CLASS_COORD_APPROVED', 'REJECTED'] }
            },
            include: { request: true }
        });

        const approvedThisMonth = auditLogsThisMonth.filter(l => l.action === 'CLASS_COORD_APPROVED').length;
        const rejectedThisMonth = auditLogsThisMonth.filter(l => l.action === 'REJECTED').length;

        let totalResponseTimeMs = 0;
        let validLogsCount = 0;
        for (const log of auditLogsThisMonth) {
            if (log.request && log.request.createdAt) {
                totalResponseTimeMs += (log.createdAt - log.request.createdAt);
                validLogsCount++;
            }
        }
        
        let avgResponseTimeHours = 0;
        if (validLogsCount > 0) {
            avgResponseTimeHours = (totalResponseTimeMs / validLogsCount) / (1000 * 60 * 60);
        }

        res.json({
            pendingReview,
            approvedThisMonth,
            rejectedThisMonth,
            avgResponseTimeHours: avgResponseTimeHours.toFixed(1)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const getCoordinatorExcel = async (req, res) => {
    try {
        const coord = req.user;
        const studentsInDivision = await prisma.user.findMany({
            where: { role: 'STUDENT', division: coord.division, year: coord.year }
        });
        const studentIds = studentsInDivision.map(s => s.id);

        // Current semester assumption: let's just get APPROVED within the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const approvedRequests = await prisma.attendanceRequest.findMany({
            where: {
                studentId: { in: studentIds },
                status: 'APPROVED',
                createdAt: { gte: sixMonthsAgo }
            },
            include: { student: true }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Approved Leaves');

        sheet.columns = [
            { header: 'Student Name', key: 'name', width: 25 },
            { header: 'Register No', key: 'rollNo', width: 15 },
            { header: 'Leave Type', key: 'leaveType', width: 15 },
            { header: 'From Date', key: 'fromDate', width: 15 },
            { header: 'To Date', key: 'toDate', width: 15 },
            { header: 'Days', key: 'daysCount', width: 10 },
            { header: 'Reason', key: 'reason', width: 40 },
        ];

        approvedRequests.forEach(req => {
            sheet.addRow({
                name: req.student.name,
                rollNo: req.student.rollNo,
                leaveType: req.leaveType,
                fromDate: new Date(req.fromDate).toISOString().split('T')[0],
                toDate: new Date(req.toDate).toISOString().split('T')[0],
                daysCount: req.daysCount,
                reason: req.reason
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${coord.division}_${coord.year}_Records.xlsx"`);
        
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to generate excel');
    }
};

const getYearRecordTable = async (req, res) => {
    try {
        const { year } = req.user;
        const studentsInYear = await prisma.user.findMany({
            where: { role: 'STUDENT', year }
        });
        const studentIds = studentsInYear.map(s => s.id);

        const approved = await prisma.attendanceRequest.findMany({
            where: {
                studentId: { in: studentIds },
                status: { in: ['YEAR_COORD_APPROVED', 'CHAIRPERSON_APPROVED'] },
                leaveType: { in: ['OD', 'MEDICAL'] } // Only show attendance-linked ones in reports for now
            },
            include: { student: { select: { name: true, rollNo: true, division: true } } },
            orderBy: { updatedAt: 'desc' }
        });

        res.json({ success: true, data: approved });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { 
    submitRequest, 
    getPendingRequests, 
    getCoordinatorStats,
    getCoordinatorExcel,
    getYearRecordTable,
    approveClassCoord, 
    rejectRequest, 
    getPendingYearRequests, 
    approveYearCoord,
    rejectYearCoord,
    requestResubmissionYearCoord,
    resubmitRequest,
    getMyRequests,
    getRequestById,
    cancelRequest
};

