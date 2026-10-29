export type TabType =
  | 'dashboard'
  | 'tutor'
  | 'notes'
  | 'my-notes'
  | 'quiz'
  | 'revision'
  | 'analytics'
  | 'career'
  | 'settings';

export interface StudyStat {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  icon: string;
  progressPercent: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  score?: string;
  icon: string;
}

export interface WeeklyChartData {
  day: string;
  hours: number;
  label: string;
  isToday?: boolean;
}

export type VisualModelType =
  | 'cpu-architecture'
  | 'photosynthesis'
  | 'water-cycle'
  | 'human-heart'
  | 'solar-system'
  | 'neural-network'
  | 'electric-circuit'
  | 'binary-search'
  | 'js-promise-flow'
  | 'sql-join-venn'
  | 'os-scheduling'
  | 'pythagorean-theorem'
  | 'generic-process-flow';

export interface VisualStep {
  stepNumber: number;
  label: string;
  description: string;
  activeElements?: string[];
}

export interface EducationalVisualModel {
  id: string;
  type: VisualModelType;
  title: string;
  category: 'Computer Science' | 'Science & Biology' | 'Mathematics' | 'Physics & Chemistry' | 'Engineering' | 'General';
  caption: string;
  summary: string;
  is3D?: boolean;
  steps: VisualStep[];
  interactiveParams?: Record<string, any>;
}

export type VisualizationType = 'diagram' | 'process' | 'simulation' | '3d';

export interface TutorVisualSpec {
  id: string;
  type: VisualModelType | string;
  visualType: VisualizationType;
  visualTitle: string;
  visualDescription: string;
  model: EducationalVisualModel;
  parameters?: Record<string, any>;
}

export type TutorProviderMode = 'auto' | 'gemini' | 'ollama';

export interface BackendHealthInfo {
  status: string;
  app: string;
  port: number;
  geminiConfigured: boolean;
  ollamaRunning?: boolean;
  ollamaModelAvailable?: boolean;
  ollamaModel?: string;
  ollamaBaseUrl?: string;
  installedModels?: string[];
  ollamaTimeoutMs?: number;
  ollamaKeepAlive?: string;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  explanation?: string;
  markdown?: string;
  timestamp: string;
  codeSnippet?: string;
  bulletPoints?: string[];
  suggestedFollowUp?: string;
  isDemo?: boolean;
  sourceLabel?: string;
  sourceType?: 'gemini' | 'ollama' | 'offline-curriculum' | 'offline-unsupported';
  model?: string;
  fallbackNotice?: string;
  visual?: TutorVisualSpec;
  visualType?: VisualizationType;
  visualTitle?: string;
  visualDescription?: string;
  visualModel?: EducationalVisualModel;
}

export interface QuizQuestion {
  id: string;
  track: string;
  topic?: string;
  subtopic?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizTopicBreakdown {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
  isWeak: boolean;
  insufficientEvidence?: boolean;
}

export interface QuizResultRecord {
  id: string;
  track: string;
  difficulty?: string;
  mode?: 'diagnostic' | 'custom';
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  topicBreakdowns?: QuizTopicBreakdown[];
  answeredHistory: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
    questionText?: string;
    selectedText?: string;
    correctText?: string;
    explanation?: string;
    topic?: string;
  }[];
}

export interface RevisionTask {
  id: string;
  title: string;
  subject: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  dueText: string;
  completed: boolean;
  estimatedMinutes: number;
  memoryScore: number;
}

export interface Flashcard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  rationale: string;
}

export interface CareerMilestone {
  title: string;
  desc: string;
  completed: boolean;
}

export interface CareerPathway {
  id: string;
  title: string;
  level: string;
  demand: 'Very High' | 'High' | 'Moderate';
  salaryRange: string;
  description: string;
  skills: string[];
  milestones: CareerMilestone[];
}

// ============================================================================
// CAREER COMPASS AI TYPES
// ============================================================================
export type SkillProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserSkillEntry {
  name: string;
  level: SkillProficiencyLevel;
}

export interface StudentCareerProfile {
  id?: string;
  degree: string;
  branch: string;
  semester: string;
  skills: UserSkillEntry[];
  projects: string;
  certifications?: string;
  preferredAreas: string[];
  preferredLocation?: string;
  rolePreference: 'Internship / Trainee' | 'Fresher (0-1 yrs)' | 'Part-time' | 'Experienced / Associate';
  updatedAt?: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  overview: string;
  whyItFits: string;
  skillsYouHave: string[];
  skillsToImprove: string[];
  typicalRequirements: string[];
  matchAssessment: string;
  readinessStatus: 'Ready to Explore Now (Intern / Junior)' | 'Explore After Preparation (2-3 Months)';
  suggestedPortfolioProjects: string[];
  marketContextNote: string;
  safeSearchQuery: string;
}

export interface RoadmapPhase {
  phaseTitle: string;
  timeframe: string;
  focusSkills: string[];
  actionMilestones: string[];
  deliverableEvidence: string;
}

export interface CareerAnalysisResult {
  id: string;
  studentSummary: {
    demonstratedSkills: string[];
    selfReportedSkills: string[];
    transferableStrengths: string[];
    primaryReadinessObservation: string;
  };
  jobRecommendations: JobRecommendation[];
  learningRoadmap: RoadmapPhase[];
  source: 'gemini' | 'ollama' | 'offline';
  sourceLabel: string;
  analyzedAt: string;
}

export interface NoteSection {
  heading: string;
  content?: string;
  code?: string;
}

export interface GeneratedNote {
  id: string;
  topic: string;
  title: string;
  styleLabel: string;
  language: string;
  detailLevel: string;
  sections: NoteSection[];
  createdAt: string;
  updatedAt?: string;
  markdown?: string;
  sourceType?: 'gemini' | 'offline';
  sourceLabel?: string;
  subject?: string;
  educationLevel?: string;
}

export type {
  TopicStatus,
  TopicPerformanceSummary,
  AggregateLearningStats,
  RecommendationPriority,
  StudyRecommendation,
  PrioritizedRevisionItem
} from './utils/personalizedLearning';

