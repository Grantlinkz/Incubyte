'use client';

import React from 'react';

interface AcmeLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function AcmeLogo({ className = '', size = 28, showText = false }: AcmeLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Crisp Vector Chevron Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
      >
        <defs>
          <linearGradient id="acme-logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="acme-logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Plate container */}
        <rect width="32" height="32" rx="7" fill="currentColor" className="text-slate-900 dark:text-slate-950" />
        <rect
          x="0.5"
          y="0.5"
          width="31"
          height="31"
          rx="6.5"
          stroke="url(#acme-logo-grad)"
          strokeOpacity="0.4"
        />

        {/* Left Leg */}
        <path d="M7 25L16 6L19.5 13L15 15.5L10.5 25H7Z" fill="url(#acme-logo-grad)" />

        {/* Right Leg / Upward Vector */}
        <path d="M25 25L16 6L20 6L26.5 20.5L25 25Z" fill="url(#acme-logo-accent)" />

        {/* Crossbar */}
        <path d="M10 18.5H22L20.5 21H11.5L10 18.5Z" fill="#38bdf8" />

        {/* Global Node */}
        <circle cx="16" cy="14" r="1.75" fill="#ffffff" />
      </svg>

      {showText && (
        <div className="flex flex-col select-none">
          <span className="text-sm font-bold tracking-tight text-foreground leading-none">
            ACME
          </span>
          <span className="text-[9px] font-semibold tracking-widest text-primary leading-tight mt-0.5">
            COMPENSATION
          </span>
        </div>
      )}
    </div>
  );
}
