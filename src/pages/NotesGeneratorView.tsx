import React, { useState, useEffect } from 'react';
import type { GeneratedNote } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { formatNoteDate } from '../utils/dateUtils';
import { generateOfflineTopicNotes } from '../utils/offlineCurriculum';
import { getUserSkillProfile, getSkillConfig } from '../utils/skillPersonalization';
import { recordLearningActivity } from '../utils/activityTracker';

interface NotesGeneratorViewProps {
  onShowToast: (msg: string) => void;
  initialNoteId?: string;
  initialTopic?: string;
  initialMode?: 'all' | 'library' | 'generator';
}

function formatInlineNote(text: string): string {
  if (!text) return '';
  let res = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
  // Bold: **text**
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  res = res.replace(/(^|[^\*])\*([^*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');

  return res;
}

interface NoteContentBlock {
  type: 'p' | 'h3' | 'h4' | 'table' | 'ul' | 'ol' | 'callout';
  content?: string;
  items?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
}

function parseSectionContent(text: string): NoteContentBlock[] {
  if (!text) return [];
  const lines = text.split('\n');
  const blocks: NoteContentBlock[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Markdown table rows: | Col 1 | Col 2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Skip delimiter line |---|---|
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else if (currentTable) {
      blocks.push({
        type: 'table',
        tableHeaders: currentTable.headers,
        tableRows: currentTable.rows
      });
      currentTable = null;
    }

    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    // Subheadings
    if (trimmed.startsWith('#### ')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'h4', content: trimmed.slice(5) });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'h3', content: trimmed.slice(4) });
      continue;
    }

    // Callout quote
    if (trimmed.startsWith('> ')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'callout', content: trimmed.slice(2) });
      continue;
    }

    // Bullet lists (- or * or •)
    const listMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (listMatch) {
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(listMatch[1]);
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numMatch[1]);
      continue;
    }

    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }

    blocks.push({ type: 'p', content: trimmed });
  }

  if (currentList) blocks.push(currentList);
  if (currentTable) {
    blocks.push({
      type: 'table',
      tableHeaders: currentTable.headers,
      tableRows: currentTable.rows
    });
  }

  return blocks;
}

