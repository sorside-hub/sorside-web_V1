import React from 'react';
import { FeedItem } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';

interface FeedCardProps {
  item: FeedItem;
}

export const FeedCard: React.FC<FeedCardProps> = ({ item }) => {
  return (
    <article className="group cursor-pointer border border-border bg-surface hover:bg-surface-hover transition-colors rounded-none p-5 flex flex-col">
      {item.imageUrl && (
        <div className="mb-5 aspect-video w-full overflow-hidden bg-background">
          <ImageWithFallback 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
          />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3 text-xs font-mono tracking-widest uppercase">
        <span className="text-text-secondary">{item.date}</span>
        <span className="text-accent border border-accent px-2 py-0.5">{item.category}</span>
      </div>
      
      <h3 className="text-xl font-display tracking-wide uppercase mb-2 group-hover:text-accent transition-colors">
        {item.title}
      </h3>
      
      <p className="text-sm text-text-secondary leading-relaxed">
        {item.shortDescription}
      </p>
    </article>
  );
};
