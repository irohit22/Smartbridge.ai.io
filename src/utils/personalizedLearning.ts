import type { QuizResultRecord, GeneratedNote, RevisionTask, TabType } from '../types';
import { AVAILABLE_TOPICS } from '../data/quizBank';

// ============================================================================
// CONFIGURABLE PERSONALIZATION THRESHOLDS & HEURISTICS
// ============================================================================
export const PERSONALIZATION_THRESHOLDS = {
  /** Accuracy below 60% indicates a topic that needs more practice */
  NEEDS_FOCUS: 60,
  /** Accuracy between 60% and 79% indicates a topic where practice is recommended */
  PRACTICE_RECOMMENDED: 80,
  /** Accuracy of 80% or higher indicates the student is on track */
  ON_TRACK: 80,
  /** Minimum assessable questions needed before reaching a confident assessment */
  MIN_ASSESSABLE_QUESTIONS: 2
} as const;

export type TopicStatus =
  | 'needs_focus'
  | 'practice_recommended'
  | 'on_track'
  | 'insufficient_evidence'
  | 'not_assessed';

export interface TopicPerformanceSummary {
  topicId: string;
  topicName: string;
  track: string;
  icon: string;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number | null;
  status: TopicStatus;
  statusLabel: string;
  mostRecentAttemptDate: string | null;
  recommendedNextAction: string;
  isAssessable: boolean;
}

export interface AggregateLearningStats {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number | null; // Aggregate correct / total assessable questions
  topicsAssessedCount: number;
  topicsNeedingFocusCount: number;
  topicsOnTrackCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  hasEnoughData: boolean;
}

export type RecommendationPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface StudyRecommendation {
  id: string; // Stable ID to prevent duplicate render artifacts
  title: string;
  explanation: string;
  topic: string;
  reason: string;
  priority: RecommendationPriority;
  priorityOrder: number;
  actionLabel: string;
  actionType:
    | 'quiz_topic'
    | 'open_note'
    | 'generate_note'
    | 'revision_task'
    | 'diagnostic_quiz'
    | 'continue_practice';
  targetTab: TabType;
  targetPayload?: {
    noteId?: string;
    topic?: string;
    taskId?: string;
  };
}

export interface PrioritizedRevisionItem {
  task: RevisionTask;
  priorityScore: number;
  urgencyReason: string;
  relatedTopicSummary?: TopicPerformanceSummary;
  matchingNote?: GeneratedNote | null;
}

// ============================================================================
// HELPER: CASE-INSENSITIVE NORMALIZED NOTE MATCHING
// ============================================================================
/**
 * Safely search saved notes for a matching topic.
 * Prioritizes exact/strong topic matches first, then falls back to title matches,
 * and finally matches on significant keyword token overlap.
 */
export function findMatchingNote(
  topicName: string,
  savedNotes: GeneratedNote[]
): GeneratedNote | null {
  if (!Array.isArray(savedNotes) || savedNotes.length === 0 || !topicName) {
    return null;
  }

  const normalizedTarget = topicName.trim().toLowerCase();

  // 1. Direct or Substring Match on note.topic
  const directTopic = savedNotes.find((n) => {
    const noteTopic = (n.topic || '').trim().toLowerCase();
    return noteTopic === normalizedTarget || noteTopic.includes(normalizedTarget) || normalizedTarget.includes(noteTopic);
  });
  if (directTopic) return directTopic;

  // 2. Direct or Substring Match on note.title
  const directTitle = savedNotes.find((n) => {
    const noteTitle = (n.title || '').trim().toLowerCase();
    return noteTitle === normalizedTarget || noteTitle.includes(normalizedTarget) || normalizedTarget.includes(noteTitle);
  });
  if (directTitle) return directTitle;

  // 3. Significant Keyword Token Overlap (e.g. 'react', 'sql', 'javascript', 'css', 'algorithms')
  const targetTokens = normalizedTarget
    .split(/[\s&,/+_-]+/)
    .filter((w) => w.length >= 3 && !['and', 'for', 'the', 'with'].includes(w));

  const keywordMatch = savedNotes.find((n) => {
    const combined = `${n.topic || ''} ${n.title || ''}`.toLowerCase();
    return targetTokens.some((token) => combined.includes(token));
  });
  return keywordMatch || null;
}

