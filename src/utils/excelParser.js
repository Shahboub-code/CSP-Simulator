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
      const cleanedQuestion = rawQuestion.replace(/(?<!\n)\s+([A-E][.)]\s*|[1-5][.)]\s*|A:|B:|C:|D:|E:)\s*/gi, '\n$1 ');
      const lines = cleanedQuestion.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const optionRegex = /^[-*]?\s*([A-E][.)]\s*|[1-5][.)]\s*|A:|B:|C:|D:|E:)\s*/i;
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
    
    // Clean up the correct letter (e.g., if it says "C" or "C. something" or "1 - answer text")
    if (correctLetter && correctLetter.length > 1) {
      const match = correctLetter.match(/^([A-E]|[1-5])/i);
      if (match) correctLetter = match[0].toUpperCase();
    }

    // Map the correct letter/number to the full option text
    const correctAnswerIndex = options.findIndex(opt => {
      const optUpper = opt.toUpperCase().trim();
      return optUpper.startsWith(correctLetter + '.') || 
             optUpper.startsWith(correctLetter + ')') || 
             optUpper.startsWith(correctLetter + ':') ||
             optUpper.startsWith(correctLetter + ' ');
    });
    const correctAnswerText = correctAnswerIndex !== -1 ? options[correctAnswerIndex] : (correctLetter || "Unknown");

    // Defensive guard: skip questions whose correct answer cannot be matched to any option.
    // This prevents silently grading a question as always-wrong.
    if (correctAnswerIndex === -1) continue;

    // Look for optional Topic and Explanation columns
    const topicKey = keys.find(k => {
      const clean = k.trim().toUpperCase();
      return clean === 'TOPIC' || clean === 'DOMAIN' || clean === 'CATEGORY' || clean.includes('TOPIC') || clean.includes('DOMAIN');
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
          
        // Merge topics according to ASP/CSP Blueprint (9 domains)
        if (cleanTopic.includes('Safety Management') || cleanTopic.includes('Management System') || cleanTopic.includes('Management/Organization') || cleanTopic.includes('Advance Safety') || cleanTopic.includes('Safety Concept') || cleanTopic === 'Safety' || cleanTopic === 'General' || cleanTopic.includes('General Safety') || cleanTopic.includes('Safety Concepts') || cleanTopic.includes('Study') || cleanTopic.includes('Bcsp') || cleanTopic.includes('Asp Span') || cleanTopic.includes('Flashcards')) {
          cleanTopic = '1. Safety Management';
        } else if (cleanTopic.includes('Risk') || cleanTopic.includes('Loss Prevention') || cleanTopic.includes('Reliability') || cleanTopic.includes('Process Safety') || cleanTopic.includes('Insurance') || cleanTopic.includes('Finance')) {
          cleanTopic = '2. Risk Management';
        } else if (cleanTopic.includes('Industrial Hygiene') || cleanTopic.includes('Employee Exposures') || cleanTopic.includes('Occupational Health') || cleanTopic.includes('PPE') || cleanTopic.includes('Personal Protective') || cleanTopic.includes('Hearing') || cleanTopic.includes('Noise') || cleanTopic.includes('Heat') || cleanTopic.includes('Thermal') || cleanTopic.includes('Cold') || cleanTopic.includes('Relative Humidity') || cleanTopic.includes('Radiation') || cleanTopic.includes('Non-Ionizing') || cleanTopic.includes('Ventilation') || cleanTopic.includes('Indoor Air') || cleanTopic.includes('Toxicology') || cleanTopic.includes('Biohazard') || cleanTopic.includes('Bloodborne') || cleanTopic.includes('Respiratory') || cleanTopic.includes('Hazardous') || cleanTopic.includes('Hazard Communication') || cleanTopic.includes('Hazard Identification') || cleanTopic.includes('Asbestos') || cleanTopic.includes('Air Sampling') || cleanTopic.includes('Chemistry') || cleanTopic.includes('Gas Laws') || cleanTopic.includes('Confined Space') || cleanTopic.includes('Machine') || cleanTopic.includes('Lockout') || cleanTopic.includes('Lock Out') || cleanTopic.includes('Electrical') || cleanTopic.includes('Electric')) {
          cleanTopic = '3. Industrial Hygiene & Safety Controls';
        } else if (cleanTopic.includes('Fire') || cleanTopic.includes('Fire Prevention') || cleanTopic.includes('Fire Protection') || cleanTopic.includes('Fire Safety')) {
          cleanTopic = '4. Fire Prevention & Protection';
        } else if (cleanTopic.includes('Environmental') || cleanTopic.includes('EPA') || cleanTopic.includes('Domain 7') || cleanTopic.includes('Community Exposure')) {
          cleanTopic = '5. Environmental Management';
        } else if (cleanTopic.includes('Emergency') || cleanTopic.includes('Disaster')) {
          cleanTopic = '6. Emergency Management';
        } else if (cleanTopic.includes('Ergonomic')) {
          cleanTopic = '7. Ergonomics';
        } else if (cleanTopic.includes('Math') || cleanTopic.includes('Statistic') || cleanTopic.includes('Probability') || cleanTopic.includes('Trigonometry') || cleanTopic.includes('Engineering') || cleanTopic.includes('Physics') || cleanTopic.includes('Mechanics') || cleanTopic.includes('Science') || cleanTopic.includes('Basic Science')) {
          cleanTopic = '8. Math & Science';
        } else if (cleanTopic.includes('Ethics') || cleanTopic.includes('Law') || cleanTopic.includes('Legal') || cleanTopic.includes('Liability') || cleanTopic.includes('Product Liability')) {
          cleanTopic = '9. Law, Ethics & Professional Conduct';
        } else if (cleanTopic.includes('Construction')) {
          cleanTopic = '3. Industrial Hygiene & Safety Controls';
        } else if (cleanTopic.includes('Fall')) {
          cleanTopic = '3. Industrial Hygiene & Safety Controls';
        } else if (cleanTopic.includes('Scaffold') || cleanTopic.includes('Aerial Platform')) {
          cleanTopic = '3. Industrial Hygiene & Safety Controls';
        } else if (cleanTopic.includes('Ladder') || cleanTopic.includes('Stair')) {
          cleanTopic = '3. Industrial Hygiene & Safety Controls';
        } else if (cleanTopic.includes('Transportation') || cleanTopic.includes('Fleet')) {
          cleanTopic = '2. Risk Management';
        } else if (cleanTopic.includes('Security') || cleanTopic.includes('Workplace Violence')) {
          cleanTopic = '6. Emergency Management';
        } else if (cleanTopic.includes('Communication')) {
          cleanTopic = '1. Safety Management';
        } else if (cleanTopic.includes('Material') || cleanTopic.includes('Storage')) {
          cleanTopic = '3. Industrial Hygiene & Safety Controls';
        } else if (cleanTopic.includes('Facility') || cleanTopic.includes('Work Environment') || cleanTopic.includes('Visual Environment')) {
          cleanTopic = '7. Ergonomics';
        } else if (cleanTopic.includes('Hydraulic') || cleanTopic.includes('Hydrostatic')) {
          cleanTopic = '8. Math & Science';
        } else if (cleanTopic.includes('Training')) {
          cleanTopic = '1. Safety Management';
        } else {
          cleanTopic = '1. Safety Management'; // Default
        }
        
        // Safety net for dirty data strings (e.g. formula copy paste)
        if (cleanTopic.length > 50) {
          cleanTopic = 'General';
        }
        
        // No acronym fixes needed for blueprint domains

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

