import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TabType } from './types';
import {
  INITIAL_STUDY_STATS,
  RECENT_ACTIVITIES,
  WEEKLY_CHART_DATA,
  SAMPLE_QUIZ_QUESTIONS,
  INITIAL_REVISION_TASKS,
  SAMPLE_FLASHCARDS,
  CAREER_PATHWAYS
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { SkillWelcomeModal } from './components/SkillWelcomeModal';
import {
  getUserSkillProfile,
  hasCompletedSkillOnboarding
} from './utils/skillPersonalization';
import { initStudyTimeTracker } from './utils/activityTracker';
import { DashboardView } from './pages/DashboardView';
import { AITutorView } from './pages/AITutorView';
import { NotesGeneratorView } from './pages/NotesGeneratorView';
import { QuizView } from './pages/QuizView';
import { RevisionView } from './pages/RevisionView';
import { AnalyticsView } from './pages/AnalyticsView';
import { CareerView } from './pages/CareerView';
import { SettingsView } from './pages/SettingsView';
import './App.css';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Skill Personalization State
  const [activeSkill, setActiveSkill] = useState<string>(() => {
    return getUserSkillProfile()?.primarySkill || 'Python';
  });
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    return !hasCompletedSkillOnboarding();
  });
  const [isSkillChangeMode, setIsSkillChangeMode] = useState<boolean>(false);

  // Initialize real-time study timer and activity tracker
  useEffect(() => {
    initStudyTimeTracker();
  }, []);

  const handleOpenSkillSelector = () => {
    setIsSkillChangeMode(true);
    setIsWelcomeModalOpen(true);
  };

  const handleCloseWelcomeModal = (selectedSkillName: string) => {
    setActiveSkill(selectedSkillName);
    setIsWelcomeModalOpen(false);
    setIsSkillChangeMode(false);
    showToast(`🎯 Learning profile updated to: ${selectedSkillName}`);
  };

  // Cross-view recommendation navigation payload state
  const [notesPayload, setNotesPayload] = useState<{ noteId?: string; topic?: string } | null>(null);
  const [quizPayloadTopic, setQuizPayloadTopic] = useState<string | undefined>(undefined);

  const handleNavigate = (
    tab: TabType,
    payload?: { noteId?: string; topic?: string; taskId?: string }
  ) => {
    if ((tab === 'notes' || tab === 'my-notes') && payload) {
      setNotesPayload({ noteId: payload.noteId, topic: payload.topic });
    }
    if (tab === 'quiz' && payload?.topic) {
      setQuizPayloadTopic(payload.topic);
    }
    setCurrentTab(tab);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  return (
    <div className="app-shell">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="app-main-pane">
        {/* Top Navbar */}
        <TopNavbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onQuickAction={(tab) => setCurrentTab(tab)}
          onShowToast={showToast}
          activeSkill={activeSkill}
          onOpenSkillSelector={handleOpenSkillSelector}
        />

        {/* Scrollable Viewport */}
        <main className="main-scroll-viewport" role="main">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="view-motion-wrapper"
          >
              {currentTab === 'dashboard' && (
                <DashboardView
                  stats={INITIAL_STUDY_STATS}
                  recentActivity={RECENT_ACTIVITIES}
                  weeklyChart={WEEKLY_CHART_DATA}
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                  activeSkill={activeSkill}
                  onOpenSkillSelector={handleOpenSkillSelector}
                />
              )}

              {currentTab === 'tutor' && (
                <AITutorView onShowToast={showToast} />
              )}

              {currentTab === 'notes' && (
                <NotesGeneratorView
                  onShowToast={showToast}
                  initialMode="all"
                  initialNoteId={notesPayload?.noteId}
                  initialTopic={notesPayload?.topic}
                />
              )}

              {currentTab === 'my-notes' && (
                <NotesGeneratorView
                  onShowToast={showToast}
                  initialMode="library"
                  initialNoteId={notesPayload?.noteId}
                  initialTopic={notesPayload?.topic}
                />
              )}

              {currentTab === 'quiz' && (
                <QuizView
                  questions={SAMPLE_QUIZ_QUESTIONS}
                  onShowToast={showToast}
                  onNavigateToRevision={() => setCurrentTab('revision')}
                  onNavigateToNotes={(payload?: { noteId?: string; topic?: string }) => handleNavigate('notes', payload)}
                  initialTopic={quizPayloadTopic}
                />
              )}

              {currentTab === 'revision' && (
                <RevisionView
                  tasks={INITIAL_REVISION_TASKS}
                  flashcards={SAMPLE_FLASHCARDS}
                  onShowToast={showToast}
                  onNavigateToNotes={(payload?: { noteId?: string; topic?: string }) => handleNavigate('notes', payload)}
                  onNavigateToQuiz={(topic) => handleNavigate('quiz', { topic })}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView onNavigate={(tab) => setCurrentTab(tab)} />
              )}

              {currentTab === 'career' && (
                <CareerView
                  pathways={CAREER_PATHWAYS}
                  onShowToast={showToast}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  onShowToast={showToast}
                  onOpenSkillSelector={handleOpenSkillSelector}
                />
              )}
            </motion.div>
        </main>
      </div>

      {/* First-Time Welcome & Skill Selector Modal */}
      <SkillWelcomeModal
        isOpen={isWelcomeModalOpen && (currentTab === 'dashboard' || isSkillChangeMode)}
        onClose={handleCloseWelcomeModal}
        isChangeMode={isSkillChangeMode}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="app-toast-alert" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
