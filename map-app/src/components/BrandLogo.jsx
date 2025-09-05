import React from "react";

export default function BrandLogo({ size = 40, className = "", title = "AI 여행 플래너" }) {
  // Gradient purple-magenta star with a paper-plane overlay
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
        </filter>
      </defs>

      {/* Star shape */}
      <path
        d="M32 2 L39 22 L62 24 L44 38 L50 60 L32 48 L14 60 L20 38 L2 24 L25 22 Z"
        fill="url(#brandGrad)"
        filter="url(#softShadow)"
      />

      {/* Paper plane overlay */}
      <path
        d="M48 20 L20 34 L30 36 L36 44 L48 20 Z M30 36 L44 28"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}
