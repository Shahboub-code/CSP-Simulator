const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('public/Exams.xlsx');
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet);

const topics = new Set();

for (const row of jsonData) {
  const keys = Object.keys(row);
  const topicKey = keys.find(k => {
    const clean = k.trim().toUpperCase();
    return clean === 'TOPIC' || clean === 'DOMAIN' || clean === 'CATEGORY';
  });
  
  if (topicKey && row[topicKey]) {
    const val = row[topicKey].toString().trim();
    if (val.length > 0 && isNaN(Number(val))) {
      let cleanTopic = val
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      topics.add(cleanTopic);
    }
  }
}

console.log(Array.from(topics).sort());
