const fs = require('fs');
let code = fs.readFileSync('src/pages/Home/components/ThoughtFragments.tsx', 'utf-8');

// Change excerpt to snippet in fallback items
code = code.replace(/excerpt:/g, 'snippet:');
// Change item.excerpt to item.snippet in mapping
code = code.replace(/\{item\.excerpt \|\| \(item as any\)\.content\?\.slice\(0, 160\) \+ '\.\.\.'\}/g, '{item.snippet}');

fs.writeFileSync('src/pages/Home/components/ThoughtFragments.tsx', code);
console.log('Snippet updated');
