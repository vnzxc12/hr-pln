import React from 'react';

export const LunayveLogo = ({ className = "w-10 h-10", showText = false, textClassName = "text-xl font-bold text-slate-900", subtitleClassName = "text-xs text-slate-500 font-medium", variant = "default" }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${variant === 'center' ? 'flex-col justify-center' : ''}`}>
      <svg
        viewBox="0 0 500 500"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top Left Dark Green Gradient */}
          <linearGradient id="lunayve-dark-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#042f2e" />
            <stop offset="50%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Top Right Vibrant Green Gradient */}
          <linearGradient id="lunayve-bright-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Bottom Left Royal Deep Blue Gradient */}
          <linearGradient id="lunayve-deep-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="40%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Bottom Right Azure Blue Gradient */}
          <linearGradient id="lunayve-azure-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Metallic Silver 1 */}
          <linearGradient id="lunayve-silver-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Metallic Silver 2 (Darker Sheen) */}
          <linearGradient id="lunayve-silver-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Shadow filter for 3D metallic depth */}
          <filter id="drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#drop-shadow)">
          {/* Top Left Dark Forest Green Roof */}
          <polygon
            points="250,42 75,188 116,242 250,132"
            fill="url(#lunayve-dark-green)"
          />

          {/* Top Right Bright Lime/Emerald Green Roof */}
          <polygon
            points="250,42 425,188 384,242 250,132"
            fill="url(#lunayve-bright-green)"
          />

          {/* Bottom Left Deep Navy/Royal Blue Folded Band */}
          <polygon
            points="84,260 216,358 322,425 210,425 106,346 160,425 84,425"
            fill="url(#lunayve-deep-blue)"
          />
          <polygon
            points="84,260 168,322 135,425 84,425"
            fill="#1e3a8a"
          />

          {/* Bottom Right Sky Azure Upright Beam */}
          <polygon
            points="372,238 416,268 320,425 272,425"
            fill="url(#lunayve-azure-blue)"
          />

          {/* Central Silver Construction Architecture / "PL" Girders */}
          {/* Upper Silver Angled Girder */}
          <polygon
            points="250,140 330,202 290,262 255,235 278,202 225,160"
            fill="url(#lunayve-silver-1)"
          />
          {/* Mid/Lower Silver Cross Beam */}
          <polygon
            points="145,225 265,140 335,195 190,305"
            fill="url(#lunayve-silver-2)"
          />
          {/* Lower Silver Base Beam */}
          <polygon
            points="155,285 305,395 345,340 195,230"
            fill="url(#lunayve-silver-1)"
          />

          {/* Dark Metallic Core Inset */}
          <polygon
            points="190,370 270,425 190,425"
            fill="#475569"
          />
        </g>
      </svg>

      {showText && (
        <div className={variant === 'center' ? 'text-center mt-2' : 'flex flex-col'}>
          <span className={`${textClassName} tracking-tight leading-none`}>
            Project Lunayve
          </span>
          <span className={`${subtitleClassName} uppercase tracking-widest mt-1`}>
            Construction HRMS
          </span>
        </div>
      )}
    </div>
  );
};

export default LunayveLogo;
