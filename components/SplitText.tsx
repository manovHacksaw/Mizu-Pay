'use client';

import { ReactNode } from 'react';

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function SplitText({ children, className = '', delay = 0, stagger = 0.05 }: SplitTextProps) {
  const characters = children.split('');

  return (
    <span className={`split-text ${className}`}>
      {characters.map((char, index) => (
        <span
          key={index}
          className="split-char"
          style={{
            animationDelay: `${delay + index * stagger}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

