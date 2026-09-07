import React from 'react';
import { Camera } from 'lucide-react';
import { RevealImage } from '../../../components/common/RevealImage';

export const AtmosphereArtifacts: React.FC = () => {
  const artifacts = [
    {
      id: 'art-1',
      title: '03:14 AM / SUDUT KAMAR',
      caption: 'Tempat semua rekaman dan tulisan ini pertama kali diketik.',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
      coordinate: 'SESSION: BEDROOM ONE-TAKE',
    },
    {
      id: 'art-2',
      title: 'FREKUENSI KEPALA',
      caption: 'Kabel, pedal seadanya, dan suara-suara yang menolak diam.',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      coordinate: 'MONO // ANALOG TEXTURE',
    },
  ];

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-text-primary inline-block" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
            04 // ARTIFAK VISUAL
          </h2>
        </div>
        <span className="font-mono text-[10px] text-text-secondary uppercase">
          RAW ARCHIVE
        </span>
      </div>

      {/* Grid of Polaroid / Brutalist Mood Frames */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {artifacts.map((art) => (
          <div
            key={art.id}
            className="border border-border bg-surface p-3 group hover:border-text-primary transition-colors flex flex-col justify-between"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-background mb-3 border border-border/50">
              <RevealImage
                src={art.imageUrl}
                alt={art.title}
                className="w-full h-full"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-accent">
                <span>{art.coordinate}</span>
                <Camera className="w-2.5 h-2.5" />
              </div>
              <h3 className="font-display text-sm tracking-wide uppercase text-text-primary">
                {art.title}
              </h3>
              <p className="text-[11px] font-mono text-text-secondary leading-relaxed">
                {art.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
