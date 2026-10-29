import React, { useState } from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const ElectricCircuitModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const [isSwitchClosed, setIsSwitchClosed] = useState(step >= 2);
  const effectiveSwitch = step >= 2 || isSwitchClosed;
  const dur = `${2 / speed}s`;

  return (
    <div className="visual-model-canvas-wrapper circuit-model-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="DC Electric Circuit Schematic"
      >
        <defs>
          <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
          </radialGradient>
        </defs>

        <rect width="680" height="340" fill="#070a16" rx="12" />

        <text x="340" y="28" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          DC CLOSED CIRCUIT & OHM’S LAW (V = I × R)
        </text>

        {/* Conductive Wire Loop */}
        <g stroke={effectiveSwitch ? '#38bdf8' : '#334155'} strokeWidth="4" fill="none">
          {/* Top horizontal wire */}
          <line x1="120" y1="70" x2="300" y2="70" />
          <line x1="380" y1="70" x2="560" y2="70" />

          {/* Right vertical wire */}
          <line x1="560" y1="70" x2="560" y2="270" />

          {/* Bottom horizontal wire */}
          <line x1="560" y1="270" x2="410" y2="270" />
          <line x1="270" y1="270" x2="120" y2="270" />

          {/* Left vertical wire */}
          <line x1="120" y1="270" x2="120" y2="70" />
        </g>

        {/* ================================================================ */}
        {/* 1. BATTERY POWER SOURCE (Left) */}
        {/* ================================================================ */}
        <g transform="translate(120, 170)">
          {/* Long line (+) and Short thick line (-) */}
          <line x1="-30" y1="-22" x2="30" y2="-22" stroke="#f43f5e" strokeWidth="5" />
          <line x1="-18" y1="-8" x2="18" y2="-8" stroke="#38bdf8" strokeWidth="7" />
          <line x1="-30" y1="8" x2="30" y2="8" stroke="#f43f5e" strokeWidth="5" />
          <line x1="-18" y1="22" x2="18" y2="22" stroke="#38bdf8" strokeWidth="7" />

          <text x="-45" y="-18" fill="#f43f5e" fontSize="12" fontWeight="800">
            +
          </text>
          <text x="-45" y="26" fill="#38bdf8" fontSize="14" fontWeight="800">
            -
          </text>

          <rect x="-85" y="-12" width="55" height="24" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <text x="-58" y="4" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
            9.0 V
          </text>
        </g>

        {/* ================================================================ */}
        {/* 2. KNIFE SWITCH (Top) */}
        {/* ================================================================ */}
        <g
          transform="translate(340, 70)"
          onClick={() => setIsSwitchClosed(!isSwitchClosed)}
          style={{ cursor: 'pointer' }}
        >
          {/* Contact Terminals */}
          <circle cx="-35" cy="0" r="6" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="35" cy="0" r="6" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2" />

          {/* Switch Blade */}
          <line
            x1="-35"
            y1="0"
            x2={effectiveSwitch ? 35 : 20}
            y2={effectiveSwitch ? 0 : -32}
            stroke={effectiveSwitch ? '#10b981' : '#f59e0b'}
            strokeWidth="5"
            strokeLinecap="round"
          />

          <text x="0" y="-38" textAnchor="middle" fill={effectiveSwitch ? '#34d399' : '#fbbf24'} fontSize="10" fontWeight="700">
            {effectiveSwitch ? 'SWITCH CLOSED (ON)' : 'SWITCH OPEN (OFF)'}
          </text>
        </g>

        {/* ================================================================ */}
        {/* 3. RESISTOR (Bottom) */}
        {/* ================================================================ */}
        <g transform="translate(340, 270)">
          {/* Resistor zigzag path */}
          <path
            d="M -60 0 L -45 -12 L -25 12 L -5 -12 L 15 12 L 35 -12 L 45 12 L 60 0"
            fill="none"
            stroke={step >= 3 ? '#a855f7' : '#94a3b8'}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <rect x="-35" y="18" width="70" height="22" rx="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
          <text x="0" y="33" textAnchor="middle" fill="#c084fc" fontSize="10" fontWeight="700">
            R = 300 Ω
          </text>
        </g>

        {/* ================================================================ */}
        {/* 4. LIGHT BULB / RADIANT LOAD (Right) */}
        {/* ================================================================ */}
        <g transform="translate(560, 170)">
          {/* Radiant Glow Bloom */}
          {effectiveSwitch && (
            <circle cx="0" cy="0" r={step === 4 ? 45 : 30} fill="url(#bulbGlowGrad)" opacity={step === 4 ? 0.9 : 0.6} />
          )}

          {/* Bulb Outer Glass */}
          <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />

          {/* Filament */}
          <path
            d="M -10 12 L -5 -8 L 0 -2 L 5 -8 L 10 12"
            fill="none"
            stroke={effectiveSwitch ? '#facc15' : '#64748b'}
            strokeWidth="2.5"
          />

          <text x="40" y="4" fill={effectiveSwitch ? '#fef08a' : '#64748b'} fontSize="10" fontWeight="700">
            {effectiveSwitch ? (step === 4 ? 'Bright (P = 0.27W)' : 'Lit (I = 30mA)') : 'Dark'}
          </text>
        </g>

        {/* Animated Electron Drift Dots */}
        {effectiveSwitch && isPlaying && (
          <g fill="#38bdf8">
            <circle r="4">
              <animateMotion
                path="M 120 170 L 120 70 L 340 70 L 560 70 L 560 170 L 560 270 L 340 270 L 120 270 Z"
                dur={dur}
                repeatCount="indefinite"
              />
            </circle>
            <circle r="4">
              <animateMotion
                path="M 340 70 L 560 70 L 560 170 L 560 270 L 340 270 L 120 270 L 120 70 Z"
                dur={dur}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
};
