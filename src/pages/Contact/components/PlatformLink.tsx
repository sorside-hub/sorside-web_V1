import React from 'react';
interface PlatformLinkProps {
  item: {
    name: string;
    url: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  };
}

export const PlatformLink: React.FC<PlatformLinkProps> = ({ item }) => {
  const Icon = item.icon;
  return (
    <a 
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between py-2.5 transition-colors w-full"
    >
      <div className="flex items-center gap-6">
        <Icon className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" strokeWidth={1.5} />
        <span className="font-mono text-sm tracking-widest uppercase text-text-secondary group-hover:text-text-primary transition-colors">
          {item.name}
        </span>
      </div>
      <span className="text-[10px] text-text-secondary font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        LISTEN
      </span>
    </a>
  );
};
