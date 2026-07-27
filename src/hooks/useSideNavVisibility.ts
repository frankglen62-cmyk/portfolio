import { useEffect, useState } from 'react';

export function useSideNavVisibility() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const syncVisibility = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const services = document.getElementById('services');
        if (!services) {
          setIsVisible(false);
          return;
        }

        setIsVisible(services.getBoundingClientRect().top <= window.innerHeight * 0.12);
      });
    };

    syncVisibility();
    window.addEventListener('scroll', syncVisibility, { passive: true });
    window.addEventListener('resize', syncVisibility, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', syncVisibility);
      window.removeEventListener('resize', syncVisibility);
    };
  }, []);

  return isVisible;
}
