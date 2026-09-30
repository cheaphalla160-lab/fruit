import React from 'react';
import { FruitType } from '../types/game';

interface FruitGraphicProps {
  type: FruitType;
  size?: number;
  className?: string;
  showFace?: boolean;
}

export const FruitGraphic: React.FC<FruitGraphicProps> = ({
  type,
  size = 64,
  className = '',
  showFace = true,
}) => {
  if (type === 'apple') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`filter drop-shadow-md select-none pointer-events-none ${className}`}
      >
        <defs>
          <radialGradient id="appleGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="45%" stopColor="#EE2828" />
            <stop offset="90%" stopColor="#B91C1C" />
          </radialGradient>
          <radialGradient id="appleHighlight" cx="30%" cy="25%" r="35%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>

        {/* Stem */}
        <path
          d="M 50 28 C 50 14, 58 10, 62 8"
          stroke="url(#stemGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Leaf */}
        <path
          d="M 52 20 C 65 14, 76 18, 76 26 C 68 28, 56 26, 52 20 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 53 21 Q 64 22 72 25"
          stroke="#86EFAC"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Apple Main Body (heart-apple shape) */}
        <path
          d="M 50 32
             C 38 22, 16 26, 16 52
             C 16 76, 32 92, 45 92
             C 48 92, 50 88, 52 88
             C 54 88, 56 92, 59 92
             C 72 92, 88 76, 88 52
             C 88 26, 66 22, 54 32
             C 52 34, 48 34, 50 32 Z"
          fill="url(#appleGrad)"
        />

        {/* Glossy specular highlight */}
        <ellipse
          cx="33"
          cy="42"
          rx="12"
          ry="18"
          transform="rotate(-25 33 42)"
          fill="url(#appleHighlight)"
        />

        {/* Cute Face */}
        {showFace && (
          <g>
            {/* Left Eye */}
            <circle cx="38" cy="54" r="3.2" fill="#1E293B" />
            <circle cx="39" cy="53" r="1.1" fill="#FFFFFF" />
            {/* Right Eye */}
            <circle cx="62" cy="54" r="3.2" fill="#1E293B" />
            <circle cx="63" cy="53" r="1.1" fill="#FFFFFF" />
            {/* Cheeks */}
            <circle cx="32" cy="60" r="3.5" fill="#FDA4AF" opacity="0.75" />
            <circle cx="68" cy="60" r="3.5" fill="#FDA4AF" opacity="0.75" />
            {/* Sweet Smile */}
            <path
              d="M 44 60 Q 50 66 56 60"
              stroke="#7F1D1D"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    );
  }

  if (type === 'banana') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`filter drop-shadow-md select-none pointer-events-none ${className}`}
      >
        <defs>
          <linearGradient id="bananaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FACC15" />
            <stop offset="85%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="bananaShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Banana Stem Tip */}
        <path
          d="M 22 22 L 27 16 L 31 19 L 26 25 Z"
          fill="#65A30D"
        />

        {/* Main Curved Body */}
        <path
          d="M 26 23
             C 45 28, 72 45, 80 72
             C 84 84, 76 86, 70 82
             C 52 70, 32 50, 24 32
             C 21 27, 22 24, 26 23 Z"
          fill="url(#bananaGrad)"
        />

        {/* Inner Curved ridge */}
        <path
          d="M 28 26 C 44 33, 64 48, 72 70"
          stroke="#FDE047"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Lower Tip */}
        <path
          d="M 76 78 C 80 82, 82 85, 78 87 C 76 88, 73 85, 71 83 Z"
          fill="#78350F"
        />

        {/* Cute Face */}
        {showFace && (
          <g transform="rotate(22 52 50)">
            {/* Left Eye */}
            <circle cx="48" cy="46" r="3" fill="#1E293B" />
            <circle cx="49" cy="45" r="1" fill="#FFFFFF" />
            {/* Right Eye */}
            <circle cx="62" cy="48" r="3" fill="#1E293B" />
            <circle cx="63" cy="47" r="1" fill="#FFFFFF" />
            {/* Cheeks */}
            <circle cx="43" cy="51" r="3" fill="#FDE047" opacity="0.9" />
            <circle cx="66" cy="53" r="3" fill="#FDE047" opacity="0.9" />
            {/* Smile */}
            <path
              d="M 52 53 Q 56 58 60 54"
              stroke="#713F12"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    );
  }

  // Kiwi: Sliced delicious kiwi with vibrant seeds
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`filter drop-shadow-md select-none pointer-events-none ${className}`}
    >
      <defs>
        <radialGradient id="kiwiFlesh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="35%" stopColor="#BEF264" />
          <stop offset="70%" stopColor="#84CC16" />
          <stop offset="90%" stopColor="#65A30D" />
          <stop offset="100%" stopColor="#854D0E" />
        </radialGradient>
        <radialGradient id="kiwiCenter" cx="50%" cy="50%" r="30%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FEF08A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#BEF264" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Fuzzy Brown Skin Outer Ring */}
      <circle cx="50" cy="50" r="44" fill="#78350F" />
      <circle cx="50" cy="50" r="41" fill="#92400E" />

      {/* Green Flesh */}
      <circle cx="50" cy="50" r="38" fill="url(#kiwiFlesh)" />

      {/* Starburst rays */}
      <g stroke="#ECFCCB" strokeWidth="1.2" opacity="0.75">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="50"
            x2={50 + 26 * Math.cos((deg * Math.PI) / 180)}
            y2={50 + 26 * Math.sin((deg * Math.PI) / 180)}
          />
        ))}
      </g>

      {/* Pale Center Heart */}
      <circle cx="50" cy="50" r="14" fill="url(#kiwiCenter)" />

      {/* Black Kiwi Seeds */}
      {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const dist = 18 + (i % 2) * 4;
        const sx = 50 + dist * Math.cos(rad);
        const sy = 50 + dist * Math.sin(rad);
        return (
          <ellipse
            key={deg}
            cx={sx}
            cy={sy}
            rx="1.5"
            ry="2.4"
            transform={`rotate(${deg + 90} ${sx} ${sy})`}
            fill="#1E293B"
          />
        );
      })}

      {/* Cute Face in center */}
      {showFace && (
        <g>
          {/* Eyes */}
          <circle cx="43" cy="49" r="2.8" fill="#1E293B" />
          <circle cx="44" cy="48" r="1" fill="#FFFFFF" />
          <circle cx="57" cy="49" r="2.8" fill="#1E293B" />
          <circle cx="58" cy="48" r="1" fill="#FFFFFF" />
          {/* Pink Cheeks */}
          <circle cx="37" cy="54" r="3" fill="#F472B6" opacity="0.6" />
          <circle cx="63" cy="54" r="3" fill="#F472B6" opacity="0.6" />
          {/* Smile */}
          <path
            d="M 47 54 Q 50 58 53 54"
            stroke="#1E293B"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
    </svg>
  );
};
