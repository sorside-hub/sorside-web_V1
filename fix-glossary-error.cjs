const fs = require('fs');

const storePath = 'src/lib/glossaryStore.ts';
let code = fs.readFileSync(storePath, 'utf-8');

// Modify the revalidateGlossary function to silently fail and just return the empty array if the table doesn't exist yet
code = code.replace(
  /console\.error\('Error fetching glossary:', error\);/g,
  `// Silently fail if table doesn't exist yet (PGRST205)
      if (error.code !== 'PGRST205') {
        console.error('Error fetching glossary:', error);
      }`
);

fs.writeFileSync(storePath, code);
console.log('Store updated');
