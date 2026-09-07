const fs = require('fs');
let code = fs.readFileSync('src/pages/Home/components/ThoughtFragments.tsx', 'utf-8');

code = code.replace(
  "{item.date}",
  "{item.release_date || item.created_at?.split('T')[0] || (item as any).date}"
);

fs.writeFileSync('src/pages/Home/components/ThoughtFragments.tsx', code);
console.log('Date updated');
