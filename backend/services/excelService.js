const ExcelJS = require('exceljs');
const { google } = require('googleapis');
const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

const generateExcelRow = async (requestId) => {
    // 1. Fetch Request with all nested relations
    const request = await prisma.attendanceRequest.findUnique({
        where: { id: requestId },
        include: {
            student: {
                include: {
                    subjectsEnrolled: {
                        include: { subject: true }
                    }
                }
            },
            auditLogs: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    if (!request) throw new Error("Request not found");

    const student = request.student;
    
    // Fallback if approved by log is missing
    const approverLog = request.auditLogs[0];
    let approvedByName = "System";
    if (approverLog && approverLog.performedBy) {
        const approver = await prisma.user.findUnique({ where: { id: approverLog.performedBy }});
        if (approver) approvedByName = approver.name;
    }

    // Process Date
    const formatDate = (date) => date ? date.toISOString().split('T')[0] : "";

    // Aggregate Subject and Teacher Logic
    const subjects = student.subjectsEnrolled || [];
    let subjectNames = [];
    let teacherNames = [];
    
    subjects.forEach(enrollment => {
        subjectNames.push(enrollment.subject.name || `Sub-${enrollment.subjectId}`);
        teacherNames.push(enrollment.teacherName || "Unknown");
    });

    // We join them as comma-separated values since we don't know N columns optimally for a flat array,
    // Or we pad an array of columns. The instruction says "Subject 1...N | Teacher 1...N" which means dynamic columns. 
    // To handle dynamic columns cleanly in ExcelJS, we can just supply them as spread array values. 

    const baseData = [
        student.name, 
        student.id.toString(), // Register No. fallback to User ID
        request.leaveType,
        formatDate(request.fromDate),
        formatDate(request.toDate),
        request.daysCount,
        request.reason
    ];

    const finalData = [
        ...baseData,
        ...subjectNames,
        ...teacherNames,
        request.status,
        approvedByName,
        formatDate(new Date()) // Approved At
    ];

    return {
        department: student.department || 'UnknownDept',
        division: student.division || 'UnknownDiv',
        semester: request.semester || 'UnknownSem',
        rowData: finalData,
        subjectCount: subjects.length
    };
};

module.exports = { generateExcelRow };
