const fs = require('fs');
let code = fs.readFileSync('src/pages/About/About.tsx', 'utf-8');

// I'll just restore the end of the file properly
const correctEnd = `
      </div>
    </div>
  );
};
`;

const systemOutputIndex = code.indexOf('{/* SYSTEM OUTPUT / DATA PANEL */}');
const topPart = code.substring(0, systemOutputIndex);

const systemPanel = `{/* SYSTEM OUTPUT / DATA PANEL */}
      <div className="pt-16 sm:pt-24 space-y-8 relative z-10">
        
        {/* Pembatas Terminal */}
        <div className="flex items-center gap-4">
          <span className="h-[1px] flex-1 bg-border/60"></span>
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-pulse" />
            SYSTEM_DIAGNOSTICS // [EOF]
          </span>
          <span className="h-[1px] flex-1 bg-border/60"></span>
        </div>

        {/* 1. Panel Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">EST.</p>
            <p className="font-display text-2xl text-text-primary">2025</p>
          </div>
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">Audio_Archives</p>
            <p className="font-display text-2xl text-text-primary">{formattedTracks}</p>
          </div>
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">Text_Logs</p>
            <p className="font-display text-2xl text-text-primary">{formattedLogs}</p>
          </div>
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors flex flex-col justify-center">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">Status</p>
            <p className="font-mono text-xs text-accent uppercase tracking-widest animate-pulse">Evolving</p>
          </div>
        </div>

      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/pages/About/About.tsx', topPart + systemPanel);
console.log('Restored About.tsx structure');
