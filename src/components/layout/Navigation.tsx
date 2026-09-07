import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Disc, BookOpen, Mail } from 'lucide-react';
import { SSLogo } from '../icons/SSLogo';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/discography', label: 'Discography', icon: Disc },
  { path: '/the-side', label: 'The Side', icon: BookOpen },
  { path: '/contact', label: 'Contact', icon: Mail },
  { path: '/about', label: 'About', icon: SSLogo },
];

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border pb-safe">
      <ul className="flex items-center justify-around h-12 w-full max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`
                }
                title={item.label}
              >
                {({ isActive }) => (
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