// ============================================================================
// TOPIC PERFORMANCE SUMMARY ENGINE
// ============================================================================
/**
 * Aggregates real quiz history across attempts to calculate per-topic performance.
 * Correctly handles:
 * - Empty quiz history
 * - Legacy attempts without topic breakdowns
 * - Attempts with different numbers of questions
 * - Duplicate guard validation
 */
export function getTopicPerformanceSummary(
  quizHistory: QuizResultRecord[]
): TopicPerformanceSummary[] {
  // Map of unique topics initialized with official catalog
  const topicStatsMap = new Map<
    string,
    {
      meta: (typeof AVAILABLE_TOPICS)[number];
      attempted: number;
      correct: number;
      mostRecentDate: string | null;
    }
  >();

  AVAILABLE_TOPICS.forEach((meta) => {
    topicStatsMap.set(meta.name, {
      meta,
      attempted: 0,
      correct: 0,
      mostRecentDate: null
    });
  });

  if (!Array.isArray(quizHistory) || quizHistory.length === 0) {
    return Array.from(topicStatsMap.values()).map(({ meta }) =>
      buildTopicSummary(meta, 0, 0, null)
    );
  }

  // Deduplicate attempts by unique ID
  const seenAttemptIds = new Set<string>();
  const validAttempts = quizHistory.filter((attempt) => {
    if (!attempt || typeof attempt !== 'object') return false;
    const id = attempt.id || `${attempt.completedAt}-${attempt.score}`;
    if (seenAttemptIds.has(id)) return false;
    seenAttemptIds.add(id);
    return true;
  });

  validAttempts.forEach((attempt) => {
    const attemptDate = attempt.completedAt || null;

    // Path A: Attempt has explicit topic breakdowns (Stage 4 custom practice format)
    if (Array.isArray(attempt.topicBreakdowns) && attempt.topicBreakdowns.length > 0) {
      attempt.topicBreakdowns.forEach((tb) => {
        if (!tb || !tb.topic) return;
        const entry = topicStatsMap.get(tb.topic) || findEntryByFuzzyName(tb.topic, topicStatsMap);
        if (entry) {
          entry.attempted += Math.max(0, Number(tb.total) || 0);
          entry.correct += Math.max(0, Number(tb.correct) || 0);
          if (attemptDate && (!entry.mostRecentDate || attemptDate > entry.mostRecentDate)) {
            entry.mostRecentDate = attemptDate;
          }
        }
      });
      return;
    }

    // Path B: Attempt has answeredHistory with topic tags
    if (Array.isArray(attempt.answeredHistory) && attempt.answeredHistory.length > 0) {
      let foundTaggedHistory = false;
      attempt.answeredHistory.forEach((ans) => {
        if (ans && ans.topic) {
          foundTaggedHistory = true;
          const entry = topicStatsMap.get(ans.topic) || findEntryByFuzzyName(ans.topic, topicStatsMap);
          if (entry) {
            entry.attempted += 1;
            if (ans.isCorrect) entry.correct += 1;
            if (attemptDate && (!entry.mostRecentDate || attemptDate > entry.mostRecentDate)) {
              entry.mostRecentDate = attemptDate;
            }
          }
        }
      });
      if (foundTaggedHistory) return;
    }

    // Path C: Legacy attempt associated with track/topic name
    const trackOrTopic = (attempt.track || '').trim();
    if (trackOrTopic) {
      const entry =
        topicStatsMap.get(trackOrTopic) ||
        findEntryByTrackCode(trackOrTopic, topicStatsMap) ||
        findEntryByFuzzyName(trackOrTopic, topicStatsMap);

      if (entry) {
        const total = Math.max(0, Number(attempt.totalQuestions) || 0);
        const score = Math.max(0, Number(attempt.score) || 0);
        entry.attempted += total;
        entry.correct += score;
        if (attemptDate && (!entry.mostRecentDate || attemptDate > entry.mostRecentDate)) {
          entry.mostRecentDate = attemptDate;
        }
      }
    }
  });

  return Array.from(topicStatsMap.values()).map(({ meta, attempted, correct, mostRecentDate }) =>
    buildTopicSummary(meta, attempted, correct, mostRecentDate)
  );
}