export const NotesGeneratorView: React.FC<NotesGeneratorViewProps> = ({
  onShowToast,
  initialNoteId,
  initialTopic,
  initialMode
}) => {
  const [activeSkill, setActiveSkill] = useState<string>(() => {
    return getUserSkillProfile()?.primarySkill || 'Python';
  });
  const activeSkillConfig = getSkillConfig(activeSkill);

  const [topic, setTopic] = useState(() => initialTopic || activeSkillConfig.defaultNote.topic);
  const [subject, setSubject] = useState(() => activeSkillConfig.defaultSubject || 'Computer Science & IT');
  const [educationLevel, setEducationLevel] = useState('College / Undergraduate');
  const [language, setLanguage] = useState('English');
  const [style, setStyle] = useState('cheatsheet');
  const [detailLevel, setDetailLevel] = useState('comprehensive');
  const [engine, setEngine] = useState<'gemini' | 'offline'>('gemini');
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data?.geminiConfigured) {
          setGeminiConnected(true);
        } else {
          setEngine('offline');
        }
      })
      .catch(() => {
        setEngine('offline');
      });
  }, []);

  // Search state for Stage 3 Saved Notes Library
  const [searchQuery, setSearchQuery] = useState('');

  // Studio Mode: 'all' (Full view with both), 'library' (Notes Library focused), 'generator' (Creation focused)
  type NotesStudioMode = 'all' | 'library' | 'generator';
  const [studioMode, setStudioMode] = useState<NotesStudioMode>(() => initialMode || 'all');

  // Persistent notes library state with status tracking
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const [savedNotes, setSavedNotes] = useState<GeneratedNote[]>(() => {
    const result = storage.getWithStatus<GeneratedNote[]>(STORAGE_KEYS.NOTES, []);
    if (result.status === 'corrupted' && result.warning) {
      setTimeout(() => setStorageWarning(result.warning || null), 0);
    }
    // If storage explicitly has an array (even empty []), respect it
    if (result.status === 'ok' && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result.data) && result.data.length > 0) {
      return result.data;
    }
    return [activeSkillConfig.defaultNote];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    const result = storage.getWithStatus<GeneratedNote[]>(STORAGE_KEYS.NOTES, []);
    if (result.status === 'ok' && Array.isArray(result.data)) {
      return result.data.length > 0 ? result.data[0].id : '';
    }
    if (Array.isArray(result.data) && result.data.length > 0) {
      return result.data[0].id;
    }
    return activeSkillConfig.defaultNote.id;
  });

  useEffect(() => {
    const handleSkillChanged = (e: any) => {
      if (e.detail?.primarySkill) {
        setActiveSkill(e.detail.primarySkill);
        const nextConfig = getSkillConfig(e.detail.primarySkill);
        setTopic(nextConfig.defaultNote.topic);
        setSubject(nextConfig.defaultSubject);
      }
    };
    window.addEventListener('smartbridge:skill-changed', handleSkillChanged);
    return () => window.removeEventListener('smartbridge:skill-changed', handleSkillChanged);
  }, []);

  // Track props changes during render (official React pattern for prop-based state adjustment)
  const [prevInitialNoteId, setPrevInitialNoteId] = useState(initialNoteId);
  const [prevInitialTopic, setPrevInitialTopic] = useState(initialTopic);
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);

  if (initialNoteId !== prevInitialNoteId) {
    setPrevInitialNoteId(initialNoteId);
    if (initialNoteId && savedNotes.some((n) => n.id === initialNoteId)) {
      setActiveNoteId(initialNoteId);
    }
  }

  if (initialTopic !== prevInitialTopic) {
    setPrevInitialTopic(initialTopic);
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }

  if (initialMode !== prevInitialMode) {
    setPrevInitialMode(initialMode);
    if (initialMode) {
      setStudioMode(initialMode);
    }
  }

  // Safe deletion confirmation state
  const [notePendingDelete, setNotePendingDelete] = useState<GeneratedNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active note resolution
  const activeNote =
    savedNotes.find((n) => n.id === activeNoteId) ||
    savedNotes[0] ||
    null;

  // Filtered notes by search query (title or topic, case-insensitive, trimmed)
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = savedNotes.filter((note) => {
    if (!trimmedQuery) return true;
    const matchTitle = (note.title || '').toLowerCase().includes(trimmedQuery);
    const matchTopic = (note.topic || '').toLowerCase().includes(trimmedQuery);
    return matchTitle || matchTopic;
  });

  // Escape key handler for accessible modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && notePendingDelete) {
        setNotePendingDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notePendingDelete]);

  const presetTopics = [
    'Operating System: Process & Memory Architecture',
    'React 19 State, Hooks & Reconciliation',
    'SQL Indexing: B-Trees & Hash Indexes',
    'REST vs GraphQL: Architectural Trade-Offs'
  ];

  const handleGenerate = async () => {
    // Guard against duplicate execution while request is pending
    if (isGenerating) return;

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setValidationError('Please enter a valid study topic or keyword first.');
      onShowToast('Please enter a study topic first.');
      return;
    }

    setValidationError(null);
    setIsGenerating(true);

    // If offline engine is explicitly selected
    if (engine === 'offline') {
      setTimeout(() => {
        setIsGenerating(false);

        const newNote = generateOfflineTopicNotes({
          topic: trimmedTopic,
          style,
          language,
          detailLevel
        });

        const updatedNotes = [newNote, ...savedNotes.filter((n) => n.id !== newNote.id)];
        setSavedNotes(updatedNotes);
        setActiveNoteId(newNote.id);
        storage.set(STORAGE_KEYS.NOTES, updatedNotes);
        setStorageWarning(null);

        recordLearningActivity({
          type: 'notes',
          title: `Study Note: ${newNote.title || trimmedTopic}`,
          category: subject || 'Notes Studio',
          icon: '📝'
        });

        onShowToast(`Generated & saved note: "${trimmedTopic}" to library! 💾`);
      }, 350);
      return;
    }

    // Default: Attempt live synthesis with Gemini AI via /api/notes
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: trimmedTopic,
          subject,
          educationLevel,
          detailLevel,
          style,
          language
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.source === 'gemini') {
          const newNote: GeneratedNote = {
            id: json.id || `note-${Date.now()}`,
            topic: trimmedTopic,
            title: json.title || trimmedTopic,
            styleLabel: json.styleLabel || 'Comprehensive Study Guide',
            language,
            detailLevel,
            subject,
            educationLevel,
            createdAt: json.createdAt || new Date().toISOString(),
            sourceType: 'gemini',
            sourceLabel: '🌟 Gemini Cloud AI',
            markdown: json.markdown,
            sections: json.sections || []
          };

          const updatedNotes = [newNote, ...savedNotes.filter((n) => n.id !== newNote.id)];
          setSavedNotes(updatedNotes);
          setActiveNoteId(newNote.id);
          storage.set(STORAGE_KEYS.NOTES, updatedNotes);
          setStorageWarning(null);
          setIsGenerating(false);

          recordLearningActivity({
            type: 'notes',
            title: `AI Study Guide: ${newNote.title || trimmedTopic}`,
            category: subject || 'Notes Studio',
            icon: '📝'
          });

          onShowToast(`Generated study guide with Gemini AI: "${newNote.title}"! 🌟`);
          return;
        }
      }
    } catch (err: any) {
      console.warn('[Notes Generator] Gemini API error, falling back to offline:', err.message);
    }

    // Fallback to deterministic offline curriculum generator
    const fallbackNote = generateOfflineTopicNotes({
      topic: trimmedTopic,
      style,
      language,
      detailLevel
    });

    const updatedNotes = [fallbackNote, ...savedNotes.filter((n) => n.id !== fallbackNote.id)];
    setSavedNotes(updatedNotes);
    setActiveNoteId(fallbackNote.id);
    storage.set(STORAGE_KEYS.NOTES, updatedNotes);
    setStorageWarning(null);
    setIsGenerating(false);

    recordLearningActivity({
      type: 'notes',
      title: `Study Note: ${fallbackNote.title || trimmedTopic}`,
      category: subject || 'Notes Studio',
      icon: '📝'
    });

    onShowToast(`Generated note via offline curriculum engine! 📖`);
  };

  // Safe individual note deletion with confirmation execution
  const handleConfirmDelete = () => {
    if (!notePendingDelete || isDeleting) return;

    setIsDeleting(true);
    const idToDelete = notePendingDelete.id;
    const noteTitle = notePendingDelete.title;

    const updated = savedNotes.filter((n) => n.id !== idToDelete);
    const saveSuccess = storage.set(STORAGE_KEYS.NOTES, updated);

    if (!saveSuccess) {
      setIsDeleting(false);
      onShowToast('Error deleting note from browser storage.');
      return;
    }

    setSavedNotes(updated);

    // If active note was deleted, switch to first remaining or empty
    if (activeNoteId === idToDelete) {
      setActiveNoteId(updated.length > 0 ? updated[0].id : '');
    }

    setNotePendingDelete(null);
    setIsDeleting(false);
    onShowToast(`Permanently deleted: "${noteTitle}". 🗑️`);
  };

  const handleCopy = () => {
    if (!activeNote) return;
    const textToCopy = activeNote.markdown
      ? activeNote.markdown
      : `# ${activeNote.title} (${activeNote.styleLabel})\nLanguage: ${activeNote.language}\nCreated: ${formatNoteDate(activeNote.createdAt)}\n\n` +
        activeNote.sections
          .map((s) => `## ${s.heading}\n${s.content || ''}\n${s.code ? `\`\`\`typescript\n${s.code}\n\`\`\`` : ''}`)
          .join('\n\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      onShowToast('Notes copied to clipboard as Markdown! 📋');
    });
  };

  const handleDownload = () => {
    if (!activeNote) return;
    const textToCopy = activeNote.markdown
      ? activeNote.markdown
      : `# ${activeNote.title}\nFormat: ${activeNote.styleLabel}\nLanguage: ${activeNote.language}\nCreated: ${formatNoteDate(activeNote.createdAt)}\n\n` +
        activeNote.sections
          .map((s) => `## ${s.heading}\n${s.content || ''}\n${s.code ? `\`\`\`typescript\n${s.code}\n\`\`\`` : ''}`)
          .join('\n\n');

    const blob = new Blob([textToCopy], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded notes as Markdown (.md) file! 📄');
  };

  const handleSaveToLibrary = () => {
    if (!activeNote) return;
    const existingIndex = savedNotes.findIndex((n) => n.id === activeNote.id);
    let updated: GeneratedNote[];
    if (existingIndex >= 0) {
      updated = [...savedNotes];
      updated[existingIndex] = { ...activeNote };
    } else {
      updated = [activeNote, ...savedNotes];
    }
    const success = storage.set(STORAGE_KEYS.NOTES, updated);
    if (success) {
      setSavedNotes(updated);
      recordLearningActivity({
        type: 'notes',
        title: `Saved Note: ${activeNote.title || activeNote.topic}`,
        category: activeNote.subject || 'Notes Studio',
        icon: '💾'
      });
      onShowToast(`Saved "${activeNote.title}" to your Library! 💾`);
    } else {
      onShowToast('Could not save note to browser storage.');
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <span className="eyebrow">{studioMode === 'library' ? 'MY COLLECTION' : 'STUDY STUDIO'}</span>
          <h1 className="view-main-title">
            {studioMode === 'library' ? 'My Saved Notes Library' : 'Notes Generator & Library'}
          </h1>
          <p className="view-desc">
            {studioMode === 'library'
              ? 'Access, search, study, copy, download, and manage all your saved study notes and cheatsheets.'
              : 'Transform technical subjects into structured, revision-ready study notes, syntax cheatsheets, or flashcards.'}
          </p>
        </div>

        {/* Status Badge */}
        <div className="demo-notice-badge">
          <span
            className="badge-pulse"
            style={{
              background: geminiConnected ? '#10b981' : '#f59e0b',
              boxShadow: geminiConnected ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : undefined
            }}
          ></span>
          <div>
            <strong>
              {studioMode === 'library'
                ? 'Saved Notes Collection'
                : geminiConnected
                ? 'Gemini Notes Studio Active'
                : 'Offline Notes Mode'}
            </strong>
            <span className="demo-notice-sub">
              {savedNotes.length} Note{savedNotes.length !== 1 ? 's' : ''} saved locally
            </span>
          </div>
        </div>
      </div>

      {/* Studio Navigation Mode Tabs */}
      <div className="quiz-mode-nav-tray" role="tablist" aria-label="Notes Studio Modes" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          id="tab-mode-all"
          role="tab"
          aria-selected={studioMode === 'all'}
          className={`btn-mode-tab ${studioMode === 'all' ? 'active' : ''}`}
          onClick={() => setStudioMode('all')}
        >
          <span>📑 Full Studio View</span>
        </button>
        <button
          type="button"
          id="tab-mode-library"
          role="tab"
          aria-selected={studioMode === 'library'}
          className={`btn-mode-tab ${studioMode === 'library' ? 'active' : ''}`}
          onClick={() => setStudioMode('library')}
        >
          <span>📚 My Notes Library</span>
          <span className="mode-pill-badge">{savedNotes.length} saved</span>
        </button>
        <button
          type="button"
          id="tab-mode-generator"
          role="tab"
          aria-selected={studioMode === 'generator'}
          className={`btn-mode-tab ${studioMode === 'generator' ? 'active' : ''}`}
          onClick={() => setStudioMode('generator')}
        >
          <span>✨ Create New Note</span>
        </button>
      </div>

      {/* Corrupted Storage Alert Banner if detected */}
      {storageWarning && (
        <div
          className="storage-corrupt-warning"
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem'
          }}
        >
          <div>
            <strong>⚠️ Storage Warning:</strong> {storageWarning}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setStorageWarning(null)}
            style={{ color: '#92400e' }}
            title="Dismiss warning"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Generator Configuration Panel */}
      {(studioMode === 'all' || studioMode === 'generator') && (
        <div className="content-card">
        <div className="form-grid-two-col">
          {/* Topic Input */}
          <div className="form-field-full">
            <label htmlFor="notes-topic" className="form-label">
              Study Topic or Keyword
            </label>
            <input
              id="notes-topic"
              type="text"
              className={`form-input ${validationError ? 'input-error' : ''}`}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g., Operating System Process Scheduling, React 19 State, SQL Window Functions..."
            />
            {validationError && (
              <span className="field-error-text" style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ {validationError}
              </span>
            )}

            {/* Quick Topic Chips Tailored to Skill */}
            <div className="notes-skill-chips-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                {activeSkillConfig.icon} {activeSkillConfig.name} Suggested Topics:
              </span>
              {activeSkillConfig.suggestedNoteTopics.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="btn-topic-quick-chip"
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '9999px',
                    padding: '0.2rem 0.65rem',
                    color: '#e2e8f0',
                    fontSize: '0.76rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setTopic(item);
                    if (validationError) setValidationError(null);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Subject / Academic Field */}
          <div className="form-field">
            <label htmlFor="notes-subject" className="form-label">
              Subject / Academic Domain
            </label>
            <select
              id="notes-subject"
              className="form-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Computer Science & IT">Computer Science & IT</option>
              <option value="Operating Systems & Architecture">Operating Systems & Architecture</option>
              <option value="Software Engineering & Web">Software Engineering & Web</option>
              <option value="Database Systems">Database Systems</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="General Science & Physics">General Science & Physics</option>
            </select>
          </div>

          {/* Education Level */}
          <div className="form-field">
            <label htmlFor="notes-education" className="form-label">
              Class / Education Level
            </label>
            <select
              id="notes-education"
              className="form-select"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <option value="College / Undergraduate">College / Undergraduate (B.Tech / BCA / BS)</option>
              <option value="High School (Grades 11-12)">Senior High School (Grades 11-12)</option>
              <option value="Middle School (Grades 8-10)">Foundation School (Grades 8-10)</option>
              <option value="Professional & Interview Prep">Technical Interview / Professional (FAANG)</option>
            </select>
          </div>

          {/* AI Generation Engine */}
          <div className="form-field">
            <label htmlFor="notes-engine" className="form-label">
              Generation Engine
            </label>
            <select
              id="notes-engine"
              className="form-select"
              value={engine}
              onChange={(e) => setEngine(e.target.value as 'gemini' | 'offline')}
            >
              <option value="gemini">🌟 Gemini Cloud AI (Deep Custom Study Guide)</option>
              <option value="offline">📖 Verified Offline Curriculum (Instant Local)</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="form-field">
            <label htmlFor="notes-language" className="form-label">
              Language Output
            </label>
            <select
              id="notes-language"
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Hinglish">Hinglish (Hindi + English)</option>
              <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="Spanish">Español (Spanish)</option>
            </select>
          </div>

          {/* Notes Style Selector */}
          <div className="form-field">
            <label htmlFor="notes-style" className="form-label">
              Notes Format Style
            </label>
            <select
              id="notes-style"
              className="form-select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="cheatsheet">⚡ Exam Cheatsheet & Syntax</option>
              <option value="summary">📌 Executive Conceptual Summary</option>
              <option value="flashcards">🎴 Flashcard Bullet Q&As</option>
              <option value="tutorial">🛠️ Hands-on Step-by-Step Guide</option>
            </select>
          </div>

          {/* Detail Depth */}
          <div className="form-field">
            <label htmlFor="notes-detail" className="form-label">
              Detail Depth
            </label>
            <select
              id="notes-detail"
              className="form-select"
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
            >
              <option value="concise">Concise (Quick 2-min Revision)</option>
              <option value="comprehensive">Comprehensive (Full Deep-Dive)</option>
            </select>
          </div>
        </div>

        {/* Popular Presets Bar */}
        <div className="builder-footer-row">
          <div className="presets-tray">
            <span className="presets-label">Popular topics:</span>
            {presetTopics.map((pt) => (
              <button
                key={pt}
                type="button"
                className="btn-preset-pill"
                onClick={() => setTopic(pt)}
              >
                {pt.split(':')[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Synthesizing...' : '✨ Generate Notes'}
          </button>
        </div>
      </div>
      )}

      {/* STAGE 3: SAVED NOTES LIBRARY & SEARCH PANEL */}
      {(studioMode === 'all' || studioMode === 'library') && (
        <div className="content-card notes-library-panel">
        <div className="library-header-controls">
          <div className="library-title-group">
            <h2 className="library-main-heading">📚 Saved Notes Library</h2>
            <span className="library-count-pill">
              {filteredNotes.length} of {savedNotes.length} note{savedNotes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search Box */}
          <div className="library-search-box">
            <span className="library-search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              className="library-search-input"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search saved notes by title or topic"
            />
            {searchQuery && (
              <button
                type="button"
                className="library-search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchQuery('');
                }}
                title="Clear search query"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Library Cards Grid or Empty Search State */}
        {savedNotes.length === 0 ? (
          <div className="library-empty-search-state">
            <span style={{ fontSize: '2rem' }} aria-hidden="true">
              📝
            </span>
            <h3>No study notes saved yet</h3>
            <p>Enter a topic above or open the generator to create your first note.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setStudioMode('generator')}
            >
              ✨ Create Your First Note
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="library-empty-search-state">
            <span style={{ fontSize: '2rem' }} aria-hidden="true">
              🔍
            </span>
            <h3>No notes matching "{searchQuery}"</h3>
            <p>Try searching for a different keyword, title, or topic.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchQuery('')}
            >
              ✕ Reset Search
            </button>
          </div>
        ) : (
          <div className="library-cards-grid" role="list" aria-label="Saved notes list">
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  className={`saved-note-card ${isSelected ? 'active-note' : ''}`}
                  onClick={() => setActiveNoteId(note.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveNoteId(note.id);
                    }
                  }}
                  aria-pressed={isSelected}
                  title={`Open "${note.title}"`}
                >
                  <div className="note-card-meta-row">
                    <span className="badge-subtle" style={{ fontSize: '0.72rem' }}>
                      {note.styleLabel}
                    </span>
                    <button
                      type="button"
                      className="btn-card-delete"
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid selecting note when clicking delete
                        setNotePendingDelete(note);
                      }}
                      title={`Delete "${note.title}"`}
                      aria-label={`Delete note: ${note.title}`}
                    >
                      🗑️
                    </button>
                  </div>

                  <h3 className="note-card-title">{note.title}</h3>
                  <p className="note-card-topic-text">Topic: {note.topic}</p>

                  <div className="note-card-footer">
                    <span>🗓️ {formatNoteDate(note.createdAt)}</span>
                    <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: isSelected ? 700 : 500 }}>
                      {isSelected ? '● Active' : 'Open →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Rendered Notes Preview Sheet */}
      {activeNote ? (
        <div className="content-card notes-preview-sheet">
          <div className="notes-sheet-header">
            <div>
              <div className="sheet-tags-row">
                {activeNote.sourceType === 'gemini' ? (
                  <span
                    className="badge-subtle"
                    style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.35)', background: 'rgba(52, 211, 153, 0.15)', fontWeight: 600 }}
                  >
                    🌟 Gemini Cloud AI
                  </span>
                ) : (
                  <span
                    className="badge-subtle"
                    style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)', background: 'rgba(56, 189, 248, 0.15)', fontWeight: 600 }}
                  >
                    📖 Offline Curriculum
                  </span>
                )}
                <span className="badge-subtle">{activeNote.styleLabel}</span>
                <span className="badge-subtle">{activeNote.language}</span>
                <span
                  className="badge-subtle"
                  style={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.35)', background: 'rgba(74, 222, 128, 0.15)' }}
                >
                  💾 Created: {formatNoteDate(activeNote.createdAt)}
                </span>
              </div>
              <h2 className="notes-sheet-title">{activeNote.title}</h2>
            </div>

            <div
              className="sheet-actions"
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}
            >
              {/* Preserved dropdown selector for backward compatibility and quick switching */}
              {savedNotes.length > 1 && (
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  value={activeNote.id}
                  onChange={(e) => setActiveNoteId(e.target.value)}
                  title="Switch between saved notes"
                  aria-label="Switch saved note"
                >
                  {savedNotes.map((n) => (
                    <option key={n.id} value={n.id}>
                      📄 {n.title.length > 25 ? n.title.slice(0, 25) + '...' : n.title} ({formatNoteDate(n.createdAt)})
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                className="btn btn-primary btn-sm btn-save-library"
                onClick={handleSaveToLibrary}
                title="Explicitly save note to local storage library"
              >
                💾 Save Note
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopy}
                title="Copy formatted markdown to clipboard"
              >
                📋 Copy Markdown
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleDownload}
                title="Download file to computer"
              >
                ⬇ Download .md
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#dc2626' }}
                onClick={() => setNotePendingDelete(activeNote)}
                title="Delete this note from storage"
                aria-label="Delete this note"
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          {/* Note Body */}
          <div className="notes-sheet-body">
            {activeNote.sections.map((sec, idx) => (
              <div key={idx} className="note-section-block">
                <h3 className="note-section-heading">{sec.heading}</h3>
                {sec.content && (
                  <div className="note-section-text">
                    {parseSectionContent(sec.content).map((block, bIdx) => {
                      if (block.type === 'h3') {
                        return <h4 key={bIdx} className="note-sub-heading-3">{block.content}</h4>;
                      }
                      if (block.type === 'h4') {
                        return <h5 key={bIdx} className="note-sub-heading-4">{block.content}</h5>;
                      }
                      if (block.type === 'callout') {
                        return (
                          <div
                            key={bIdx}
                            className="note-callout-box"
                            dangerouslySetInnerHTML={{ __html: formatInlineNote(block.content || '') }}
                          />
                        );
                      }
                      if (block.type === 'table') {
                        return (
                          <div key={bIdx} className="note-table-container">
                            <table className="note-markdown-table">
                              <thead>
                                <tr>
                                  {block.tableHeaders?.map((th, thIdx) => (
                                    <th key={thIdx} dangerouslySetInnerHTML={{ __html: formatInlineNote(th) }} />
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {block.tableRows?.map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} dangerouslySetInnerHTML={{ __html: formatInlineNote(cell) }} />
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      if (block.type === 'ul' && block.items) {
                        return (
                          <ul key={bIdx} className="note-bullet-list">
                            {block.items.map((it, iIdx) => (
                              <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInlineNote(it) }} />
                            ))}
                          </ul>
                        );
                      }
                      if (block.type === 'ol' && block.items) {
                        return (
                          <ol key={bIdx} className="note-numbered-list">
                            {block.items.map((it, iIdx) => (
                              <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInlineNote(it) }} />
                            ))}
                          </ol>
                        );
                      }
                      return (
                        <p
                          key={bIdx}
                          dangerouslySetInnerHTML={{ __html: formatInlineNote(block.content || '') }}
                        />
                      );
                    })}
                  </div>
                )}
                {sec.code && (
                  <div className="note-code-wrapper">
                    <div className="code-header">
                      <div className="code-lang-tag">
                        <span className="code-lang-dot"></span>
                        <span>Reference Implementation / System Diagram</span>
                      </div>
                      <button
                        type="button"
                        className="btn-code-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(sec.code!);
                          onShowToast('Snippet copied! 📋');
                        }}
                      >
                        📋 Copy Code
                      </button>
                    </div>
                    <pre>
                      <code>{sec.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}

            <div className="note-persistence-notice">
              💾 <strong>Storage Status:</strong> Your generated notes are automatically persisted in browser <code>localStorage</code>. They remain available across tab reloads on this computer.
            </div>
          </div>
        </div>
      ) : (
        <div className="content-card library-empty-search-state">
          <h3>No Active Note Selected</h3>
          <p>Please select a note from your library or generate a new study note above.</p>
        </div>
      )}

      {/* Accessible Safe Delete Confirmation Modal */}
      {notePendingDelete && (
        <div
          className="modal-overlay-backdrop"
          onClick={() => setNotePendingDelete(null)}
          role="presentation"
        >
          <div
            className="modal-dialog-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-dialog-header">
              <h3 id="delete-dialog-title">⚠️ Delete Study Note</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setNotePendingDelete(null)}
                aria-label="Close dialog"
                style={{ fontSize: '1rem', padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-dialog-body" id="delete-dialog-desc">
              <p style={{ margin: '0 0 0.5rem 0' }}>
                Are you sure you want to permanently delete this study note from your library?
              </p>

              <div className="modal-note-preview-box">
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>
                  {notePendingDelete.title}
                </strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '0.2rem' }}>
                  Topic: {notePendingDelete.topic}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                  Created: {formatNoteDate(notePendingDelete.createdAt)} · {notePendingDelete.styleLabel}
                </span>
              </div>

              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.78rem', color: '#b91c1c' }}>
                This action cannot be undone. Only this specific note will be deleted; other saved notes are safe.
              </p>
            </div>

            <div className="modal-dialog-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setNotePendingDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm btn-confirm-delete-note"
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
