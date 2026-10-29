import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const NeuralNetworkModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const dur = `${2 / speed}s`;

  // Network topology: 3 -> 4 -> 4 -> 2
  const layers = [
    { name: 'Input', nodes: [100, 170, 240], x: 80, stepActive: 1 },
    { name: 'Hidden 1', nodes: [70, 135, 205, 270], x: 240, stepActive: 2 },
    { name: 'Hidden 2', nodes: [70, 135, 205, 270], x: 420, stepActive: 3 },
    { name: 'Output', nodes: [135, 205], x: 580, stepActive: 4 }
  ];

  return (
    <div className="visual-model-canvas-wrapper neural-net-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="Deep Neural Network Multilayer Perceptron Diagram"
      >
        <defs>
          <linearGradient id="synapsePulse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        <rect width="680" height="340" fill="#060919" rx="12" />

        <text x="340" y="28" textAnchor="middle" fill="#818cf8" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          DEEP NEURAL NETWORK FORWARD PROPAGATION
        </text>

        {/* Synaptic Interconnections */}
        <g opacity="0.6">
          {/* Layer 1 -> Layer 2 */}
          {layers[0].nodes.map((y1, i) =>
            layers[1].nodes.map((y2, j) => {
              const active = step >= 2;
              return (
                <line
                  key={`l1-${i}-${j}`}
                  x1={layers[0].x}
                  y1={y1}
                  x2={layers[1].x}
                  y2={y2}
                  stroke={active ? '#38bdf8' : '#1e293b'}
                  strokeWidth={active ? 1.4 : 0.6}
                  strokeOpacity={active ? 0.8 : 0.3}
                />
              );
            })
          )}

          {/* Layer 2 -> Layer 3 */}
          {layers[1].nodes.map((y1, i) =>
            layers[2].nodes.map((y2, j) => {
              const active = step >= 3;
              return (
                <line
                  key={`l2-${i}-${j}`}
                  x1={layers[1].x}
                  y1={y1}
                  x2={layers[2].x}
                  y2={y2}
                  stroke={active ? '#818cf8' : '#1e293b'}
                  strokeWidth={active ? 1.4 : 0.6}
                  strokeOpacity={active ? 0.8 : 0.3}
                />
              );
            })
          )}

          {/* Layer 3 -> Layer 4 */}
          {layers[2].nodes.map((y1, i) =>
            layers[3].nodes.map((y2, j) => {
              const active = step >= 4;
              return (
                <line
                  key={`l3-${i}-${j}`}
                  x1={layers[2].x}
                  y1={y1}
                  x2={layers[3].x}
                  y2={y2}
                  stroke={active ? '#c084fc' : '#1e293b'}
                  strokeWidth={active ? 1.6 : 0.6}
                  strokeOpacity={active ? 0.9 : 0.3}
                />
              );
            })
          )}
        </g>

        {/* Dynamic Forward Signal Pulse Animation */}
        {isPlaying && (
          <g>
            <circle r="4" fill="#38bdf8">
              <animateMotion
                path={`M ${layers[0].x} ${layers[0].nodes[1]} L ${layers[1].x} ${layers[1].nodes[2]} L ${layers[2].x} ${layers[2].nodes[1]} L ${layers[3].x} ${layers[3].nodes[0]}`}
                dur={dur}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {/* Neurons by Layer */}
        {layers.map((layer, lIdx) => {
          const isLayerActive = step === layer.stepActive || (step >= layer.stepActive && lIdx < step);

          return (
            <g key={layer.name}>
              {/* Layer Title */}
              <text
                x={layer.x}
                y="52"
                textAnchor="middle"
                fill={isLayerActive ? '#f8fafc' : '#64748b'}
                fontSize="11"
                fontWeight="700"
              >
                {layer.name}
              </text>

              {layer.nodes.map((y, nIdx) => (
                <g key={nIdx} transform={`translate(${layer.x}, ${y})`}>
                  {/* Glowing halo for active step */}
                  {isLayerActive && (
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
                  )}

                  <circle
                    cx="0"
                    cy="0"
                    r="14"
                    fill={
                      isLayerActive
                        ? lIdx === 3
                          ? '#10b981'
                          : lIdx === 0
                          ? '#0284c7'
                          : '#4f46e5'
                        : '#0f172a'
                    }
                    stroke={isLayerActive ? '#ffffff' : '#334155'}
                    strokeWidth="1.5"
                  />

                  {/* Value / Activation label */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {lIdx === 0
                      ? `x${nIdx + 1}`
                      : lIdx === 3
                      ? nIdx === 0
                        ? '92%'
                        : '8%'
                      : `a${nIdx + 1}`}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* Output labels */}
        <g transform="translate(615, 135)">
          <text x="0" y="4" fill="#34d399" fontSize="10" fontWeight="700">
            Class A (Positive)
          </text>
        </g>
        <g transform="translate(615, 205)">
          <text x="0" y="4" fill="#94a3b8" fontSize="10" fontWeight="600">
            Class B (Negative)
          </text>
        </g>
      </svg>
    </div>
  );
};
