import React, { useState, useEffect } from 'react';
import type { QuizQuestion, QuizResultRecord, QuizTopicBreakdown, GeneratedNote } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { getUserSkillProfile, getSkillConfig } from '../utils/skillPersonalization';
import { recordLearningActivity } from '../utils/activityTracker';
import {
  AVAILABLE_TOPICS,
  getAvailableTopicsWithCounts,
  getQuestionsForCustomQuiz,
  analyzeQuizTopicPerformance,
  WEAK_TOPIC_ACCURACY_THRESHOLD,
  MIN_QUESTIONS_FOR_WEAK_ASSESSMENT,
  getRecentQuizQuestionIds,
  recordRecentQuizQuestionIds,
  getSeenQuestionsTracker,
  recordSeenQuestions,
  clearSeenQuestionsTracker,
  getDiagnosticQuestions
} from '../data/quizBank';

interface QuizViewProps {
  questions: QuizQuestion[];
  onShowToast: (msg: string) => void;
  onNavigateToRevision: () => void;
  onNavigateToNotes?: (payload?: { noteId?: string; topic?: string }) => void;
  initialTopic?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions: defaultQuestions,
  onShowToast,
  onNavigateToRevision,
  onNavigateToNotes,
  initialTopic
}) => {
  // Top-level mode: 'diagnostic' (instant feedback track) or 'custom' (Stage 4 custom practice engine)
  const [activeMode, setActiveMode] = useState<'diagnostic' | 'custom'>('diagnostic');

  // Persistent quiz attempts history
  const [savedAttempts, setSavedAttempts] = useState<QuizResultRecord[]>(() => {
    const stored = storage.get<QuizResultRecord[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
    return Array.isArray(stored) ? stored : [];
  });
  const [showHistoryTray, setShowHistoryTray] = useState(false);

  // =========================================================================
  // MODE 1: Quick Diagnostic Track State (Stage 1 & Stage 2 backward-compatible)
  // =========================================================================
  const [activeTrack, setActiveTrack] = useState<string>('all');
  const [diagQuestionsList, setDiagQuestionsList] = useState<QuizQuestion[]>(() => {
    return defaultQuestions && defaultQuestions.length > 0 ? defaultQuestions : getDiagnosticQuestions('all', 3);
  });
  const [diagIndex, setDiagIndex] = useState(0);
  const [diagSelectedOption, setDiagSelectedOption] = useState<number | null>(null);
  const [diagUserScore, setDiagUserScore] = useState(0);
  const [diagFinished, setDiagFinished] = useState(false);
  const [diagAttemptSaved, setDiagAttemptSaved] = useState(false);
  const [diagAnsweredHistory, setDiagAnsweredHistory] = useState<
    { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  >([]);

  const filteredDiagQuestions = activeTrack === 'all'
    ? diagQuestionsList
    : diagQuestionsList.filter((q) => q.track === activeTrack);

  const currentDiagQ = filteredDiagQuestions[diagIndex] || filteredDiagQuestions[0];

  const handleDiagSelectOption = (index: number) => {
    if (diagSelectedOption !== null) return;
    setDiagSelectedOption(index);
    const isCorrect = index === currentDiagQ.correctAnswerIndex;

    if (isCorrect) {
      setDiagUserScore((prev) => prev + 1);
      onShowToast('Correct answer! +1 Point 🎯');
    } else {
      onShowToast('Incorrect. Review the rationale below 💡');
    }

    setDiagAnsweredHistory((prev) => [
      ...prev,
      {
        questionId: currentDiagQ.id,
        selectedIndex: index,
        isCorrect
      }
    ]);
  };

  const handleDiagFinish = (finalScore: number, history: typeof diagAnsweredHistory) => {
    setDiagFinished(true);
    if (diagAttemptSaved) return;

    setDiagAttemptSaved(true);
    const pct = Math.round((finalScore / filteredDiagQuestions.length) * 100);
    const newRecord: QuizResultRecord = {
      id: `quiz-attempt-${Date.now()}`,
      track: activeTrack === 'all' ? 'All Tracks' : activeTrack.toUpperCase(),
      difficulty: currentDiagQ?.difficulty || 'Medium',
      mode: 'diagnostic',
      score: finalScore,
      totalQuestions: filteredDiagQuestions.length,
      percentage: pct,
      completedAt: new Date().toISOString(),
      answeredHistory: history
    };

    setSavedAttempts((prev) => {
      if (prev.some((a) => a.id === newRecord.id)) return prev;
      const updated = [newRecord, ...prev];
      storage.set(STORAGE_KEYS.QUIZ_HISTORY, updated);
      return updated;
    });

    // Record meaningful learning activity for streak & daily tracker
    recordLearningActivity({
      type: 'quiz',
      title: `Diagnostic Quiz (${filteredDiagQuestions.length} Questions)`,
      category: 'Diagnostic Assessment',
      score: `${finalScore}/${filteredDiagQuestions.length} (${pct}%)`,
      icon: '🎯'
    });

    onShowToast(`Saved assessment score: ${finalScore}/${filteredDiagQuestions.length} (${pct}%) 🏆`);
  };

  const handleDiagNext = () => {
    if (diagIndex < filteredDiagQuestions.length - 1) {
      setDiagIndex((prev) => prev + 1);
      setDiagSelectedOption(null);
    } else {
      handleDiagFinish(diagUserScore, diagAnsweredHistory);
    }
  };

  const handleDiagRestart = (fresh: boolean = true, targetTrack?: string) => {
    const trackToUse = targetTrack !== undefined ? targetTrack : activeTrack;
    setDiagIndex(0);
    setDiagSelectedOption(null);
    setDiagUserScore(0);
    setDiagFinished(false);
    setDiagAnsweredHistory([]);
    setDiagAttemptSaved(false);
    if (fresh) {
      const freshQuestions = getDiagnosticQuestions(trackToUse, 3, diagQuestionsList.map((q) => q.id));
      if (freshQuestions.length > 0) {
        setDiagQuestionsList(freshQuestions);
        recordSeenQuestions(freshQuestions);
      }
    }
    onShowToast('Assessment restarted with fresh questions! 🎯');
  };

  // =========================================================================
  // MODE 2: Custom Practice Quiz Engine State (Stage 4)
  // =========================================================================
  type CustomStage = 'setup' | 'answering' | 'review' | 'results';
  const [customStage, setCustomStage] = useState<CustomStage>('setup');

  const userSkillProfile = getUserSkillProfile();
  const activeSkillConfig = getSkillConfig(userSkillProfile?.primarySkill);

  // Setup options
  const [setupTopic, setSetupTopic] = useState<string>(() => initialTopic || activeSkillConfig.quizTopicId || 'react');
  const [setupDifficulty, setSetupDifficulty] = useState<'Any' | 'Easy' | 'Medium' | 'Hard'>('Any');
  const [setupCount, setSetupCount] = useState<number>(5);

  useEffect(() => {
    const handleSkillChanged = (e: any) => {
      if (e.detail?.primarySkill) {
        const nextConfig = getSkillConfig(e.detail.primarySkill);
        setSetupTopic(nextConfig.quizTopicId || 'react');
      }
    };
    window.addEventListener('smartbridge:skill-changed', handleSkillChanged);
    return () => window.removeEventListener('smartbridge:skill-changed', handleSkillChanged);
  }, []);

  // Synchronize initialTopic from recommendation action during render
  const [prevInitialTopic, setPrevInitialTopic] = useState(initialTopic);
  if (initialTopic !== prevInitialTopic) {
    setPrevInitialTopic(initialTopic);
    if (initialTopic) {
      setSetupTopic(initialTopic);
      setActiveMode('custom');
      setCustomStage('setup');
    }
  }

  // Active quiz session state
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[]>([]);
  const [customIndex, setCustomIndex] = useState(0);
  const [customAnswers, setCustomAnswers] = useState<Record<string, number>>({});
  const [customAttemptSaved, setCustomAttemptSaved] = useState(false);

  // calculated results
  const [customResults, setCustomResults] = useState<{
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    totalQuestions: number;
    percentage: number;
    topicBreakdowns: QuizTopicBreakdown[];
  } | null>(null);

  // AI & Exhaustion state
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [quizSource, setQuizSource] = useState<'local' | 'gemini' | 'ollama'>('local');
  const [quizExhaustionInfo, setQuizExhaustionInfo] = useState<{ isExhausted: boolean; message?: string } | null>(null);

  // Retrieve saved notes to cross-reference with weak topics
  const savedNotes = storage.get<GeneratedNote[]>(STORAGE_KEYS.NOTES, []);

  // Compute live question availability during setup
  const previewData = getQuestionsForCustomQuiz({
    topicId: setupTopic,
    difficulty: setupDifficulty,
    requestedCount: setupCount,
    isPreview: true
  });

  const handleStartCustomQuiz = async (opts?: { forceAi?: boolean }) => {
    const matchedMeta = AVAILABLE_TOPICS.find((t) => t.id === setupTopic);
    const targetTopicName = matchedMeta ? matchedMeta.name : setupTopic;
    const recentIds = getRecentQuizQuestionIds();
    const seenTracker = getSeenQuestionsTracker();

    // 1. AI Generation path (if explicitly triggered)
    if (opts?.forceAi) {
      setIsAiGenerating(true);
      onShowToast(`Generating fresh questions for ${targetTopicName} via AI... 🤖`);
      try {
        const excludeTexts = seenTracker
          .filter((e) => e.topic === targetTopicName)
          .slice(-10)
          .map((e) => e.normalizedText);

        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: targetTopicName,
            difficulty: setupDifficulty,
            count: setupCount,
            excludeQuestions: excludeTexts,
            provider: 'auto'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok && Array.isArray(data.questions) && data.questions.length > 0) {
            recordSeenQuestions(data.questions);
            recordRecentQuizQuestionIds(data.questions.map((q: QuizQuestion) => q.id));
            setCustomQuestions(data.questions);
            setQuizSource(data.source === 'ollama' ? 'ollama' : 'gemini');
            setQuizExhaustionInfo(null);
            setCustomIndex(0);
            setCustomAnswers({});
            setCustomResults(null);
            setCustomAttemptSaved(false);
            setCustomStage('answering');
            setIsAiGenerating(false);
            onShowToast(`Started AI-Generated Custom Quiz: ${data.questions.length} Questions (${data.source === 'ollama' ? '🦙 Ollama' : '🌟 Gemini'})! 🚀`);
            return;
          }
        }
      } catch (err) {
        console.warn('AI Quiz Generation failed, falling back to local question bank:', err);
      } finally {
        setIsAiGenerating(false);
      }
    }

    // 2. Local Question Bank path
    const freshData = getQuestionsForCustomQuiz({
      topicId: setupTopic,
      difficulty: setupDifficulty,
      requestedCount: setupCount,
      excludeRecentIds: recentIds
    });

    if (freshData.error || freshData.availableCount === 0) {
      onShowToast('Cannot start: No questions available for selected criteria ⚠️');
      return;
    }

    const targetQuestions = freshData.questions;
    recordSeenQuestions(targetQuestions);
    recordRecentQuizQuestionIds(targetQuestions.map((q) => q.id));

    setCustomQuestions(targetQuestions);
    setQuizSource('local');

    if (freshData.isExhausted) {
      setQuizExhaustionInfo({
        isExhausted: true,
        message: freshData.exhaustedMessage
      });
    } else {
      setQuizExhaustionInfo(null);
    }

    setCustomIndex(0);
    setCustomAnswers({});
    setCustomResults(null);
    setCustomAttemptSaved(false);
    setCustomStage('answering');
    onShowToast(`Started Custom Quiz: ${targetQuestions.length} Questions 🚀`);
  };

  const handleResetTopicTracking = () => {
    clearSeenQuestionsTracker(setupTopic);
    setQuizExhaustionInfo(null);
    onShowToast(`Reset question tracker for this topic! Fresh questions will start over. ↺`);
  };

  const handleSelectCustomAnswer = (questionId: string, optionIndex: number) => {
    // Allows updating/changing answer freely prior to final submission
    setCustomAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleCustomPrev = () => {
    if (customIndex > 0) {
      setCustomIndex((prev) => prev - 1);
    }
  };

  const handleCustomNext = () => {
    if (customIndex < customQuestions.length - 1) {
      setCustomIndex((prev) => prev + 1);
    }
  };

  const handleGoToReview = () => {
    setCustomStage('review');
  };

  const handleFinalSubmit = () => {
    if (customAttemptSaved) return;

    // 1. Calculate Dynamic Results
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const answerHistoryEntries: QuizResultRecord['answeredHistory'] = [];

    customQuestions.forEach((q) => {
      const chosen = customAnswers[q.id];
      if (chosen === undefined) {
        unanswered += 1;
        answerHistoryEntries.push({
          questionId: q.id,
          selectedIndex: -1,
          isCorrect: false,
          questionText: q.question,
          selectedText: 'Not Answered',
          correctText: q.options[q.correctAnswerIndex],
          explanation: q.explanation,
          topic: q.topic
        });
      } else if (chosen === q.correctAnswerIndex) {
        correct += 1;
        answerHistoryEntries.push({
          questionId: q.id,
          selectedIndex: chosen,
          isCorrect: true,
          questionText: q.question,
          selectedText: q.options[chosen],
          correctText: q.options[q.correctAnswerIndex],
          explanation: q.explanation,
          topic: q.topic
        });
      } else {
        incorrect += 1;
        answerHistoryEntries.push({
          questionId: q.id,
          selectedIndex: chosen,
          isCorrect: false,
          questionText: q.question,
          selectedText: q.options[chosen],
          correctText: q.options[q.correctAnswerIndex],
          explanation: q.explanation,
          topic: q.topic
        });
      }
    });

    const total = customQuestions.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const topicBreakdowns = analyzeQuizTopicPerformance(customQuestions, customAnswers);

    const calculatedResult = {
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      totalQuestions: total,
      percentage: pct,
      topicBreakdowns
    };

    setCustomResults(calculatedResult);
    setCustomAttemptSaved(true);
    setCustomStage('results');

    // 2. Persist Attempt to localStorage (smartbridge_quiz_history_v1)
    const topicLabel = setupTopic === 'all'
      ? 'Mixed Topics'
      : AVAILABLE_TOPICS.find((t) => t.id === setupTopic)?.name || setupTopic;

    const newRecord: QuizResultRecord = {
      id: `quiz-attempt-${Date.now()}`,
      track: topicLabel,
      difficulty: setupDifficulty,
      mode: 'custom',
      score: correct,
      totalQuestions: total,
      percentage: pct,
      completedAt: new Date().toISOString(),
      topicBreakdowns,
      answeredHistory: answerHistoryEntries
    };

    setSavedAttempts((prev) => {
      if (prev.some((a) => a.id === newRecord.id)) return prev;
      const updated = [newRecord, ...prev];
      storage.set(STORAGE_KEYS.QUIZ_HISTORY, updated);
      return updated;
    });

    // Record meaningful learning activity for streak & daily tracker
    const matchedMeta = AVAILABLE_TOPICS.find((t) => t.id === setupTopic);
    const targetTopicLabel = matchedMeta ? matchedMeta.name : setupTopic === 'all' ? 'Mixed Topics' : setupTopic;
    recordLearningActivity({
      type: 'quiz',
      title: `Completed ${targetTopicLabel} Quiz`,
      category: 'Practice Assessment',
      score: `${correct}/${total} (${pct}%)`,
      icon: '🎯'
    });

    onShowToast(`Quiz completed: ${correct}/${total} (${pct}%) 🏆`);
  };

  const handleRetakeCustomQuiz = () => {
    // Retake the same question set for active recall; starts a fresh attempt
    setCustomIndex(0);
    setCustomAnswers({});
    setCustomResults(null);
    setCustomAttemptSaved(false);
    setCustomStage('answering');
    onShowToast('Retaking custom quiz. Best of luck!');
  };

  const handleBackToSetup = () => {
    setCustomStage('setup');
    setCustomQuestions([]);
    setCustomAnswers({});
    setCustomResults(null);
    setCustomAttemptSaved(false);
  };

  const handleClearHistory = () => {
    storage.remove(STORAGE_KEYS.QUIZ_HISTORY);
    setSavedAttempts([]);
    onShowToast('Cleared quiz history from local storage 🧹');
  };

  const currentCustomQ = customQuestions[customIndex] || customQuestions[0];
  const customAnsweredCount = Object.keys(customAnswers).length;
  const customUnansweredCount = customQuestions.length - customAnsweredCount;

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header-row">
        <div>
          <span className="eyebrow">PRACTICE & ASSESSMENT ENGINE</span>
          <h1 className="view-main-title">Quiz & Technical Practice</h1>
          <p className="view-desc">
            Test and benchmark software concepts with interactive, auto-graded practice sessions and topic diagnostics.
          </p>
        </div>

        {/* Storage and History Badge */}
        <div className="demo-notice-badge">
          <span className="badge-pulse"></span>
          <div>
            <strong>Stage 4: Custom Quiz Engine</strong>
            <span className="demo-notice-sub">
              {savedAttempts.length} attempt{savedAttempts.length !== 1 ? 's' : ''} saved locally
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selector Tab Tray */}
      <div className="quiz-mode-nav-tray" role="tablist" aria-label="Quiz Practice Modes">
        <button
          type="button"
          id="tab-custom-quiz"
          role="tab"
          aria-selected={activeMode === 'custom'}
          className={`btn-mode-tab ${activeMode === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setActiveMode('custom');
            if (customStage === 'results') {
              setCustomStage('setup');
            }
          }}
        >
          <span>🎯 Custom Practice Quiz</span>
          <span className="mode-pill-badge">Stage 4</span>
        </button>
        <button
          type="button"
          id="tab-diagnostic-quiz"
          role="tab"
          aria-selected={activeMode === 'diagnostic'}
          className={`btn-mode-tab ${activeMode === 'diagnostic' ? 'active' : ''}`}
          onClick={() => setActiveMode('diagnostic')}
        >
          <span>⚡ Quick Diagnostic Track</span>
          <span className="mode-pill-sub">Rapid Review</span>
        </button>

        {savedAttempts.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => setShowHistoryTray((prev) => !prev)}
          >
            {showHistoryTray ? 'Hide History ✕' : `📜 Past History (${savedAttempts.length})`}
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PAST ATTEMPTS DRAWER / HISTORY PANEL                                      */}
      {/* ========================================================================= */}
      {showHistoryTray && (
        <div className="content-card quiz-history-drawer-card">
          <div className="card-header-clean">
            <div>
              <h3 className="card-title">📜 Local Storage Quiz History</h3>
              <p className="card-subtitle">
                Attempts saved offline in <code>smartbridge_quiz_history_v1</code>
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClearHistory}
              title="Clear all saved quiz history"
            >
              Clear History
            </button>
          </div>

          <div className="quiz-history-list">
            {savedAttempts.map((attempt) => (
              <div key={attempt.id} className="quiz-history-item-row">
                <div className="history-item-left">
                  <span className="history-track-badge">{attempt.track}</span>
                  {attempt.difficulty && (
                    <span className="badge-subtle">{attempt.difficulty}</span>
                  )}
                  <span className="history-time-stamp">
                    {new Date(attempt.completedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="history-item-right">
                  <span
                    className={`history-score-tag ${
                      attempt.percentage >= 60 ? 'score-tag-pass' : 'score-tag-warn'
                    }`}
                  >
                    {attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: QUICK DIAGNOSTIC TRACK VIEW (STAGE 1 & 2 REGRESSION PRESERVED)    */}
      {/* ========================================================================= */}
      {activeMode === 'diagnostic' && (
        <>
          {/* Track Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="track-filter-pills" role="radiogroup" aria-label="Filter Track">
              <button
                type="button"
                className={`track-pill-btn ${activeTrack === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTrack('all');
                  handleDiagRestart();
                }}
              >
                All Tracks ({defaultQuestions.length})
              </button>
              <button
                type="button"
                className={`track-pill-btn ${activeTrack === 'webdev' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTrack('webdev');
                  handleDiagRestart();
                }}
              >
                🌐 Web Dev
              </button>
              <button
                type="button"
                className={`track-pill-btn ${activeTrack === 'cs' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTrack('cs');
                  handleDiagRestart();
                }}
              >
                💻 Computer Science
              </button>
              <button
                type="button"
                className={`track-pill-btn ${activeTrack === 'data' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTrack('data');
                  handleDiagRestart();
                }}
              >
                📊 Data & SQL
              </button>
            </div>
          </div>

          {!diagFinished ? (
            <div className="content-card quiz-card-container">
              {/* Question Progress and Header */}
              <div className="quiz-card-header">
                <div className="quiz-step-meta">
                  <span className="quiz-step-counter">
                    Question {diagIndex + 1} of {filteredDiagQuestions.length}
                  </span>
                  <span className="badge-subtle">Difficulty: {currentDiagQ?.difficulty}</span>
                </div>
                <div className="quiz-progress-bar-rail">
                  <div
                    className="quiz-progress-bar-fill"
                    style={{
                      width: `${((diagIndex + 1) / filteredDiagQuestions.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Question Title */}
              <h2 className="quiz-question-title">{currentDiagQ?.question}</h2>

              {/* Options */}
              <div className="quiz-options-grid" role="radiogroup" aria-label="Quiz Answer Options">
                {currentDiagQ?.options.map((opt, idx) => {
                  let optionClass = 'quiz-option-button';
                  if (diagSelectedOption !== null) {
                    if (idx === currentDiagQ.correctAnswerIndex) {
                      optionClass += ' option-correct';
                    } else if (idx === diagSelectedOption) {
                      optionClass += ' option-incorrect';
                    } else {
                      optionClass += ' option-faded';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={optionClass}
                      onClick={() => handleDiagSelectOption(idx)}
                      disabled={diagSelectedOption !== null}
                    >
                      <span className="option-letter-badge">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="option-text-label">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Rationale Box */}
              {diagSelectedOption !== null && (
                <div
                  className={`quiz-rationale-box ${
                    diagSelectedOption === currentDiagQ?.correctAnswerIndex
                      ? 'rationale-success'
                      : 'rationale-error'
                  }`}
                >
                  <div className="rationale-header">
                    {diagSelectedOption === currentDiagQ?.correctAnswerIndex ? (
                      <strong>✅ Well done! That is correct.</strong>
                    ) : (
                      <strong>❌ Incorrect. Here is why:</strong>
                    )}
                  </div>
                  <p className="rationale-body">{currentDiagQ?.explanation}</p>
                </div>
              )}

              {/* Actions Row */}
              <div className="quiz-actions-row">
                <span className="quiz-score-indicator">
                  Current Score: <strong>{diagUserScore}</strong> / {filteredDiagQuestions.length}
                </span>

                {diagSelectedOption !== null && (
                  <button type="button" className="btn btn-primary" onClick={handleDiagNext}>
                    {diagIndex < filteredDiagQuestions.length - 1
                      ? 'Next Question →'
                      : 'Finish Assessment →'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="content-card quiz-summary-card">
              <div className="summary-trophy-icon" aria-hidden="true">🏆</div>
              <h2 className="summary-title">Assessment Completed!</h2>
              <p className="summary-desc">
                You answered <strong>{diagUserScore}</strong> out of{' '}
                <strong>{filteredDiagQuestions.length}</strong> questions correctly ({Math.round((diagUserScore / filteredDiagQuestions.length) * 100)}% accuracy).
              </p>

              <div className="summary-meter-wrap">
                <div className="summary-meter-bar">
                  <div
                    className="summary-meter-fill"
                    style={{
                      width: `${(diagUserScore / filteredDiagQuestions.length) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="summary-score-pct">
                  {Math.round((diagUserScore / filteredDiagQuestions.length) * 100)}% Proficiency
                </span>
              </div>

              <div className="quiz-history-review" style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {diagAnsweredHistory.map((item, i) => (
                  <span
                    key={item.questionId}
                    className="badge-subtle"
                    style={{
                      color: item.isCorrect ? '#4ade80' : '#f87171',
                      borderColor: item.isCorrect ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)',
                      background: item.isCorrect ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                      fontWeight: 700
                    }}
                  >
                    Q{i + 1}: {item.isCorrect ? '✓' : '✗'}
                  </span>
                ))}
              </div>

              <div style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                💾 Result automatically saved to <code>localStorage</code> history!
              </div>

              <div className="summary-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleDiagRestart(true)}
                >
                  ↺ Retake Assessment
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onNavigateToRevision}
                >
                  Review in Smart Revision 🎴
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CUSTOM PRACTICE QUIZ ENGINE (STAGE 4 FULL IMPLEMENTATION)        */}
      {/* ========================================================================= */}
      {activeMode === 'custom' && (
        <div className="custom-quiz-wrapper">
          {/* --------------------------------------------------------------------- */}
          {/* SUB-STATE A: SETUP SCREEN                                             */}
          {/* --------------------------------------------------------------------- */}
          {customStage === 'setup' && (
            <div className="content-card custom-quiz-setup-card">
              <div className="card-header-clean">
                <div>
                  <h2 className="card-title">⚙️ Custom Quiz Setup</h2>
                  <p className="card-subtitle">
                    Select a topic, targeted difficulty, and question count to build an adaptive practice set.
                  </p>
                </div>
                <span className="badge-subtle">Local Question Bank: 30 Questions</span>
              </div>

              <div className="setup-fields-grid">
                {/* 1. Topic Selection */}
                <div className="setup-field-group">
                  <label htmlFor="custom-topic-select" className="form-label">
                    Technical Topic
                  </label>
                  <select
                    id="custom-topic-select"
                    className="form-select"
                    value={setupTopic}
                    onChange={(e) => setSetupTopic(e.target.value)}
                  >
                    <option value="all">🌐 All Topics (Mixed Assessment)</option>
                    {getAvailableTopicsWithCounts().map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name} ({t.totalCount} questions)
                      </option>
                    ))}
                  </select>
                  <span className="field-hint-text">
                    {setupTopic === 'all'
                      ? 'Combines React, JavaScript, Algorithms, SQL, and CSS for a comprehensive test.'
                      : AVAILABLE_TOPICS.find((t) => t.id === setupTopic)?.description}
                  </span>
                </div>

                {/* 2. Difficulty Selection */}
                <div className="setup-field-group">
                  <span className="form-label">Target Difficulty</span>
                  <div className="pill-toggle-group" role="radiogroup" aria-label="Difficulty Filter">
                    {(['Any', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        className={`pill-option-btn ${setupDifficulty === diff ? 'active' : ''}`}
                        onClick={() => setSetupDifficulty(diff)}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                  <span className="field-hint-text">
                    {setupDifficulty === 'Any'
                      ? 'Includes mixed difficulty questions.'
                      : `Filters strictly for ${setupDifficulty}-tier conceptual questions.`}
                  </span>
                </div>

                {/* 3. Question Count Selection */}
                <div className="setup-field-group">
                  <span className="form-label">Number of Questions</span>
                  <div className="pill-toggle-group" role="radiogroup" aria-label="Question Count">
                    {[3, 5, 10].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        className={`pill-option-btn ${setupCount === cnt ? 'active' : ''}`}
                        onClick={() => setSetupCount(cnt)}
                      >
                        {cnt} Questions
                      </button>
                    ))}
                  </div>
                  <span className="field-hint-text">
                    Choose from 3 (Quick Sprint), 5 (Standard), or 10 (Deep Assessment).
                  </span>
                </div>
              </div>

              {/* Setup Diagnostics & Validation Banner */}
              <div
                className={`setup-validation-banner ${
                  previewData.availableCount === 0 ? 'banner-error' : 'banner-info'
                }`}
              >
                {previewData.availableCount === 0 ? (
                  <div>
                    <strong>⚠️ No questions available:</strong>{' '}
                    <span>{previewData.error || 'Please choose a different difficulty or topic.'}</span>
                  </div>
                ) : (
                  <div>
                    <strong>✓ Practice Set Ready:</strong>{' '}
                    <span>
                      {previewData.questions.length} questions selected{' '}
                      {previewData.availableCount < setupCount && (
                        <em>(Capped at {previewData.availableCount} available questions for this criteria)</em>
                      )}
                      .
                    </span>
                  </div>
                )}
              </div>

              {/* Start Quiz Action */}
              <div className="setup-actions-row" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  id="btn-start-custom-quiz"
                  className="btn btn-primary btn-lg btn-start-custom-quiz"
                  disabled={previewData.availableCount === 0 || isAiGenerating}
                  onClick={() => handleStartCustomQuiz()}
                >
                  {isAiGenerating ? 'Generating Quiz... ⏳' : `Start Custom Quiz 🚀 (${previewData.questions.length} Questions)`}
                </button>
                <button
                  type="button"
                  id="btn-generate-ai-quiz"
                  className="btn btn-secondary btn-lg btn-generate-ai-quiz"
                  disabled={isAiGenerating}
                  onClick={() => handleStartCustomQuiz({ forceAi: true })}
                  title="Generate dynamic, fresh multiple-choice questions via AI"
                >
                  {isAiGenerating ? 'Generating via AI... 🤖' : '🤖 Generate with AI'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-reset-topic-tracker"
                  onClick={handleResetTopicTracking}
                  title="Reset history of questions seen for this topic"
                  style={{ fontSize: '0.85rem' }}
                >
                  ↺ Reset Topic History
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SUB-STATE B: ANSWERING SCREEN (1-AT-A-TIME WITH PREV/NEXT)           */}
          {/* --------------------------------------------------------------------- */}
          {customStage === 'answering' && currentCustomQ && (
            <div className="content-card custom-quiz-question-card">
              {/* Exhaustion Banner if all offline questions practiced */}
              {quizExhaustionInfo?.isExhausted && (
                <div
                  className="quiz-exhaustion-notice"
                  role="alert"
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <strong>📚 Question Bank Exhausted:</strong>{' '}
                    <span>{quizExhaustionInfo.message || "You've practiced all offline questions for this topic. Showing a refreshed review mix."}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={handleResetTopicTracking}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    >
                      ↺ Reset Tracker
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => handleStartCustomQuiz({ forceAi: true })}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    >
                      🤖 Generate AI Questions
                    </button>
                  </div>
                </div>
              )}

              {/* Question Progress Header */}
              <div className="quiz-card-header">
                <div className="quiz-step-meta">
                  <span className="quiz-step-counter">
                    Question {customIndex + 1} of {customQuestions.length}
                  </span>
                  <span className="badge-subtle topic-badge">{currentCustomQ.topic}</span>
                  <span className="badge-subtle diff-badge">{currentCustomQ.difficulty}</span>
                  {quizSource === 'gemini' && (
                    <span className="badge-subtle" style={{ color: '#38bdf8' }}>🌟 Gemini AI</span>
                  )}
                  {quizSource === 'ollama' && (
                    <span className="badge-subtle" style={{ color: '#a855f7' }}>🦙 Ollama AI</span>
                  )}
                  {quizSource === 'local' && (
                    <span className="badge-subtle" style={{ color: '#94a3b8' }}>📚 Curriculum Bank</span>
                  )}
                </div>
                <div className="quiz-progress-bar-rail">
                  <div
                    className="quiz-progress-bar-fill"
                    style={{
                      width: `${((customIndex + 1) / customQuestions.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Question Content */}
              <h2 className="quiz-question-title">{currentCustomQ.question}</h2>

              {/* 4 Interactive Options */}
              <div
                className="quiz-options-grid"
                role="radiogroup"
                aria-label={`Options for Question ${customIndex + 1}`}
              >
                {currentCustomQ.options.map((opt, idx) => {
                  const isSelected = customAnswers[currentCustomQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`custom-quiz-option-button ${isSelected ? 'option-selected' : ''}`}
                      onClick={() => handleSelectCustomAnswer(currentCustomQ.id, idx)}
                    >
                      <span className="option-letter-badge">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="option-text-label">{opt}</span>
                      {isSelected && <span className="option-checked-mark">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Answering Status & Navigation Controls */}
              <div className="custom-nav-bar">
                <button
                  type="button"
                  className="btn btn-secondary btn-quiz-prev"
                  disabled={customIndex === 0}
                  onClick={handleCustomPrev}
                >
                  ← Previous
                </button>

                <div className="custom-nav-center-status">
                  {customAnswers[currentCustomQ.id] !== undefined ? (
                    <span className="status-answered-tag">✓ Answer selected</span>
                  ) : (
                    <span className="status-unanswered-tag">⚪ Not answered yet</span>
                  )}
                  <span className="total-progress-note">
                    {customAnsweredCount} of {customQuestions.length} answered
                  </span>
                </div>

                {customIndex < customQuestions.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-quiz-next"
                    onClick={handleCustomNext}
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-quiz-review"
                    onClick={handleGoToReview}
                  >
                    Review & Submit Quiz →
                  </button>
                )}
              </div>

              {/* Abandon to Setup safety button */}
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn-text-link"
                  onClick={handleBackToSetup}
                >
                  Quit to Quiz Setup
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SUB-STATE C: REVIEW & CONFIRMATION STEP                               */}
          {/* --------------------------------------------------------------------- */}
          {customStage === 'review' && (
            <div className="content-card custom-quiz-review-card">
              <div className="card-header-clean">
                <div>
                  <h2 className="card-title">📋 Review Your Quiz Answers</h2>
                  <p className="card-subtitle">
                    Verify all answers before final grading. You can return to any question to make adjustments.
                  </p>
                </div>
                <span className="badge-subtle">
                  {customAnsweredCount} / {customQuestions.length} Answered
                </span>
              </div>

              {/* Unanswered Questions Warning */}
              {customUnansweredCount > 0 ? (
                <div className="review-warning-box">
                  <strong>⚠️ You have {customUnansweredCount} unanswered question(s).</strong>
                  <p>
                    Unanswered questions will receive 0 points if you submit now. You can return to any question using the buttons below.
                  </p>
                </div>
              ) : (
                <div className="review-success-box">
                  <strong>✅ All {customQuestions.length} questions answered!</strong>
                  <p>You are ready for final scoring and learning diagnostics.</p>
                </div>
              )}

              {/* Question-by-Question Review List */}
              <div className="review-questions-list">
                {customQuestions.map((q, idx) => {
                  const chosenIdx = customAnswers[q.id];
                  const hasAnswered = chosenIdx !== undefined;

                  return (
                    <div key={q.id} className="review-question-row">
                      <div className="review-row-num">Q{idx + 1}</div>
                      <div className="review-row-content">
                        <div className="review-row-title">{q.question}</div>
                        <div className="review-row-sub">
                          <span className="badge-subtle">{q.topic}</span>
                          {hasAnswered ? (
                            <span className="review-status-tag tag-answered">
                              Selected: Option {String.fromCharCode(65 + chosenIdx)} ({q.options[chosenIdx]})
                            </span>
                          ) : (
                            <span className="review-status-tag tag-unanswered">
                              ⚠️ Unanswered
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setCustomIndex(idx);
                          setCustomStage('answering');
                        }}
                      >
                        Edit Answer
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Confirmation Actions Row */}
              <div className="review-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary btn-back-to-questions"
                  onClick={() => setCustomStage('answering')}
                >
                  ← Back to Questions
                </button>
                <button
                  type="button"
                  id="btn-confirm-submit"
                  className="btn btn-primary btn-confirm-submit"
                  onClick={handleFinalSubmit}
                >
                  Confirm Final Submission ✓
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SUB-STATE D: RESULTS & WEAK-TOPIC DIAGNOSTICS                         */}
          {/* --------------------------------------------------------------------- */}
          {customStage === 'results' && customResults && (
            <div className="custom-results-container">
              {/* Score Hero Card */}
              <div className="content-card custom-score-hero-card">
                <div className="summary-trophy-icon" aria-hidden="true">
                  {customResults.percentage >= 80 ? '🏆' : customResults.percentage >= 60 ? '📈' : '📚'}
                </div>
                <h2 className="summary-title">Assessment Completed!</h2>
                <p className="summary-desc">
                  You scored <strong>{customResults.correctCount}</strong> out of{' '}
                  <strong>{customResults.totalQuestions}</strong> correct (
                  <strong>{customResults.percentage}% Accuracy</strong>).
                </p>

                {/* Accuracy Meter */}
                <div className="summary-meter-wrap">
                  <div className="summary-meter-bar">
                    <div
                      className="summary-meter-fill"
                      style={{ width: `${customResults.percentage}%` }}
                    ></div>
                  </div>
                  <span className="summary-score-pct">{customResults.percentage}% Mastery</span>
                </div>

                {/* Score Pill Chips */}
                <div className="results-chips-row">
                  <span className="score-stat-chip chip-correct">
                    ✅ {customResults.correctCount} Correct
                  </span>
                  <span className="score-stat-chip chip-incorrect">
                    ❌ {customResults.incorrectCount} Incorrect
                  </span>
                  {customResults.unansweredCount > 0 && (
                    <span className="score-stat-chip chip-unanswered">
                      ⚠️ {customResults.unansweredCount} Unanswered
                    </span>
                  )}
                </div>

                <div className="storage-save-confirmation-pill">
                  💾 Attempt recorded in local storage history!
                </div>
              </div>

              {/* Weak-Topic Detection & Learning Gaps Card */}
              <div className="content-card weak-topic-analysis-card">
                <div className="card-header-clean">
                  <div>
                    <h3 className="card-title">🎯 Topic Breakdown & Weak-Topic Detection</h3>
                    <p className="card-subtitle">
                      Diagnostic accuracy evaluated per technical domain (Threshold: &lt;{WEAK_TOPIC_ACCURACY_THRESHOLD}% accuracy with &ge;{MIN_QUESTIONS_FOR_WEAK_ASSESSMENT} questions).
                    </p>
                  </div>
                </div>

                <div className="topic-breakdown-list">
                  {customResults.topicBreakdowns.map((tb) => {
                    // Check if student has a saved note on this topic
                    const matchingNote = savedNotes.find(
                      (n) =>
                        n.topic.toLowerCase().includes(tb.topic.toLowerCase()) ||
                        tb.topic.toLowerCase().includes(n.topic.toLowerCase()) ||
                        n.title.toLowerCase().includes(tb.topic.toLowerCase())
                    );

                    return (
                      <div
                        key={tb.topic}
                        className={`topic-breakdown-card ${
                          tb.isWeak ? 'card-topic-weak' : tb.insufficientEvidence ? 'card-topic-neutral' : 'card-topic-strong'
                        }`}
                      >
                        <div className="topic-card-header">
                          <div>
                            <strong className="topic-card-title">{tb.topic}</strong>
                            <div className="topic-card-score-sub">
                              {tb.correct} of {tb.total} correct ({tb.percentage}%)
                            </div>
                          </div>

                          <div className="topic-status-badge">
                            {tb.isWeak ? (
                              <span className="tag-weak-alert">⚠️ Needs Focus / Weak</span>
                            ) : tb.insufficientEvidence ? (
                              <span className="tag-neutral-alert">ℹ️ Insufficient Evidence</span>
                            ) : (
                              <span className="tag-strong-alert">✓ Strong Comprehension</span>
                            )}
                          </div>
                        </div>

                        {/* Explanation for insufficient evidence or weak topic */}
                        {tb.insufficientEvidence && (
                          <p className="topic-insufficient-note">
                            Not enough questions to assess this topic accurately ({tb.total} question answered). Answer at least {MIN_QUESTIONS_FOR_WEAK_ASSESSMENT} questions in this topic for an accurate assessment.
                          </p>
                        )}

                        {/* Weak Topic Remediation Recommendation */}
                        {tb.isWeak && (
                          <div className="weak-topic-remediation-box">
                            {matchingNote ? (
                              <div className="remediation-match">
                                <span>
                                  📄 <strong>Recommended Saved Note:</strong> "{matchingNote.title}"
                                </span>
                                {onNavigateToNotes && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm btn-goto-note"
                                    onClick={() => onNavigateToNotes({ noteId: matchingNote.id, topic: tb.topic })}
                                  >
                                    Review Note in Library 📝
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="remediation-create">
                                <span>
                                  💡 <strong>No saved note found for this topic yet.</strong> Generate a targeted note in the Notes Generator to close this gap.
                                </span>
                                {onNavigateToNotes && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm btn-create-topic-note"
                                    onClick={() => onNavigateToNotes({ topic: tb.topic })}
                                  >
                                    Generate Study Note 📝
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Question-by-Question Review with Explanations */}
              <div className="content-card custom-review-accordion-card">
                <div className="card-header-clean">
                  <div>
                    <h3 className="card-title">📖 Comprehensive Question Review & Explanations</h3>
                    <p className="card-subtitle">
                      Review correct answers and rationale for every question in this practice set.
                    </p>
                  </div>
                </div>

                <div className="questions-detail-review-list">
                  {customQuestions.map((q, idx) => {
                    const chosenIdx = customAnswers[q.id];
                    const isCorrect = chosenIdx === q.correctAnswerIndex;
                    const isUnanswered = chosenIdx === undefined;

                    return (
                      <div
                        key={q.id}
                        className={`detail-review-item ${
                          isCorrect ? 'item-correct' : isUnanswered ? 'item-unanswered' : 'item-incorrect'
                        }`}
                      >
                        <div className="detail-review-header">
                          <span className="detail-q-badge">Question {idx + 1}</span>
                          <span className="badge-subtle">{q.topic}</span>
                          <span className="badge-subtle">{q.difficulty}</span>

                          <span className="detail-result-tag">
                            {isCorrect
                              ? '✅ Correct'
                              : isUnanswered
                              ? '⚠️ Not Answered'
                              : '❌ Incorrect'}
                          </span>
                        </div>

                        <h4 className="detail-q-title">{q.question}</h4>

                        {/* Options comparison */}
                        <div className="detail-options-breakdown">
                          {q.options.map((opt, optIdx) => {
                            const isThisCorrect = optIdx === q.correctAnswerIndex;
                            const isThisChosen = optIdx === chosenIdx;

                            let optRowClass = 'detail-opt-row';
                            if (isThisCorrect) optRowClass += ' opt-is-correct';
                            if (isThisChosen && !isThisCorrect) optRowClass += ' opt-is-wrong';

                            return (
                              <div key={optIdx} className={optRowClass}>
                                <span className="opt-marker">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="opt-text">{opt}</span>
                                {isThisCorrect && (
                                  <span className="opt-tag tag-correct-ans">Correct Answer ✓</span>
                                )}
                                {isThisChosen && !isThisCorrect && (
                                  <span className="opt-tag tag-your-ans">Your Answer ✗</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Rationale explanation box */}
                        <div className="detail-rationale-box">
                          <strong>💡 Conceptual Explanation:</strong>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exhaustion Notice on Results Screen */}
              {quizExhaustionInfo?.isExhausted && (
                <div
                  className="quiz-exhaustion-notice-results"
                  style={{
                    margin: '1.25rem 0',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <strong>📚 Topic Pool Fully Explored:</strong>{' '}
                    <span>{quizExhaustionInfo.message || "You've practiced all offline questions for this topic."}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={handleResetTopicTracking}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      ↺ Reset Tracker
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => handleStartCustomQuiz({ forceAi: true })}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      🤖 Generate AI Questions
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="summary-actions-row">
                <button
                  type="button"
                  className="btn btn-primary btn-retake-custom"
                  onClick={handleRetakeCustomQuiz}
                >
                  ↺ Retake This Quiz
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-fresh-custom-quiz"
                  onClick={() => handleStartCustomQuiz()}
                  title="Generate a fresh randomized set of questions for these criteria"
                >
                  🎲 Fresh Quiz (New Questions)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-new-custom-setup"
                  onClick={handleBackToSetup}
                >
                  ⚙️ New Quiz Setup
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-goto-revision"
                  onClick={onNavigateToRevision}
                >
                  Review in Smart Revision 🎴
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
