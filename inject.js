const fs = require('fs');

const importer = fs.readFileSync('C:/Users/rahul/.gemini/antigravity/brain/7616fdf4-a376-4f84-9b9a-1d5a1ded1c83/scratch/admin-importer.tsx', 'utf-8')
  .replace('import React, { useState } from "react";\n', '')
  .replace('import React, { useState } from "react";\r\n', '');

const targetPath = 'e:/Claude/venuees.in/app/list-your-business/apply-form.tsx';
const target = fs.readFileSync(targetPath, 'utf-8');

const newTarget = target.replace('// ── Main component', importer + '\n\n// ── Main component');

fs.writeFileSync(targetPath, newTarget);
