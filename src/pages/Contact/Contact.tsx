import React from 'react';
import { Mail } from 'lucide-react';
import { contactData } from '../../data/contact';
import { ContactForm } from './components/ContactForm';
import { SocialLink } from './components/SocialLink';
import { PlatformLink } from './components/PlatformLink';
import { SectionTitle } from './components/SectionTitle';

export const Contact: React.FC = () => {
  return (
    <div className="pb-12 max-w-lg mx-auto w-full">
      <header className="mb-12 md:mb-14">
        <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">Contact</h2>
        <p className="text-[10px] md:text-xs font-mono text-text-secondary uppercase tracking-widest leading-relaxed">
          Every song has a story.<br />Every story has a side.
        </p>
      </header>

      <div className="space-y-12 md:space-y-16">
        <section>
          <ContactForm />
        </section>

        <section>
          <SectionTitle>Email</SectionTitle>
          <a 
            href={`mailto:${contactData.email}`}
            className="group flex items-center gap-6 py-2.5 transition-colors w-full"
          >
            <Mail className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" strokeWidth={1.5} />
            <span className="font-mono text-sm tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
              {contactData.email}
            </span>
          </a>
        </section>

        <section>
          <SectionTitle>Socials</SectionTitle>
          <div className="flex flex-col gap-2">
            {contactData.socials.map(social => (
              <SocialLink key={social.id} item={social} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Listen</SectionTitle>
          <div className="flex flex-col">
            {contactData.platforms.map(platform => (
              <PlatformLink key={platform.id} item={platform} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
