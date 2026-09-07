const fs = require('fs');

// 1. Update Types
let typesCode = fs.readFileSync('src/types/glossary.ts', 'utf-8');
typesCode = typesCode.replace('is_active: boolean;', 'published: boolean;');
fs.writeFileSync('src/types/glossary.ts', typesCode);

// 2. Update Store
let storeCode = fs.readFileSync('src/lib/glossaryStore.ts', 'utf-8');
storeCode = storeCode.replace(".eq('is_active', true)", ".eq('published', true)");
fs.writeFileSync('src/lib/glossaryStore.ts', storeCode);

// 3. Update SQL Setup Component (Move to header approach later, first fix the code)
let sqlCode = fs.readFileSync('src/pages/About/components/AboutSqlSetup.tsx', 'utf-8');
sqlCode = sqlCode.replace(/is_active/g, 'published');
fs.writeFileSync('src/pages/About/components/AboutSqlSetup.tsx', sqlCode);

console.log('Fields updated to published');
