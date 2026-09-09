import React from 'react';

const gradients = [
  ['#FF0080', '#7928CA'], // Pink to Purple
  ['#4FACFE', '#00F2FE'], // Blue
  ['#43E97B', '#38F9D7'], // Green
  ['#FA709A', '#FEE140'], // Pink to Yellow
  ['#30CFD0', '#330867'], // Cyan to Deep Purple
  ['#F6D365', '#FDA085'], // Orange/Yellow
  ['#5EE7DF', '#B490CA'], // Mint to Lavender
  ['#FF416C', '#FF4B2B'], // Red/Orange
  ['#F761A1', '#8C1BAB'], // Magenta/Plum
  ['#42E695', '#3BB2B8'], // Emerald/Teal
];

export const AvatarGenerator = ({ seed }: { seed: string }) => {
  // Simple hash function to generate a consistent number from the seed (ID)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // Pick colors and pattern based on the hash
  const gradientIdx = hash % gradients.length;
  const [color1, color2] = gradients[gradientIdx];
  const patternIdx = hash % 6; // 6 unique patterns

  const renderPattern = () => {
    switch (patternIdx) {
      case 0: // Circle
        return <circle cx="20" cy="20" r="9" fill="white" fillOpacity="0.3" />;
      case 1: // Triangle
        return <polygon points="20,11 29,26 11,26" fill="white" fillOpacity="0.3" />;
      case 2: // Diamond
        return <polygon points="20,9 31,20 20,31 9,20" fill="white" fillOpacity="0.3" />;
      case 3: // Two dots
        return (
          <>
            <circle cx="13" cy="20" r="4.5" fill="white" fillOpacity="0.3" />
            <circle cx="27" cy="20" r="4.5" fill="white" fillOpacity="0.3" />
          </>
        );
      case 4: // Rotated Square
        return <rect x="13.5" y="13.5" width="13" height="13" rx="3" fill="white" fillOpacity="0.3" transform="rotate(45 20 20)" />;
      case 5: // Smile/Arc
        return <path d="M 12 18 A 8 8 0 0 0 28 18" stroke="white" strokeWidth="4" strokeOpacity="0.3" strokeLinecap="round" fill="none" />;
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" fill={`url(#grad-${hash})`} />
      {renderPattern()}
    </svg>
  );
};
