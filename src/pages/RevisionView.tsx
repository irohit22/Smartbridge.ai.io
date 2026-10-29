import React, { useState } from 'react';
import type { RevisionTask, Flashcard, QuizResultRecord, GeneratedNote } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import {
  getTopicPerformanceSummary,
  getPrioritizedRevisionTasks
} from '../utils/personalizedLearning';
import { getUserSkillProfile, getSkillConfig } from '../utils/skillPersonalization';
import { recordLearningActivity } from '../utils/activityTracker';

interface RevisionViewProps {
  tasks: RevisionTask[];
  flashcards: Flashcard[];
  onShowToast: (msg: string) => void;
  onNavigateToNotes?: (payload?: { noteId?: string; topic?: string }) => void;
  onNavigateToQuiz?: (topicId?: string) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  tasks: initialTasks,
  flashcards,
  onShowToast,
  onNavigateToNotes,
  onNavigateToQuiz
}) => {
  // Load tasks from storage or fallback to initialTasks
  const [tasks, setTasks] = useState<RevisionTask[]>(() => {
    const stored = storage.get<RevisionTask[]>(STORAGE_KEYS.REVISION_TASKS, []);
    if (Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
    return initialTasks;
  });

  const [filter, setFilter] = useState<'all' | 'urgent' | 'completed'>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const userSkillProfile = getUserSkillProfile();
  const activeSkillConfig = getSkillConfig(userSkillProfile?.primarySkill);

  const effectiveFlashcards = activeSkillConfig.flashcards.length > 0
    ? [...activeSkillConfig.flashcards, ...flashcards]
    : flashcards;

  // Read quiz history and notes for personalized revision prioritization
  const quizHistory = storage.get<QuizResultRecord[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
  const savedNotes = storage.get<GeneratedNote[]>(STORAGE_KEYS.NOTES, []);
  const topicSummaries = getTopicPerformanceSummary(quizHistory);

  // Derive prioritized revision items (pure derivation, no duplicate persistence)
  const prioritizedItems = getPrioritizedRevisionTasks({
    revisionTasks: tasks,
    topicSummaries,
    savedNotes
  });

  const toggleTask = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const willBeCompleted = !targetTask.completed;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: willBeCompleted } : t
    );

    setTasks(updatedTasks);
    storage.set(STORAGE_KEYS.REVISION_TASKS, updatedTasks);

    if (willBeCompleted) {
      recordLearningActivity({
        type: 'revision',
        title: `Completed: ${targetTask.title}`,
        category: targetTask.subject || 'Revision',
        icon: '✅'
      });
    }

    onShowToast(
      willBeCompleted
        ? `Marked "${targetTask.title}" as completed! ✅`
        : `Restored "${targetTask.title}" to review list.`
    );
  };

  const handleResetTasks = () => {
    setTasks(initialTasks);
    storage.set(STORAGE_KEYS.REVISION_TASKS, initialTasks);
    onShowToast('Reset revision tasks to initial defaults.');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'urgent') return t.priority === 'Urgent' || t.priority === 'High';
    if (filter === 'completed') return t.completed;
    return true;
  });

  const currentCard = effectiveFlashcards[activeCardIndex] || effectiveFlashcards[0];

  const handleToggleFlip = () => {
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && currentCard) {
        recordLearningActivity({
          type: 'revision',
          title: `Flashcard: ${currentCard.question.length > 35 ? currentCard.question.slice(0, 32) + '...' : currentCard.question}`,
          category: currentCard.subject || 'Flashcard',
          icon: '🗂️'
        });
      }
      return next;
    });
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % effectiveFlashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev - 1 + effectiveFlashcards.length) % effectiveFlashcards.length);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <span className="eyebrow">ACTIVE RECALL ENGINE</span>
          <h1 className="view-main-title">Smart Revision & Retention</h1>
          <p className="view-desc">
            Scientifically scheduled reviews using the Leitner spaced repetition model. Never forget key formulas or architectural principles.
          </p>
        </div>

        <div className="status-pill status-online" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span>{activeSkillConfig.icon} Focus: {activeSkillConfig.name}</span>
          <span>• ({completedCount}/{tasks.length} Completed)</span>
        </div>
      </div>

      {/* Top 3D Active Recall Flashcard Stage */}
      <div className="content-card flashcard-stage-container">
        <div className="flashcard-stage-header">
          <div>
            <span className="badge-subtle">🎴 Active Recall Deck</span>
            <span className="flashcard-counter-tag">
              Card {activeCardIndex + 1} of {effectiveFlashcards.length}
            </span>
          </div>
          <span className="flashcard-topic-tag">{currentCard.subject}</span>
        </div>

        {/* 3D Flip Card */}
        <div
          className={`interactive-flip-card ${isFlipped ? 'flipped' : ''}`}
          onClick={handleToggleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleFlip();
            }
          }}
          aria-label="Study flashcard. Click to flip front or back."
        >
          {/* Front Face */}
          <div className="card-face face-front">
            <div className="face-header-meta">
              <span className="face-badge-pill">QUESTION (Click to Flip ↷)</span>
              <span className="face-sub-caption">Active Retrieval</span>
            </div>
            <h2 className="face-question-prompt">{currentCard.question}</h2>
            <div className="face-footer-tip">
              💡 Press spacebar or click anywhere to verify your answer
            </div>
          </div>

          {/* Back Face */}
          <div className="card-face face-back">
            <div className="face-header-meta">
              <span className="face-badge-pill pill-success">ANSWER & MENTAL MODEL</span>
              <span className="face-sub-caption">Verified Solution</span>
            </div>
            <p className="face-answer-text">{currentCard.answer}</p>
            <div className="face-rationale-note">
              <strong>Key takeaway:</strong> {currentCard.rationale}
            </div>
            <div className="face-footer-tip">
              Click to flip back ↶
            </div>
          </div>
        </div>

        {/* Flashcard Controls */}
        <div className="flashcard-controls-row">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrevCard}
          >
            ← Previous
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleToggleFlip}
          >
            🔄 {isFlipped ? 'Show Question' : 'Flip to Answer'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleNextCard}
          >
            Next Card →
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 5: PERSONALIZED REVISION PRIORITIES CALLOUT                         */}
      {/* ========================================================================= */}
      <div className="content-card revision-priorities-callout-card">
        <div className="card-header-clean">
          <div>
            <div className="section-eyebrow-tag">PERSONALIZED ADAPTATION</div>
            <h2 className="card-title">🎯 Targeted Revision Focus</h2>
            <p className="card-subtitle">
              Prioritized according to your offline quiz diagnostic accuracy and Leitner memory decay strength.
            </p>
          </div>
        </div>

        <div className="prioritized-items-grid">
          {prioritizedItems.slice(0, 3).map((item) => (
            <div
              key={item.task.id}
              className={`priority-focus-card ${item.task.completed ? 'task-done' : ''}`}
            >
              <div className="priority-card-top">
                <span className="priority-subject-tag">{item.task.subject}</span>
                <span className="priority-score-badge">Strength: {item.task.memoryScore}%</span>
              </div>
              <strong className="priority-task-title">{item.task.title}</strong>
              <div className="priority-urgency-note">
                <span className="urgency-icon" aria-hidden="true">💡</span>
                <span>{item.urgencyReason}</span>
              </div>

              <div className="priority-card-actions">
                {item.matchingNote && onNavigateToNotes && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      onShowToast(`Opening matching note: ${item.matchingNote?.title}`);
                      onNavigateToNotes({ noteId: item.matchingNote?.id, topic: item.task.subject });
                    }}
                  >
                    Review Note 📖
                  </button>
                )}
                {onNavigateToQuiz && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      onShowToast(`Opening quiz for: ${item.task.subject}`);
                      onNavigateToQuiz(item.relatedTopicSummary?.topicId || 'all');
                    }}
                  >
                    Practice Quiz 🎯
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revision Task Board (Preserved with exact selectors for Stage 2 regression) */}
      <div className="content-card">
        <div className="card-header-clean">
          <div>
            <h2 className="card-title">📋 Scheduled Revision Tasks</h2>
            <p className="card-subtitle">
              Check off topics as you review them. Status is saved automatically in <code>localStorage</code>.
            </p>
          </div>

          {/* Filter Pills and Reset Button */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="task-filter-pills" role="group" aria-label="Task Filter">
              <button
                type="button"
                className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                className={`pill-btn ${filter === 'urgent' ? 'active' : ''}`}
                onClick={() => setFilter('urgent')}
              >
                Urgent ({tasks.filter((t) => t.priority === 'Urgent' || t.priority === 'High').length})
              </button>
              <button
                type="button"
                className={`pill-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Done ({completedCount})
              </button>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleResetTasks}
              title="Reset tasks to initial state"
              style={{ fontSize: '0.78rem' }}
            >
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Task List (Preserved) */}
        {filteredTasks.length > 0 ? (
          <div className="revision-tasks-list">
            {filteredTasks.map((task) => {
              const priorityClasses: Record<string, string> = {
                Urgent: 'badge-urgent',
                High: 'badge-high',
                Medium: 'badge-medium',
                Low: 'badge-low'
              };

              return (
                <div
                  key={task.id}
                  className={`task-row-card ${task.completed ? 'task-completed' : ''}`}
                >
                  <label className="checkbox-custom-wrap">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <span className="checkbox-box"></span>
                  </label>

                  <div className="task-info-col">
                    <div className="task-meta-line">
                      <span className={`priority-tag ${priorityClasses[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="task-subject-tag">{task.subject}</span>
                      <span className="task-due-text">⏱️ {task.dueText}</span>
                    </div>
                    <strong className="task-title-text">{task.title}</strong>
                  </div>

                  <div className="task-score-col">
                    <span className="task-retention-rate">
                      {task.memoryScore}%
                    </span>
                    <span className="task-retention-caption">Memory Strength</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-card">
            <span className="empty-emoji" aria-hidden="true">
              🎉
            </span>
            <h3>No tasks found in this view</h3>
            <p>You have reviewed all items matching this filter!</p>
          </div>
        )}
      </div>
    </div>
  );
};
