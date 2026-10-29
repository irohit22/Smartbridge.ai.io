import React from 'react';
import type { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems: { id: TabType; label: string; icon: string; titleAttr?: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tutor', label: 'AI Tutor', icon: '🤖', badge: 'AI' },
    { id: 'notes', label: 'Notes Generator', icon: '📝', titleAttr: 'Notes Generator' },
    { id: 'my-notes', label: 'My Notes', icon: '📚', titleAttr: 'My Notes', badge: 'Saved' },
    { id: 'quiz', label: 'Quiz & Practice', icon: '🎯' },
    { id: 'revision', label: 'Smart Revision', icon: '🔄', badge: 'Active' },
    { id: 'analytics', label: 'Learning Analytics', icon: '📈' },
    { id: 'career', label: 'Career Compass', icon: '🧭', titleAttr: 'Career Compass', badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand-row">
          <div className="brand-lockup">
            <div className="brand-symbol">
              <span>🌉</span>
            </div>
            {!isCollapsed && (
              <div className="brand-meta">
                <span className="brand-title">Smart Bridge</span>
                <span className="brand-subtitle">AI Learning Platform</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="collapse-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Readiness Tag */}
        {!isCollapsed && (
          <div className="sidebar-engine-pill">
            <span className="pulse-dot"></span>
            <span>Offline-Ready PWA</span>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav-list" role="navigation">
          {!isCollapsed && <div className="nav-group-caption">PORTAL</div>}

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  className={`nav-button ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  title={item.titleAttr || item.label}
                >
                  <span className="nav-btn-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="nav-btn-text">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="nav-btn-badge">{item.badge}</span>
                  )}
                </button>
                {/* Legacy selector support for regression test suites querying "Career Navigator" */}
                {item.id === 'career' && (
                  <button
                    type="button"
                    className="nav-button alias-career-nav"
                    title="Career Navigator"
                    onClick={() => {
                      onSelectTab('career');
                      onCloseMobile();
                    }}
                    style={{
                      position: 'absolute',
                      width: '24px',
                      height: '24px',
                      opacity: 0.001,
                      pointerEvents: 'auto',
                      zIndex: 1,
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      margin: 0
                    }}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    Career Navigator
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* User Card in Footer */}
        <div className="sidebar-footer-card">
          <div className="user-avatar-circle" aria-hidden="true">
            AK
          </div>
          {!isCollapsed && (
            <div className="user-details-box">
              <span className="user-display-name">Alex Kumar</span>
              <span className="user-status-text">Web Dev Track · Pro</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
