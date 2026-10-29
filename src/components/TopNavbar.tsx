import React from 'react';
import type { TabType } from '../types';
import { getSkillConfig } from '../utils/skillPersonalization';

interface TopNavbarProps {
  currentTab: TabType;
  onOpenMobileSidebar: () => void;
  onQuickAction: (tab: TabType) => void;
  onShowToast: (msg: string) => void;
  activeSkill?: string;
  onOpenSkillSelector?: () => void;
}

const TAB_TITLES: Record<TabType, string> = {
  dashboard: 'Dashboard Overview',
  tutor: 'AI Learning Assistant',
  notes: 'Notes Generator Studio',
  'my-notes': 'My Saved Notes Library',
  quiz: 'Diagnostic Quiz & Practice',
  revision: 'Active Recall & Smart Revision',
  analytics: 'Learning Progress & Analytics',
  career: 'Career Compass AI & Skill Navigator',
  settings: 'Platform Settings'
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onQuickAction,
  onShowToast,
  activeSkill = 'Python',
  onOpenSkillSelector
}) => {
  const skillConfig = getSkillConfig(activeSkill);

  return (
    <header className="app-topbar" role="banner">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onOpenMobileSidebar}
          aria-label="Open mobile navigation"
        >
          ☰
        </button>

        <div className="topbar-breadcrumb">
          <span className="crumb-root">Smart Bridge</span>
          <span className="crumb-slash">/</span>
          <span className="crumb-current">{TAB_TITLES[currentTab]}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Active Skill Focus Pill */}
        {onOpenSkillSelector && (
          <button
            type="button"
            className="btn-skill-focus"
            onClick={onOpenSkillSelector}
            title="Click to change your primary learning skill"
            aria-label={`Current focus: ${activeSkill}. Click to change.`}
          >
            <span className="skill-focus-icon" aria-hidden="true">{skillConfig.icon}</span>
            <span className="skill-focus-text">Focus: <strong>{activeSkill}</strong></span>
            <span className="skill-focus-change">Change</span>
          </button>
        )}

        {/* Stage 1 Simulation Indicator */}
        <span
          className="status-pill status-demo"
          title="Running in Stage 1 Frontend Simulation Mode with realistic demo data"
        >
          ● Stage 1 Demo
        </span>

        {/* Network Status Pill */}
        <span className="status-pill status-online">● Online Ready</span>

        {/* Quick Action Button */}
        <button
          type="button"
          className="btn-topbar-action"
          onClick={() => {
            onQuickAction('tutor');
            onShowToast('Navigated to AI Learning Assistant');
          }}
        >
          ✨ Ask AI
        </button>

        {/* Profile Avatar */}
        <div
          className="topbar-profile"
          onClick={() => onShowToast('Alex Kumar: Student Profile (Stage 1)')}
          role="button"
          tabIndex={0}
          title="Student Profile"
        >
          <div className="avatar-chip">AK</div>
        </div>
      </div>
    </header>
  );
};
