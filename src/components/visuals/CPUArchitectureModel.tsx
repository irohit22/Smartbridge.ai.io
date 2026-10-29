import React from 'react';

interface ModelProps {
  step: number; // 1-based index (1, 2, 3, 4)
  isPlaying: boolean;
  speed: number;
}

export const CPUArchitectureModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const animDuration = `${2 / speed}s`;

  // Determine active highlights per step
  const isRamActive = step === 1 || step === 4;
  const isAddressBusActive = step === 1;
  const isDataBusActive = step === 1 || step === 4;
  const isCuActive = step === 2;
  const isIrActive = step === 1 || step === 2;
  const isAluActive = step === 3;
  const isRegistersActive = step === 3 || step === 4;
  const isPcActive = step === 1 || step === 4;

  return (
    <div className="visual-model-canvas-wrapper cpu-model-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="CPU Architecture Schematic Diagram"
      >
        <defs>
          <linearGradient id="cpuBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1739" />
            <stop offset="100%" stopColor="#070c24" />
          </linearGradient>
          <linearGradient id="ramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Background Grid */}
        <rect width="680" height="340" fill="#040714" rx="12" />
        <g opacity="0.1" stroke="#38bdf8" strokeWidth="0.5">
          <line x1="0" y1="85" x2="680" y2="85" />
          <line x1="0" y1="170" x2="680" y2="170" />
          <line x1="0" y1="255" x2="680" y2="255" />
          <line x1="170" y1="0" x2="170" y2="340" />
          <line x1="340" y1="0" x2="340" y2="340" />
          <line x1="510" y1="0" x2="510" y2="340" />
        </g>

        {/* ================================================================ */}
        {/* RAM MODULE (Left) */}
        {/* ================================================================ */}
        <g transform="translate(30, 45)">
          <rect
            width="140"
            height="250"
            rx="8"
            fill="url(#ramGrad)"
            stroke={isRamActive ? '#38bdf8' : '#334155'}
            strokeWidth={isRamActive ? 2 : 1}
            filter={isRamActive ? 'url(#glowEffect)' : undefined}
          />
          <text x="70" y="28" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
            PRIMARY RAM
          </text>
          <text x="70" y="44" textAnchor="middle" fill="#94a3b8" fontSize="10">
            Address Space: 64 KB
          </text>

          {/* Memory Cells */}
          {[
            { addr: '0x0010', val: 'LOAD R1, [0x40]', active: step === 1 },
            { addr: '0x0014', val: 'ADD R1, R2', active: step === 2 },
            { addr: '0x0018', val: 'STORE R1, [0x44]', active: step === 4 },
            { addr: '0x001C', val: 'HALT', active: false },
            { addr: '0x0040', val: '0x00000017 (23)', active: step === 1 },
            { addr: '0x0044', val: '0x0000002A (42)', active: step === 4 }
          ].map((cell, idx) => (
            <g key={idx} transform={`translate(10, ${58 + idx * 30})`}>
              <rect
                width="120"
                height="24"
                rx="4"
                fill={cell.active ? '#1e3a5f' : '#0b1329'}
                stroke={cell.active ? '#38bdf8' : '#1e293b'}
                strokeWidth="1"
              />
              <text x="6" y="16" fill={cell.active ? '#38bdf8' : '#64748b'} fontSize="9" fontFamily="monospace">
                {cell.addr}
              </text>
              <text x="114" y="16" textAnchor="end" fill={cell.active ? '#f8fafc' : '#94a3b8'} fontSize="8.5" fontFamily="monospace">
                {cell.val.slice(0, 14)}
              </text>
            </g>
          ))}
        </g>

        {/* ================================================================ */}
        {/* SYSTEM BUS CHANNELS (Center connectors) */}
        {/* ================================================================ */}
        {/* Address Bus */}
        <g>
          <line
            x1="170"
            y1="85"
            x2="280"
            y2="85"
            stroke={isAddressBusActive ? '#f59e0b' : '#334155'}
            strokeWidth="4"
            strokeDasharray="6 3"
          />
          <text x="225" y="77" textAnchor="middle" fill={isAddressBusActive ? '#fbbf24' : '#64748b'} fontSize="9" fontWeight="600">
            Address Bus (16-bit)
          </text>
          {isAddressBusActive && isPlaying && (
            <circle cx="225" cy="85" r="5" fill="#f59e0b">
              <animate attributeName="cx" from="280" to="170" dur={animDuration} repeatCount="indefinite" />
            </circle>
          )}
        </g>

        {/* Data Bus */}
        <g>
          <line
            x1="170"
            y1="170"
            x2="280"
            y2="170"
            stroke={isDataBusActive ? '#38bdf8' : '#334155'}
            strokeWidth="5"
            strokeDasharray="8 4"
          />
          <text x="225" y="162" textAnchor="middle" fill={isDataBusActive ? '#38bdf8' : '#64748b'} fontSize="9" fontWeight="600">
            Data Bus (Bi-directional 64-bit)
          </text>
          {isDataBusActive && isPlaying && (
            <circle cx="225" cy="170" r="5" fill="#38bdf8">
              <animate
                attributeName="cx"
                from={step === 4 ? "280" : "170"}
                to={step === 4 ? "170" : "280"}
                dur={animDuration}
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>

        {/* Control Bus */}
        <g>
          <line
            x1="170"
            y1="255"
            x2="280"
            y2="255"
            stroke={isCuActive ? '#a855f7' : '#334155'}
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          <text x="225" y="247" textAnchor="middle" fill={isCuActive ? '#c084fc' : '#64748b'} fontSize="9" fontWeight="600">
            Control Bus (Read/Write Lines)
          </text>
        </g>

        {/* ================================================================ */}
        {/* CPU CHIP CORE (Right) */}
        {/* ================================================================ */}
        <g transform="translate(280, 30)">
          {/* CPU Outer Case */}
          <rect
            width="370"
            height="280"
            rx="12"
            fill="url(#cpuBgGrad)"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
          <text x="25" y="24" fill="#a5b4fc" fontSize="12" fontWeight="700" letterSpacing="0.05em">
            CENTRAL PROCESSING UNIT (CPU)
          </text>
          <rect x="290" y="10" width="65" height="18" rx="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="0.8" />
          <text x="322" y="22" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="600">
            Clock: 2.4 GHz
          </text>

          {/* Control Unit */}
          <g transform="translate(20, 38)">
            <rect
              width="155"
              height="100"
              rx="6"
              fill={isCuActive ? '#2e1065' : '#0f172a'}
              stroke={isCuActive ? '#c084fc' : '#334155'}
              strokeWidth={isCuActive ? 2 : 1}
              filter={isCuActive ? 'url(#glowEffect)' : undefined}
            />
            <text x="77" y="22" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
              CONTROL UNIT (CU)
            </text>
            <text x="77" y="38" textAnchor="middle" fill="#94a3b8" fontSize="8.5">
              Instruction Decoder & Sequencer
            </text>

            {/* Instruction Register inside CU */}
            <rect
              x="12"
              y="50"
              width="131"
              height="36"
              rx="4"
              fill={isIrActive ? '#1e1b4b' : '#070b19'}
              stroke={isIrActive ? '#a855f7' : '#1e293b'}
            />
            <text x="77" y="65" textAnchor="middle" fill={isIrActive ? '#e9d5ff' : '#64748b'} fontSize="9" fontWeight="600">
              Instruction Register (IR)
            </text>
            <text x="77" y="78" textAnchor="middle" fill={isIrActive ? '#38bdf8' : '#475569'} fontSize="8" fontFamily="monospace">
              {step >= 2 ? 'OPCODE: ADD_R1_R2' : 'FETCHING...'}
            </text>
          </g>

          {/* ALU (Arithmetic Logic Unit) */}
          <g transform="translate(195, 38)">
            <path
              d="M 10 0 L 145 0 L 130 50 L 145 100 L 10 100 L 25 50 Z"
              fill={isAluActive ? '#064e3b' : '#0f172a'}
              stroke={isAluActive ? '#34d399' : '#334155'}
              strokeWidth={isAluActive ? 2 : 1}
              filter={isAluActive ? 'url(#glowEffect)' : undefined}
            />
            <text x="77" y="36" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
              ALU
            </text>
            <text x="77" y="52" textAnchor="middle" fill="#94a3b8" fontSize="8">
              Arithmetic & Logic
            </text>
            <text x="77" y="72" textAnchor="middle" fill={isAluActive ? '#6ee7b7' : '#64748b'} fontSize="10" fontWeight="700" fontFamily="monospace">
              {step === 3 ? '23 + 19 = 42' : 'IDLE'}
            </text>
          </g>

          {/* Internal CPU Bus */}
          <line x1="20" y1="152" x2="350" y2="152" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />

          {/* Registers Bank (Bottom) */}
          <g transform="translate(20, 165)">
            <rect
              width="330"
              height="95"
              rx="6"
              fill="#0f172a"
              stroke={isRegistersActive ? '#38bdf8' : '#334155'}
              strokeWidth={isRegistersActive ? 1.5 : 1}
            />
            <text x="16" y="20" fill="#f8fafc" fontSize="10" fontWeight="700">
              REGISTER FILE & SPECIAL REGISTERS
            </text>

            <g transform="translate(14, 30)">
              {/* Program Counter */}
              <g transform="translate(0, 0)">
                <rect
                  width="70"
                  height="48"
                  rx="4"
                  fill={isPcActive ? '#1e3a5f' : '#090e24'}
                  stroke={isPcActive ? '#38bdf8' : '#1e293b'}
                />
                <text x="35" y="16" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600">
                  PC (Counter)
                </text>
                <text x="35" y="34" textAnchor="middle" fill={isPcActive ? '#38bdf8' : '#cbd5e1'} fontSize="10" fontFamily="monospace" fontWeight="700">
                  {step === 4 ? '0x0018' : '0x0014'}
                </text>
              </g>

              {/* General Register R1 */}
              <g transform="translate(76, 0)">
                <rect
                  width="70"
                  height="48"
                  rx="4"
                  fill={isRegistersActive ? '#1e3a5f' : '#090e24'}
                  stroke={isRegistersActive ? '#38bdf8' : '#1e293b'}
                />
                <text x="35" y="16" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600">
                  Reg R1
                </text>
                <text x="35" y="34" textAnchor="middle" fill={isRegistersActive ? '#38bdf8' : '#cbd5e1'} fontSize="10" fontFamily="monospace" fontWeight="700">
                  {step >= 3 ? '42' : '23'}
                </text>
              </g>

              {/* General Register R2 */}
              <g transform="translate(152, 0)">
                <rect width="70" height="48" rx="4" fill="#090e24" stroke="#1e293b" />
                <text x="35" y="16" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600">
                  Reg R2
                </text>
                <text x="35" y="34" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="700">
                  19
                </text>
              </g>

              {/* Accumulator ACC */}
              <g transform="translate(228, 0)">
                <rect
                  width="74"
                  height="48"
                  rx="4"
                  fill={isRegistersActive ? '#1e3a5f' : '#090e24'}
                  stroke={isRegistersActive ? '#38bdf8' : '#1e293b'}
                />
                <text x="37" y="16" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600">
                  Accumulator
                </text>
                <text x="37" y="34" textAnchor="middle" fill={isRegistersActive ? '#34d399' : '#cbd5e1'} fontSize="10" fontFamily="monospace" fontWeight="700">
                  {step >= 3 ? '0x002A' : '0x0017'}
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
