import React, { useMemo } from 'react';
import { ReleaseCredits as ReleaseCreditsType, CreditItem } from '../../../types/discography';

interface ReleaseCreditsProps {
  credits?: string | ReleaseCreditsType;
  catalogNumber?: string;
}

interface ParsedCreditItem {
  role: string;
  name: string;
}

interface ParsedCreditsResult {
  items: ParsedCreditItem[];
  notes?: string;
  rawText?: string;
}

function parseCredits(credits: any): ParsedCreditsResult | null {
  if (!credits) return null;

  let target = credits;

  // If it's a JSON string, try to parse it
  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        target = JSON.parse(trimmed);
      } catch {
        // Fall through to treat as raw text
      }
    }
  }

  // If still plain string, return as rawText
  if (typeof target === 'string') {
    const trimmed = target.trim();
    return trimmed ? { items: [], rawText: trimmed } : null;
  }

  // If Array of credits e.g. [{"name": "SORSIDE", "role": "Lyrics"}, ...]
  if (Array.isArray(target)) {
    const items: ParsedCreditItem[] = [];
    let notes: string | undefined = undefined;

    for (const entry of target) {
      if (!entry) continue;
      if (typeof entry === 'string') {
        items.push({ role: 'Credit', name: entry });
      } else if (typeof entry === 'object') {
        const itemObj = entry as CreditItem & Record<string, any>;
        const role = itemObj.role || itemObj.label || itemObj.key || itemObj.title || '';
        const name = itemObj.name || itemObj.value || itemObj.val || itemObj.artist || '';

        const cleanRole = String(role).trim().toLowerCase();
        
        // If entry explicitly has a "notes" or "note" property
        if (itemObj.notes || itemObj.note) {
          notes = String(itemObj.notes || itemObj.note);
        } else if (
          cleanRole === 'notes' ||
          cleanRole === 'note' ||
          cleanRole === 'liner notes' ||
          cleanRole === 'liner_notes' ||
          cleanRole === 'linernotes' ||
          cleanRole === 'catatan'
        ) {
          notes = String(name || role);
        } else if (name || role) {
          items.push({ role: String(role || 'Credit'), name: String(name || role) });
        }
      }
    }
    if (items.length > 0 || notes) {
      return { items, notes };
    }
    return null;
  }

  // If Object (e.g. { "Lyrics": "SORSIDE" } or legacy { performance: "...", ... })
  if (typeof target === 'object' && target !== null) {
    const items: ParsedCreditItem[] = [];
    let notes: string | undefined = undefined;

    const legacyRoleMap: Record<string, string> = {
      performance: 'Performance & Writing',
      production: 'Production',
      engineering: 'Audio Engineering',
      mastering: 'Mastering',
      artwork: 'Artwork & Identity',
    };

    for (const [key, value] of Object.entries(target)) {
      if (!value) continue;
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'notes' || lowerKey === 'note') {
        notes = String(value);
      } else {
        const displayRole = legacyRoleMap[key] || key;
        items.push({ role: displayRole, name: String(value) });
      }
    }

    if (items.length > 0 || notes) {
      return { items, notes };
    }
  }

  return null;
}

export const ReleaseCredits: React.FC<ReleaseCreditsProps> = ({ credits, catalogNumber }) => {
  const parsed = useMemo(() => parseCredits(credits), [credits]);

  if (!parsed) {
    return null;
  }

  const { items, notes, rawText } = parsed;

  if (items.length === 0 && !notes && !rawText) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent" />
          <span>Credits & Liner Notes</span>
        </h3>
        {catalogNumber && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary border border-border px-2 py-0.5">
            {catalogNumber}
          </span>
        )}
      </div>

      {/* Cassette Sleeve / Liner Notes Container */}
      {rawText ? (
        <div className="bg-surface/30 border border-border p-4 sm:p-5 font-mono text-xs text-text-secondary leading-relaxed whitespace-pre-line">
          {rawText}
        </div>
      ) : (
        <div className="bg-surface/30 border border-border p-4 sm:p-5 space-y-4 font-mono text-xs">
          {/* Key-Value Liner Notes Grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-baseline justify-between py-1.5 border-b border-border/40 gap-1 sm:gap-4 group hover:border-border transition-colors"
                >
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-text-secondary/70 shrink-0 font-medium">
                    {item.role}
                  </span>
                  <span className="text-xs text-text-primary font-semibold text-left sm:text-right break-words">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Personal Liner Note / Band Quote */}
          {notes && (
            <div className="pt-4 mt-2 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-none"></span>
                <span className="text-[10px] uppercase tracking-widest text-text-secondary/70 font-mono font-medium">
                  [ Liner Notes ]
                </span>
              </div>
              <blockquote className="border-l-2 border-accent/60 pl-3.5 py-1 bg-surface/30">
                <p className="text-xs sm:text-sm text-text-primary italic font-mono leading-relaxed">
                  &ldquo;{notes}&rdquo;
                </p>
              </blockquote>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

