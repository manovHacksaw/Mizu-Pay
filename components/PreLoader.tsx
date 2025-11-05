'use client';

import { useEffect, useState } from 'react';
import { SplitText } from './SplitText';

export function PreLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [showText, setShowText] = useState(false);
  const [fadeText, setFadeText] = useState(false);
  const [fadeLoader, setFadeLoader] = useState(false);

  useEffect(() => {
    // Blank screen for 0.2 seconds
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 200);

    // After text animation completes (1.5s), start fading the text
    const fadeTextTimer = setTimeout(() => {
      setFadeText(true);
    }, 1700); // 0.2s blank + 1.5s text animation

    // After text fades out (0.8s), fade out the loader background
    const fadeLoaderTimer = setTimeout(() => {
      setFadeLoader(true);
    }, 2500); // 0.2s blank + 1.5s text + 0.8s text fade

    // Remove from DOM after loader fade out (0.8s)
    const removeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3300); // 0.2s blank + 1.5s text + 0.8s text fade + 0.8s loader fade = 3.3s total

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTextTimer);
      clearTimeout(fadeLoaderTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`pre-loader fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-[800ms] ease-in-out ${
        fadeLoader ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {showText && (
        <div
          className={`pre-loader-text text-white text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight transition-opacity duration-[800ms] ease-in-out ${
            fadeText ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <SplitText delay={0} stagger={0.065}>
            MIZU PAY
          </SplitText>
        </div>
      )}
    </div>
  );
}