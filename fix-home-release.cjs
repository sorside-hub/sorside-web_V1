const fs = require('fs');

const path = 'src/pages/Home/components/LoneTransmissionCard.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Replace static text
code = code.replace("01 // REKAMAN TUNGGAL DARI KAMAR", "01 // Release Update");

// Add useEffect and useState to subscribe to real-time releases
code = code.replace(
  "import React, { useMemo } from 'react';", 
  "import React, { useState, useEffect } from 'react';"
);

code = code.replace(
  "import { getCachedReleases } from '../../../lib/discographyStore';",
  "import { getCachedReleases, subscribeToReleases, revalidateReleases } from '../../../lib/discographyStore';"
);

code = code.replace(
  "const releases = getCachedReleases();\n  const latestRelease = releases.length > 0 ? releases[0] : null;",
  `const [releases, setReleases] = useState(getCachedReleases());
  
  useEffect(() => {
    revalidateReleases().then(setReleases);
    const unsubscribe = subscribeToReleases(setReleases);
    return () => unsubscribe();
  }, []);

  const latestRelease = releases.length > 0 ? releases[0] : null;`
);

fs.writeFileSync(path, code);
console.log('Done fixing LoneTransmissionCard.tsx');
