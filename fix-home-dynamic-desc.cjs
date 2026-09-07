const fs = require('fs');

const path = 'src/pages/Home/components/LoneTransmissionCard.tsx';
let code = fs.readFileSync(path, 'utf-8');

// replace the static quote with the actual description/tagline if it exists
code = code.replace(
  `&ldquo;Lagu ini dibuat untuk menemani malam-malam panjang kalian.&rdquo;`,
  `{latestRelease?.tagline ? \`"\${latestRelease.tagline}"\` : latestRelease?.description ? \`"\${latestRelease.description.substring(0, 100)}..."\` : '"Lagu ini dibuat untuk menemani malam-malam panjang kalian."'}`
);

fs.writeFileSync(path, code);
console.log('Done fixing quote');
