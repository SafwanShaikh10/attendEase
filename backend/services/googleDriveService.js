const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const getDriveService = () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../credentials.json'),
        scopes: ['https://www.googleapis.com/auth/drive']
    });
    return google.drive({ version: 'v3', auth });
};

const syncExcelToDrive = async (department, division, semester, rowData, subjectCount) => {
    // Ensure credentials exist before trying to connect
    if (!fs.existsSync(path.join(__dirname, '../credentials.json'))) {
        console.warn('Google Drive credentials.json not found - skipping drive sync. Excel data generated but not pushed.');
        return;
    }

    const drive = getDriveService();
    const fileName = `${department}_${division}_${semester}.xlsx`;
    
    const localPath = path.join(__dirname, `../tmp_${fileName}`);
    let workbook = new ExcelJS.Workbook();
    let worksheet;

    try {
        const query = `name='${fileName}' and trashed=false`;
        const res = await drive.files.list({ q: query, fields: 'files(id, name)' });
        const existingFile = res.data.files[0];

        if (existingFile) {
            // File exists -> Download it
            const dest = fs.createWriteStream(localPath);
            await drive.files.get({ fileId: existingFile.id, alt: 'media' }, { responseType: 'stream' })
                .then(response => {
                    return new Promise((resolve, reject) => {
                        response.data.on('end', () => resolve()).on('error', reject).pipe(dest);
                    });
                });
            
            await workbook.xlsx.readFile(localPath);
            worksheet = workbook.getWorksheet(1);
        } else {
            // File doesn't exist -> Create basic headers
            worksheet = workbook.addWorksheet('Attendance');
            let headers = ['Student Name', 'Register No.', 'Leave Type', 'From Date', 'To Date', 'Days', 'Reason'];
            for(let i = 0; i < subjectCount; i++) headers.push(`Subject ${i+1}`);
            for(let i = 0; i < subjectCount; i++) headers.push(`Teacher ${i+1}`);
            headers.push('Status', 'Approved By', 'Approved At');
            
            worksheet.addRow(headers);
        }

        // Append the new row at the bottom
        worksheet.addRow(rowData);
        await workbook.xlsx.writeFile(localPath);

        // Upload
        const media = {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            body: fs.createReadStream(localPath)
        };

        if (existingFile) {
            await drive.files.update({ fileId: existingFile.id, media });
        } else {
            await drive.files.create({
                requestBody: { 
                    name: fileName, 
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                },
                media
            });
        }

        // Cleanup temporary download
        if(fs.existsSync(localPath)) fs.unlinkSync(localPath);
        console.log(`Synced ${fileName} to Google Drive successfully.`);
        
    } catch (e) {
        console.error('Error syncing drive:', e);
    }
};

module.exports = { syncExcelToDrive };
