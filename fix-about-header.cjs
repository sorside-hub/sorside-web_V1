const fs = require('fs');
let code = fs.readFileSync('src/pages/About/About.tsx', 'utf-8');

// Replace the SqlSetup at the bottom
code = code.replace('<AboutSqlSetup />\n    </div>', '</div>');

// Inject the SqlSetup in the header with a Settings icon
code = code.replace("import { AboutSqlSetup } from './components/AboutSqlSetup';", "import { AboutSqlSetup } from './components/AboutSqlSetup';\nimport { Settings } from 'lucide-react';");
code = code.replace(
  '<div className="flex items-center gap-3">\n          <span className="w-8 h-[1px] bg-accent" />\n          <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">\n            // System.Glossary\n          </p>\n        </div>',
  `<div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-accent" />
            <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">
              // System.Glossary
            </p>
          </div>
          <AboutSqlSetup />
        </div>`
);

fs.writeFileSync('src/pages/About/About.tsx', code);
console.log('Header updated');
