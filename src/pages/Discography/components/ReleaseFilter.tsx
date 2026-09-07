import React from 'react';
import { ReleaseType } from '../../../types/discography';

interface ReleaseFilterProps {
  selectedType: ReleaseType | null;
  onSelectType: (type: ReleaseType | null) => void;
}

export const ReleaseFilter: React.FC<ReleaseFilterProps> = ({
  selectedType,
  onSelectType
}) => {
  const filterOptions: { label: string; value: ReleaseType | null }[] = [
    { label: 'All', value: null },
    { label: 'Singles', value: 'Single' },
    { label: 'EP', value: 'EP' },
    { label: 'Albums', value: 'Album' }
  ];

  return (
    <div className="flex justify-center md:justify-start items-center gap-5 sm:gap-6 md:gap-8 border-b border-border pb-4 mb-8">
      {filterOptions.map((opt) => {
        const isActive = selectedType === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onSelectType(opt.value)}
            className={`font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-colors py-1 ${
              isActive
                ? 'text-text-primary border-b border-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
