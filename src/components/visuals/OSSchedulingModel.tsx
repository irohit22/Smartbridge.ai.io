import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const OSSchedulingModel: React.FC<ModelProps> = ({ step }) => {
  return (
    <div className="visual-model-canvas-wrapper os-scheduling-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="OS CPU Scheduling and Gantt Chart Diagram"
      >
        <rect width="680" height="340" fill="#090c1d" rx="12" />

        <text x="340" y="28" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          OS CPU SCHEDULING (ROUND ROBIN TIME QUANTUM = 2ms)
        </text>

        {/* 1. Ready Queue Container */}
        <g transform="translate(40, 50)">
          <rect width="260" height="120" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <text x="130" y="24" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700">
            KERNEL READY QUEUE (FIFO)
          </text>

          {/* Processes */}
          <g transform="translate(15, 42)">
            {[
              { id: 'P1', burst: '6ms', remaining: step >= 2 ? '4ms' : '6ms', active: step === 2 },
              { id: 'P2', burst: '3ms', remaining: step >= 3 ? '1ms' : '3ms', active: step === 3 },
              { id: 'P3', burst: '4ms', remaining: '4ms', active: false }
            ].map((p, idx) => (
              <g key={p.id} transform={`translate(${idx * 78}, 0)`}>
                <rect
                  width="70"
                  height="55"
                  rx="6"
                  fill={p.active ? '#1e3a8a' : '#0b1329'}
                  stroke={p.active ? '#38bdf8' : '#1e293b'}
                  strokeWidth={p.active ? 2 : 1}
                />
                <text x="35" y="20" textAnchor="middle" fill={p.active ? '#ffffff' : '#f8fafc'} fontSize="11" fontWeight="700">
                  {p.id}
                </text>
                <text x="35" y="36" textAnchor="middle" fill="#94a3b8" fontSize="8.5">
                  Rem: {p.remaining}
                </text>
              </g>
            ))}
          </g>
        </g>

        {/* Dispatch Arrow */}
        <g transform="translate(310, 110)">
          <line x1="0" y1="0" x2="60" y2="0" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow)" />
          <text x="30" y="-8" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="700">
            Dispatch
          </text>
        </g>

        {/* 2. CPU Core */}
        <g transform="translate(380, 50)">
          <rect
            width="260"
            height="120"
            rx="8"
            fill="#1e1b4b"
            stroke="#6366f1"
            strokeWidth={1.5}
          />
          <text x="130" y="24" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="700">
            ACTIVE CPU CORE
          </text>

          <g transform="translate(45, 40)">
            <rect
              width="170"
              height="60"
              rx="6"
              fill={step >= 2 ? '#312e81' : '#0f172a'}
              stroke={step >= 2 ? '#818cf8' : '#334155'}
              strokeWidth="1.5"
            />
            <text x="85" y="26" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="800">
              {step === 2 ? 'Executing: P1' : step === 3 ? 'Executing: P2' : step >= 4 ? 'Executing: P3' : 'Core Ready'}
            </text>
            <text x="85" y="44" textAnchor="middle" fill="#a5b4fc" fontSize="9">
              Time Quantum: 2ms Slice
            </text>
          </g>
        </g>

        {/* 3. Gantt Chart Timeline (Bottom) */}
        <g transform="translate(40, 200)">
          <rect width="600" height="110" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <text x="20" y="24" fill="#94a3b8" fontSize="10" fontWeight="700">
            EXECUTION TIMELINE (GANTT CHART)
          </text>

          {/* Time Slices */}
          <g transform="translate(20, 40)">
            {/* 0 - 2ms: P1 */}
            <g transform="translate(0, 0)">
              <rect width="130" height="36" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text x="65" y="22" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                P1 (Slice 1)
              </text>
              <text x="0" y="50" fill="#64748b" fontSize="9" fontFamily="monospace">
                0ms
              </text>
              <text x="130" y="50" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                2ms
              </text>
            </g>

            {/* 2 - 4ms: P2 */}
            <g transform="translate(135, 0)">
              <rect
                width="130"
                height="36"
                rx="4"
                fill={step >= 3 ? '#4f46e5' : '#0b1329'}
                stroke={step >= 3 ? '#818cf8' : '#1e293b'}
                strokeWidth="1"
              />
              <text x="65" y="22" textAnchor="middle" fill={step >= 3 ? '#ffffff' : '#64748b'} fontSize="11" fontWeight="700">
                P2 (Slice 1)
              </text>
              <text x="130" y="50" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                4ms
              </text>
            </g>

            {/* 4 - 6ms: P3 */}
            <g transform="translate(270, 0)">
              <rect
                width="130"
                height="36"
                rx="4"
                fill={step >= 4 ? '#059669' : '#0b1329'}
                stroke={step >= 4 ? '#34d399' : '#1e293b'}
                strokeWidth="1"
              />
              <text x="65" y="22" textAnchor="middle" fill={step >= 4 ? '#ffffff' : '#64748b'} fontSize="11" fontWeight="700">
                P3 (Slice 1)
              </text>
              <text x="130" y="50" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                6ms
              </text>
            </g>

            {/* 6 - 8ms: P1 Round 2 */}
            <g transform="translate(405, 0)">
              <rect width="130" height="36" rx="4" fill="#0b1329" stroke="#1e293b" strokeWidth="1" />
              <text x="65" y="22" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
                P1 (Slice 2)
              </text>
              <text x="130" y="50" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                8ms
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
