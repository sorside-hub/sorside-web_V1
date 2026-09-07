const fs = require('fs');
let code = fs.readFileSync('src/pages/About/About.tsx', 'utf-8');

code = code.replace('{glossary.length > 0 && (\n          {/* Terminal/Log Footer */}\n          <div className="mt-16 sm:mt-24 text-center font-mono text-[10px] text-text-secondary uppercase tracking-widest">\n            <p>END OF GLOSSARY // [EOF]</p>\n          </div>\n        )}', '{glossary.length > 0 && (\n          <div className="mt-16 sm:mt-24 text-center font-mono text-[10px] text-text-secondary uppercase tracking-widest">\n            <p>END OF GLOSSARY // [EOF]</p>\n          </div>\n        )}');

fs.writeFileSync('src/pages/About/About.tsx', code);
