import * as xlsx from 'xlsx';

const processWorkbook = (workbook) => {
  // Use the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert to JSON
  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  
  const parsedQuestions = [];
  let idCounter = 1;

  for (const row of jsonData) {
    // Find the exact keys since headers might have newlines or trailing spaces
    const keys = Object.keys(row);
    const questionKey = keys.find(k => k.toUpperCase().includes('QUESTION'));
    
    // Look for 'CORRECT ANSWER' or similar
    const correctKey = keys.find(k => k.toUpperCase().includes('CORRECT') && k.toUpperCase().includes('ANSWER')) 
                    || keys.find(k => k.toUpperCase() === 'ANSWER');
                    
    if (!questionKey || !row[questionKey]) continue;

    const rawQuestion = row[questionKey].toString();
    
    // Check if column-based options (Option A-D) are populated; prefer those over inline split.
    const optAKey = keys.find(k => k.trim().toUpperCase() === 'OPTION A');
    const optBKey = keys.find(k => k.trim().toUpperCase() === 'OPTION B');
    const optCKey = keys.find(k => k.trim().toUpperCase() === 'OPTION C');
    const optDKey = keys.find(k => k.trim().toUpperCase() === 'OPTION D');
    const optEKey = keys.find(k => k.trim().toUpperCase() === 'OPTION E');

    const colOptCount = [optAKey, optBKey, optCKey, optDKey, optEKey]
      .filter(k => k && row[k] && String(row[k]).trim()).length;

    let questionText = "";
    const options = [];

    if (colOptCount >= 2) {
      // Column-based options: use the full question text as-is, options come from columns.
      questionText = rawQuestion;
      if (optAKey && row[optAKey]) options.push(`A. ${row[optAKey]}`);
      if (optBKey && row[optBKey]) options.push(`B. ${row[optBKey]}`);
      if (optCKey && row[optCKey]) options.push(`C. ${row[optCKey]}`);
      if (optDKey && row[optDKey]) options.push(`D. ${row[optDKey]}`);
      if (optEKey && row[optEKey]) options.push(`E. ${row[optEKey]}`);
    } else {
      // Inline style: options are embedded in the question text.
      const cleanedQuestion = rawQuestion.replace(/(?<!\n)\s+([A-E][.)])\s+/gi, '\n$1 ');
      const lines = cleanedQuestion.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const optionRegex = /^[-*]?\s*[A-E][.)]\s*/i;
      for (const line of lines) {
        if (optionRegex.test(line)) {
          options.push(line);
        } else {
          questionText += (questionText ? "\n" : "") + line;
        }
      }
    }

    // If still no options were found, skip (might be a header or invalid row)
    if (options.length === 0) continue;

    let correctLetter = row[correctKey] ? row[correctKey].toString().trim().toUpperCase() : null;
    
    // Clean up the correct letter (e.g., if it says "C" or "C. something")
    if (correctLetter && correctLetter.length > 1) {
      const match = correctLetter.match(/^[A-E]/i);
      if (match) correctLetter = match[0].toUpperCase();
    }

    // Map the correct letter to the full option text
    const correctAnswerIndex = options.findIndex(opt => opt.toUpperCase().startsWith(correctLetter));
    const correctAnswerText = correctAnswerIndex !== -1 ? options[correctAnswerIndex] : (correctLetter || "Unknown");

    // Defensive guard: skip questions whose correct answer cannot be matched to any option.
    // This prevents silently grading a question as always-wrong.
    if (correctAnswerIndex === -1) continue;

    // Look for optional Topic and Explanation columns
    const topicKey = keys.find(k => {
      const clean = k.trim().toUpperCase();
      return clean === 'TOPIC' || clean === 'DOMAIN' || clean === 'CATEGORY';
    });
    
    let finalTopic = "General";
    if (topicKey && row[topicKey]) {
      const val = row[topicKey].toString().trim();
      if (val.length > 0 && isNaN(Number(val))) { // Don't use raw numbers like "3" as a topic
        // Basic normalization
        let cleanTopic = val
          .toLowerCase()
          .replace(/\s+/g, ' ') // replace multiple spaces with single space
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        // Merge similar topics
        if (cleanTopic.includes('Emergency') || cleanTopic.includes('Disaster')) {
          cleanTopic = 'Emergency Management & Preparedness';
        } else if (cleanTopic.includes('Employee Substance')) {
          cleanTopic = 'Employee Substance Abuse';
        } else if (cleanTopic.includes('Environmental') || cleanTopic === 'Epa') {
          cleanTopic = 'Environmental & EPA';
        } else if (cleanTopic.includes('Ethics') || cleanTopic.includes('Law')) {
          cleanTopic = 'Ethics & Law';
        } else if (cleanTopic.includes('Hierarchy Of Control')) {
          cleanTopic = 'Hierarchy Of Control';
        } else if (cleanTopic.includes('Ladder') || cleanTopic.includes('Stair')) {
          cleanTopic = 'Ladder & Stair Safety';
        } else if (cleanTopic.includes('Risk')) {
          cleanTopic = 'Risk Management';
        } else if (cleanTopic.includes('Safety Management') || cleanTopic === 'Management') {
          cleanTopic = 'Safety Management';
        } else if (cleanTopic.includes('Scaffold') || cleanTopic.includes('Aerial Platform')) {
          cleanTopic = 'Scaffold & Aerial Platforms';
        } else if (cleanTopic.includes('Math') || cleanTopic.includes('Statistic') || cleanTopic.includes('Probability') || cleanTopic.includes('Trigonometry')) {
          cleanTopic = 'Math & Statistics';
        } else if (cleanTopic.includes('Confined Space')) {
          cleanTopic = 'Confined Space';
        } else if (cleanTopic.includes('Electric')) {
          cleanTopic = 'Electrical Safety';
        } else if (cleanTopic.includes('Engineering Econom') || cleanTopic === 'Engineering Economy') {
          cleanTopic = 'Math & Statistics';
        } else if (cleanTopic === 'Engineering') {
          cleanTopic = 'Math & Statistics';
        } else if (cleanTopic.includes('Fire')) {
          cleanTopic = 'Fire Safety & Prevention';
        } else if (cleanTopic.includes('Hydraulic')) {
          cleanTopic = 'Hydraulics';
        } else if (cleanTopic.includes('Machine Guarding') || cleanTopic.includes('Machine Safety')) {
          cleanTopic = 'Machine Guarding';
        } else if (cleanTopic === 'Ppe' || cleanTopic === 'Personal Protective Equipment') {
          cleanTopic = 'Personal Protective Equipment';
        } else if (cleanTopic.includes('Liability')) {
          cleanTopic = 'Liability';
        } else if (['Training', 'Trainee Evaluation', 'Needs Assessment', 'Course Evaluation'].includes(cleanTopic)) {
          cleanTopic = 'Training & Evaluation';
        }
        
        // Safety net for dirty data strings (e.g. formula copy paste)
        if (cleanTopic.length > 50) {
          cleanTopic = 'General';
        }
        
        // Fix Acronyms (e.g. Ppe -> PPE)
        cleanTopic = cleanTopic
          .replace(/\bPpe\b/g, 'PPE')
          .replace(/\bDot\b/g, 'DOT')
          .replace(/\bIso\b/g, 'ISO')
          .replace(/\bGhs\b/g, 'GHS');

        finalTopic = cleanTopic;
      }
    }

    const explanationKey = keys.find(k => {
      const clean = k.trim().toUpperCase();
      return clean.includes('EXPLANATION') || clean.includes('RATIONALE') || clean === 'REASON';
    });
    
    let explanation = "";
    if (explanationKey && row[explanationKey]) {
      explanation = row[explanationKey].toString().trim();
    }

    parsedQuestions.push({
      id: idCounter++,
      text: questionText,
      options: options,
      correctAnswer: correctAnswerText,
      correctLetter: correctLetter,
      topic: finalTopic,
      explanation: explanation
    });
  }
  
  if (parsedQuestions.length === 0) {
    throw new Error("No valid questions found. Ensure the Excel file has a QUESTION column with A/B/C/D options.");
  }
  
  return parsedQuestions;
};

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: 'array' });
        const parsedQuestions = processWorkbook(workbook);
        resolve(parsedQuestions);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        reject(err instanceof Error ? err : new Error("Failed to parse the Excel file. Please ensure it is a valid format."));
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const loadDefaultBank = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}Exams.xlsx`);
    if (!response.ok) {
      throw new Error(`Failed to fetch default bank: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = xlsx.read(data, { type: 'array' });
    return processWorkbook(workbook);
  } catch (err) {
    console.error("Error loading default bank:", err);
    throw err;
  }
};
