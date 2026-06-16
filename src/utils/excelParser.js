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
    
    // Split by newlines to separate question from options
    const lines = rawQuestion.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    let questionText = "";
    const options = [];
    
    // Heuristic: lines starting with A., B., C., D. are options
    const optionRegex = /^[A-E][.)]\s*/i;
    
    for (const line of lines) {
      if (optionRegex.test(line)) {
        options.push(line);
      } else {
        questionText += (questionText ? "\n" : "") + line;
      }
    }
    
    // If no options were found, skip (might be a header or invalid row)
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
        if (cleanTopic.includes('Emergency Preaparedness') || cleanTopic.includes('Emergency Preparedness')) {
          cleanTopic = 'Emergency Preparedness';
        } else if (cleanTopic.includes('Employee Substance')) {
          cleanTopic = 'Employee Substance Abuse';
        } else if (cleanTopic.includes('Environmental') || cleanTopic === 'Epa') {
          cleanTopic = 'Environmental & EPA';
        } else if (cleanTopic.includes('Ethics') || cleanTopic.includes('Law')) {
          cleanTopic = 'Ethics & Law';
        } else if (cleanTopic.includes('Hierarchy Of Control')) {
          cleanTopic = 'Hierarchy Of Control';
        } else if (cleanTopic.includes('Ladder And Stair')) {
          cleanTopic = 'Ladder & Stair Safety';
        } else if (cleanTopic.includes('Risk Management')) {
          cleanTopic = 'Risk Management';
        } else if (cleanTopic.includes('Safety Management')) {
          cleanTopic = 'Safety Management';
        } else if (cleanTopic.includes('Scaffold')) {
          cleanTopic = 'Scaffold & Aerial Platforms';
        } else if (cleanTopic === 'Math' || cleanTopic === 'Statistics') {
          cleanTopic = 'Math & Statistics';
        } else if (['Training', 'Trainee Evaluation', 'Needs Assessment', 'Course Evaluation'].includes(cleanTopic)) {
          cleanTopic = 'Training & Evaluation';
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
