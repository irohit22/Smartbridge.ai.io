import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const PhotosynthesisModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const animDur = `${3 / speed}s`;

  const isLightReaction = step === 1 || step === 2;
  const isCalvinCycle = step === 3 || step === 4;

  return (
    <div className="visual-model-canvas-wrapper photosynthesis-model-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="Photosynthesis Chloroplast Diagram"
      >
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="thylakoidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        {/* Outer Background */}
        <rect width="680" height="340" fill="#03150d" rx="12" />

        {/* Chloroplast Outer Double Membrane */}
        <ellipse
          cx="340"
          cy="170"
          rx="310"
          ry="145"
          fill="url(#leafGrad)"
          stroke="#10b981"
          strokeWidth="3"
        />
        <ellipse
          cx="340"
          cy="170"
          rx="295"
          ry="132"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.6"
        />

        <text x="340" y="45" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="700" letterSpacing="0.06em">
          CHLOROPLAST ORGANELLE (PLANT CELL)
        </text>

        {/* ================================================================ */}
        {/* SUN / LIGHT SOURCE (Top Left) */}
        {/* ================================================================ */}
        <g transform="translate(45, 55)">
          <circle cx="20" cy="20" r="24" fill="url(#sunGrad)" />
          {isPlaying && (
            <circle cx="20" cy="20" r="28" fill="none" stroke="#fde047" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" values="24;32;24" dur={animDur} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur={animDur} repeatCount="indefinite" />
            </circle>
          )}
          <text x="20" y="24" textAnchor="middle" fill="#713f12" fontSize="9" fontWeight="800">
            SOLAR
          </text>
        </g>

        {/* Light Photons Stream */}
        <g stroke="#facc15" strokeWidth="2" strokeDasharray="5 3" opacity={step >= 1 ? 0.9 : 0.3}>
          <line x1="85" y1="85" x2="160" y2="130" />
          <line x1="95" y1="95" x2="170" y2="140" />
        </g>
        <text x="120" y="100" fill="#fef08a" fontSize="10" fontWeight="600">
          Photons (hν)
        </text>

        {/* H2O Input */}
        <g transform="translate(60, 240)">
          <rect width="80" height="32" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="40" y="20" textAnchor="middle" fill="#e0f2fe" fontSize="11" fontWeight="700">
            6 H₂O In
          </text>
          {isPlaying && (
            <circle cx="40" cy="2" r="3" fill="#38bdf8">
              <animate attributeName="cy" from="32" to="-40" dur={animDur} repeatCount="indefinite" />
            </circle>
          )}
        </g>

        {/* ================================================================ */}
        {/* THYLAKOID MEMBRANE / GRANUM STACK (Left Region) */}
        {/* ================================================================ */}
        <g transform="translate(160, 95)">
          <rect
            width="170"
            height="180"
            rx="12"
            fill="#062e20"
            stroke={isLightReaction ? '#34d399' : '#1e3a2b'}
            strokeWidth={isLightReaction ? 2.5 : 1}
          />
          <text x="85" y="24" textAnchor="middle" fill="#a7f3d0" fontSize="11" fontWeight="700">
            THYLAKOID GRANUM
          </text>
          <text x="85" y="38" textAnchor="middle" fill="#6ee7b7" fontSize="8.5">
            Light-Dependent Reactions
          </text>

          {/* Granum Discs */}
          {[0, 1, 2, 3].map((d) => (
            <ellipse
              key={d}
              cx="85"
              cy={65 + d * 22}
              rx="60"
              ry="11"
              fill="url(#thylakoidGrad)"
              stroke="#059669"
              strokeWidth="1"
            />
          ))}

          {/* O2 Released */}
          <g transform="translate(45, 145)">
            <rect width="80" height="24" rx="4" fill="#047857" stroke="#6ee7b7" strokeWidth="1" />
            <text x="40" y="16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
              6 O₂ Released
            </text>
          </g>
        </g>

        {/* Energy Carrier Bridges: ATP & NADPH <---> ADP + NADP+ */}
        <g transform="translate(340, 125)">
          {/* Top arrow: ATP + NADPH -> Calvin Cycle */}
          <path
            d="M 5 0 Q 30 -20 55 0"
            fill="none"
            stroke={isLightReaction ? '#f59e0b' : '#334155'}
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
          <text x="30" y="-14" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="700">
            ATP + NADPH
          </text>

          {/* Bottom arrow: ADP + NADP+ <- Calvin Cycle */}
          <path
            d="M 55 50 Q 30 70 5 50"
            fill="none"
            stroke={isCalvinCycle ? '#38bdf8' : '#334155'}
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
          <text x="30" y="74" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="600">
            ADP + NADP⁺
          </text>
        </g>

        {/* ================================================================ */}
        {/* STROMA & CALVIN CYCLE (Right Region) */}
        {/* ================================================================ */}
        <g transform="translate(410, 85)">
          <rect
            width="220"
            height="195"
            rx="12"
            fill="#042017"
            stroke={isCalvinCycle ? '#10b981' : '#1e3a2b'}
            strokeWidth={isCalvinCycle ? 2.5 : 1}
          />
          <text x="110" y="24" textAnchor="middle" fill="#a7f3d0" fontSize="11" fontWeight="700">
            STROMA FLUID
          </text>
          <text x="110" y="38" textAnchor="middle" fill="#6ee7b7" fontSize="8.5">
            Calvin Cycle (Light-Independent)
          </text>

          {/* Calvin Cycle Circular Pathway */}
          <circle
            cx="110"
            cy="110"
            r="48"
            fill="none"
            stroke={isCalvinCycle ? '#34d399' : '#334155'}
            strokeWidth="3"
            strokeDasharray={isPlaying ? '8 4' : undefined}
          />

          <text x="110" y="105" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
            RuBisCO
          </text>
          <text x="110" y="120" textAnchor="middle" fill="#94a3b8" fontSize="8">
            Carbon Fixation
          </text>

          {/* CO2 Input */}
          <g transform="translate(70, -25)">
            <rect width="80" height="26" rx="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
            <text x="40" y="17" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="700">
              6 CO₂ Inflow
            </text>
          </g>

          {/* Glucose Output */}
          <g transform="translate(60, 162)">
            <rect
              width="100"
              height="28"
              rx="6"
              fill={step === 4 ? '#854d0e' : '#1c1917'}
              stroke={step === 4 ? '#facc15' : '#44403c'}
              strokeWidth={step === 4 ? 2 : 1}
            />
            <text x="50" y="18" textAnchor="middle" fill={step === 4 ? '#fef08a' : '#a8a29e'} fontSize="10" fontWeight="700">
              C₆H₁₂O₆ (Glucose)
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
