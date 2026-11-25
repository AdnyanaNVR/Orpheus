import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  startFrom?: 'zero' | 'previous';
  resetKey?: string | number;
  formatter?: (val: number) => string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 650,
  decimals = 0,
  startFrom = 'zero',
  resetKey,
  formatter,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || duration <= 0) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const from = startFrom === 'zero' ? 0 : prevValueRef.current;
    const to = value;

    if (from === to) {
      setDisplayValue(to);
      prevValueRef.current = to;
      return;
    }

    let rafId = 0;
    const startTime = performance.now();
    const factor = Math.pow(10, decimals);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const raw = from + (to - from) * eased;
      const rounded =
        decimals === 0 ? Math.round(raw) : Math.round(raw * factor) / factor;

      setDisplayValue(progress >= 1 ? to : rounded);
      prevValueRef.current = progress >= 1 ? to : rounded;

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    if (startFrom === 'zero') {
      setDisplayValue(0);
    }

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [value, duration, decimals, startFrom, resetKey]);

  const text = formatter
    ? formatter(displayValue)
    : displayValue.toLocaleString('id-ID');

  return <span className={className}>{text}</span>;
};
