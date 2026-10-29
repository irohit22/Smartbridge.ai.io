import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const WaterCycleModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const dur = `${2.5 / speed}s`;

  return (
    <div className="visual-model-canvas-wrapper water-cycle-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="Earth Water Cycle Diagram"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c1a30" />
            <stop offset="60%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>
          <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="680" height="240" fill="url(#skyGrad)" rx="12" />

        {/* Sun (Upper Left) */}
        <g transform="translate(70, 45)">
          <circle cx="20" cy="20" r="26" fill="#facc15" />
          {isPlaying && (
            <circle cx="20" cy="20" r="34" fill="none" stroke="#fde047" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" values="26;38;26" dur={dur} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur={dur} repeatCount="indefinite" />
            </circle>
          )}
          <text x="20" y="24" textAnchor="middle" fill="#713f12" fontSize="9" fontWeight="800">
            SUN
          </text>
        </g>

        {/* Mountains (Right side) */}
        <polygon points="400,240 520,70 610,240" fill="url(#mountainGrad)" />
        <polygon points="520,70 480,130 520,120 550,135" fill="#f1f5f9" opacity="0.9" /> {/* Snowcap */}
        <polygon points="540,240 620,110 680,240" fill="#334155" />
        <polygon points="620,110 595,150 620,140 645,155" fill="#f1f5f9" opacity="0.85" />

        {/* Ocean & Lake Water (Left/Center bottom) */}
        <rect x="0" y="240" width="480" height="100" fill="url(#oceanGrad)" />
        <rect x="480" y="240" width="200" height="100" fill="#292524" /> {/* Ground/Soil */}

        {/* Groundwater aquifer */}
        <g transform="translate(480, 280)">
          <rect width="200" height="60" fill="#1c1917" />
          <text x="100" y="32" textAnchor="middle" fill="#78716c" fontSize="9" fontWeight="600">
            Aquifer / Groundwater
          </text>
          {step === 4 && (
            <path d="M 0 10 Q 50 25 100 10 T 200 10" stroke="#38bdf8" strokeWidth="2" fill="none" strokeDasharray="4 2" />
          )}
        </g>

        {/* Ocean Waves */}
        <path d="M 0 242 Q 60 236 120 242 T 240 242 T 360 242 T 480 242" fill="none" stroke="#7dd3fc" strokeWidth="2" />

        {/* ================================================================ */}
        {/* STEP 1: EVAPORATION & TRANSPIRATION */}
        {/* ================================================================ */}
        <g opacity={step === 1 ? 1 : 0.45}>
          {/* Evaporation Squiggly Arrows */}
          <path d="M 120 220 C 115 190, 135 170, 125 140" fill="none" stroke="#bae6fd" strokeWidth="3" strokeDasharray="5 3" />
          <path d="M 160 220 C 155 180, 175 160, 165 130" fill="none" stroke="#bae6fd" strokeWidth="3" strokeDasharray="5 3" />
          <path d="M 200 225 C 195 195, 215 175, 205 145" fill="none" stroke="#bae6fd" strokeWidth="3" strokeDasharray="5 3" />

          <rect x="110" y="105" width="105" height="24" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
          <text x="162" y="121" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
            1. Evaporation
          </text>
        </g>

        {/* ================================================================ */}
        {/* STEP 2: CONDENSATION (CLOUDS) */}
        {/* ================================================================ */}
        <g transform="translate(260, 50)" opacity={step >= 2 ? 1 : 0.4}>
          {/* Cloud Shapes */}
          <ellipse cx="60" cy="40" rx="45" ry="22" fill="#f8fafc" />
          <circle cx="45" cy="28" r="26" fill="#f8fafc" />
          <circle cx="85" cy="25" r="24" fill="#f8fafc" />
          <ellipse cx="150" cy="50" rx="55" ry="25" fill="#e2e8f0" />
          <circle cx="135" cy="35" r="30" fill="#e2e8f0" />
          <circle cx="175" cy="38" r="25" fill="#e2e8f0" />

          <rect x="70" y="75" width="115" height="24" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
          <text x="127" y="91" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
            2. Condensation
          </text>
        </g>

        {/* ================================================================ */}
        {/* STEP 3: PRECIPITATION (RAIN / SNOW) */}
        {/* ================================================================ */}
        <g transform="translate(370, 110)" opacity={step >= 3 ? 1 : 0.35}>
          {/* Falling Rain Drops */}
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <line
              key={r}
              x1={r * 18 + 10}
              y1={20}
              x2={r * 18 + 5}
              y2={85}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="8 6"
            />
          ))}

          <rect x="20" y="90" width="105" height="24" rx="4" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1" />
          <text x="72" y="106" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
            3. Precipitation
          </text>
        </g>

        {/* ================================================================ */}
        {/* STEP 4: SURFACE RUNOFF & COLLECTION */}
        {/* ================================================================ */}
        <g opacity={step === 4 ? 1 : 0.4}>
          {/* River cascading from mountain into ocean */}
          <path
            d="M 520 170 Q 460 210 400 240 Q 360 260 280 265"
            fill="none"
            stroke="#0284c7"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="360" y="215" width="125" height="24" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
          <text x="422" y="231" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
            4. Runoff & Flow
          </text>
        </g>
      </svg>
    </div>
  );
};
