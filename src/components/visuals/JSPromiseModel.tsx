import React from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

export const JSPromiseModel: React.FC<ModelProps> = ({ step }) => {
  return (
    <div className="visual-model-canvas-wrapper promise-model-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="JavaScript Promise Lifecycle and Microtask Diagram"
      >
        <rect width="680" height="340" fill="#070a1a" rx="12" />

        <text x="340" y="28" textAnchor="middle" fill="#facc15" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          JAVASCRIPT PROMISE LIFECYCLE & MICROTASK EVENT LOOP
        </text>

        {/* State 1: PENDING */}
        <g transform="translate(60, 90)">
          <rect
            width="140"
            height="80"
            rx="8"
            fill={step === 1 ? '#451a03' : '#1e1b18'}
            stroke={step === 1 ? '#f59e0b' : '#334155'}
            strokeWidth={step === 1 ? 2.5 : 1}
          />
          <text x="70" y="32" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="700">
            PENDING
          </text>
          <text x="70" y="52" textAnchor="middle" fill="#94a3b8" fontSize="9">
            Initial State
          </text>
          <text x="70" y="66" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">
            result: undefined
          </text>
        </g>

        {/* Transition Arrows */}
        <path d="M 200 115 L 280 85" fill="none" stroke={step >= 2 ? '#34d399' : '#334155'} strokeWidth="2.5" />
        <path d="M 200 145 L 280 175" fill="none" stroke={step >= 2 ? '#f43f5e' : '#334155'} strokeWidth="1.5" strokeDasharray="3 3" />

        {/* State 2A: FULFILLED */}
        <g transform="translate(280, 50)">
          <rect
            width="150"
            height="75"
            rx="8"
            fill={step >= 2 ? '#064e3b' : '#0f172a'}
            stroke={step >= 2 ? '#10b981' : '#334155'}
            strokeWidth={step >= 2 ? 2.5 : 1}
          />
          <text x="75" y="28" textAnchor="middle" fill="#a7f3d0" fontSize="12" fontWeight="700">
            FULFILLED (Resolved)
          </text>
          <text x="75" y="46" textAnchor="middle" fill="#6ee7b7" fontSize="9">
            .then(onFulfilled)
          </text>
          <text x="75" y="62" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">
            result: ResponseData
          </text>
        </g>

        {/* State 2B: REJECTED */}
        <g transform="translate(280, 145)">
          <rect width="150" height="65" rx="8" fill="#1e131d" stroke="#4c0519" strokeWidth="1" />
          <text x="75" y="26" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">
            REJECTED
          </text>
          <text x="75" y="44" textAnchor="middle" fill="#94a3b8" fontSize="8.5">
            .catch(onRejected)
          </text>
        </g>

        {/* Transition to Microtask Queue */}
        <path d="M 430 87 L 500 87" fill="none" stroke={step >= 3 ? '#38bdf8' : '#334155'} strokeWidth="3" />

        {/* State 3: MICROTASK QUEUE */}
        <g transform="translate(500, 50)">
          <rect
            width="150"
            height="160"
            rx="8"
            fill={step >= 3 ? '#0c2340' : '#09101d'}
            stroke={step >= 3 ? '#38bdf8' : '#1e293b'}
            strokeWidth={step >= 3 ? 2 : 1}
          />
          <text x="75" y="24" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">
            MICROTASK QUEUE
          </text>
          <text x="75" y="38" textAnchor="middle" fill="#38bdf8" fontSize="8">
            Priority Drain Phase
          </text>

          <g transform="translate(10, 50)">
            <rect
              width="130"
              height="28"
              rx="4"
              fill={step === 3 ? '#1e3a8a' : '#0f172a'}
              stroke={step === 3 ? '#60a5fa' : '#334155'}
            />
            <text x="65" y="18" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace">
              Promise Callback
            </text>
          </g>

          <g transform="translate(10, 85)">
            <rect width="130" height="28" rx="4" fill="#0f172a" stroke="#1e293b" />
            <text x="65" y="18" textAnchor="middle" fill="#64748b" fontSize="8.5" fontFamily="monospace">
              queueMicrotask()
            </text>
          </g>

          <g transform="translate(10, 120)">
            <rect width="130" height="28" rx="4" fill="#0f172a" stroke="#1e293b" />
            <text x="65" y="18" textAnchor="middle" fill="#64748b" fontSize="8.5" fontFamily="monospace">
              MutationObserver
            </text>
          </g>
        </g>

        {/* Lower Call Stack & Event Loop Box */}
        <g transform="translate(60, 235)">
          <rect
            width="590"
            height="75"
            rx="8"
            fill={step === 4 ? '#172554' : '#0b1329'}
            stroke={step === 4 ? '#38bdf8' : '#1e293b'}
            strokeWidth={step === 4 ? 2 : 1}
          />
          <text x="24" y="26" fill="#38bdf8" fontSize="11" fontWeight="700">
            EVENT LOOP EXECUTION ORDER
          </text>
          <text x="24" y="46" fill="#f8fafc" fontSize="10">
            1. Synchronous Call Stack clears ➜ 2. Drain <strong>ALL Microtasks</strong> entirely ➜ 3. UI Repaint ➜ 4. Macrotask (setTimeout)
          </text>
          <text x="24" y="62" fill="#94a3b8" fontSize="8.5">
            Key Interview Takeaway: Promises always resolve before `setTimeout(..., 0)` because microtasks preempt macrotasks.
          </text>
        </g>
      </svg>
    </div>
  );
};
