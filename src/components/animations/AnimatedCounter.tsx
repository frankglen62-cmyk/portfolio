import React from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  active: boolean;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  active,
  duration = 650,
  className,
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const hasAnimated = React.useRef(false);

  React.useEffect(() => {
    if (!active || hasAnimated.current) return;
    hasAnimated.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frameId = requestAnimationFrame(() => setDisplayValue(value));
      return () => cancelAnimationFrame(frameId);
    }

    let frameId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Fast ease-out: the number quickly reaches its final value.
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [active, duration, value]);

  return <strong className={className}>{displayValue}{suffix}</strong>;
};
