import pandas as pd
from pathlib import Path
import re

exams_path = Path('public/Exams.xlsx')
df = pd.read_excel(exams_path)

print(f"Original question count: {len(df)}")

# Create a normalized version of the question text to detect duplicates better
# - lower case
# - strip non-alphanumeric chars for comparison
# - we'll keep the first 100 chars of normalized text to check
def normalize_text(text):
    if pd.isna(text):
        return ""
    # Remove punctuation, newlines and extra spaces
    normalized = re.sub(r'\W+', ' ', str(text)).strip().lower()
    return normalized[:150]

df['Normalized'] = df['Question'].apply(normalize_text)

# We want to keep the one that has an Explanation if there's a duplicate.
# So we sort by 'Explanation' (so rows WITH explanation come first, NaN come last)
# Actually, sorting by Explanation ascending puts strings before NaN?
# No, we can just create a boolean column 'HasExp'
df['HasExp'] = df['Explanation'].notna() & (df['Explanation'].str.strip() != '')

# Sort by HasExp descending (True first)
df = df.sort_values(by='HasExp', ascending=False)

# Drop duplicates based on 'Normalized'
df_dedup = df.drop_duplicates(subset=['Normalized'], keep='first')

print(f"Deduplicated question count: {len(df_dedup)}")

# Drop the temporary columns
df_dedup = df_dedup.drop(columns=['Normalized', 'HasExp'])

# Write back
df_dedup.to_excel(exams_path, index=False)
print("Saved deduplicated Exams.xlsx")