function findEntryByFuzzyName(
  search: string,
  map: Map<string, { meta: (typeof AVAILABLE_TOPICS)[number]; attempted: number; correct: number; mostRecentDate: string | null }>
) {
  const norm = search.toLowerCase().trim();
  if (norm.length < 3) return null; // Prevent short track codes (e.g. 'cs') from matching substrings in 'css'
  for (const [key, value] of map.entries()) {
    if (key.toLowerCase().includes(norm) || norm.includes(key.toLowerCase())) {
      return value;
    }
  }
  return null;
}

function findEntryByTrackCode(
  track: string,
  map: Map<string, { meta: (typeof AVAILABLE_TOPICS)[number]; attempted: number; correct: number; mostRecentDate: string | null }>
) {
  const norm = track.toLowerCase().trim();
  if (norm === 'cs' && map.has('dsa')) return map.get('dsa')!;
  if (norm === 'data' && map.has('sql')) return map.get('sql')!;
  if (norm === 'webdev' && map.has('react')) return map.get('react')!;

  for (const value of map.values()) {
    if (
      value.meta.id.toLowerCase() === norm ||
      value.meta.track.toLowerCase() === norm
    ) {
      return value;
    }
  }
  return null;
}

function buildTopicSummary(
  meta: (typeof AVAILABLE_TOPICS)[number],
  attempted: number,
  correct: number,
  mostRecentDate: string | null
): TopicPerformanceSummary {
  const isAssessable = attempted >= PERSONALIZATION_THRESHOLDS.MIN_ASSESSABLE_QUESTIONS;
  let status: TopicStatus;
  let statusLabel: string;
  let accuracy: number | null = null;
  let nextAction: string;

  if (attempted === 0) {
    status = 'not_assessed';
    statusLabel = 'Not Assessed Yet';
    nextAction = 'Start with a diagnostic practice quiz';
  } else if (!isAssessable) {
    status = 'insufficient_evidence';
    accuracy = Math.round((correct / attempted) * 100);
    statusLabel = 'Needs More Evidence';
    nextAction = `Answer at least ${PERSONALIZATION_THRESHOLDS.MIN_ASSESSABLE_QUESTIONS} questions for a confident assessment`;
  } else {
    accuracy = Math.round((correct / attempted) * 100);
    if (accuracy < PERSONALIZATION_THRESHOLDS.NEEDS_FOCUS) {
      status = 'needs_focus';
      statusLabel = 'Needs More Practice';
      nextAction = 'Review key study notes and practice scenario questions';
    } else if (accuracy < PERSONALIZATION_THRESHOLDS.PRACTICE_RECOMMENDED) {
      status = 'practice_recommended';
      statusLabel = 'Practice Recommended';
      nextAction = 'Strengthen edge-case comprehension with targeted quiz questions';
    } else {
      status = 'on_track';
      statusLabel = 'On Track';
      nextAction = 'Maintain retention with spaced recall reviews';
    }
  }

  return {
    topicId: meta.id,
    topicName: meta.name,
    track: meta.track,
    icon: meta.icon,
    questionsAttempted: attempted,
    correctAnswers: correct,
    incorrectAnswers: Math.max(0, attempted - correct),
    accuracyPercentage: accuracy,
    status,
    statusLabel,
    mostRecentAttemptDate: mostRecentDate,
    recommendedNextAction: nextAction,
    isAssessable
  };
}

// ============================================================================
// AGGREGATE LEARNING STATISTICS
// ============================================================================
/**
 * Calculates overall aggregate statistics with an accurate, mathematically weighted denominator.
 * Never averages percentages directly across disparate topic lengths.
 */
