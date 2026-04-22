const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const LETTER_DIR = path.resolve('./uploads/letters');
if (!fs.existsSync(LETTER_DIR)) fs.mkdirSync(LETTER_DIR, { recursive: true });

// Common Header Helper
function drawHeader(doc, student) {
  doc.fontSize(16).font('Helvetica-Bold')
     .text('DAYANANDA SAGAR UNIVERSITY', { align: 'center' });
  doc.fontSize(11).font('Helvetica')
     .text('Bangalore - 560078', { align: 'center' });
  doc.fontSize(11).font('Helvetica')
     .text('Department of ' + (student.department || 'N/A'), { align: 'center' });
  doc.moveDown(2);

  doc.text('Date: ' + new Date().toLocaleDateString('en-GB'), { align: 'right' });
  doc.moveDown();
}

// Common Footer Helper
function drawFooter(doc, student, attachments = []) {
  doc.moveDown(2);
  doc.font('Helvetica-Bold').text('Declaration:');
  doc.font('Helvetica').text('I hereby declare that the above information is true and correct to the best of my knowledge.', { italic: true });
  
  doc.moveDown();
  if (attachments.length > 0) {
    doc.font('Helvetica-Bold').text('Attachments:');
    attachments.forEach(item => doc.font('Helvetica').text('- ' + item));
    doc.moveDown();
  }

  doc.moveDown(2);
  doc.text('Yours sincerely,');
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(student.name);
  doc.font('Helvetica')
     .text('Register No: ' + student.id)
     .text('Year ' + (student.year || 'N/A') + ' | Division ' + (student.division || 'N/A'))
     .text('Department of ' + (student.department || 'N/A'));
}

async function generateODLetter(request, student, content) {
  return new Promise((resolve, reject) => {
    const fileName = `OD_${request.id}_${Date.now()}.pdf`;
    const filePath = path.join(LETTER_DIR, fileName);
    const doc = new PDFDocument({ margin: 72 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    drawHeader(doc, student);

    doc.text('To,');
    doc.text('The Class Coordinator,');
    doc.text('Dayananda Sagar University, Bangalore.');
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Subject: Application for On-Duty (OD) Leave');
    doc.font('Helvetica').moveDown();

    doc.text('Respected Sir/Madam,').moveDown(0.5);
    doc.text(
      `I, ${student.name}, a student of ${student.department} (Div ${student.division}, Year ${student.year}), ` +
      `am writing to request OD leave for ${request.daysCount} day(s) from ` +
      `${new Date(request.fromDate).toLocaleDateString('en-GB')} to ${new Date(request.toDate).toLocaleDateString('en-GB')}.`
    );
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Event Details:');
    doc.font('Helvetica')
       .text('Event Name: ' + content.eventName)
       .text('Organising Body: ' + content.organisingBody)
       .text('My Role: ' + content.role)
       .text('Venue: ' + content.location);
    
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Reason:');
    doc.font('Helvetica').text(request.reason);

    drawFooter(doc, student, ['Event Brochure/Invite']);

    doc.end();
    stream.on('finish', () => resolve({ fileName, filePath }));
    stream.on('error', reject);
  });
}

async function generateMedicalLetter(request, student, content) {
  return new Promise((resolve, reject) => {
    const fileName = `MED_${request.id}_${Date.now()}.pdf`;
    const filePath = path.join(LETTER_DIR, fileName);
    const doc = new PDFDocument({ margin: 72 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    drawHeader(doc, student);

    doc.text('To,');
    doc.text('The Class Coordinator,');
    doc.text('Dayananda Sagar University, Bangalore.');
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Subject: Application for Medical Leave');
    doc.font('Helvetica').moveDown();

    doc.text('Respected Sir/Madam,').moveDown(0.5);
    doc.text(
      `I, ${student.name}, a student of ${student.department} (Div ${student.division}, Year ${student.year}), ` +
      `request leave for ${request.daysCount} day(s) from ` +
      `${new Date(request.fromDate).toLocaleDateString('en-GB')} to ${new Date(request.toDate).toLocaleDateString('en-GB')} due to medical reasons.`
    );
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Medical Information:');
    doc.font('Helvetica')
       .text('Nature of Illness: ' + content.illness)
       .text('Hospital/Doctor: ' + content.doctor)
       .text('Under Treatment: ' + (content.underTreatment ? 'Yes' : 'No'));
    
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Reason:');
    doc.font('Helvetica').text(request.reason);

    const attachments = content.certificateAttached ? ['Medical Certificate'] : [];
    drawFooter(doc, student, attachments);

    doc.end();
    stream.on('finish', () => resolve({ fileName, filePath }));
    stream.on('error', reject);
  });
}

async function generateSpecialODLetter(request, student, content) {
  return new Promise((resolve, reject) => {
    const fileName = `SPEC_OD_${request.id}_${Date.now()}.pdf`;
    const filePath = path.join(LETTER_DIR, fileName);
    const doc = new PDFDocument({ margin: 72 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    drawHeader(doc, student);

    doc.text('To,');
    doc.text('The Chairperson,');
    doc.text('(Via: Class Coordinator and Year Coordinator),');
    doc.text('Dayananda Sagar University, Bangalore.');
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Subject: Application for Special On-Duty (Special OD) Leave');
    doc.font('Helvetica').moveDown();

    doc.text('Respected Sir/Madam,').moveDown(0.5);
    doc.text(
      `I, ${student.name}, a student of ${student.department} (Div ${student.division}, Year ${student.year}), ` +
      `humbly request Special OD approval for ${request.daysCount} day(s) from ` +
      `${new Date(request.fromDate).toLocaleDateString('en-GB')} to ${new Date(request.toDate).toLocaleDateString('en-GB')}.`
    );
    doc.moveDown();

    doc.font('Helvetica-Bold').text('External Event Details:');
    doc.font('Helvetica')
       .text('External Event: ' + content.externalEvent)
       .text('Organising Institution: ' + content.organisingBody)
       .text('Representing Role: ' + content.role)
       .text('Venue & City: ' + content.location);
    
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Reason:');
    doc.font('Helvetica').text(request.reason);

    const attachments = content.selectionLetterAttached ? ['Official Selection Letter'] : [];
    drawFooter(doc, student, attachments);

    doc.end();
    stream.on('finish', () => resolve({ fileName, filePath }));
    stream.on('error', reject);
  });
}

module.exports = { generateODLetter, generateMedicalLetter, generateSpecialODLetter };
