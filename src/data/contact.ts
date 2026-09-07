import { 
  IconInstagram, 
  IconTiktok, 
  IconThreads, 
  IconSpotify, 
  IconYoutube, 
  IconSoundcloud, 
  IconAppleMusic 
} from '../components/icons/BrandIcons';

export const contactData = {
  email: 'sorside.raw@gmail.com',
  socials: [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/@sor.side', icon: IconInstagram },
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@sor.side', icon: IconTiktok },
    { id: 'threads', name: 'Threads', url: 'https://www.threads.com/@sor.side', icon: IconThreads }
  ],
  platforms: [
    { id: 'youtube', name: 'YouTube', url: '#', icon: IconYoutube },
    { id: 'spotify', name: 'Spotify', url: '#', icon: IconSpotify },
    { id: 'apple-music', name: 'Apple Music', url: '#', icon: IconAppleMusic },
    { id: 'soundcloud', name: 'SoundCloud', url: '#', icon: IconSoundcloud }
  ]
};
