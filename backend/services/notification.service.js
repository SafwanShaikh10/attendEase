const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

// ============================================
// Ethereal Email Setup (for local testing)
// In production, replace with real SMTP credentials
// ============================================
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Check if real credentials exist in .env
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('[EMAIL] Using Gmail SMTP');
  } else {
    // Ethereal — fake SMTP for local dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('[EMAIL] Using Ethereal test account:', testAccount.user);
  }

  return transporter;
}

// ============================================
// Send Email — never crashes the main flow
// ============================================
async function sendEmail(to, subject, body) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: `"AttendX - DSU" <${process.env.EMAIL_USER || 'noreply@attendx.dev'}>`,
      to,
      subject,
      html: body
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);

    // If using Ethereal, print the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL] Preview: ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err.message);
  }
}

// ============================================
// In-App Notification — stores in DB
// ============================================
async function createInAppNotification(userId, message, requestId = null) {
  try {
    await prisma.notification.create({
      data: { userId, message, requestId }
    });
  } catch (err) {
    console.error('[IN-APP NOTIF] Failed:', err.message);
  }
}

// ============================================
// Pre-built email templates per trigger
// ============================================
const templates = {
  submitted: (studentName, coordName) => ({
    subject: 'New Leave Request — Action Required',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#1a56db">New Leave Request</h2>
      <p>Hi ${coordName},</p>
      <p>A new leave request has been submitted by <b>${studentName}</b> and is awaiting your review.</p>
      <p>Please log in to the AttendX dashboard to take action.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  }),

  classCoordApproved: (studentName, nextCoordName) => ({
    subject: 'Leave Request Forwarded — Action Required',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#1a56db">Request Forwarded</h2>
      <p>Hi ${nextCoordName},</p>
      <p>A request from <b>${studentName}</b> has been approved by the Class Coordinator and is now awaiting your review.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  }),

  finalApproved: (studentName) => ({
    subject: 'Leave Request Approved ✅',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#16a34a">Request Approved</h2>
      <p>Hi ${studentName},</p>
      <p>Your leave request has been <b>approved</b>. Your attendance records have been updated.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  }),

  rejected: (studentName, role, reason) => ({
    subject: 'Leave Request Rejected',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#dc2626">Request Rejected</h2>
      <p>Hi ${studentName},</p>
      <p>Your leave request was <b>rejected</b> by the ${role}.</p>
      <p><b>Reason:</b> ${reason}</p>
      <p>You may resubmit with updated information.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  }),

  resubmissionRequested: (studentName, role, note) => ({
    subject: 'Changes Requested on Your Leave Application',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#f59e0b">Changes Requested</h2>
      <p>Hi ${studentName},</p>
      <p>The ${role} has requested changes to your leave application.</p>
      <p><b>Note:</b> ${note}</p>
      <p>Please resubmit with the required updates.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  }),

  resubmitted: (coordName, studentName) => ({
    subject: 'Student Has Resubmitted a Request',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#1a56db">Request Resubmitted</h2>
      <p>Hi ${coordName},</p>
      <p><b>${studentName}</b> has resubmitted their leave request. Please review it.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  }),

  deadlineWarning: (studentName, deadlineDate) => ({
    subject: '⚠️ 1 Day Left to Submit Leave Request',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#f59e0b">Deadline Approaching</h2>
      <p>Hi ${studentName},</p>
      <p>Your leave request deadline is <b>tomorrow (${deadlineDate})</b>. Please ensure your application is submitted in time.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  }),

  reminder: (coordName) => ({
    subject: '⏰ Reminder: Pending Leave Request Awaiting Your Action',
    body: `<div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#f59e0b">Pending Request Reminder</h2>
      <p>Hi ${coordName},</p>
      <p>You have a leave request that has been pending for over 24 hours. Please review it at your earliest convenience.</p>
      <hr><p style="color:#666;font-size:12px">AttendX — Dayananda Sagar University</p></div>`
  })
};

module.exports = { sendEmail, createInAppNotification, templates };
