import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const PythagoreanTheoremModel: React.FC<ModelProps> = ({ step }) => {
  // Triangle 3-4-5
  // Leg a = 3, Leg b = 4, Hypotenuse c = 5
  // Square a = 9 units, Square b = 16 units, Square c = 25 units
  const showSquareA = step >= 2;
  const showSquareB = step >= 2;
  const showSquareC = step >= 3;
  const showEquivalence = step >= 4;

  return (
    <div className="visual-model-canvas-wrapper pythagorean-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="Pythagorean Theorem Geometric Proof Diagram"
      >
        <rect width="680" height="340" fill="#080c1f" rx="12" />

        <text x="340" y="26" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          PYTHAGOREAN THEOREM: a² + b² = c² (3² + 4² = 5²)
        </text>

        {/* Center Geometric Canvas */}
        <g transform="translate(140, 180)">
          {/* Right Triangle: vertices (0,0), (80, 0), (0, -60) -> base=80(4u), height=60(3u), hyp=100(5u) */}
          <polygon
            points="0,0 80,0 0,-60"
            fill="#1e293b"
            stroke="#f8fafc"
            strokeWidth="2.5"
          />

          {/* Right Angle Symbol at (0,0) */}
          <rect x="0" y="-12" width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Side a (vertical leg = 3 units, 60px) */}
          <text x="-14" y="-30" textAnchor="middle" fill="#f43f5e" fontSize="12" fontWeight="800">
            a = 3
          </text>

          {/* Side b (horizontal leg = 4 units, 80px) */}
          <text x="40" y="18" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="800">
            b = 4
          </text>

          {/* Hypotenuse c (slanted side = 5 units, 100px) */}
          <text x="50" y="-40" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="800">
            c = 5
          </text>

          {/* ================================================================ */}
          {/* SQUARE A on Leg a (Left side: 3x3 grid = 60x60px) */}
          {/* ================================================================ */}
          {showSquareA && (
            <g transform="translate(-60, -60)">
              <rect width="60" height="60" fill="#881337" fillOpacity="0.85" stroke="#f43f5e" strokeWidth="2" />
              {/* 3x3 Grid Lines */}
              {[1, 2].map((i) => (
                <g key={i}>
                  <line x1={i * 20} y1="0" x2={i * 20} y2="60" stroke="#fecdd3" strokeWidth="0.8" opacity="0.6" />
                  <line x1="0" y1={i * 20} x2="60" y2={i * 20} stroke="#fecdd3" strokeWidth="0.8" opacity="0.6" />
                </g>
              ))}
              <text x="30" y="35" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
                a² = 9
              </text>
            </g>
          )}

          {/* ================================================================ */}
          {/* SQUARE B on Leg b (Bottom side: 4x4 grid = 80x80px) */}
          {/* ================================================================ */}
          {showSquareB && (
            <g transform="translate(0, 0)">
              <rect width="80" height="80" fill="#0369a1" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="2" />
              {/* 4x4 Grid Lines */}
              {[1, 2, 3].map((i) => (
                <g key={i}>
                  <line x1={i * 20} y1="0" x2={i * 20} y2="80" stroke="#bae6fd" strokeWidth="0.8" opacity="0.6" />
                  <line x1="0" y1={i * 20} x2="80" y2={i * 20} stroke="#bae6fd" strokeWidth="0.8" opacity="0.6" />
                </g>
              ))}
              <text x="40" y="46" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
                b² = 16
              </text>
            </g>
          )}

          {/* ================================================================ */}
          {/* SQUARE C on Hypotenuse c (Slanted side: 5x5 grid = 100x100px) */}
          {/* Angle is ~ -36.87 degrees */}
          {/* ================================================================ */}
          {showSquareC && (
            <g transform="translate(0, -60) rotate(36.87)">
              <rect width="100" height="100" fill="#581c87" fillOpacity="0.85" stroke="#c084fc" strokeWidth="2" />
              {/* 5x5 Grid Lines */}
              {[1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line x1={i * 20} y1="0" x2={i * 20} y2="100" stroke="#e9d5ff" strokeWidth="0.8" opacity="0.6" />
                  <line x1="0" y1={i * 20} x2="100" y2={i * 20} stroke="#e9d5ff" strokeWidth="0.8" opacity="0.6" />
                </g>
              ))}
              <text x="50" y="56" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">
                c² = 25
              </text>
            </g>
          )}
        </g>

        {/* Mathematical Proof Card (Right) */}
        <g transform="translate(420, 70)">
          <rect width="230" height="230" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <text x="20" y="28" fill="#38bdf8" fontSize="12" fontWeight="700">
            Area Equivalence Proof
          </text>

          <g transform="translate(20, 50)">
            <text x="0" y="16" fill="#f43f5e" fontSize="12" fontWeight="700">
              Area of Square A = 3² = 9
            </text>
            <text x="0" y="42" fill="#38bdf8" fontSize="12" fontWeight="700">
              Area of Square B = 4² = 16
            </text>
            <line x1="0" y1="58" x2="190" y2="58" stroke="#334155" strokeWidth="1" />

            <text x="0" y="80" fill="#a855f7" fontSize="13" fontWeight="800">
              Sum: 9 + 16 = 25
            </text>

            <text x="0" y="108" fill="#c084fc" fontSize="12" fontWeight="700">
              Hypotenuse Square C = 5² = 25
            </text>

            <rect
              x="0"
              y="126"
              width="190"
              height="36"
              rx="6"
              fill={showEquivalence ? '#064e3b' : '#1e1b4b'}
              stroke={showEquivalence ? '#34d399' : '#6366f1'}
              strokeWidth="1.5"
            />
            <text x="95" y="149" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
              {showEquivalence ? '✓ Q.E.D. (Area A + B = C)' : 'a² + b² = c²'}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
