const fs = require('fs');

/**
 * Validates magic bytes (signatures) of a file to ensure it's a real PDF, JPG, or PNG.
 * @param {string} filePath - Path to the file to check.
 * @returns {Promise<boolean>} - True if valid, false otherwise.
 */
async function validateFileSignature(filePath) {
  return new Promise((resolve) => {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const hex = buffer.toString('hex').toUpperCase();

    // PDF: %PDF- (25 50 44 46)
    if (hex.startsWith('25504446')) return resolve(true);

    // JPG/JPEG: FF D8 FF
    if (hex.startsWith('FFD8FF')) return resolve(true);

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (hex.startsWith('89504E470D0A1A0A')) return resolve(true);

    resolve(false);
  });
}

module.exports = { validateFileSignature };
