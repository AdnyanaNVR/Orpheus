import React, { useState } from 'react';

interface InfoIconProps {
  tooltip: string;
  variant?: 'light' | 'dark';
}

export const InfoIcon: React.FC<InfoIconProps> = ({ tooltip, variant = 'dark' }) => {
  const [open, setOpen] = useState(false);

  const strokeColor = variant === 'light' ? '#5e5e5a' : '#787874';

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={tooltip}
        className="inline-flex items-center justify-center rounded-full focus:outline-none cursor-pointer"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke={strokeColor} strokeWidth="1.2" />
          <path d="M8 7.2V11.2" stroke={strokeColor} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="8" cy="5.1" r="0.8" fill={strokeColor} />
        </svg>
      </button>
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-52 rounded-lg bg-[#252523] border border-white/10 px-2.5 py-2 text-[11px] leading-snug text-[#e5e5e2] shadow-xl pointer-events-none">
          {tooltip}
        </span>
      )}
    </span>
  );
};
