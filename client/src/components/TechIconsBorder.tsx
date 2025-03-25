import React, { useEffect, useState } from 'react';
import { 
  SiJavascript, 
  SiHtml5, 
  SiCss3, 
  SiNodedotjs, 
  SiReact, 
  SiTypescript, 
  SiTailwindcss, 
  SiExpress, 
  SiNpm
} from 'react-icons/si';

interface TechIconProps {
  id: number;
  Icon: React.ComponentType<any>;
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  delay: number;
  duration: number;
  isRed?: boolean;
}

const iconComponents = [
  SiJavascript, 
  SiHtml5, 
  SiCss3, 
  SiNodedotjs, 
  SiReact, 
  SiTypescript, 
  SiTailwindcss, 
  SiExpress, 
  SiNpm
];

interface TechIconsBorderProps {
  children: React.ReactNode;
}

export default function TechIconsBorder({ children }: TechIconsBorderProps) {
  const [icons, setIcons] = useState<TechIconProps[]>([]);

  useEffect(() => {
    // Generate icons for the border
    const topIcons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      Icon: iconComponents[i % iconComponents.length],
      position: { top: '-15px', left: `${i * 13}%` },
      delay: i * 0.2,
      duration: 3 + (i % 3),
      isRed: i % 3 === 0 // Every third icon will be red
    }));
    
    const rightIcons = Array.from({ length: 6 }, (_, i) => ({
      id: i + 8,
      Icon: iconComponents[(i + 3) % iconComponents.length],
      position: { top: `${i * 18}%`, right: '-15px' },
      delay: i * 0.3,
      duration: 4 + (i % 2),
      isRed: i % 3 === 1 // Different pattern for red icons
    }));
    
    const bottomIcons = Array.from({ length: 8 }, (_, i) => ({
      id: i + 14,
      Icon: iconComponents[(i + 6) % iconComponents.length],
      position: { bottom: '-15px', right: `${i * 13}%` },
      delay: i * 0.25,
      duration: 3.5 + (i % 3),
      isRed: i % 3 === 2 // Different pattern for red icons
    }));
    
    const leftIcons = Array.from({ length: 6 }, (_, i) => ({
      id: i + 22,
      Icon: iconComponents[(i + 4) % iconComponents.length],
      position: { bottom: `${i * 18}%`, left: '-15px' },
      delay: i * 0.35,
      duration: 4.5 + (i % 2),
      isRed: i % 3 === 0 // Every third icon will be red
    }));
    
    setIcons([...topIcons, ...rightIcons, ...bottomIcons, ...leftIcons]);
  }, []);

  return (
    <div className="tech-border">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className={`tech-icon ${icon.isRed ? 'tech-icon-red' : ''}`}
          style={{
            ...icon.position,
            animationDelay: `${icon.delay}s`,
            animationDuration: `${icon.duration}s`
          }}
        >
          <icon.Icon size={42} />
        </div>
      ))}
      <div className="tech-border-content">
        {children}
      </div>
    </div>
  );
}