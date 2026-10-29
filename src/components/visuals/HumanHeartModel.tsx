import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const HumanHeartModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const pulseDur = `${1.2 / speed}s`;

  // Steps:
  // 1: Deoxygenated blood returns (Vena Cava -> RA)
  // 2: Pumped to lungs (RV -> Pulmonary Artery)
  // 3: Oxygenated blood returns (Pulmonary Veins -> LA)
  // 4: Ejected to body (LV -> Aorta)

  return (
    <div className="visual-model-canvas-wrapper heart-model-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="Human Heart 4-Chamber Cardiovascular Flow"
      >
        <defs>
          <filter id="heartGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="680" height="340" fill="#0c0a14" rx="12" />

        <text x="340" y="32" textAnchor="middle" fill="#f43f5e" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          CARDIOVASCULAR FLOW (4 CHAMBERS & DUAL CIRCULATION)
        </text>

        {/* ================================================================ */}
        {/* MAIN HEART SILHOUETTE */}
        {/* ================================================================ */}
        <g transform="translate(190, 45)">
          {/* Animated Heartbeat Scale Pulse */}
          <g className={isPlaying ? 'heart-beat-pulse' : ''} style={{ transformOrigin: '150px 140px' }}>
            {/* Heart Muscle Background */}
            <path
              d="M 150 40 C 90 -20, 20 40, 20 120 C 20 190, 90 230, 150 270 C 210 230, 280 190, 280 120 C 280 40, 210 -20, 150 40 Z"
              fill="#270e17"
              stroke="#881337"
              strokeWidth="4"
            />

            {/* Central Septum (dividing wall) */}
            <line x1="150" y1="40" x2="150" y2="260" stroke="#4c0519" strokeWidth="8" />

            {/* Horizontal Atrio-Ventricular Septum */}
            <line x1="30" y1="130" x2="270" y2="130" stroke="#4c0519" strokeWidth="6" />

            {/* 1. RIGHT ATRIUM (Upper Left anatomically, viewer's top-left) */}
            <g>
              <rect
                x="35"
                y="55"
                width="105"
                height="65"
                rx="8"
                fill={step === 1 ? '#1e3a8a' : '#0f172a'}
                stroke={step === 1 ? '#38bdf8' : '#1e3a5f'}
                strokeWidth={step === 1 ? 2.5 : 1}
                filter={step === 1 ? 'url(#heartGlow)' : undefined}
              />
              <text x="87" y="80" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">
                RIGHT ATRIUM
              </text>
              <text x="87" y="96" textAnchor="middle" fill="#60a5fa" fontSize="8.5">
                Deoxygenated (RA)
              </text>
              {step === 1 && (
                <circle cx="87" cy="108" r="4" fill="#38bdf8">
                  <animate attributeName="cy" values="65;110;65" dur={pulseDur} repeatCount="indefinite" />
                </circle>
              )}
            </g>

            {/* 2. RIGHT VENTRICLE (Lower Left anatomically, viewer's bottom-left) */}
            <g>
              <rect
                x="35"
                y="140"
                width="105"
                height="90"
                rx="8"
                fill={step === 2 ? '#1e3a8a' : '#0f172a'}
                stroke={step === 2 ? '#38bdf8' : '#1e3a5f'}
                strokeWidth={step === 2 ? 2.5 : 1}
                filter={step === 2 ? 'url(#heartGlow)' : undefined}
              />
              <text x="87" y="175" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">
                RIGHT VENTRICLE
              </text>
              <text x="87" y="193" textAnchor="middle" fill="#60a5fa" fontSize="8.5">
                Pumps to Lungs (RV)
              </text>
            </g>

            {/* 3. LEFT ATRIUM (Upper Right anatomically, viewer's top-right) */}
            <g>
              <rect
                x="160"
                y="55"
                width="105"
                height="65"
                rx="8"
                fill={step === 3 ? '#881337' : '#270e17'}
                stroke={step === 3 ? '#fb7185' : '#4c0519'}
                strokeWidth={step === 3 ? 2.5 : 1}
                filter={step === 3 ? 'url(#heartGlow)' : undefined}
              />
              <text x="212" y="80" textAnchor="middle" fill="#fecdd3" fontSize="11" fontWeight="700">
                LEFT ATRIUM
              </text>
              <text x="212" y="96" textAnchor="middle" fill="#f43f5e" fontSize="8.5">
                Oxygenated (LA)
              </text>
              {step === 3 && (
                <circle cx="212" cy="108" r="4" fill="#fb7185">
                  <animate attributeName="cy" values="65;110;65" dur={pulseDur} repeatCount="indefinite" />
                </circle>
              )}
            </g>

            {/* 4. LEFT VENTRICLE (Lower Right anatomically, thick myocardium) */}
            <g>
              <rect
                x="160"
                y="140"
                width="105"
                height="90"
                rx="8"
                fill={step === 4 ? '#881337' : '#270e17'}
                stroke={step === 4 ? '#fb7185' : '#4c0519'}
                strokeWidth={step === 4 ? 2.5 : 1}
                filter={step === 4 ? 'url(#heartGlow)' : undefined}
              />
              <text x="212" y="175" textAnchor="middle" fill="#fecdd3" fontSize="11" fontWeight="700">
                LEFT VENTRICLE
              </text>
              <text x="212" y="193" textAnchor="middle" fill="#f43f5e" fontSize="8.5">
                High-Pressure Body (LV)
              </text>
            </g>
          </g>
        </g>

        {/* ================================================================ */}
        {/* MAJOR BLOOD VESSELS */}
        {/* ================================================================ */}
        {/* Vena Cava (Deoxygenated Inflow - Left) */}
        <g transform="translate(30, 90)">
          <rect width="130" height="42" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="65" y="20" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="700">
            Vena Cava Inflow
          </text>
          <text x="65" y="34" textAnchor="middle" fill="#60a5fa" fontSize="8">
            From Body Tissues (Blue)
          </text>
          <line x1="130" y1="21" x2="225" y2="21" stroke="#38bdf8" strokeWidth="4" strokeDasharray="6 3" />
        </g>

        {/* Pulmonary Artery (To Lungs - Top Center) */}
        <g transform="translate(50, 205)">
          <rect width="125" height="42" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="62" y="20" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="700">
            Pulmonary Artery
          </text>
          <text x="62" y="34" textAnchor="middle" fill="#60a5fa" fontSize="8">
            To Lungs for O₂ (Blue)
          </text>
          <line x1="125" y1="21" x2="225" y2="21" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5 3" />
        </g>

        {/* Pulmonary Veins (Oxygenated Inflow - Right Top) */}
        <g transform="translate(500, 90)">
          <rect width="145" height="42" rx="6" fill="#270e17" stroke="#fb7185" strokeWidth="1.5" />
          <text x="72" y="20" textAnchor="middle" fill="#fecdd3" fontSize="10" fontWeight="700">
            Pulmonary Veins
          </text>
          <text x="72" y="34" textAnchor="middle" fill="#f43f5e" fontSize="8">
            From Lungs (Red O₂)
          </text>
          <line x1="0" y1="21" x2="-60" y2="21" stroke="#fb7185" strokeWidth="3" strokeDasharray="5 3" />
        </g>

        {/* Aorta (Oxygenated Ejection - Right Bottom) */}
        <g transform="translate(500, 205)">
          <rect width="145" height="42" rx="6" fill="#270e17" stroke="#fb7185" strokeWidth="2" />
          <text x="72" y="20" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
            Aorta Systemic Ejection
          </text>
          <text x="72" y="34" textAnchor="middle" fill="#fda4af" fontSize="8">
            To Brain & Whole Body (Red)
          </text>
          <line x1="0" y1="21" x2="-60" y2="21" stroke="#fb7185" strokeWidth="5" strokeDasharray="6 3" />
        </g>
      </svg>
    </div>
  );
};
