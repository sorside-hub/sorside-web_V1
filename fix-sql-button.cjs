const fs = require('fs');
let code = fs.readFileSync('src/pages/About/components/AboutSqlSetup.tsx', 'utf-8');

// Change the button from fixed bottom-right to a simple icon button
code = code.replace(
  `<button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-surface border border-border p-3 text-text-secondary hover:text-accent hover:border-accent transition-colors shadow-lg flex items-center justify-center gap-2 group"
        title="Setup Glossary DB"
      >
        <Database size={18} />
        <span className="font-mono text-[10px] uppercase tracking-widest hidden group-hover:block">DB Setup</span>
      </button>`,
  `<button 
        onClick={() => setIsOpen(true)}
        className="text-text-secondary hover:text-accent transition-colors"
        title="DB Setup"
      >
        <Database size={16} />
      </button>`
);
// replace lucide import to remove Database and Check, but we actually just need to make sure we use Settings if asked, but let's stick to Database icon or Settings icon. User asked for "icon setting".
code = code.replace("import { Database, Check, Copy, X } from 'lucide-react';", "import { Settings, Check, Copy, X, Database } from 'lucide-react';");

code = code.replace(
  `<Database size={16} />`,
  `<Settings size={16} />`
);

fs.writeFileSync('src/pages/About/components/AboutSqlSetup.tsx', code);
console.log('Button updated');
