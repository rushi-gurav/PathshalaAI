const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateAttendanceSheet({ year, division, subject, date, data }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Attendance');

  // Title headers
  sheet.mergeCells('A1', 'B1');
  sheet.getCell('A1').value = `Attendance - ${subject}`;
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.getCell('A2').value = `Year: ${year}`;
  sheet.getCell('B2').value = `Division: ${division}`;
  sheet.getCell('A3').value = `Date: ${date}`;
  sheet.getCell('A4').value = '';

  // Data headers
  sheet.columns = [
    { header: 'Roll No', key: 'Roll', width: 10 },
    { header: 'Status', key: 'Status', width: 15 }
  ];

  // Add attendance data
  data.forEach(row => sheet.addRow(row));

  const dir = path.join(__dirname, '../../generated');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filename = `${year}_Div-${division}_${subject.replace(/\s+/g, '_')}_${date.replace(/-/g, '_')}.xlsx`;
  const filepath = path.join(dir, filename);

  await workbook.xlsx.writeFile(filepath);
  return filepath;
}

module.exports = { generateAttendanceSheet };
