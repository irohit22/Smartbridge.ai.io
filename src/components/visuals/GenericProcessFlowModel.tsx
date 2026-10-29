import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const GenericProcessFlowModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const dur = `${2 / speed}s`;

  const stages = [
    { title: '1. Input & Ingestion', subtitle: 'Raw telemetry & payload', active: step >= 1 },
    { title: '2. Transformation', subtitle: 'Core operational pipeline', active: step >= 2 },
    { title: '3. Invariant Check', subtitle: 'Boundary & schema audit', active: step >= 3 },
    { title: '4. Output Deliverable', subtitle: 'Stabilized final artifact', active: step >= 4 }
  ];

  return (
    <div className="visual-model-canvas-wrapper generic-flow-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="Sequential Process Flow Diagram"
      >
        <rect width="680" height="340" fill="#080c1d" rx="12" />

        <text x="340" y="32" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          EDUCATIONAL PROCESS ARCHITECTURE & PIPELINE
        </text>

        {/* Stages Progression */}
        <g transform="translate(40, 90)">
          {stages.map((stage, idx) => {
            const isCur = step === idx + 1;
            return (
              <g key={idx} transform={`translate(${idx * 155}, 0)`}>
                {/* Node Box */}
                <rect
                  width="135"
                  height="120"
                  rx="8"
                  fill={isCur ? '#1e3a8a' : stage.active ? '#0f172a' : '#070a16'}
                  stroke={isCur ? '#38bdf8' : stage.active ? '#3b82f6' : '#1e293b'}
                  strokeWidth={isCur ? 2.5 : 1}
                />

                {/* Step Circle Badge */}
                <circle
                  cx="67"
                  cy="35"
                  r="18"
                  fill={isCur ? '#0284c7' : stage.active ? '#1e293b' : '#0f172a'}
                  stroke={isCur ? '#ffffff' : '#475569'}
                  strokeWidth="1.5"
                />
                <text x="67" y="40" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">
                  {idx + 1}
                </text>

                {/* Title */}
                <text x="67" y="78" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontWeight="700">
                  {stage.title.slice(3)}
                </text>
                <text x="67" y="96" textAnchor="middle" fill="#94a3b8" fontSize="8.5">
                  {stage.subtitle}
                </text>

                {/* Connector Arrow to next stage */}
                {idx < stages.length - 1 && (
                  <g transform="translate(135, 60)">
                    <line
                      x1="4"
                      y1="0"
                      x2="16"
                      y2="0"
                      stroke={step > idx + 1 ? '#38bdf8' : '#334155'}
                      strokeWidth="3"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Pulse particle moving between stages */}
        {isPlaying && (
          <circle r="4" fill="#38bdf8">
            <animateMotion
              path="M 107 150 L 262 150 L 417 150 L 572 150"
              dur={dur}
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Status bar */}
        <g transform="translate(40, 250)">
          <rect width="600" height="60" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <text x="24" y="24" fill="#38bdf8" fontSize="11" fontWeight="700">
            Active Phase: Step {step} of 4
          </text>
          <text x="24" y="44" fill="#cbd5e1" fontSize="10">
            {step === 1 && 'Ingestion phase: Parameters and preconditions evaluated.'}
            {step === 2 && 'Transformation phase: Algorithms process input transitions.'}
            {step === 3 && 'Verification phase: Ensuring state invariance and output safety.'}
            {step >= 4 && 'Delivery phase: Completed pipeline artifact produced successfully.'}
          </text>
        </g>
      </svg>
    </div>
  );
};