export function getAggregateLearningStats(
  quizHistory: QuizResultRecord[],
  revisionTasks: RevisionTask[]
): AggregateLearningStats {
  const summaries = getTopicPerformanceSummary(quizHistory);

  let totalQuestionsAnswered = 0;
  let totalCorrect = 0;

  summaries.forEach((s) => {
    totalQuestionsAnswered += s.questionsAttempted;
    totalCorrect += s.correctAnswers;
  });

  const overallAccuracy =
    totalQuestionsAnswered > 0
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
      : null;

  const topicsAssessedCount = summaries.filter((s) => s.isAssessable).length;
  const topicsNeedingFocusCount = summaries.filter((s) => s.status === 'needs_focus').length;
  const topicsOnTrackCount = summaries.filter((s) => s.status === 'on_track').length;

  const safeTasks = Array.isArray(revisionTasks) ? revisionTasks : [];
  const completedTasksCount = safeTasks.filter((t) => t.completed).length;
  const pendingTasksCount = safeTasks.length - completedTasksCount;

  // Deduplicated attempt count
  const seenIds = new Set<string>();
  const totalAttempts = Array.isArray(quizHistory)
    ? quizHistory.filter((a) => {
        if (!a) return false;
        const id = a.id || `${a.completedAt}-${a.score}`;
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      }).length
    : 0;

  return {
    totalAttempts,
    totalQuestionsAnswered,
    totalCorrectAnswers: totalCorrect,
    overallAccuracy,
    topicsAssessedCount,
    topicsNeedingFocusCount,
    topicsOnTrackCount,
    pendingTasksCount,
    completedTasksCount,
    hasEnoughData: totalAttempts > 0 && totalQuestionsAnswered > 0
  };
}

// ============================================================================
// PERSONALIZED RECOMMENDATION ENGINE
// ============================================================================
/**
 * Generates transparent, deterministic study recommendations grounded in real student data.
 * Adheres strictly to the transparent prioritization rule:
 * 1. Topics needing focus (<60% accuracy with >=2 questions)
 * 2. Incomplete revision tasks associated with weak/struggling topics
 * 3. Topics with moderate accuracy (60-79%)
 * 4. Diagnostic practice for unassessed topics or topics with insufficient evidence
 * 5. On-track topics with reinforcement practice
 */
