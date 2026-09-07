import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCachedArticles, subscribeToArticles, revalidateArticles } from '../../../lib/articlesStore';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

export const ThoughtFragments: React.FC = () => {
  const [articles, setArticles] = useState(getCachedArticles());

  useEffect(() => {
    revalidateArticles().then(setArticles);
    const unsubscribe = subscribeToArticles(setArticles);
    return () => unsubscribe();
  }, []);

  const displayItems = articles.length > 0 ? articles.slice(0, 3) : [
    {
      id: 'tf-1',
      title: 'Tentang Kamar, Jam 3 Pagi, dan Kebisingan Pikiran',
      slug: 'tentang-kamar-jam-3-pagi',
      category: 'Thoughts',
      date: '2024-08-20',
      snippet: 'Di luar sunyi, tapi di kepala seperti ada ratusan frekuensi yang saling bertabrakan. SORSIDE lahir bukan dari studio mewah, tapi dari sudut kamar yang sempit saat malam menolak tidur.',
    },
    {
      id: 'tf-2',
      title: 'Menolak Menjadi Palsu: Kenapa Ruang Ini Ada',
      slug: 'menolak-menjadi-palsu',
      category: 'Origins',
      date: '2024-07-14',
      snippet: 'Media sosial menuntut kita tampak selesai dan rapi. Di sini aku cuma ingin menaruh apa adanya—kegagalan, kebingungan, dan suara-suara mentah yang tidak perlu dipoles untuk menyenangkan orang lain.',
    }
  ];

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-text-primary inline-block" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
            02 // The Side Update
          </h2>
        </div>
        <Link
          to="/the-side"
          className="font-mono text-[11px] text-text-secondary hover:text-accent flex items-center gap-1 transition-colors uppercase"
        >
          <span>LIHAT SEMUA TULISAN</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Thought Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {displayItems.map((item) => (
          <Link
            key={item.id}
            to={`/the-side/${item.slug}`}
            className="group block border border-border bg-surface hover:border-text-primary transition-all p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider text-text-secondary mb-2.5">
              <span className="text-accent font-semibold border border-accent/40 px-2 py-0.5">
                {item.category || 'THOUGHTS'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.release_date || item.created_at?.split('T')[0] || (item as any).date}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-display uppercase tracking-wide text-text-primary group-hover:text-accent transition-colors mb-2">
              {item.title}
            </h3>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans line-clamp-3">
              {item.snippet}
            </p>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors">
              <span>BACA CATATAN INI</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
