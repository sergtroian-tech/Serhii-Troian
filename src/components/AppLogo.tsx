import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic Vector Brand Icon */}
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform duration-200 hover:scale-105 select-none`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="60%" stopColor="#4338CA" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>
            <linearGradient id="logoCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="flapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Squircle base */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            fill="url(#logoBgGrad)"
          />

          {/* Subtle inner border */}
          <rect
            x="2.5"
            y="2.5"
            width="43"
            height="43"
            rx="11.5"
            stroke="#FFFFFF"
            strokeOpacity="0.2"
            strokeWidth="1"
          />

          {/* Envelope Body */}
          <rect
            x="9"
            y="13"
            width="30"
            height="21"
            rx="3.5"
            fill="#1E1B4B"
            fillOpacity="0.25"
          />

          {/* Envelope Lower Fold */}
          <path
            d="M9.5 31.5L20 22C22.2 20 25.8 20 28 22L38.5 31.5"
            stroke="#C7D2FE"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Envelope Flap Fold */}
          <path
            d="M10.5 15L22.5 24.5C23.4 25.2 24.6 25.2 25.5 24.5L37.5 15"
            stroke="url(#flapGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Attached Task Checkmark Pin */}
          <g>
            <circle
              cx="34"
              cy="34"
              r="10"
              fill="#0F172A"
              stroke="#6366F1"
              strokeWidth="1"
            />
            <circle
              cx="34"
              cy="34"
              r="8.5"
              fill="url(#logoCheckGrad)"
            />
            <path
              d="M30 34L32.8 36.8L38 31.5"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-display">
            NexusMail
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-body mt-0.5">
            Почта + Задачи
          </span>
        </div>
      )}
    </div>
  );
};
