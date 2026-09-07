const fs = require('fs');

let code = fs.readFileSync('src/pages/About/components/AboutSqlSetup.tsx', 'utf-8');

// Import createPortal
code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { createPortal } from 'react-dom';");

// Wrap the modal with createPortal
const modalRegex = /{isOpen && \(\s*<div className="fixed inset-0([\s\S]*?)<\/div>\s*\)\s*}/;
const match = code.match(modalRegex);

if (match) {
  const modalContent = match[0];
  const newModalContent = modalContent.replace(
    "{isOpen && (",
    "{isOpen && createPortal("
  ).replace(
    /}\s*$/,
    ", document.body)}"
  );
  
  code = code.replace(modalContent, newModalContent);
  fs.writeFileSync('src/pages/About/components/AboutSqlSetup.tsx', code);
  console.log("Portal added successfully");
} else {
  console.log("Could not find modal content");
}