export function generatePersonalizedRecommendations(params: {
  quizHistory: QuizResultRecord[];
  savedNotes: GeneratedNote[];
  revisionTasks: RevisionTask[];
}): StudyRecommendation[] {
  const { quizHistory, savedNotes, revisionTasks } = params;
  const topicSummaries = getTopicPerformanceSummary(quizHistory);
  const recommendations: StudyRecommendation[] = [];

  // Edge Case 1: Empty History -> Useful, welcoming first step
  const totalQuestionsAnswered = topicSummaries.reduce((sum, t) => sum + t.questionsAttempted, 0);
  if (totalQuestionsAnswered === 0) {
    recommendations.push({
      id: 'rec-initial-diagnostic',
      title: 'Take Your First Technical Practice Quiz',
      explanation: 'Complete an initial 5-question practice quiz to benchmark your software development strengths.',
      topic: 'React & Frontend Architecture',
      reason: 'No previous quiz attempts recorded. A quick diagnostic unlocks personalized insights.',
      priority: 'high',
      priorityOrder: 1,
      actionLabel: 'Start Practice Quiz 🎯',
      actionType: 'quiz_topic',
      targetTab: 'quiz',
      targetPayload: { topic: 'react' }
    });

    recommendations.push({
      id: 'rec-initial-notes',
      title: 'Review Frontend Architecture Cheatsheet',
      explanation: 'Familiarize yourself with fundamental concepts in the Notes Generator before your first assessment.',
      topic: 'React & Frontend Architecture',
      reason: 'Structured revision before practice reinforces declarative UI mental models.',
      priority: 'medium',
      priorityOrder: 2,
      actionLabel: 'Open Study Notes 📝',
      actionType: 'open_note',
      targetTab: 'notes'
    });

    return recommendations;
  }

  // 1. High Priority: Topics Needing Focus (<60% with >=2 questions)
  const needsFocusTopics = topicSummaries.filter((t) => t.status === 'needs_focus');
  needsFocusTopics.forEach((t) => {
    const matchingNote = findMatchingNote(t.topicName, savedNotes);

    // Note recommendation
    if (matchingNote) {
      recommendations.push({
        id: `rec-note-${t.topicId}`,
        title: `Review Note: ${matchingNote.title}`,
        explanation: `Strengthen ${t.topicName} concepts by reviewing your saved study guide.`,
        topic: t.topicName,
        reason: `Your current accuracy in this topic is ${t.accuracyPercentage}% (${t.correctAnswers}/${t.questionsAttempted} correct).`,
        priority: 'urgent',
        priorityOrder: 10,
        actionLabel: 'Open Saved Note 📖',
        actionType: 'open_note',
        targetTab: 'notes',
        targetPayload: { noteId: matchingNote.id, topic: t.topicName }
      });
    } else {
      recommendations.push({
        id: `rec-gen-note-${t.topicId}`,
        title: `Generate Study Note for ${t.topicName}`,
        explanation: `Create a targeted cheatsheet in the Notes Generator to address gaps in ${t.topicName}.`,
        topic: t.topicName,
        reason: `Your accuracy is ${t.accuracyPercentage}%, and no saved note currently exists for this topic.`,
        priority: 'urgent',
        priorityOrder: 11,
        actionLabel: 'Generate Note 📝',
        actionType: 'generate_note',
        targetTab: 'notes',
        targetPayload: { topic: t.topicName }
      });
    }

    // Quiz practice recommendation
    recommendations.push({
      id: `rec-quiz-${t.topicId}`,
      title: `Practice 5 Questions in ${t.topicName}`,
      explanation: `Test yourself on ${t.topicName} with a 5-question focused sprint to improve mastery.`,
      topic: t.topicName,
      reason: `Active recall and retakes help reinforce concepts below the 60% mastery threshold.`,
      priority: 'high',
      priorityOrder: 12,
      actionLabel: 'Practice Quiz 🎯',
      actionType: 'quiz_topic',
      targetTab: 'quiz',
      targetPayload: { topic: t.topicId }
    });
  });

  // 2. Pending Revision Tasks connected to learning topics
  const safeTasks = Array.isArray(revisionTasks) ? revisionTasks : [];
  const pendingUrgentTasks = safeTasks.filter((task) => !task.completed && (task.priority === 'Urgent' || task.priority === 'High'));
  pendingUrgentTasks.slice(0, 2).forEach((task) => {
    recommendations.push({
      id: `rec-task-${task.id}`,
      title: `Complete Revision Task: ${task.title}`,
      explanation: `Prioritized in your revision deck (${task.priority} priority, memory strength: ${task.memoryScore}%).`,
      topic: task.subject,
      reason: `Pending active recall item due for review in Smart Revision.`,
      priority: 'high',
      priorityOrder: 20,
      actionLabel: 'Go to Revision 🔄',
      actionType: 'revision_task',
      targetTab: 'revision',
      targetPayload: { taskId: task.id }
    });
  });

  // 3. Moderate Accuracy Topics (60% to 79%)
  const moderateTopics = topicSummaries.filter((t) => t.status === 'practice_recommended');
  moderateTopics.forEach((t) => {
    recommendations.push({
      id: `rec-practice-${t.topicId}`,
      title: `Refine Concepts in ${t.topicName}`,
      explanation: `Solid progress (${t.accuracyPercentage}% accuracy). A short practice set can elevate you to the 80%+ on-track tier.`,
      topic: t.topicName,
      reason: `Accuracy is in the 60-79% range. Additional practice cements high-yield principles.`,
      priority: 'medium',
      priorityOrder: 30,
      actionLabel: 'Practice Sprint 🎯',
      actionType: 'quiz_topic',
      targetTab: 'quiz',
      targetPayload: { topic: t.topicId }
    });
  });

  // 4. Insufficient Evidence / Unassessed Topics
  const unassessedTopics = topicSummaries.filter(
    (t) => t.status === 'insufficient_evidence' || t.status === 'not_assessed'
  );
  unassessedTopics.slice(0, 2).forEach((t) => {
    const isSingle = t.status === 'insufficient_evidence';
    recommendations.push({
      id: `rec-diag-${t.topicId}`,
      title: isSingle ? `Take 3 More Questions in ${t.topicName}` : `Benchmark ${t.topicName}`,
      explanation: isSingle
        ? `Only ${t.questionsAttempted} question answered so far. Take 3 questions to establish a reliable baseline.`
        : `Explore ${t.topicName} with a quick 3-question diagnostic.`,
      topic: t.topicName,
      reason: isSingle
        ? `Single-question samples lack sufficient evidence for an accurate diagnostic.`
        : `No recorded practice sessions in this technical domain yet.`,
      priority: 'low',
      priorityOrder: 40,
      actionLabel: 'Start Diagnostic 🚀',
      actionType: 'diagnostic_quiz',
      targetTab: 'quiz',
      targetPayload: { topic: t.topicId }
    });
  });

  // 5. On-Track Topics (>=80%)
  const onTrackTopics = topicSummaries.filter((t) => t.status === 'on_track');
  if (recommendations.length < 3 && onTrackTopics.length > 0) {
    const t = onTrackTopics[0];
    recommendations.push({
      id: `rec-ontrack-${t.topicId}`,
      title: `Maintain Mastery in ${t.topicName}`,
      explanation: `Excellent performance (${t.accuracyPercentage}%). Periodically review flashcards to prevent memory decay.`,
      topic: t.topicName,
      reason: `Consistently on track across ${t.questionsAttempted} questions.`,
      priority: 'low',
      priorityOrder: 50,
      actionLabel: 'Review Deck 🎴',
      actionType: 'continue_practice',
      targetTab: 'revision'
    });
  }

  // Sort strictly by priority order
  return recommendations.sort((a, b) => a.priorityOrder - b.priorityOrder);
}

