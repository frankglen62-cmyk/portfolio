import { useEffect, useRef, useState } from 'react';

export function useHeroIntro(): boolean {
  const [isHeroIntro, setIsHeroIntro] = useState(true);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      const aboutSection = document.getElementById('about');
      const aboutTop = aboutSection
        ? aboutSection.getBoundingClientRect().top + window.scrollY
        : window.innerHeight;

      setIsHeroIntro(window.scrollY < aboutTop - window.innerHeight * 0.2);
      frameRef.current = null;
    };

    const scheduleSync = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(sync);
      }
    };

    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync, { passive: true });
    sync();

    return () => {
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return isHeroIntro;
}
