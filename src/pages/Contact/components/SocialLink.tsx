import React from 'react';
interface SocialLinkProps {
  item: {
    name: string;
    url: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  };
}

export const SocialLink: React.FC<SocialLinkProps> = ({ item }) => {
  const Icon = item.icon;
  return (
    <a 
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-6 py-2.5 transition-colors w-full"
    >
      <Icon className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" strokeWidth={1.5} />
      <span className="font-mono text-sm tracking-widest uppercase text-text-secondary group-hover:text-text-primary transition-colors">
        {item.name}
      </span>
    </a>
  );
};