// ============================================================================
// PRIORITIZED REVISION ADAPTATION
// ============================================================================
/**
 * Integrates quiz performance with revision tasks to prioritize what to study next.
 */
export function getPrioritizedRevisionTasks(params: {
  revisionTasks: RevisionTask[];
  topicSummaries: TopicPerformanceSummary[];
  savedNotes: GeneratedNote[];
}): PrioritizedRevisionItem[] {
  const { revisionTasks, topicSummaries, savedNotes } = params;

  if (!Array.isArray(revisionTasks)) return [];

  return revisionTasks.map((task) => {
    // Find matching topic summary
    const matchingSummary = topicSummaries.find(
      (s) =>
        s.topicName.toLowerCase().includes(task.subject.toLowerCase()) ||
        task.subject.toLowerCase().includes(s.topicName.toLowerCase())
    );

    // Find matching note
    const matchingNote = findMatchingNote(task.subject, savedNotes);

    let priorityScore = 0;
    let urgencyReason = 'Scheduled spaced repetition';

    // Base score from existing task priority
    if (task.priority === 'Urgent') priorityScore += 40;
    else if (task.priority === 'High') priorityScore += 30;
    else if (task.priority === 'Medium') priorityScore += 20;
    else priorityScore += 10;

    // Additional weight if topic was assessed and needs focus
    if (matchingSummary) {
      if (matchingSummary.status === 'needs_focus') {
        priorityScore += 35;
        urgencyReason = `Linked to ${matchingSummary.topicName} quiz score (${matchingSummary.accuracyPercentage}% accuracy · Needs more practice)`;
      } else if (matchingSummary.status === 'practice_recommended') {
        priorityScore += 15;
        urgencyReason = `Linked to ${matchingSummary.topicName} quiz score (${matchingSummary.accuracyPercentage}% accuracy · Practice recommended)`;
      } else if (matchingSummary.status === 'on_track') {
        urgencyReason = `Retention check (${matchingSummary.accuracyPercentage}% quiz accuracy)`;
      }
    }

    // Uncompleted items have higher priority
    if (!task.completed) {
      priorityScore += 50;
    }

    return {
      task,
      priorityScore,
      urgencyReason,
      relatedTopicSummary: matchingSummary,
      matchingNote
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}
