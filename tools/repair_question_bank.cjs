const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const XLSX = require("xlsx");

const sourcePath = path.resolve("public", "Exams2.xlsx");
const outputDir = path.resolve("outputs", "question-bank-repair");
const outputPath = path.join(outputDir, "Exams2_repaired.xlsx");

const sourceBytes = fs.readFileSync(sourcePath);
const sourceHash = crypto.createHash("sha256").update(sourceBytes).digest("hex");
const workbook = XLSX.read(sourceBytes, {
  type: "buffer",
  cellStyles: true,
  cellDates: true,
});
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

const directMap = new Map([
  ["\uF057", "\u03A9"], // Omega
  ["\uF053", "\u03A3"], // Sigma
  ["\uF073", "\u03C3"], // sigma
  ["\uF070", "\u03C0"], // pi
  ["\uF06C", "\u03BB"], // lambda
  ["\uF063", "\u03C7"], // chi
  ["\uF04C", "..."],
  ["\uF0B7", "\u2022"],
  ["\uF028", "("],
  ["\uF029", ")"],
  ["\uF02B", "+"],
  ["\uF02D", "-"],
  ["\uF03D", "="],
  ["\uF03B", ";"],
  ["\uF03F", "?"],
  ["\uF020", " "],
  ["\uF0F1", "\u00B1"],
  ["\uF0E0", "\u2192"],
  ["\uF0E5", "\u2211"],
]);

// Composite equation-font parentheses and brackets. The top glyph becomes the
// normal delimiter; extender and bottom glyphs are removed.
const compositeMap = new Map([
  ["\uF8EB", "("], ["\uF8EC", ""], ["\uF8ED", ""],
  ["\uF8F6", ")"], ["\uF8F7", ""], ["\uF8F8", ""],
  ["\uF8EE", "["], ["\uF8EF", ""], ["\uF8F0", ""],
  ["\uF8F9", "]"], ["\uF8FA", ""], ["\uF8FB", ""],
  ["\uF0E6", "("], ["\uF0E7", ""], ["\uF0E8", ""],
  ["\uF0F6", ")"], ["\uF0F7", ""], ["\uF0F8", ""],
  ["\uF0E9", "["], ["\uF0EA", ""], ["\uF0EB", ""],
  ["\uF0F9", "]"], ["\uF0FA", ""], ["\uF0FB", ""],
]);

const puaRegex = /[\uE000-\uF8FF]/g;
const replacementRegex = /\uFFFD/g;
const optionOnlyRegex = /^\s*(?:[A-E1-5][.):]\s*)/i;

function repairText(value) {
  const original = String(value ?? "");
  let changed = false;
  let ambiguousEquation = original.includes("\uF04C");
  let unrecoverable = false;

  let repaired = original.replace(/[\uE000-\uF8FF\uFFFD]/g, (char) => {
    changed = true;
    if (char === "\uFFFD") {
      unrecoverable = true;
      return "[UNRECOVERABLE SYMBOL]";
    }
    if (directMap.has(char)) return directMap.get(char);
    if (compositeMap.has(char)) {
      ambiguousEquation = true;
      return compositeMap.get(char);
    }
    unrecoverable = true;
    return `[UNRECOVERABLE SYMBOL U+${char.codePointAt(0).toString(16).toUpperCase()}]`;
  });

  // This equation is fully recoverable from the visible operands and OSHA's
  // standard dose formula.
  repaired = repaired.replace(
    /\(7 0\.75 0\.25\)\s*\+\s*\+\s*100=119%\s*8 4 2\s*/g,
    "[(7 / 8) + (0.75 / 4) + (0.25 / 2)] x 100 = 119% "
  );

  repaired = repaired
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([,.;:])/g, "$1")
    .trim();

  return { original, repaired, changed, ambiguousEquation, unrecoverable };
}

