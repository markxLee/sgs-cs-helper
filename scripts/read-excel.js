/* eslint-disable @typescript-eslint/no-require-imports */
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../docs/template/oder.xls');
const wb = XLSX.readFile(filePath);
console.log('Sheet Names:', wb.SheetNames);
const ws = wb.Sheets[wb.SheetNames[0]];
const range = ws['!ref'];
console.log('Range:', range);
const data = XLSX.utils.sheet_to_json(ws, {header: 1});
console.log('Total rows:', data.length);
console.log('---');
data.slice(0, 10).forEach((row, i) => {
  console.log('Row ' + i + ':');
  if (Array.isArray(row)) {
    row.forEach((cell, j) => console.log('  Col ' + j + ': ' + cell));
  }
});
