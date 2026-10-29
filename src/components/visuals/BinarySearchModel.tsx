import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const BinarySearchModel: React.FC<ModelProps> = ({ step }) => {
  const dataset = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
  const target = 23;

  // Step 1: full range (low=0, high=10, mid=5 -> dataset[5] = 23)
  // Step 2: mid value compared
  // Step 3: range contracted
  // Step 4: match confirmed at index 5

  const low = step === 1 ? 0 : step >= 2 ? 0 : 0;
  const high = step === 1 ? 10 : step >= 2 ? 5 : 5;
  const mid = 5;

  return (
    <div className="visual-model-canvas-wrapper binary-search-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="Binary Search Algorithm Visualization"
      >
        <rect width="680" height="340" fill="#070c1e" rx="12" />

        <text x="340" y="28" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          BINARY SEARCH: O(log N) DIVIDE & CONQUER
        </text>

        {/* Target Badge */}
        <g transform="translate(40, 50)">
          <rect width="180" height="32" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
          <text x="14" y="21" fill="#f8fafc" fontSize="11" fontWeight="700">
            Search Target:
          </text>
          <rect x="110" y="6" width="36" height="20" rx="4" fill="#0284c7" />
          <text x="128" y="20" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="monospace">
            {target}
          </text>
        </g>

        {/* Complexity & Comparison Stats */}
        <g transform="translate(460, 50)">
          <rect width="180" height="32" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="90" y="20" textAnchor="middle" fill="#94a3b8" fontSize="10">
            Comparisons: <strong style={{ color: '#34d399' }}>{step >= 3 ? '1 of max 4' : 'In Progress'}</strong>
          </text>
        </g>

        {/* Array Visualization */}
        <g transform="translate(30, 130)">
          {dataset.map((val, idx) => {
            const isMid = idx === mid;
            const isTargetFound = isMid && step >= 3;
            const isDiscarded = step >= 2 && idx > 5;
            const inActiveRange = idx >= low && idx <= high;

            return (
              <g key={idx} transform={`translate(${idx * 56}, 0)`}>
                {/* Index label above */}
                <text x="26" y="-12" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                  [{idx}]
                </text>

                {/* Box element */}
                <rect
                  width="50"
                  height="50"
                  rx="6"
                  fill={
                    isTargetFound
                      ? '#065f46'
                      : isMid
                      ? '#1e3a8a'
                      : isDiscarded
                      ? '#0a0f1d'
                      : inActiveRange
                      ? '#0f172a'
                      : '#0a0f1d'
                  }
                  stroke={
                    isTargetFound
                      ? '#34d399'
                      : isMid
                      ? '#38bdf8'
                      : isDiscarded
                      ? '#1e293b'
                      : inActiveRange
                      ? '#334155'
                      : '#1e293b'
                  }
                  strokeWidth={isMid || isTargetFound ? 2.5 : 1}
                  opacity={isDiscarded ? 0.35 : 1}
                />

                {/* Number inside */}
                <text
                  x="25"
                  y="30"
                  textAnchor="middle"
                  fill={isTargetFound ? '#6ee7b7' : isMid ? '#ffffff' : isDiscarded ? '#475569' : '#f1f5f9'}
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {val}
                </text>

                {/* Pointer indicator tags below */}
                {idx === 0 && (
                  <g transform="translate(25, 62)">
                    <text textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="700">
                      ▲ Low
                    </text>
                  </g>
                )}

                {isMid && (
                  <g transform="translate(25, 76)">
                    <text textAnchor="middle" fill={isTargetFound ? '#34d399' : '#38bdf8'} fontSize="9" fontWeight="800">
                      ▲ Mid {isTargetFound ? '(Match!)' : ''}
                    </text>
                  </g>
                )}

                {idx === (step >= 2 ? 5 : 10) && (
                  <g transform="translate(25, 62)">
                    <text textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="700">
                      ▲ High
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Step Explanation Callout within SVG */}
        <g transform="translate(30, 240)">
          <rect width="620" height="70" rx="8" fill="#0b132b" stroke="#1e293b" strokeWidth="1" />
          <text x="20" y="26" fill="#38bdf8" fontSize="11" fontWeight="700">
            {step === 1 && 'Step 1: Compute Mid = floor((0 + 10) / 2) = 5. Array[5] is 23.'}
            {step === 2 && 'Step 2: Compare 23 === Target (23). Target found on first midpoint comparison!'}
            {step === 3 && 'Step 3: Discard unused partition [38, 45, 56, 72, 91]. Only active interval inspected.'}
            {step >= 4 && 'Step 4: Algorithm terminates successfully returning index 5 in O(1) step.'}
          </text>
          <text x="20" y="48" fill="#94a3b8" fontSize="9.5">
            Logarithmic scaling guarantee: Even with 1,000,000 sorted elements, binary search requires at most 20 comparisons.
          </text>
        </g>
      </svg>
    </div>
  );
};
