import React from 'react';
import type { TabType } from '../types';

interface AnalyticsViewProps {
  onNavigate: (tab: TabType) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate }) => {
  const skillsData = [
    { name: 'HTML5 Semantics & Accessibility (WCAG 2.1)', mastery: 92, status: 'Mastered' },
    { name: 'Responsive CSS Grid & Flexbox Layouts', mastery: 85, status: 'Proficient' },
    { name: 'React 19 State, Hooks & Reconciliation', mastery: 74, status: 'Practicing' },
    { name: 'Asynchronous JavaScript & Event Loop', mastery: 65, status: 'Needs Review' },
    { name: 'SQL Joins, Aggregations & Query Plans', mastery: 58, status: 'Needs Focus' }
  ];

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header-row">
        <div>
          <span className="eyebrow">METRICS & RETENTION</span>
          <h1 className="view-main-title">Learning Analytics</h1>
          <p className="view-desc">
            Granular benchmark proficiencies across software engineering domains, cognitive retention, and study velocity.
          </p>
        </div>

        <span className="status-pill status-online">
          ● Target: 100% Industry Benchmark
        </span>
      </div>

      {/* Two-Column Grid */}
      <div className="dashboard-columns-split">
        {/* Mastery Breakdown */}
        <div className="content-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">📈 Topic Mastery Breakdown</h2>
              <p className="card-subtitle">
                Automated calculation based on quiz accuracy and recall frequency
              </p>
            </div>
          </div>

          <div className="mastery-bars-stack">
            {skillsData.map((skill) => {
              let barColorClass = 'fill-emerald';
              if (skill.mastery < 70 && skill.mastery >= 60) barColorClass = 'fill-amber';
              if (skill.mastery < 60) barColorClass = 'fill-rose';

              return (
                <div key={skill.name} className="mastery-item-row">
                  <div className="mastery-item-meta">
                    <strong className="mastery-skill-name">{skill.name}</strong>
                    <span className="mastery-skill-status">
                      {skill.mastery}% · {skill.status}
                    </span>
                  </div>
                  <div className="mastery-rail">
                    <div
                      className={`mastery-fill ${barColorClass}`}
                      style={{ width: `${skill.mastery}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Knowledge Gap Card */}
        <div className="content-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">⚠️ Priority Knowledge Gaps</h2>
              <span className="badge-subtle">Recommended Action</span>
            </div>
          </div>

          <div className="weak-focus-banner">
            <div className="weak-focus-header">
              <span className="tag-warning">Low Confidence (58%)</span>
              <strong className="weak-topic-title">
                SQL Joins, Aggregations & Query Execution Plans
              </strong>
            </div>
            <p className="weak-topic-desc">
              Your recent diagnostic checks flagged minor confusion between `WHERE` vs `HAVING` and `LEFT JOIN` null handling. Closing this gap will elevate your database competency into the top tier.
            </p>

            <div className="weak-actions-row">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('quiz')}
              >
                Take Targeted Quiz →
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('notes')}
              >
                Synthesize SQL Cheatsheet 📝
              </button>
            </div>
          </div>

          <div className="study-velocity-box">
            <h3 className="velocity-title">⏱️ Study Velocity</h3>
            <p className="velocity-desc">
              You averaged <strong>2.3 hours/day</strong> over the last 14 days with zero missed days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
