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
          
        // Merge similar topics
        if (cleanTopic.includes('Emergency') || cleanTopic.includes('Disaster')) {
          cleanTopic = 'Emergency Management & Preparedness';
        } else if (cleanTopic.includes('Employee Substance')) {
          cleanTopic = 'Employee Substance Abuse';
        } else if (cleanTopic.includes('Environmental') || cleanTopic === 'Epa' || cleanTopic.includes('Domain 7') || cleanTopic.includes('Community Exposure')) {
          cleanTopic = 'Environmental Management';
        } else if (cleanTopic.includes('Ethics') || cleanTopic.includes('Law') || cleanTopic.includes('Legal') || cleanTopic.includes('Liability') || cleanTopic.includes('Product Liability')) {
          cleanTopic = 'Ethics & Law';
        } else if (cleanTopic.includes('Hierarchy Of Control')) {
          cleanTopic = 'Hierarchy Of Control';
        } else if (cleanTopic.includes('Ladder') || cleanTopic.includes('Stair')) {
          cleanTopic = 'Ladder & Stair Safety';
        } else if (cleanTopic.includes('Risk')) {
          cleanTopic = 'Risk Management';
        } else if (cleanTopic.includes('Safety Management') || cleanTopic === 'Management' || cleanTopic.includes('Management System') || cleanTopic.includes('Management/Organization') || cleanTopic.includes('Advance Safety') || cleanTopic.includes('Safety Concept') || cleanTopic === 'Safety') {
          cleanTopic = 'Safety Management';
        } else if (cleanTopic.includes('Scaffold') || cleanTopic.includes('Aerial Platform')) {
          cleanTopic = 'Scaffold & Aerial Platforms';
        } else if (cleanTopic.includes('Math') || cleanTopic.includes('Statistic') || cleanTopic.includes('Probability') || cleanTopic.includes('Trigonometry') || cleanTopic.includes('Engineering Econom') || cleanTopic.includes('Engineering') || cleanTopic === 'Engineering') {
          cleanTopic = 'Math & Statistics';
        } else if (cleanTopic.includes('Confined Space')) {
          cleanTopic = 'Confined Space';
        } else if (cleanTopic.includes('Electric')) {
          cleanTopic = 'Electrical Safety';
        } else if (cleanTopic.includes('Fire') || cleanTopic.includes('Fire Prevention') || cleanTopic.includes('Fire Protection') || cleanTopic.includes('Fire Safety')) {
          cleanTopic = 'Fire Safety & Protection';
        } else if (cleanTopic.includes('Hydraulic') || cleanTopic.includes('Hydrostatic')) {
          cleanTopic = 'Hydraulics';
        } else if (cleanTopic.includes('Machine') || cleanTopic.includes('Machine Guarding') || cleanTopic.includes('Machine Safety') || cleanTopic.includes('Lockout') || cleanTopic.includes('Lock Out')) {
          cleanTopic = 'Machine Safety';
        } else if (cleanTopic === 'Ppe' || cleanTopic === 'Personal Protective Equipment') {
          cleanTopic = 'PPE';
        } else if (cleanTopic.includes('Training') || cleanTopic.includes('Trainee') || cleanTopic.includes('Needs Assessment') || cleanTopic.includes('Course Evaluation')) {
          cleanTopic = 'Training & Evaluation';
        } else if (cleanTopic.includes('Hearing') || cleanTopic.includes('Noise')) {
          cleanTopic = 'Hearing & Noise';
        } else if (cleanTopic.includes('Heat') || cleanTopic.includes('Thermal') || cleanTopic.includes('Cold') || cleanTopic.includes('Relative Humidity')) {
          cleanTopic = 'Heat & Thermal Stress';
        } else if (cleanTopic.includes('Radiation') || cleanTopic.includes('Non-Ionizing') || cleanTopic.includes('Non-ionizing')) {
          cleanTopic = 'Radiation';
        } else if (cleanTopic.includes('Ventilation') || cleanTopic.includes('Indoor Air')) {
          cleanTopic = 'Ventilation';
        } else if (cleanTopic.includes('Hazardous') || cleanTopic.includes('Hazmat')) {
          cleanTopic = 'Hazardous Materials';
        } else if (cleanTopic.includes('Hazard Communication') || cleanTopic.includes('Hazard Identification')) {
          cleanTopic = 'Hazard Communication';
        } else if (cleanTopic.includes('Respiratory')) {
          cleanTopic = 'Respiratory Protection';
        } else if (cleanTopic.includes('Toxicology') || cleanTopic.includes('Biohazard') || cleanTopic.includes('Bloodborne')) {
          cleanTopic = 'Toxicology & Biohazards';
        } else if (cleanTopic.includes('Ergonomic')) {
          cleanTopic = 'Ergonomics';
        } else if (cleanTopic.includes('Industrial Hygiene') || cleanTopic.includes('Employee Exposures') || cleanTopic.includes('Occupational Health')) {
          cleanTopic = 'Industrial Hygiene';
        } else if (cleanTopic.includes('Physics') || cleanTopic.includes('Mechanics')) {
          cleanTopic = 'Physics';
        } else if (cleanTopic.includes('Chemistry') || cleanTopic.includes('Gas Laws')) {
          cleanTopic = 'Chemistry';
        } else if (cleanTopic.includes('Science') || cleanTopic.includes('Basic Science')) {
          cleanTopic = 'Science';
        } else if (cleanTopic.includes('Construction')) {
          cleanTopic = 'Construction Safety';
        } else if (cleanTopic.includes('Fall')) {
          cleanTopic = 'Fall Protection';
        } else if (cleanTopic.includes('Process Safety')) {
          cleanTopic = 'Process Safety';
        } else if (cleanTopic.includes('Insurance') || cleanTopic.includes('Finance')) {
          cleanTopic = 'Finance & Insurance';
        } else if (cleanTopic.includes('Security') || cleanTopic.includes('Workplace Violence')) {
          cleanTopic = 'Security';
        } else if (cleanTopic.includes('Communication')) {
          cleanTopic = 'Communication';
        } else if (cleanTopic.includes('Transportation') || cleanTopic.includes('Fleet')) {
          cleanTopic = 'Transportation & Fleet Safety';
        } else if (cleanTopic.includes('Material') || cleanTopic.includes('Storage')) {
          cleanTopic = 'Material Handling & Storage';
        } else if (cleanTopic.includes('Loss Prevention') || cleanTopic.includes('Reliability')) {
          cleanTopic = 'Loss Prevention & Reliability';
        } else if (cleanTopic.includes('Work Environment') || cleanTopic.includes('Visual Environment')) {
          cleanTopic = 'Work Environments';
        } else if (cleanTopic.includes('Study')) {
          cleanTopic = 'Study Habits';
        } else if (cleanTopic.includes('Facility') || cleanTopic.includes('Facility Design') || cleanTopic.includes('Facility Planning')) {
          cleanTopic = 'Facility Planning & Design';
        } else if (cleanTopic.includes('General') || cleanTopic.includes('General Safety')) {
          cleanTopic = 'General Safety';
        } else if (cleanTopic.includes('System Safety') || cleanTopic.includes('Systems Safety')) {
          cleanTopic = 'System Safety';
        } else if (cleanTopic.includes('Asbestos') || cleanTopic.includes('Air Sampling')) {
          cleanTopic = 'Asbestos & Air Sampling';
        } else if (cleanTopic.includes('Bcsp') || cleanTopic.includes('Asp Span')) {
          cleanTopic = 'BCSP Exam Prep';
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
    const response = await fetch(`${import.meta.env.BASE_URL}Exams2.xlsx`);
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
