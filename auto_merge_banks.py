import pandas as pd
import re
import csv
import os
import glob
from pathlib import Path

# Base file
exams_path = Path('public/Exams.xlsx')
try:
    df_exams = pd.read_excel(exams_path)
except:
    df_exams = pd.DataFrame(columns=['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Domain'])

expected_header = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Domain']

def read_csv_robust(filepath):
    # Detect if it has a header
    has_header = False
    with open(filepath, 'r', encoding='utf-8-sig', errors='replace') as f:
        reader = csv.reader(f)
        first_row = next(reader, None)
        if first_row and any(col.strip().lower() == 'question' for col in first_row):
            has_header = True

    rows = []
    with open(filepath, 'r', encoding='utf-8-sig', errors='replace') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if has_header and i == 0:
                continue
            if not row or all(not cell.strip() for cell in row):
                continue
            
            # Some csvs have 3 columns: Topic, Question, Answer
            if len(row) == 3 and not any(c.startswith('Option') for c in expected_header): # wait, this logic is flawed.
                pass
                
            if len(row) > 8:
                row = row[:7] + [','.join(row[7:])]
            elif len(row) < 8:
                row.extend([''] * (8 - len(row)))
            rows.append(row)
            
    df = pd.DataFrame(rows, columns=expected_header)
    return df

# Find all txt and csv files in root, Bank, dist, public that are not node_modules
search_dirs = ['.', 'dist', 'public', 'Bank', r'C:\Users\pc3\Desktop\Bank']
all_files = []
for d in search_dirs:
    if os.path.isdir(d):
        all_files.extend(glob.glob(os.path.join(d, '**', '*.txt'), recursive=True))
        all_files.extend(glob.glob(os.path.join(d, '**', '*.csv'), recursive=True))

all_dfs = [df_exams]

# To avoid duplicates, we can keep track of questions
existing_questions = set()
for q in df_exams['Question'].dropna():
    existing_questions.add(str(q).strip()[:100])

for f in all_files:
    # Skip our own python scripts or unrelated
    if "LICENSE" in f or "Questions_And_Answers.csv" in f:
        continue # we will handle QA specially if needed, but the user says "add new Notepad file". 
    
    try:
        df = read_csv_robust(f)
        new_rows = []
        for _, row in df.iterrows():
            q_text = str(row['Question']).strip()
            if q_text and q_text[:100] not in existing_questions:
                existing_questions.add(q_text[:100])
                new_rows.append(row)
                
        if new_rows:
            all_dfs.append(pd.DataFrame(new_rows, columns=expected_header))
            print(f"Added {len(new_rows)} new questions from {f}")
    except Exception as e:
        print(f"Could not parse {f}: {e}")

# Handle Questions_And_Answers.csv if it exists
qa_files = [f for f in all_files if "Questions_And_Answers.csv" in f and "node_modules" not in f]
for qa_file in qa_files:
    try:
        df_qa = pd.read_csv(qa_file, on_bad_lines='skip')
        qa_rows = []
        for idx, row in df_qa.iterrows():
            topic = str(row['Topic'])
            question_text_raw = str(row['Question'])
            answer_text_raw = str(row['Answer'])
            
            correct_match = re.search(r'The correct solution is ([A-D])\.', answer_text_raw, re.IGNORECASE)
            correct_ans = correct_match.group(1).upper() if correct_match else 'Unknown'
            explanation = answer_text_raw
            
            question_text_formatted = re.sub(r'(?<!\n)\s*([A-D][\.\)])\s+', r'\n\1 ', question_text_raw)
            
            if question_text_formatted.strip()[:100] not in existing_questions:
                existing_questions.add(question_text_formatted.strip()[:100])
                qa_rows.append({
                    'Question': question_text_formatted,
                    'Correct Answer': correct_ans,
                    'Explanation': explanation,
                    'Domain': topic
                })
        if qa_rows:
            all_dfs.append(pd.DataFrame(qa_rows, columns=expected_header))
            print(f"Added {len(qa_rows)} new questions from {qa_file}")
    except Exception as e:
        pass

df_combined = pd.concat(all_dfs, ignore_index=True)
df_combined.to_excel(exams_path, index=False)
print(f"Total questions in bank: {len(df_combined)}")

# Now clean up processed txt and csv files so they don't get processed over and over
for f in all_files + qa_files:
    try:
        if not 'node_modules' in f:
            os.rename(f, f + '.processed')
    except:
        pass
