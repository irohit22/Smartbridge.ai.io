import React, { useState } from 'react';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

type JoinType = 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL OUTER JOIN';

export const SQLJoinModel: React.FC<ModelProps> = ({ step }) => {
  // Step mapping:
  // 1: Overview
  // 2: INNER JOIN
  // 3: LEFT JOIN
  // 4: FULL OUTER JOIN
  const joinType: JoinType =
    step === 2 ? 'INNER JOIN' : step === 3 ? 'LEFT JOIN' : step === 4 ? 'FULL OUTER JOIN' : 'INNER JOIN';

  const [selectedJoin, setSelectedJoin] = useState<JoinType>(joinType);
  const activeJoin = step === 1 ? selectedJoin : joinType;

  return (
    <div className="visual-model-canvas-wrapper sql-join-root">
      <svg
        viewBox="0 0 680 340"
        className="visual-model-svg"
        aria-label="SQL Join Venn Diagram and Joined Rows"
      >
        <defs>
          <clipPath id="circleLeftClip">
            <circle cx="160" cy="120" r="70" />
          </clipPath>
          <clipPath id="circleRightClip">
            <circle cx="230" cy="120" r="70" />
          </clipPath>
        </defs>

        <rect width="680" height="340" fill="#090d1f" rx="12" />

        <text x="340" y="26" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700" letterSpacing="0.05em">
          SQL RELATIONAL JOINS: VENN MODEL & RESULT SET
        </text>

        {/* Join Switcher Buttons */}
        <g transform="translate(40, 40)">
          {(['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'] as JoinType[]).map((jt, idx) => {
            const isCur = activeJoin === jt;
            return (
              <g
                key={jt}
                transform={`translate(${idx * 105}, 0)`}
                onClick={() => setSelectedJoin(jt)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width="100"
                  height="22"
                  rx="4"
                  fill={isCur ? '#0284c7' : '#1e293b'}
                  stroke={isCur ? '#38bdf8' : '#334155'}
                  strokeWidth="1"
                />
                <text x="50" y="15" textAnchor="middle" fill={isCur ? '#ffffff' : '#94a3b8'} fontSize="9" fontWeight="700">
                  {jt}
                </text>
              </g>
            );
          })}
        </g>

        {/* ================================================================ */}
        {/* VENN DIAGRAM REGION */}
        {/* ================================================================ */}
        <g transform="translate(10, 40)">
          {/* Base Left Circle A (Table A Users) */}
          <circle
            cx="160"
            cy="120"
            r="70"
            fill={activeJoin === 'LEFT JOIN' || activeJoin === 'FULL OUTER JOIN' ? '#0284c7' : '#0f172a'}
            fillOpacity={activeJoin === 'LEFT JOIN' || activeJoin === 'FULL OUTER JOIN' ? 0.6 : 0.3}
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Base Right Circle B (Table B Orders) */}
          <circle
            cx="230"
            cy="120"
            r="70"
            fill={activeJoin === 'FULL OUTER JOIN' ? '#6366f1' : '#0f172a'}
            fillOpacity={activeJoin === 'FULL OUTER JOIN' ? 0.6 : 0.3}
            stroke="#818cf8"
            strokeWidth="2"
          />

          {/* Intersecting Region (Inner Join) */}
          <circle
            cx="160"
            cy="120"
            r="70"
            clipPath="url(#circleRightClip)"
            fill={activeJoin === 'INNER JOIN' || activeJoin === 'LEFT JOIN' || activeJoin === 'FULL OUTER JOIN' ? '#10b981' : '#0f172a'}
            fillOpacity={0.8}
          />

          {/* Table Labels */}
          <text x="120" y="80" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
            Table A (Users)
          </text>
          <text x="270" y="80" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
            Table B (Orders)
          </text>
          <text x="195" y="125" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
            A ∩ B (Matched)
          </text>
        </g>

        {/* ================================================================ */}
        {/* RESULT TABLE PREVIEW (Right) */}
        {/* ================================================================ */}
        <g transform="translate(370, 70)">
          <rect width="280" height="230" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <text x="16" y="24" fill="#38bdf8" fontSize="11" fontWeight="700">
            Query Result: {activeJoin}
          </text>

          {/* Table Header */}
          <g transform="translate(12, 36)">
            <rect width="256" height="24" rx="4" fill="#1e293b" />
            <text x="10" y="16" fill="#94a3b8" fontSize="9" fontWeight="700">
              User ID
            </text>
            <text x="75" y="16" fill="#94a3b8" fontSize="9" fontWeight="700">
              Name
            </text>
            <text x="145" y="16" fill="#94a3b8" fontSize="9" fontWeight="700">
              Order ID
            </text>
            <text x="210" y="16" fill="#94a3b8" fontSize="9" fontWeight="700">
              Item
            </text>
          </g>

          {/* Table Rows */}
          {[
            { uid: '1', name: 'Alice', oid: '101', item: 'Laptop', inInner: true, inLeft: true, inFull: true },
            { uid: '2', name: 'Bob', oid: '102', item: 'Phone', inInner: true, inLeft: true, inFull: true },
            { uid: '3', name: 'Charlie', oid: 'NULL', item: 'NULL', inInner: false, inLeft: true, inFull: true },
            { uid: 'NULL', name: 'NULL', oid: '103', item: 'Desk', inInner: false, inLeft: false, inFull: true }
          ]
            .filter((row) =>
              activeJoin === 'INNER JOIN' ? row.inInner : activeJoin === 'LEFT JOIN' ? row.inLeft : row.inFull
            )
            .map((row, rIdx) => (
              <g key={rIdx} transform={`translate(12, ${68 + rIdx * 28})`}>
                <rect width="256" height="24" rx="3" fill="#0b1329" stroke="#1e293b" strokeWidth="0.8" />
                <text x="10" y="16" fill="#f8fafc" fontSize="9" fontFamily="monospace">
                  {row.uid}
                </text>
                <text x="75" y="16" fill="#f8fafc" fontSize="9">
                  {row.name}
                </text>
                <text x="145" y="16" fill={row.oid === 'NULL' ? '#f59e0b' : '#34d399'} fontSize="9" fontFamily="monospace">
                  {row.oid}
                </text>
                <text x="210" y="16" fill={row.item === 'NULL' ? '#f59e0b' : '#38bdf8'} fontSize="9">
                  {row.item}
                </text>
              </g>
            ))}
        </g>
      </svg>
    </div>
  );
};
