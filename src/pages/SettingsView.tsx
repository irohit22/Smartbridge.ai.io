import React, { useState } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { getUserSkillProfile, getSkillConfig } from '../utils/skillPersonalization';

interface SettingsViewProps {
  onShowToast: (msg: string) => void;
  onOpenSkillSelector?: () => void;
}

interface UserProfile {
  userName: string;
  userEmail: string;
  language: string;
  offlineSyncInterval: string;
}

const DEFAULT_PROFILE: UserProfile = {
  userName: 'Alex Kumar',
  userEmail: 'alex.kumar@example.com',
  language: 'en',
  offlineSyncInterval: '5'
};

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast, onOpenSkillSelector }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    return storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
  });

  const userSkillProfile = getUserSkillProfile();
  const activeSkillConfig = getSkillConfig(userSkillProfile?.primarySkill);

  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [diagnostics, setDiagnostics] = useState(() => storage.getDiagnostics());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.set(STORAGE_KEYS.USER_PROFILE, profile);
    setIsSaved(true);
    onShowToast('Profile preferences saved to localStorage! 💾');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExecuteClear = () => {
    const result = storage.clearAllSmartBridge();
    setProfile(DEFAULT_PROFILE);
    setDiagnostics(storage.getDiagnostics());
    setShowConfirmClear(false);
    onShowToast(
      `Deleted ${result.deletedCount} SMART BRIDGE storage entries. Other website storage unaffected. 🧹`
    );
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <span className="eyebrow">PREFERENCES</span>
          <h1 className="view-main-title">Platform Settings</h1>
          <p className="view-desc">
            Manage your student profile, offline synchronization triggers, and local interface preferences.
          </p>
        </div>

        <span className="status-pill status-online">
          ● Stage 2: Local Storage Active
        </span>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="content-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">👤 Student Profile</h2>
              <p className="card-subtitle">Saved in browser localStorage</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="settings-form">
            <div className="form-field-full">
              <label htmlFor="user-name" className="form-label">
                Full Name
              </label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                value={profile.userName}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, userName: e.target.value }))
                }
              />
            </div>

            <div className="form-field-full">
              <label htmlFor="user-email" className="form-label">
                Email Address
              </label>
              <input
                id="user-email"
                type="email"
                className="form-input"
                value={profile.userEmail}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, userEmail: e.target.value }))
                }
              />
            </div>

            <div className="form-field-full">
              <label htmlFor="user-lang" className="form-label">
                Preferred Interface Language
              </label>
              <select
                id="user-lang"
                className="form-select"
                value={profile.language}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, language: e.target.value }))
                }
              >
                <option value="en">English (US/UK)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="es">Español (Spanish)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              {isSaved ? '✓ Saved in LocalStorage!' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Skill Focus Profile Card */}
        <div className="content-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">🎯 My Skill & Learning Focus</h2>
              <p className="card-subtitle">Personalized learning track saved in localStorage</p>
            </div>
            <span className="badge-subtle">{activeSkillConfig.category}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{activeSkillConfig.icon}</span>
              <div>
                <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{activeSkillConfig.name}</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>{activeSkillConfig.tagline}</p>
              </div>
            </div>

            <div className="skill-hub-analogy-box">
              <p className="skill-hub-analogy-text">
                💡 <strong>Everyday Analogy:</strong> {activeSkillConfig.everydayAnalogy.english}
              </p>
              <p className="skill-hub-hinglish-text">
                🇮🇳 <strong>Easy Hinglish:</strong> {activeSkillConfig.everydayAnalogy.hinglish}
              </p>
            </div>

            {onOpenSkillSelector && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenSkillSelector}
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                🔄 Change My Skill
              </button>
            )}
          </div>
        </div>

        {/* Offline Engine Diagnostics */}
        <div className="content-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">⚡ Offline Engine & Storage Status</h2>
              <span className="badge-subtle">Diagnostics</span>
            </div>
          </div>

          <div className="diagnostics-list">
            <div className="diag-item">
              <span className="diag-label">PWA Service Worker:</span>
              <span className="diag-value positive">Active (smartbridge-v1.2.0)</span>
            </div>

            <div className="diag-item">
              <span className="diag-label">Browser LocalStorage:</span>
              <span className={`diag-value ${diagnostics.isAvailable ? 'positive' : 'negative'}`}>
                {diagnostics.isAvailable ? 'Active & Persistent' : 'Disabled / Unavailable'}
              </span>
            </div>

            <div className="diag-item">
              <span className="diag-label">Saved Study Notes:</span>
              <span className="diag-value" style={{ fontWeight: 700 }}>
                {diagnostics.notesCount} note{diagnostics.notesCount !== 1 ? 's' : ''} stored
              </span>
            </div>

            <div className="diag-item">
              <span className="diag-label">Saved Quiz Assessments:</span>
              <span className="diag-value" style={{ fontWeight: 700 }}>
                {diagnostics.quizAttemptsCount} attempt{diagnostics.quizAttemptsCount !== 1 ? 's' : ''} stored
              </span>
            </div>

            <div className="diag-item">
              <span className="diag-label">Active Revision Tasks:</span>
              <span className="diag-value" style={{ fontWeight: 700 }}>
                {diagnostics.tasksCount} task{diagnostics.tasksCount !== 1 ? 's' : ''} tracked
              </span>
            </div>

            {diagnostics.corruptedKeysCount > 0 && (
              <div className="diag-item" style={{ color: '#d97706' }}>
                <span className="diag-label">Storage Integrity:</span>
                <span className="diag-value">⚠️ Fallback active ({diagnostics.corruptedKeysCount} corrupted key recovered)</span>
              </div>
            )}

            <div className="form-field-full" style={{ marginTop: '1rem' }}>
              <label htmlFor="sync-interval" className="form-label">
                Background Sync Interval (Minutes)
              </label>
              <select
                id="sync-interval"
                className="form-select"
                value={profile.offlineSyncInterval}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, offlineSyncInterval: e.target.value }))
                }
              >
                <option value="1">Every 1 minute</option>
                <option value="5">Every 5 minutes (Recommended)</option>
                <option value="15">Every 15 minutes</option>
                <option value="manual">Manual Flush Only</option>
              </select>
            </div>

            {/* Clear Storage Section with Explicit Confirmation */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              {!showConfirmClear ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Clear Local Data</strong>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      Removes all SMART BRIDGE stored notes, quizzes, and tasks
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-clear-storage"
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                    onClick={() => setShowConfirmClear(true)}
                  >
                    🗑️ Clear Local Data
                  </button>
                </div>
              ) : (
                <div
                  className="clear-confirmation-box"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#fca5a5'
                  }}
                >
                  <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.35rem', color: '#f87171' }}>
                    ⚠️ Confirm SMART BRIDGE Data Reset
                  </strong>
                  <p style={{ fontSize: '0.82rem', margin: '0 0 0.5rem 0', color: '#fecaca' }}>
                    Are you sure you want to delete your stored data? This action will remove:
                  </p>
                  <ul style={{ margin: '0 0 0.75rem 1.25rem', padding: 0, fontSize: '0.8rem', color: '#fca5a5' }}>
                    <li>All saved custom notes (<code>smartbridge_notes_v1</code>)</li>
                    <li>All past quiz assessment history (<code>smartbridge_quiz_history_v1</code>)</li>
                    <li>Revision task checkmarks (<code>smartbridge_revision_tasks_v1</code>)</li>
                    <li>User profile preferences (<code>smartbridge_user_profile_v1</code>)</li>
                  </ul>
                  <p style={{ fontSize: '0.76rem', color: '#86efac', background: 'rgba(34, 197, 94, 0.12)', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.3)', margin: '0 0 0.75rem 0' }}>
                    🛡️ <strong>Safety Guarantee:</strong> Only keys prefixed with <code>smartbridge_</code> will be removed. Your cookies, history, and storage from other websites will never be touched.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowConfirmClear(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm btn-confirm-delete"
                      style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                      onClick={handleExecuteClear}
                    >
                      Yes, Delete SMART BRIDGE Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="note-persistence-notice" style={{ marginTop: '1.25rem' }}>
              🛡️ <strong>LocalStorage Notice:</strong> Data is saved on your device's browser memory only. No passwords, credentials, or remote telemetry are transmitted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