function looksTruncated(explanation) {
  const text = String(explanation ?? "").trim();
  if (!text) return true;
  if (text.length < 8) return true;
  return /(?:[(*+\-/=]|\b(?:and|or|the|of|to|in|for|with))\s*$/i.test(text);
}

const repairedRows = [];
const reviewRows = [];
let repairedRowCount = 0;
let manualReviewCount = 0;
let unrecoverableRowCount = 0;

for (let index = 0; index < rows.length; index += 1) {
  const row = rows[index];
  const excelRow = index + 2;
  const topic = repairText(row["Topic or Domain"]);
  const question = repairText(row["Question With Answers"]);
  const answer = repairText(row["Correct Answer"]);
  const explanation = repairText(row["Explanation"]);
  const results = [topic, question, answer, explanation];
  const notes = [];

  if (results.some((result) => result.changed)) {
    repairedRowCount += 1;
    notes.push("Converted recoverable legacy-font symbols to Unicode/plain text.");
  }
  if (results.some((result) => result.ambiguousEquation)) {
    notes.push("Equation used composite font glyphs; verify reconstructed linear notation.");
  }
  if (results.some((result) => result.unrecoverable)) {
    unrecoverableRowCount += 1;
    notes.push("Contains an unrecoverable or unknown symbol placeholder.");
  }
  if (optionOnlyRegex.test(question.repaired)) {
    notes.push("Question stem appears missing; row begins with an answer option.");
  }
  if (looksTruncated(explanation.repaired)) {
    notes.push("Explanation appears missing, unusually short, or truncated.");
  }

  const needsReview = notes.some((note) =>
    /verify|unrecoverable|unknown|missing|truncated/i.test(note)
  );
  if (needsReview) manualReviewCount += 1;

  repairedRows.push({
    "Topic or Domain": topic.repaired,
    "Question With Answers": question.repaired,
    "Correct Answer": answer.repaired,
    "Explanation": explanation.repaired,
    "Repair Status": needsReview ? "MANUAL REVIEW" : results.some((r) => r.changed) ? "REPAIRED" : "UNCHANGED",
    "Repair Notes": notes.join(" "),
    "Original Excel Row": excelRow,
  });

  if (needsReview) {
    reviewRows.push({
      "Original Excel Row": excelRow,
      "Topic or Domain": topic.repaired,
      "Repair Notes": notes.join(" "),
      "Original Question": question.original,
      "Repaired Question": question.repaired,
      "Correct Answer": answer.repaired,
      "Original Explanation": explanation.original,
      "Repaired Explanation": explanation.repaired,
    });
  }
}

const repairedSheet = XLSX.utils.json_to_sheet(repairedRows, {
  header: [
    "Topic or Domain",
    "Question With Answers",
    "Correct Answer",
    "Explanation",
    "Repair Status",
    "Repair Notes",
    "Original Excel Row",
  ],
});
repairedSheet["!cols"] = [
  { wch: 28 }, { wch: 90 }, { wch: 34 }, { wch: 100 },
  { wch: 18 }, { wch: 70 }, { wch: 18 },
];
repairedSheet["!autofilter"] = { ref: `A1:G${repairedRows.length + 1}` };
repairedSheet["!freeze"] = { xSplit: 0, ySplit: 1 };

const reviewSheet = XLSX.utils.json_to_sheet(reviewRows);
reviewSheet["!cols"] = [
  { wch: 18 }, { wch: 28 }, { wch: 70 }, { wch: 85 },
  { wch: 85 }, { wch: 34 }, { wch: 95 }, { wch: 95 },
];
reviewSheet["!autofilter"] = { ref: `A1:H${reviewRows.length + 1}` };
reviewSheet["!freeze"] = { xSplit: 0, ySplit: 1 };

workbook.Sheets[sheetName] = repairedSheet;
if (!workbook.SheetNames.includes("Manual Review")) workbook.SheetNames.push("Manual Review");
workbook.Sheets["Manual Review"] = reviewSheet;

fs.mkdirSync(outputDir, { recursive: true });
XLSX.writeFile(workbook, outputPath, { compression: true, cellStyles: true });

const sourceHashAfter = crypto
  .createHash("sha256")
  .update(fs.readFileSync(sourcePath))
  .digest("hex");
if (sourceHashAfter !== sourceHash) {
  throw new Error("Original workbook changed during repair.");
}

const verificationWorkbook = XLSX.readFile(outputPath);
const verificationRows = XLSX.utils.sheet_to_json(
  verificationWorkbook.Sheets[sheetName],
  { defval: "" }
);
const residualPrivateUse = verificationRows.reduce((count, row) => {
  return count + Object.values(row).filter((value) => puaRegex.test(String(value))).length;
}, 0);
const residualReplacement = verificationRows.reduce((count, row) => {
  return count + Object.values(row).filter((value) => replacementRegex.test(String(value))).length;
}, 0);

console.log(JSON.stringify({
  sourcePath,
  outputPath,
  sourceHash,
  sourceHashAfter,
  sourceRows: rows.length,
  outputRows: verificationRows.length,
  repairedRowCount,
  manualReviewCount,
  unrecoverableRowCount,
  manualReviewSheetRows: reviewRows.length,
  residualPrivateUse,
  residualReplacement,
  outputSheets: verificationWorkbook.SheetNames,
}, null, 2));

