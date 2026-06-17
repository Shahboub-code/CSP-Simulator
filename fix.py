import sys
from pathlib import Path

file_path = Path(r'C:\Users\pc3\Desktop\Bank\2.txt.processed')
content = file_path.read_text(encoding='utf-8')

# 1. Add header
if not content.startswith('Question,'):
    content = 'Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation,Domain\n' + content

# 2. Fix Line 54
content = content.replace('(V=10")', '(V=10 inches)')
content = content.replace('Assume 10" is', 'Assume 10 inches is')

# 3. Fix Line 77
content = content.replace('"Not exceeded, sum = 0.9"', "'Not exceeded, sum = 0.9'")

# 4. Fix Line 181
content = content.replace('"Yes, if LEL<10%? Wait 10% LEL is normally acceptable for entry (below 10%). Actually OSHA uses 10% LEL as a limit for hot work, but for confined space, any detectable flammable gas must be below 10% LEL for entry without continuous ventilation. I\'ll adjust question.",Confined Space', '"Yes, if LEL<10%","No, continuous ventilation is required",D,"Any detectable flammable gas must be below 10% LEL for entry.",Confined Space')

# 5. Fix Line 290
content = content.replace('"A safety professional is calculating the ventilation flow rate for a dilution ventilation system. The solvent evaporation rate is 0.5 cfm vapor, and the desired concentration is 50 ppm (TLV). Assume K factor 5 and safety factor. Q = (403 × 10^6 × SG × ER) / (MW × C). Not necessary for test. I\'ll replace with simpler.",Industrial Hygiene', '"What is the formula for calculating ventilation flow rate for a dilution ventilation system?","Q = (403 x 10^6 x SG x ER) / (MW x C)","Q = (SG x ER) / (MW x C)","Q = (403 x MW) / (SG x C)","Q = 1",A,"Q = (403 x 10^6 x SG x ER) / (MW x C)",Industrial Hygiene')

file_path.write_text(content, encoding='utf-8')
print('Fixed 2.txt')
