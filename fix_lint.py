import os
import re

def fix_react_import(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove `import React from 'react';`
    content = re.sub(r"import React from 'react';\n?", "", content)
    # Change `import React, { ... } from 'react';` to `import { ... } from 'react';`
    content = re.sub(r"import React, \{\s*(.*?)\s*\} from 'react';", r"import { \1 } from 'react';", content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            fix_react_import(os.path.join(root, f))

print("Fixed React imports.")
