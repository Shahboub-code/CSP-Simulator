import pandas as pd
from pathlib import Path

# Load original Exams.xlsx
exams_path = Path('G:/CSP App/public/Exams.xlsx')
df_exams = pd.read_excel(exams_path)

# Load CSVs
df1 = pd.read_csv('G:/CSP App/Bank/1.txt')
df2 = pd.read_csv('G:/CSP App/Bank/2.txt')

# Combine the three dataframes
df_combined = pd.concat([df_exams, df1, df2], ignore_index=True)

# Save back to Exams.xlsx
df_combined.to_excel(exams_path, index=False)

print(f"Merged successfully. New total rows: {len(df_combined)}")
