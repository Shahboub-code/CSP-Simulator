import csv
from pathlib import Path

files = [Path(r'C:\Users\pc3\Desktop\Bank\1.txt.processed'), Path(r'C:\Users\pc3\Desktop\Bank\2.txt.processed')]
expected_header = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Domain']
errors = []

for file in files:
    try:
        with open(file, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            header = next(reader, None)
            if header != expected_header:
                errors.append(f'{file.name}: Invalid header. Expected {expected_header}, got {header}')
            
            for i, row in enumerate(reader, start=2):
                if len(row) != len(expected_header):
                    errors.append(f'{file.name} line {i}: Expected {len(expected_header)} columns, got {len(row)}')
                    continue
                if row[5] not in ['A', 'B', 'C', 'D']:
                    errors.append(f'{file.name} line {i}: Invalid correct answer {row[5]}')
    except Exception as e:
        errors.append(f'{file.name}: Error reading file: {e}')

if errors:
    print('Found errors:')
    for err in errors:
        print(err)
else:
    print('Both files validated successfully.')
