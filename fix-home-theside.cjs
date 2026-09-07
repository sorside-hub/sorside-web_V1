const fs = require('fs');

const path = 'src/pages/Home/components/ThoughtFragments.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Replace header
code = code.replace(
  '02 // FRAGMEN DARI "THE SIDE"',
  '02 // The Side Update'
);

// Add imports
code = code.replace(
  "import React from 'react';",
  "import React, { useState, useEffect } from 'react';"
);
code = code.replace(
  "import { getCachedArticles } from '../../../lib/articlesStore';",
  "import { getCachedArticles, subscribeToArticles, revalidateArticles } from '../../../lib/articlesStore';"
);

// Implement hooks
const hookInjection = `const [articles, setArticles] = useState(getCachedArticles());

  useEffect(() => {
    revalidateArticles().then(setArticles);
    const unsubscribe = subscribeToArticles(setArticles);
    return () => unsubscribe();
  }, []);

  const displayItems = articles.length > 0 ? articles.slice(0, 3) : [`;

code = code.replace(
  `const articles = getCachedArticles();

  // Fallback thought fragments if no articles cached yet
  const displayItems = articles.length > 0 ? articles.slice(0, 3) : [`,
  hookInjection
);

fs.writeFileSync(path, code);
console.log("ThoughtFragments updated");
