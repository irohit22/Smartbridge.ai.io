import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PRESET_SKILLS,
  saveUserSkillProfile,
  getUserSkillProfile,
  getSkillConfig
} from '../utils/skillPersonalization';

interface SkillWelcomeModalProps {
  isOpen: boolean;
  onClose: (selectedSkillName: string) => void;
  isChangeMode?: boolean;
}

export const SkillWelcomeModal: React.FC<SkillWelcomeModalProps> = ({
  isOpen,
  onClose,
  isChangeMode = false
}) => {
  const currentProfile = getUserSkillProfile();
  const [selectedSkill, setSelectedSkill] = useState<string>(() => {
    return currentProfile?.primarySkill || 'Python';
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    if (!currentProfile) return false;
    return !PRESET_SKILLS.some(
      (s) => s.name.toLowerCase() === currentProfile.primarySkill.toLowerCase()
    );
  });
  const [customSkillInput, setCustomSkillInput] = useState<string>(() => {
    if (
      currentProfile &&
      !PRESET_SKILLS.some(
        (s) => s.name.toLowerCase() === currentProfile.primarySkill.toLowerCase()
      )
    ) {
      return currentProfile.primarySkill;
    }
    return '';
  });
  const [inputError, setInputError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (skillName: string) => {
    setIsCustomMode(false);
    setSelectedSkill(skillName);
    setInputError(null);
  };

  const handleSelectOther = () => {
    setIsCustomMode(true);
    setSelectedSkill('Other skill');
    setInputError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalSkillName = selectedSkill;
    if (isCustomMode || selectedSkill === 'Other skill') {
      const cleanCustom = customSkillInput.trim();
      if (!cleanCustom) {
        setInputError('Please enter your skill name (e.g. Flutter, Rust, Kotlin)');
        return;
      }
      finalSkillName = cleanCustom;
    }

    const saved = saveUserSkillProfile(finalSkillName, 'Beginner');
    onClose(saved.primarySkill);
  };

  const activeConfig = getSkillConfig(
    isCustomMode ? customSkillInput || 'Custom Skill' : selectedSkill
  );

  return (
    <AnimatePresence>
      <div
        className="skill-welcome-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-heading"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="skill-welcome-modal-card"
        >
          {/* Header Row */}
          <div className="welcome-modal-header">
            <div className="welcome-brand-badge">
              <span className="welcome-brand-sparkle">✦</span>
              <span>SMART BRIDGE PERSONALIZED LEARNING</span>
            </div>

            {isChangeMode && (
              <button
                type="button"
                className="welcome-modal-close-btn"
                onClick={() => onClose(selectedSkill)}
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>

          {/* Titles */}
          <div className="welcome-modal-titles">
            <h1 id="welcome-modal-heading" className="welcome-main-heading">
              Welcome to SMART BRIDGE
            </h1>
            <p className="welcome-question">
              Which skill have you learned so far?
            </p>
            <p className="welcome-subtitle">
              Tell us what you know, and we’ll help you learn, practice, and grow — one step at a time.
            </p>
          </div>

          {/* Skill Selection Pills Grid */}
          <div className="welcome-options-container">
            <label className="welcome-options-label">Select your core skill:</label>
            <div className="welcome-pills-grid" role="radiogroup" aria-label="Available Skills">
              {PRESET_SKILLS.map((skill) => {
                const isSelected = !isCustomMode && selectedSkill === skill.name;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`welcome-skill-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectPreset(skill.name)}
                  >
                    <span className="skill-pill-icon">{skill.icon}</span>
                    <span className="skill-pill-name">{skill.name}</span>
                    {isSelected && <span className="skill-pill-check">✓</span>}
                  </button>
                );
              })}

              {/* Other Skill Option */}
              <button
                type="button"
                role="radio"
                aria-checked={isCustomMode}
                className={`welcome-skill-pill ${isCustomMode ? 'selected' : ''}`}
                onClick={handleSelectOther}
              >
                <span className="skill-pill-icon">💡</span>
                <span className="skill-pill-name">Other skill</span>
                {isCustomMode && <span className="skill-pill-check">✓</span>}
              </button>
            </div>
          </div>

          {/* Custom Input Field (always accessible or highlighted when Other is picked) */}
          <div className="welcome-custom-input-box">
            <label htmlFor="custom-skill-input" className="custom-input-label">
              Enter any other skill not listed above:
            </label>
            <div className="custom-input-row">
              <input
                id="custom-skill-input"
                type="text"
                className={`form-input custom-skill-field ${inputError ? 'input-has-error' : ''}`}
                placeholder="e.g. Flutter, Go, Rust, React Native, DevOps, Cloud..."
                value={customSkillInput}
                onChange={(e) => {
                  setCustomSkillInput(e.target.value);
                  setIsCustomMode(true);
                  setSelectedSkill('Other skill');
                  if (inputError) setInputError(null);
                }}
                onFocus={() => {
                  setIsCustomMode(true);
                  setSelectedSkill('Other skill');
                }}
              />
            </div>
            {inputError && <span className="custom-input-error">{inputError}</span>}
          </div>

          {/* Live Preview of Everyday Analogy */}
          <div className="welcome-preview-card">
            <div className="preview-header">
              <span className="preview-icon">{activeConfig.icon}</span>
              <div>
                <strong className="preview-title">{activeConfig.name}</strong>
                <span className="preview-category"> · {activeConfig.category}</span>
              </div>
            </div>
            <p className="preview-analogy">
              💡 <strong>Real-Life Analogy:</strong> {activeConfig.everydayAnalogy.english}
            </p>
            <p className="preview-hinglish">
              🇮🇳 <strong>Easy Hinglish:</strong> {activeConfig.everydayAnalogy.hinglish}
            </p>
          </div>

          {/* Action Row */}
          <div className="welcome-modal-footer">
            {!isChangeMode && (
              <button
                type="button"
                className="btn-welcome-secondary"
                onClick={() => {
                  // Default to Python if skipping
                  const saved = saveUserSkillProfile('Python', 'Beginner');
                  onClose(saved.primarySkill);
                }}
              >
                Explore All Subjects
              </button>
            )}

            <button
              type="button"
              className="btn-welcome-primary"
              onClick={() => handleSubmit()}
            >
              Start My Learning Journey →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
