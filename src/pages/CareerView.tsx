import React, { useState, useEffect } from 'react';
import type {
  CareerPathway,
  StudentCareerProfile,
  CareerAnalysisResult,
  UserSkillEntry,
  SkillProficiencyLevel
} from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateOfflineCareerAnalysis } from '../utils/offlineCareerEngine';
import { getUserSkillProfile, getSkillConfig } from '../utils/skillPersonalization';
import { recordLearningActivity } from '../utils/activityTracker';

interface CareerViewProps {
  pathways: CareerPathway[];
  onShowToast: (msg: string) => void;
}

type WizardStep = 'profile' | 'analysis' | 'roles' | 'roadmap';
type ActiveTabMode = 'compass' | 'pathways';

const POPULAR_SKILLS = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'SQL',
  'HTML/CSS',
  'Git',
  'Tailwind CSS',
  'MongoDB',
  'Docker',
  'Express',
  'C++',
  'Java',
  'Pandas'
];

const PREFERRED_AREAS_OPTIONS = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Data Science / AI',
  'Cloud & DevOps',
  'Software Testing & QA',
  'Mobile App Development'
];

export const CareerView: React.FC<CareerViewProps> = ({ pathways, onShowToast }) => {
  // Navigation / View modes
  const [viewMode, setViewMode] = useState<ActiveTabMode>('compass');
  const [currentStep, setCurrentStep] = useState<WizardStep>('profile');
  const [activePathwayId, setActivePathwayId] = useState(pathways[0]?.id || 'path-frontend');

  // Form State
  const [degree, setDegree] = useState('B.Tech / B.E.');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('6th Semester');
  const [rolePreference, setRolePreference] = useState<StudentCareerProfile['rolePreference']>('Internship / Trainee');
  const [preferredLocation, setPreferredLocation] = useState('Remote / Hybrid');

  const userSkillProfile = getUserSkillProfile();
  const activeSkillConfig = getSkillConfig(userSkillProfile?.primarySkill);

  const [skills, setSkills] = useState<UserSkillEntry[]>(() => {
    const saved = storage.get<StudentCareerProfile | null>(STORAGE_KEYS.CAREER_COMPASS, null);
    if (saved?.skills && Array.isArray(saved.skills) && saved.skills.length > 0) {
      return saved.skills;
    }
    const defaultList: UserSkillEntry[] = [
      { name: activeSkillConfig.name, level: 'Beginner' }
    ];
    if (activeSkillConfig.name !== 'Git') {
      defaultList.push({ name: 'Git', level: 'Beginner' });
    }
    return defaultList;
  });
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillProficiencyLevel>('Intermediate');
  const [projects, setProjects] = useState('');
  const [certifications, setCertifications] = useState('');
  const [preferredAreas, setPreferredAreas] = useState<string[]>(() => {
    const saved = storage.get<StudentCareerProfile | null>(STORAGE_KEYS.CAREER_COMPASS, null);
    if (saved?.preferredAreas && Array.isArray(saved.preferredAreas) && saved.preferredAreas.length > 0) {
      return saved.preferredAreas;
    }
    return [activeSkillConfig.careerRoles[0]?.area || 'Software Development'];
  });

  // Analysis Result & States
  const [analysisResult, setAnalysisResult] = useState<CareerAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'ready' | 'prep'>('all');

  // Load saved profile & analysis on mount
  useEffect(() => {
    try {
      const savedProfile = storage.get<StudentCareerProfile | null>(STORAGE_KEYS.CAREER_COMPASS, null);
      if (savedProfile) {
        if (savedProfile.degree) setDegree(savedProfile.degree);
        if (savedProfile.branch) setBranch(savedProfile.branch);
        if (savedProfile.semester) setSemester(savedProfile.semester);
        if (savedProfile.rolePreference) setRolePreference(savedProfile.rolePreference);
        if (savedProfile.preferredLocation) setPreferredLocation(savedProfile.preferredLocation);
        if (Array.isArray(savedProfile.skills) && savedProfile.skills.length > 0) setSkills(savedProfile.skills);
        if (savedProfile.projects) setProjects(savedProfile.projects);
        if (savedProfile.certifications) setCertifications(savedProfile.certifications);
        if (Array.isArray(savedProfile.preferredAreas)) setPreferredAreas(savedProfile.preferredAreas);
      }

      const savedAnalysis = storage.get<CareerAnalysisResult | null>(STORAGE_KEYS.CAREER_ANALYSIS, null);
      if (savedAnalysis && Array.isArray(savedAnalysis.jobRecommendations)) {
        setAnalysisResult(savedAnalysis);
      }
    } catch {
      // Storage read fallback
    }
  }, []);

  // Handle adding skill
  const handleAddSkill = (skillNameToAdd?: string) => {
    const targetName = (skillNameToAdd || newSkillName).trim();
    if (!targetName) return;

    if (skills.some((s) => s.name.toLowerCase() === targetName.toLowerCase())) {
      onShowToast(`Skill "${targetName}" is already in your profile.`);
      return;
    }

    setSkills((prev) => [...prev, { name: targetName, level: newSkillLevel }]);
    setNewSkillName('');
    onShowToast(`Added skill: ${targetName} (${newSkillLevel})`);
  };

  const handleRemoveSkill = (nameToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== nameToRemove));
  };

  const handleToggleSkillLevel = (nameToToggle: string) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.name !== nameToToggle) return s;
        const nextLevel: SkillProficiencyLevel =
          s.level === 'Beginner' ? 'Intermediate' : s.level === 'Intermediate' ? 'Advanced' : 'Beginner';
        return { ...s, level: nextLevel };
      })
    );
  };

  const handleTogglePreferredArea = (area: string) => {
    setPreferredAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleFillSampleProfile = () => {
    setDegree('B.Tech / B.E.');
    setBranch('Computer Science & Engineering');
    setSemester('6th Semester');
    setRolePreference('Internship / Trainee');
    setPreferredLocation('Remote / Hybrid');
    setSkills([
      { name: 'JavaScript', level: 'Intermediate' },
      { name: 'React', level: 'Intermediate' },
      { name: 'Node.js', level: 'Beginner' },
      { name: 'HTML/CSS', level: 'Advanced' },
      { name: 'Git', level: 'Intermediate' },
      { name: 'SQL', level: 'Beginner' }
    ]);
    setProjects(
      'Built a responsive task manager web app using React, LocalStorage, and CSS Grid. Created a mini REST API with Express and Node.js for an e-commerce cart prototype with mock user auth.'
    );
    setCertifications('FreeCodeCamp Responsive Web Design, Meta Front-End Foundations on Coursera');
    setPreferredAreas(['Frontend Development', 'Web Development', 'Full Stack Development']);
    onShowToast('Filled realistic student profile preset! 🚀');
  };

  const handleResetProfile = () => {
    setSkills([]);
    setProjects('');
    setCertifications('');
    setAnalysisResult(null);
    storage.remove(STORAGE_KEYS.CAREER_ANALYSIS);
    setCurrentStep('profile');
    onShowToast('Career profile reset. Ready for new input.');
  };

  // Run Career Analysis
  const handleRunAnalysis = async () => {
    if (skills.length === 0) {
      onShowToast('Please add at least one technical or core skill to begin analysis.');
      return;
    }

    const currentProfile: StudentCareerProfile = {
      id: `profile-${Date.now()}`,
      degree,
      branch,
      semester,
      skills,
      projects,
      certifications,
      preferredAreas,
      preferredLocation,
      rolePreference,
      updatedAt: new Date().toISOString()
    };

    // Save profile to storage
    storage.set(STORAGE_KEYS.CAREER_COMPASS, currentProfile);

    setIsLoading(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile)
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.ok && Array.isArray(data.jobRecommendations)) {
          const result: CareerAnalysisResult = {
            id: data.id || `career-analysis-${Date.now()}`,
            studentSummary: data.studentSummary || {
              demonstratedSkills: [],
              selfReportedSkills: skills.map((s) => `${s.name} (${s.level})`),
              transferableStrengths: ['Problem-solving', 'Analytical thinking'],
              primaryReadinessObservation: 'Analysis completed.'
            },
            jobRecommendations: data.jobRecommendations,
            learningRoadmap: data.learningRoadmap || [],
            source: data.source || 'gemini',
            sourceLabel: data.sourceLabel || '🌟 Gemini Cloud AI',
            analyzedAt: data.analyzedAt || new Date().toISOString()
          };

          setAnalysisResult(result);
          storage.set(STORAGE_KEYS.CAREER_ANALYSIS, result);
          recordLearningActivity({
            type: 'milestone',
            title: 'Career Compass: Generated Career Roadmap',
            category: 'Career Planning',
            icon: '🧭'
          });
          setCurrentStep('analysis');
          onShowToast(`Career Analysis complete via ${result.sourceLabel}! 🎯`);
          return;
        }
      }

      // If backend responded with non-ok status or network issue, fallback to offline engine
      const offlineResult = generateOfflineCareerAnalysis(currentProfile);
      setAnalysisResult(offlineResult);
      storage.set(STORAGE_KEYS.CAREER_ANALYSIS, offlineResult);
      recordLearningActivity({
        type: 'milestone',
        title: 'Career Compass: Generated Career Roadmap',
        category: 'Career Planning',
        icon: '🧭'
      });
      setCurrentStep('analysis');
      onShowToast('Analysis generated with Offline Career Compass Engine 💾');
    } catch {
      // Complete offline fallback
      const offlineResult = generateOfflineCareerAnalysis(currentProfile);
      setAnalysisResult(offlineResult);
      storage.set(STORAGE_KEYS.CAREER_ANALYSIS, offlineResult);
      recordLearningActivity({
        type: 'milestone',
        title: 'Career Compass: Generated Career Roadmap',
        category: 'Career Planning',
        icon: '🧭'
      });
      setCurrentStep('analysis');
      onShowToast('Offline Career Compass Engine generated your roadmap 💾');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPathway = (p: CareerPathway) => {
    setActivePathwayId(p.id);
    onShowToast(`Active Track set to: ${p.title} 🧭`);
  };

  // Filtered job recommendations
  const filteredRoles = (analysisResult?.jobRecommendations || []).filter((role) => {
    if (roleFilter === 'ready') return role.readinessStatus.startsWith('Ready');
    if (roleFilter === 'prep') return role.readinessStatus.startsWith('Explore After');
    return true;
  });

  return (
    <div className="view-container career-compass-view" data-testid="career-compass-container">
      {/* View Header with Dual-Mode Toggle */}
      <div className="view-header-row career-header-row">
        <div>
          <div className="career-eyebrow-wrap">
            <span className="eyebrow">CAREER COMPASS · CAREER NAVIGATOR</span>
            <span className="ai-badge-pulse">AI-POWERED</span>
          </div>
          <h1 className="view-main-title">Career Compass AI</h1>
          <p className="view-desc">
            Evaluate your real skill matrix against market demands. Differentiate verified project experience from self-ratings, explore realistic entry-level roles, and follow an actionable milestone roadmap.
          </p>
        </div>

        <div className="career-header-controls">
          <div className="view-mode-pill-toggle">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'compass' ? 'mode-active' : ''}`}
              onClick={() => setViewMode('compass')}
            >
              🧭 Career Compass Studio
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'pathways' ? 'mode-active' : ''}`}
              onClick={() => setViewMode('pathways')}
            >
              📋 Industry Pathways ({pathways.length})
            </button>
          </div>

          {analysisResult && viewMode === 'compass' && (
            <span className="status-pill status-source" title={`Generated at ${analysisResult.analyzedAt}`}>
              {analysisResult.sourceLabel}
            </span>
          )}
        </div>
      </div>

      {/* MODE 1: INDUSTRY PATHWAYS (LEGACY COMPATIBILITY) */}
      {viewMode === 'pathways' && (
        <div className="legacy-pathways-wrap animate-fade-in">
          <div className="pathways-banner-info">
            <span>ℹ️ Curated baseline career pathways across major tech specializations. Switch back to <strong>Career Compass Studio</strong> for personalized AI role analysis based on your individual projects.</span>
          </div>

          <div className="career-pathways-grid">
            {pathways.map((pathway) => {
              const isSelected = pathway.id === activePathwayId;
              const completedCount = pathway.milestones.filter((m) => m.completed).length;
              const totalCount = pathway.milestones.length;
              const progressPct = Math.round((completedCount / totalCount) * 100);

              return (
                <div
                  key={pathway.id}
                  className={`career-pathway-card ${isSelected ? 'pathway-active' : ''}`}
                >
                  <div className="pathway-card-top">
                    <div>
                      <span className="badge-subtle">{pathway.level}</span>
                      <h2 className="pathway-title">{pathway.title}</h2>
                    </div>
                    <span className="demand-badge">{pathway.demand} Demand</span>
                  </div>

                  <div className="pathway-salary-pill">
                    💰 Benchmark: <strong>{pathway.salaryRange}</strong>
                  </div>

                  <p className="pathway-description">{pathway.description}</p>

                  <div className="pathway-skills-tray">
                    {pathway.skills.map((skill) => (
                      <span key={skill} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="milestones-section">
                    <div className="milestones-header">
                      <strong>Career Milestones</strong>
                      <span className="milestones-count">
                        {completedCount} of {totalCount} completed ({progressPct}%)
                      </span>
                    </div>

                    <div className="milestone-progress-bar">
                      <div
                        className="milestone-progress-fill"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    <ul className="milestones-list">
                      {pathway.milestones.map((m, mIdx) => (
                        <li
                          key={mIdx}
                          className={`milestone-item ${m.completed ? 'm-done' : 'm-pending'}`}
                        >
                          <span className="milestone-indicator" aria-hidden="true">
                            {m.completed ? '✓' : '○'}
                          </span>
                          <div className="milestone-text-wrap">
                            <strong className="milestone-title">{m.title}</strong>
                            <span className="milestone-desc">{m.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-full`}
                    onClick={() => handleSelectPathway(pathway)}
                  >
                    {isSelected ? '✓ Active Career Track' : 'Select This Track'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: CAREER COMPASS AI STUDIO */}
      {viewMode === 'compass' && (
        <div className="compass-studio-wrap">
          {/* Wizard Step Navigation Bar */}
          <div className="compass-stepper-bar" role="navigation" aria-label="Career Analysis Stages">
            <button
              type="button"
              className={`stepper-step-btn ${currentStep === 'profile' ? 'step-active' : ''}`}
              onClick={() => setCurrentStep('profile')}
            >
              <span className="step-num">01</span>
              <span className="step-text">Profile & Skills</span>
            </button>

            <span className="step-connector">→</span>

            <button
              type="button"
              className={`stepper-step-btn ${currentStep === 'analysis' ? 'step-active' : ''} ${
                !analysisResult ? 'step-disabled' : ''
              }`}
              onClick={() => analysisResult && setCurrentStep('analysis')}
              disabled={!analysisResult}
            >
              <span className="step-num">02</span>
              <span className="step-text">Skill Audit</span>
            </button>

            <span className="step-connector">→</span>

            <button
              type="button"
              className={`stepper-step-btn ${currentStep === 'roles' ? 'step-active' : ''} ${
                !analysisResult ? 'step-disabled' : ''
              }`}
              onClick={() => analysisResult && setCurrentStep('roles')}
              disabled={!analysisResult}
            >
              <span className="step-num">03</span>
              <span className="step-text">Job Matches</span>
            </button>

            <span className="step-connector">→</span>

            <button
              type="button"
              className={`stepper-step-btn ${currentStep === 'roadmap' ? 'step-active' : ''} ${
                !analysisResult ? 'step-disabled' : ''
              }`}
              onClick={() => analysisResult && setCurrentStep('roadmap')}
              disabled={!analysisResult}
            >
              <span className="step-num">04</span>
              <span className="step-text">Milestone Roadmap</span>
            </button>
          </div>

          {/* LOADING STATE */}
          {isLoading && (
            <div className="compass-loading-state" data-testid="compass-loading">
              <div className="radar-scanner-circle">
                <div className="radar-sweep"></div>
                <div className="radar-blip blip-1"></div>
                <div className="radar-blip blip-2"></div>
                <div className="radar-blip blip-3"></div>
              </div>
              <h2 className="loading-title">Neural Career Matrix in Motion...</h2>
              <p className="loading-sub">
                Scanning your skills against entry-level job archetypes, extracting project evidence, and mapping realistic milestones.
              </p>
              <div className="loading-progress-pulse">
                <span>Auditing code foundations</span>
                <span>•</span>
                <span>Scoring junior competencies</span>
                <span>•</span>
                <span>Generating custom roadmap</span>
              </div>
            </div>
          )}

          {/* STEP 1: STUDENT INPUT FORM */}
          {!isLoading && currentStep === 'profile' && (
            <div className="compass-profile-form animate-fade-in" data-testid="compass-profile-form">
              {analysisError && (
                <div className="privacy-shield-banner" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', marginBottom: '1rem' }}>
                  <span>⚠️ {analysisError}</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAnalysisError(null)} style={{ marginLeft: 'auto' }}>✕</button>
                </div>
              )}
              <div className="form-lead-card">
                <div className="lead-header">
                  <div>
                    <h2 className="lead-title">Your Technical Profile & Aspirations</h2>
                    <p className="lead-desc">
                      Fill in your academic background and project history. Our AI cross-references your project descriptions with your self-reported skills to produce a transparent, grounded assessment.
                    </p>
                  </div>
                  <div className="lead-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleFillSampleProfile}
                      title="Load sample student profile for quick evaluation"
                    >
                      ⚡ Quick Sample Profile
                    </button>
                    {skills.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={handleResetProfile}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Privacy Banner */}
                <div className="privacy-shield-banner">
                  <span className="shield-icon" aria-hidden="true">🛡️</span>
                  <span>
                    <strong>Privacy Guarantee:</strong> Do not enter sensitive credentials (passwords, government IDs, phone numbers). SMART BRIDGE only processes your academic background and technical skills.
                  </span>
                </div>
              </div>

              {/* Grid 1: Academic & Career Logistics */}
              <div className="form-section-card">
                <h3 className="section-card-title">1. Academic & Target Role Context</h3>
                <div className="form-fields-grid-3">
                  <div className="form-group">
                    <label className="input-label" htmlFor="degree-select">Degree / Program</label>
                    <select
                      id="degree-select"
                      className="app-select"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                    >
                      <option value="B.Tech / B.E.">B.Tech / B.E. (Engineering)</option>
                      <option value="BCA / MCA">BCA / MCA (Computer Applications)</option>
                      <option value="B.Sc Computer Science / IT">B.Sc Computer Science / IT</option>
                      <option value="Diploma in Engineering">Diploma in Engineering / Polytechnic</option>
                      <option value="Non-Tech Degree / Transitioning">Non-Tech Degree (Transitioning to Tech)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="input-label" htmlFor="branch-input">Branch / Major</label>
                    <input
                      id="branch-input"
                      type="text"
                      className="app-input"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label" htmlFor="semester-select">Current Stage / Semester</label>
                    <select
                      id="semester-select"
                      className="app-select"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    >
                      <option value="1st - 2nd Semester">1st - 2nd Semester (1st Year)</option>
                      <option value="3rd - 4th Semester">3rd - 4th Semester (2nd Year)</option>
                      <option value="5th - 6th Semester">5th - 6th Semester (3rd Year)</option>
                      <option value="Final Year (7th - 8th)">Final Year (7th - 8th Semester)</option>
                      <option value="Recent Graduate / Fresher">Recent Graduate (0-1 yrs)</option>
                    </select>
                  </div>
                </div>

                <div className="form-fields-grid-2 mt-4">
                  <div className="form-group">
                    <label className="input-label">Target Role Level</label>
                    <div className="chips-selector-row">
                      {(['Internship / Trainee', 'Fresher (0-1 yrs)', 'Part-time', 'Experienced / Associate'] as const).map(
                        (roleType) => (
                          <button
                            key={roleType}
                            type="button"
                            className={`chip-choice ${rolePreference === roleType ? 'chip-active' : ''}`}
                            onClick={() => setRolePreference(roleType)}
                          >
                            {roleType}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Work Location Model</label>
                    <div className="chips-selector-row">
                      {['Remote / Hybrid', 'On-site / In-Office', 'Any / Flexible'].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          className={`chip-choice ${preferredLocation === loc ? 'chip-active' : ''}`}
                          onClick={() => setPreferredLocation(loc)}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Skills with Self-Rated Proficiency */}
              <div className="form-section-card">
                <div className="skills-section-header">
                  <div>
                    <h3 className="section-card-title">2. Technical & Core Skills</h3>
                    <p className="section-card-sub">
                      Rate your current familiarity. Click any skill badge below to cycle through <strong>Beginner</strong>, <strong>Intermediate</strong>, and <strong>Advanced</strong>.
                    </p>
                  </div>
                  <span className="skills-counter">{skills.length} skills added</span>
                </div>

                {/* Popular Skill Quick-Add Pills */}
                <div className="popular-skills-wrap">
                  <span className="popular-label">Quick Add:</span>
                  <div className="popular-skills-pills">
                    {POPULAR_SKILLS.map((popSkill) => {
                      const isAdded = skills.some((s) => s.name.toLowerCase() === popSkill.toLowerCase());
                      return (
                        <button
                          key={popSkill}
                          type="button"
                          className={`pop-skill-btn ${isAdded ? 'pop-added' : ''}`}
                          onClick={() => !isAdded && handleAddSkill(popSkill)}
                          disabled={isAdded}
                        >
                          {isAdded ? '✓ ' : '+ '}
                          {popSkill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Skills List with Level Toggles */}
                <div className="active-skills-matrix">
                  {skills.length === 0 ? (
                    <div className="empty-skills-notice">
                      <span>No skills added yet. Click any quick-add skill above or type custom ones below.</span>
                    </div>
                  ) : (
                    skills.map((skill) => (
                      <div key={skill.name} className={`skill-rating-pill level-${skill.level.toLowerCase()}`}>
                        <span className="skill-name">{skill.name}</span>
                        <button
                          type="button"
                          className="skill-level-toggle-btn"
                          onClick={() => handleToggleSkillLevel(skill.name)}
                          title="Click to cycle proficiency level (Beginner → Intermediate → Advanced)"
                        >
                          {skill.level}
                        </button>
                        <button
                          type="button"
                          className="skill-remove-btn"
                          onClick={() => handleRemoveSkill(skill.name)}
                          title="Remove skill"
                          aria-label={`Remove ${skill.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Custom Skill Row */}
                <div className="add-custom-skill-row">
                  <input
                    type="text"
                    className="app-input flex-1"
                    placeholder="Add custom skill (e.g. Next.js, FastAPI, Rust, Figma)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <select
                    className="app-select skill-level-select"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as SkillProficiencyLevel)}
                    aria-label="Skill Proficiency Level"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleAddSkill()}
                  >
                    + Add Skill
                  </button>
                </div>
              </div>

              {/* Grid 3: Projects, Experience & Preferred Areas */}
              <div className="form-section-card">
                <h3 className="section-card-title">3. Practical Projects & Experience</h3>
                <p className="section-card-sub">
                  Describe academic coursework projects, personal repositories, or hackathon prototypes. Mention the tools and libraries you actually used.
                </p>

                <div className="form-group mt-2">
                  <label className="input-label" htmlFor="projects-input">
                    Project Summaries (Used for Demonstrated Skill Audit)
                  </label>
                  <textarea
                    id="projects-input"
                    className="app-textarea"
                    rows={4}
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    placeholder="e.g. Built an e-commerce website using React, Node.js, and MongoDB with a shopping cart and basic JWT login. Deployed on Vercel with responsive CSS..."
                  />
                  <span className="field-hint">
                    💡 If you haven't built complex projects yet, mention lab experiments, class assignments, or what you are currently coding.
                  </span>
                </div>

                <div className="form-group mt-4">
                  <label className="input-label" htmlFor="certs-input">
                    Coursework, Certifications & Extracurriculars (Optional)
                  </label>
                  <input
                    id="certs-input"
                    type="text"
                    className="app-input"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="e.g. CS50, Coursera Full-Stack, College Coding Club Lead..."
                  />
                </div>

                <div className="form-group mt-4">
                  <label className="input-label">Preferred Career Specializations</label>
                  <div className="preferred-areas-chips">
                    {PREFERRED_AREAS_OPTIONS.map((area) => {
                      const isSelected = preferredAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          className={`area-toggle-chip ${isSelected ? 'area-active' : ''}`}
                          onClick={() => handleTogglePreferredArea(area)}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit CTA Row */}
              <div className="form-submit-row">
                <button
                  type="button"
                  className="btn btn-primary btn-large glow-btn"
                  onClick={handleRunAnalysis}
                  data-testid="run-analysis-btn"
                >
                  🚀 Run AI Career Analysis
                </button>
                {analysisResult && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep('analysis')}
                  >
                    View Existing Analysis →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SKILL AUDIT & DEMONSTRATED VS SELF-REPORTED BREAKDOWN */}
          {!isLoading && currentStep === 'analysis' && analysisResult && (
            <div className="compass-step-content animate-fade-in" data-testid="compass-step-analysis">
              <div className="step-header-nav">
                <div>
                  <h2 className="step-content-title">Skill Audit & Readiness Evaluation</h2>
                  <p className="step-content-sub">
                    Transparent comparison between skills demonstrated in your project implementations and your self-reported profile entries.
                  </p>
                </div>
                <div className="step-nav-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentStep('profile')}
                  >
                    ← Edit Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setCurrentStep('roles')}
                  >
                    Explore Job Matches →
                  </button>
                </div>
              </div>

              {/* Primary Readiness Observation Banner */}
              <div className="readiness-observation-card">
                <div className="obs-header">
                  <span className="obs-badge">EXECUTIVE READINESS ASSESSMENT</span>
                  <span className="obs-source">{analysisResult.sourceLabel}</span>
                </div>
                <p className="obs-text">
                  {analysisResult.studentSummary.primaryReadinessObservation}
                </p>
              </div>

              {/* Demonstrated vs Self-Reported Breakdown Grid */}
              <div className="skills-audit-grid">
                {/* Left: Demonstrated Skills */}
                <div className="audit-card demonstrated-card">
                  <div className="audit-card-top">
                    <span className="audit-card-icon">⚡</span>
                    <div>
                      <h3 className="audit-card-heading">Demonstrated Skills</h3>
                      <span className="audit-sub">Backed by project and practical code evidence</span>
                    </div>
                  </div>

                  <div className="audit-skills-list">
                    {analysisResult.studentSummary.demonstratedSkills.length === 0 ? (
                      <div className="audit-empty-item">
                        <span>No project-backed skills detected yet. Add details about what you built to unlock verified skill tags.</span>
                      </div>
                    ) : (
                      analysisResult.studentSummary.demonstratedSkills.map((dSkill) => (
                        <div key={dSkill} className="audit-skill-tag demonstrated-tag">
                          <span className="check-icon">✓</span>
                          <span>{dSkill}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Self-Reported Skills */}
                <div className="audit-card self-reported-card">
                  <div className="audit-card-top">
                    <span className="audit-card-icon">📋</span>
                    <div>
                      <h3 className="audit-card-heading">Self-Reported Skills</h3>
                      <span className="audit-sub">Reported on profile; translate these into public code</span>
                    </div>
                  </div>

                  <div className="audit-skills-list">
                    {analysisResult.studentSummary.selfReportedSkills.map((rSkill) => (
                      <div key={rSkill} className="audit-skill-tag self-reported-tag">
                        <span>{rSkill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transferable Strengths */}
              <div className="transferable-strengths-card">
                <h3 className="strengths-title">Core Academic & Transferable Strengths</h3>
                <ul className="strengths-list">
                  {analysisResult.studentSummary.transferableStrengths.map((strength, sIdx) => (
                    <li key={sIdx} className="strength-item">
                      <span className="bullet-star">✦</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Advance Action */}
              <div className="step-bottom-cta">
                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={() => setCurrentStep('roles')}
                >
                  Proceed to Recommended Job Roles ({analysisResult.jobRecommendations.length}) →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REALISTIC JOB RECOMMENDATION CARDS */}
          {!isLoading && currentStep === 'roles' && analysisResult && (
            <div className="compass-step-content animate-fade-in" data-testid="compass-step-roles">
              <div className="step-header-nav">
                <div>
                  <h2 className="step-content-title">Recommended Entry-Level Job Roles</h2>
                  <p className="step-content-sub">
                    Realistic junior role archetypes matched to your current abilities. Real verified job board search links are provided below with no fabricated vacancies.
                  </p>
                </div>
                <div className="step-nav-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentStep('analysis')}
                  >
                    ← Skill Audit
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setCurrentStep('roadmap')}
                  >
                    View Roadmap →
                  </button>
                </div>
              </div>

              {/* Filter Row */}
              <div className="roles-filter-bar">
                <span className="filter-label">Filter Roles:</span>
                <div className="filter-chips">
                  <button
                    type="button"
                    className={`filter-chip ${roleFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setRoleFilter('all')}
                  >
                    All Roles ({analysisResult.jobRecommendations.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-chip ${roleFilter === 'ready' ? 'active' : ''}`}
                    onClick={() => setRoleFilter('ready')}
                  >
                    🚀 Ready to Explore Now
                  </button>
                  <button
                    type="button"
                    className={`filter-chip ${roleFilter === 'prep' ? 'active' : ''}`}
                    onClick={() => setRoleFilter('prep')}
                  >
                    ⏳ Explore After Prep (2-3 Mo)
                  </button>
                </div>
              </div>

              {/* Role Cards Grid */}
              <div className="job-roles-grid">
                {filteredRoles.map((role) => {
                  const isReady = role.readinessStatus.startsWith('Ready');
                  const linkedInSearchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
                    role.safeSearchQuery
                  )}&f_E=1%2C2`;
                  const internshalaSearchUrl = `https://internshala.com/internships/keywords-${encodeURIComponent(
                    role.title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0, 2).join('-').toLowerCase()
                  )}`;
                  const wellfoundSearchUrl = `https://wellfound.com/jobs?query=${encodeURIComponent(
                    role.safeSearchQuery
                  )}`;

                  return (
                    <div
                      key={role.id}
                      className={`job-recommendation-card ${isReady ? 'role-ready-card' : 'role-prep-card'}`}
                      data-testid={`role-card-${role.id}`}
                    >
                      {/* Top Header */}
                      <div className="role-card-header">
                        <div>
                          <div className="role-readiness-wrap">
                            <span className={`readiness-pill ${isReady ? 'pill-ready' : 'pill-prep'}`}>
                              {isReady ? '● Ready to Explore Now' : '⏳ Explore After Prep'}
                            </span>
                            <span className="role-archetype-tag">Junior Role Archetype</span>
                          </div>
                          <h3 className="role-card-title">{role.title}</h3>
                        </div>
                      </div>

                      {/* Overview */}
                      <p className="role-card-overview">{role.overview}</p>

                      {/* Why it Fits Callout */}
                      <div className="why-fits-box">
                        <span className="why-fits-label">Why This Fits You:</span>
                        <p className="why-fits-text">{role.whyItFits}</p>
                      </div>

                      {/* Match Assessment */}
                      <div className="match-assessment-row">
                        <span className="assessment-badge">Match Assessment</span>
                        <span className="assessment-text">{role.matchAssessment}</span>
                      </div>

                      {/* 2-Column Skills Matrix: Have vs Improve */}
                      <div className="skills-compare-matrix">
                        <div className="matrix-col have-col">
                          <span className="matrix-col-header">✓ Skills You Have</span>
                          <div className="matrix-tags">
                            {role.skillsYouHave.map((s, idx) => (
                              <span key={idx} className="matrix-tag have-tag">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="matrix-col improve-col">
                          <span className="matrix-col-header">▲ Priority Skills to Learn</span>
                          <div className="matrix-tags">
                            {role.skillsToImprove.map((s, idx) => (
                              <span key={idx} className="matrix-tag improve-tag">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Typical Requirements */}
                      <div className="typical-reqs-section">
                        <h4 className="reqs-title">Standard Junior Requirements</h4>
                        <ul className="reqs-list">
                          {role.typicalRequirements.map((req, rIdx) => (
                            <li key={rIdx} className="req-item">
                              <span className="req-check">○</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended Portfolio Projects */}
                      <div className="portfolio-suggestions-box">
                        <span className="portfolio-label">💡 Suggested Portfolio Projects:</span>
                        <ul className="portfolio-list">
                          {role.suggestedPortfolioProjects.map((proj, pIdx) => (
                            <li key={pIdx} className="portfolio-item">
                              {proj}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Market Context Note */}
                      <div className="market-context-note">
                        <span className="context-icon">📊</span>
                        <span>{role.marketContextNote}</span>
                      </div>

                      {/* Live Job Portals Search Links */}
                      <div className="verified-portals-section">
                        <div className="portals-label-row">
                          <span className="portals-title">Verify Active Openings on Job Portals:</span>
                          <span className="portals-hint">Safe real-time searches</span>
                        </div>
                        <div className="portal-buttons-grid">
                          <a
                            href={linkedInSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="portal-link-btn linkedin-btn"
                          >
                            LinkedIn Jobs ↗
                          </a>
                          <a
                            href={internshalaSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="portal-link-btn internshala-btn"
                          >
                            Internshala ↗
                          </a>
                          <a
                            href={wellfoundSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="portal-link-btn wellfound-btn"
                          >
                            Wellfound ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Advance Action */}
              <div className="step-bottom-cta">
                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={() => setCurrentStep('roadmap')}
                >
                  View 3-Phase Milestone Roadmap →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: 3-PHASE LEARNING ROADMAP */}
          {!isLoading && currentStep === 'roadmap' && analysisResult && (
            <div className="compass-step-content animate-fade-in" data-testid="compass-step-roadmap">
              <div className="step-header-nav">
                <div>
                  <h2 className="step-content-title">Personalized 3-Phase Learning Roadmap</h2>
                  <p className="step-content-sub">
                    Structured progression designed to bridge your skill gaps, produce public portfolio evidence, and prepare for tech interviews.
                  </p>
                </div>
                <div className="step-nav-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentStep('roles')}
                  >
                    ← Job Matches
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const roadmapText = analysisResult.learningRoadmap
                        .map(
                          (p) =>
                            `## ${p.phaseTitle} (${p.timeframe})\nFocus: ${p.focusSkills.join(', ')}\nMilestones:\n${p.actionMilestones.map((m) => `- ${m}`).join('\n')}\nDeliverable: ${p.deliverableEvidence}\n`
                        )
                        .join('\n');
                      navigator.clipboard.writeText(roadmapText);
                      onShowToast('Roadmap copied to clipboard! 📋');
                    }}
                  >
                    📋 Copy Roadmap Text
                  </button>
                </div>
              </div>

              {/* Roadmap Phases Timeline */}
              <div className="roadmap-timeline">
                {analysisResult.learningRoadmap.map((phase, phaseIdx) => (
                  <div key={phaseIdx} className="roadmap-phase-card">
                    <div className="phase-indicator-col">
                      <div className="phase-number-circle">{phaseIdx + 1}</div>
                      {phaseIdx < analysisResult.learningRoadmap.length - 1 && (
                        <div className="phase-timeline-line"></div>
                      )}
                    </div>

                    <div className="phase-content-box">
                      <div className="phase-header-row">
                        <h3 className="phase-title">{phase.phaseTitle}</h3>
                        <span className="phase-timeframe-badge">{phase.timeframe}</span>
                      </div>

                      {/* Focus Skills */}
                      <div className="phase-skills-row">
                        <span className="phase-skills-label">Core Focus:</span>
                        <div className="phase-skills-tags">
                          {phase.focusSkills.map((fSkill, fIdx) => (
                            <span key={fIdx} className="phase-skill-pill">
                              {fSkill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Milestones */}
                      <div className="phase-milestones-box">
                        <h4 className="milestones-heading">Actionable Milestones</h4>
                        <ul className="phase-milestones-list">
                          {phase.actionMilestones.map((milestone, mIdx) => (
                            <li key={mIdx} className="phase-milestone-item">
                              <span className="m-bullet">▹</span>
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Deliverable Evidence */}
                      <div className="phase-deliverable-card">
                        <span className="deliverable-icon">🏆</span>
                        <div>
                          <span className="deliverable-label">Key Deliverable Evidence:</span>
                          <p className="deliverable-text">{phase.deliverableEvidence}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Nav Row */}
              <div className="roadmap-bottom-cta">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep('profile')}
                >
                  Edit Profile & Re-analyze
                </button>
                <button
                  type="button"
                  className="btn btn-primary glow-btn"
                  onClick={() => {
                    setViewMode('pathways');
                    onShowToast('Viewing industry benchmark pathways 🧭');
                  }}
                >
                  Explore Industry Career Pathways →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
