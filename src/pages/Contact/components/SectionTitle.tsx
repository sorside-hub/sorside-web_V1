import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <h3 className="text-xs font-mono tracking-widest uppercase text-text-secondary mb-8 border-b border-border pb-2 inline-block">
      {children}
    </h3>
  );
};
