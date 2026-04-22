const cron = require('node-cron');
const prisma = require('../config/prisma');

const { sendEmail, templates, createInAppNotification } = require('../services/notification.service');

// ============================================
// MIDNIGHT JOB — Auto-reject overdue SUBMITTED requests
// Runs every day at 00:00
// ============================================
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running deadline enforcement check...');

  try {
    const overdue = await prisma.attendanceRequest.findMany({
      where: {
        status: 'SUBMITTED',
        deadlineDate: { lt: new Date() }  // deadline_date = from_date + 6 days
      }
    });

    for (const request of overdue) {
      await prisma.attendanceRequest.update({
        where: { id: request.id },
        data: {
          status: 'REJECTED',
          rejectedBy: null,
          rejectionReason: 'Auto-rejected: 6-day deadline from absence date exceeded.'
        }
      });

      await prisma.auditLog.create({
        data: {
          requestId: request.id,
          action: 'REJECTED',
          performedBy: null,
          performedAs: 'SYSTEM',
          note: 'Auto-rejected by deadline enforcement job (from_date + 6 days).'
        }
      });
    }

    console.log(`[CRON] Auto-rejected ${overdue.length} overdue requests.`);
  } catch (err) {
    console.error('[CRON] Deadline enforcement error:', err);
  }
});

// ============================================
// 9 AM JOB — Day 5 warning (1 day before deadline)
// Runs every day at 09:00
// ============================================
cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Running deadline warning check...');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const approaching = await prisma.attendanceRequest.findMany({
      where: {
        status: 'SUBMITTED',
        deadlineDate: { gte: tomorrow, lt: dayAfter }
      },
      include: { student: true }
    });

    for (const request of approaching) {
      const deadlineStr = request.deadlineDate.toDateString();
      const { subject, body } = templates.deadlineWarning(request.student.name, deadlineStr);
      await sendEmail(request.student.email, subject, body);
      await createInAppNotification(request.student.id, `⚠️ 1 Day Left to Submit Leave Request for returning on ${deadlineStr}`);
      console.log(`[REMINDER] Student ${request.student.name} — 1 day left on request ${request.id}`);
    }

    console.log(`[CRON] Found ${approaching.length} requests approaching deadline.`);
  } catch (err) {
    console.error('[CRON] Deadline warning error:', err);
  }
});

// ============================================
// HOURLY JOB — Deactivate expired substitutes
// ============================================
cron.schedule('0 * * * *', async () => {
  try {
    await prisma.substituteApprover.updateMany({
      where: {
        active: true,
        expiresAt: { lt: new Date() }
      },
      data: { active: false }
    });
    // console.log('[CRON] Checked for expired substitutes.');
  } catch (err) {
    console.error('[CRON] Substitute deactivation error:', err);
  }
});

// ============================================
// HOURLY JOB — 24hr stale request reminder
// ============================================
cron.schedule('0 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stale = await prisma.attendanceRequest.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'CLASS_COORD_APPROVED', 'YEAR_COORD_APPROVED']
        },
        submittedAt: { lt: cutoff }
      },
      include: { student: true }
    });

    for (const request of stale) {
      // Find the current approver based on status
      let approverRole = null;
      if (request.status === 'SUBMITTED') approverRole = 'CLASS_COORD';
      if (request.status === 'CLASS_COORD_APPROVED') approverRole = 'YEAR_COORD';
      if (request.status === 'YEAR_COORD_APPROVED') approverRole = 'CHAIRPERSON';

      if (!approverRole) continue;

      const approvers = await prisma.user.findMany({
        where: {
          role: approverRole,
          year: approverRole === 'YEAR_COORD' || approverRole === 'CLASS_COORD' ? request.student.year : undefined,
          division: approverRole === 'CLASS_COORD' ? request.student.division : undefined
        }
      });

      for (const approver of approvers) {
        const { subject, body } = templates.reminder(approver.name);
        await sendEmail(approver.email, subject, body);
        await createInAppNotification(approver.id, `Reminder: Leave request from ${request.student.name} has been pending for over 24 hours.`);
      }
    }
  } catch (err) {
    console.error('[CRON] Reminder error:', err);
  }
});

console.log('[CRON] Deadline enforcement jobs registered.');
