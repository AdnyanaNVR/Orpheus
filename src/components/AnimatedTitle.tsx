import React from 'react';

interface AnimatedTitleProps {
  text: string;
  letterDelayMs?: number;
  baseDelayMs?: number;
  className?: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  letterDelayMs = 42,
  baseDelayMs = 0,
  className = '',
}) => {
  const letters = Array.from(text);

  return (
    <h1
      aria-label={text}
      className={`text-[40px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.05] whitespace-nowrap ${className}`}
    >
      {letters.map((char, idx) => (
        <span
          key={`${idx}-${char}`}
          aria-hidden="true"
          className="inline-block animate-tab-up"
          style={{ animationDelay: `${baseDelayMs + idx * letterDelayMs}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
};
