const fs = require('fs');
let code = fs.readFileSync('src/pages/About/About.tsx', 'utf-8');

const regexToRemove = /\s*\{\/\* 2\. Hardware \/ Environment Specs \*\/\}\s*<div className="border border-border bg-surface p-5 sm:p-6 font-mono text-\[11px\] sm:text-xs text-text-secondary space-y-3 leading-relaxed">[\s\S]*?<\/div>/;

code = code.replace(regexToRemove, '');
fs.writeFileSync('src/pages/About/About.tsx', code);
console.log('Environment Specs removed.');
