import type {
  StudyStat,
  ActivityItem,
  WeeklyChartData,
  QuizQuestion,
  RevisionTask,
  Flashcard,
  CareerPathway
} from '../types';

export const INITIAL_STUDY_STATS: StudyStat[] = [
  {
    id: 'streak',
    label: 'Study Streak',
    value: '6 Days',
    change: '+2 days this week',
    isPositive: true,
    subtext: '85% consistency rate',
    icon: '🔥',
    progressPercent: 85
  },
  {
    id: 'mastery',
    label: 'Modules Completed',
    value: '18 / 24',
    change: '75% of syllabus',
    isPositive: true,
    subtext: '6 modules remaining',
    icon: '📚',
    progressPercent: 75
  },
  {
    id: 'accuracy',
    label: 'Quiz Accuracy',
    value: '86%',
    change: '+4% vs last week',
    isPositive: true,
    subtext: 'Top score in React & DOM',
    icon: '🎯',
    progressPercent: 86
  },
  {
    id: 'hours',
    label: 'Learning Hours',
    value: '16.5 hrs',
    change: 'Goal: 18 hrs/week',
    isPositive: true,
    subtext: '1.5 hrs left for weekly goal',
    icon: '⏱️',
    progressPercent: 91
  }
];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Completed Quiz: React State & Lifecycle',
    category: 'Frontend Engineering',
    timestamp: 'Today, 2:45 PM',
    score: '90%',
    icon: '✅'
  },
  {
    id: 'act-2',
    title: 'Generated Cheatsheet: SQL Window Functions',
    category: 'Database Systems',
    timestamp: 'Yesterday, 6:15 PM',
    icon: '📝'
  },
  {
    id: 'act-3',
    title: 'Active Recall Session: Binary Search Trees',
    category: 'Algorithms & Data Structures',
    timestamp: '2 days ago',
    score: '8/10 recalled',
    icon: '🎴'
  },
  {
    id: 'act-4',
    title: 'Milestone Finished: Responsive CSS Flex & Grid',
    category: 'Modern Web Design',
    timestamp: '3 days ago',
    icon: '🏆'
  }
];

export const WEEKLY_CHART_DATA: WeeklyChartData[] = [
  { day: 'Mon', hours: 2.2, label: '2.2 hrs' },
  { day: 'Tue', hours: 3.1, label: '3.1 hrs' },
  { day: 'Wed', hours: 1.5, label: '1.5 hrs' },
  { day: 'Thu', hours: 2.8, label: '2.8 hrs' },
  { day: 'Fri', hours: 2.0, label: '2.0 hrs' },
  { day: 'Sat', hours: 3.5, label: '3.5 hrs (Today)', isToday: true },
  { day: 'Sun', hours: 1.4, label: 'Goal: 2.0 hrs' }
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    track: 'webdev',
    question: 'Why should you avoid using array index as a "key" prop in dynamic React lists?',
    options: [
      'React will throw a fatal compile-time syntax error.',
      'It causes key duplication across unrelated sibling components.',
      'Reordering or filtering items can corrupt local component state and degrade diffing performance.',
      'Keys must always be cryptographically signed hashes in React 19.'
    ],
    correctAnswerIndex: 2,
    explanation:
      'React relies on stable keys to identify which DOM elements have changed, been added, or removed. If index keys are reordered, state tied to child components can attach to the wrong item.',
    difficulty: 'Medium'
  },
  {
    id: 'q-2',
    track: 'webdev',
    question: 'What is the primary difference between CSS Grid and Flexbox?',
    options: [
      'Flexbox is 1-dimensional (row OR column), while Grid is 2-dimensional (rows AND columns simultaneously).',
      'Grid only supports pixel units while Flexbox only supports percentages.',
      'Flexbox works only in modern browsers, whereas Grid works in all legacy browsers.',
      'Grid can only contain text elements, not interactive components.'
    ],
    correctAnswerIndex: 0,
    explanation:
      'Flexbox manages layout along a single main axis at a time. CSS Grid handles 2-dimensional placement, allowing elements to align across both horizontal columns and vertical rows concurrently.',
    difficulty: 'Easy'
  },
  {
    id: 'q-3',
    track: 'cs',
    question: 'What is the worst-case time complexity of QuickSort when a naive pivot is chosen on an already sorted array?',
    options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(N²)'],
    correctAnswerIndex: 3,
    explanation:
      'If the smallest or largest element is consistently picked as the pivot in an already-sorted array, partitioning creates severely unbalanced sub-arrays of size (N-1) and 0, degenerating performance to O(N²).',
    difficulty: 'Hard'
  },
  {
    id: 'q-4',
    track: 'data',
    question: 'When should you use a LEFT JOIN instead of an INNER JOIN in SQL?',
    options: [
      'When you need to join tables without any foreign key relationships.',
      'When you want to keep all records from the left table even if there are no matching rows in the right table.',
      'When the right table contains more than 10,000 rows.',
      'When you are calculating aggregate averages with the AVG() function.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'INNER JOIN excludes unmatched rows. LEFT JOIN ensures every record from the left table is returned, populating NULL for any missing columns from the right table.',
    difficulty: 'Medium'
  },
  {
    id: 'q-5',
    track: 'webdev',
    question: 'How does the JavaScript Event Loop treat Microtasks (Promises) versus Macrotasks (setTimeout)?',
    options: [
      'Macrotasks always execute before any microtasks in the event queue.',
      'All pending Microtasks are executed immediately after the current call stack clears, before the next Macrotask runs.',
      'Microtasks and Macrotasks run simultaneously using multi-threaded web workers.',
      'setTimeout callbacks bypass the task queue and execute synchronously.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'The microtask queue (Promise.then, MutationObserver, queueMicrotask) has higher priority. When the synchronous stack empties, the engine flushes the entire microtask queue before picking the next macrotask.',
    difficulty: 'Hard'
  }
];

export const INITIAL_REVISION_TASKS: RevisionTask[] = [
  {
    id: 'rev-1',
    title: 'React Custom Hooks & Rules of Hooks',
    subject: 'Frontend Architecture',
    priority: 'Urgent',
    dueText: 'Due today · Spaced Box 2',
    completed: false,
    estimatedMinutes: 15,
    memoryScore: 62
  },
  {
    id: 'rev-2',
    title: 'SQL Indexing: B-Trees vs Hash Indexes',
    subject: 'Database Systems',
    priority: 'High',
    dueText: 'Due tomorrow · Spaced Box 3',
    completed: false,
    estimatedMinutes: 20,
    memoryScore: 74
  },
  {
    id: 'rev-3',
    title: 'TypeScript Generics & Utility Types (Pick, Omit, Record)',
    subject: 'Type Systems',
    priority: 'Medium',
    dueText: 'In 3 days · Spaced Box 4',
    completed: true,
    estimatedMinutes: 12,
    memoryScore: 89
  },
  {
    id: 'rev-4',
    title: 'CSS Stacking Context & z-index Calculations',
    subject: 'Web Fundamentals',
    priority: 'Low',
    dueText: 'In 5 days · Spaced Box 5',
    completed: false,
    estimatedMinutes: 10,
    memoryScore: 94
  }
];

export const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subject: 'React Architecture',
    question: 'What is the purpose of React.useMemo() versus React.useCallback()?',
    answer:
      'useMemo caches the RESULT of an expensive function calculation. useCallback caches the FUNCTION INSTANCE itself so child components relying on reference equality do not re-render.',
    rationale: 'Remember: useMemo returns a calculated value; useCallback returns a stable function callback.'
  },
  {
    id: 'fc-2',
    subject: 'Data Structures',
    question: 'What is the difference between a Process and a Thread in modern OS?',
    answer:
      'A Process has its own dedicated, isolated memory address space. Threads within the same process share that memory space (heap and globals) while maintaining independent stacks.',
    rationale: 'Thread context switching is fast because memory mappings and TLB do not need full flushes.'
  },
  {
    id: 'fc-3',
    subject: 'Web Performance',
    question: 'What is the difference between debounce and throttle in event handling?',
    answer:
      'Debounce delays execution until a certain amount of silence has passed (ideal for search autocomplete). Throttle guarantees execution at most once per fixed time interval (ideal for window resize/scroll).',
    rationale: 'Debounce waits for silence; Throttle regulates continuous flow.'
  }
];

export const CAREER_PATHWAYS: CareerPathway[] = [
  {
    id: 'path-frontend',
    title: 'Modern Frontend & UI Engineer',
    level: 'Associate to Mid-Level',
    demand: 'Very High',
    salaryRange: '$85,000 — $135,000 / yr',
    description:
      'Craft lightning-fast, accessible, responsive client-side web applications using modern React, TypeScript, and state management.',
    skills: ['TypeScript', 'React 19', 'Next.js', 'Tailwind / CSS Modules', 'Web Performance', 'Unit Testing'],
    milestones: [
      { title: 'HTML5 Semantic Layout & WCAG Accessibility', desc: 'Screen reader optimization, aria attributes, keyboard navigation.', completed: true },
      { title: 'Responsive CSS Grid & Advanced Flexbox', desc: 'Fluid container queries, subgrid, and mobile-first layouts.', completed: true },
      { title: 'React 19 State, Hooks & Component Patterns', desc: 'Custom hooks, Context API, state reducers, and profiling.', completed: false },
      { title: 'Offline-First PWAs & Client Storage', desc: 'IndexedDB, Service Workers, cache manifests, and background sync.', completed: false }
    ]
  },
  {
    id: 'path-fullstack-ai',
    title: 'Full-Stack AI Application Developer',
    level: 'High Growth Frontier',
    demand: 'Very High',
    salaryRange: '$110,000 — $165,000 / yr',
    description:
      'Bridge modern web interfaces with local LLMs, retrieval-augmented generation (RAG), vector stores, and resilient API architectures.',
    skills: ['TypeScript', 'Node.js / Express', 'Python / FastAPI', 'Vector Databases', 'Ollama / LangChain', 'PostgreSQL'],
    milestones: [
      { title: 'Resilient REST & Streaming Webhook APIs', desc: 'Server-sent events (SSE), rate limiting, and JWT authentication.', completed: true },
      { title: 'Local AI Integration (Ollama & Small Models)', desc: 'Running quantized 4-bit models locally with zero data transmission.', completed: false },
      { title: 'Vector Embeddings & Semantic Search Pipelines', desc: 'RAG pipelines with chunking strategies and cosine similarity.', completed: false },
      { title: 'Offline AI Hybrid Fallback Systems', desc: 'Smart routing between edge heuristic rules and local neural weights.', completed: false }
    ]
  },
  {
    id: 'path-data',
    title: 'Data Analytics & Intelligence Specialist',
    level: 'High Demand',
    demand: 'High',
    salaryRange: '$80,000 — $125,000 / yr',
    description:
      'Extract actionable signals from large operational datasets using SQL aggregation, exploratory Python pipelines, and executive dashboards.',
    skills: ['Advanced SQL', 'Python (Pandas, NumPy)', 'Data Storytelling', 'Tableau / PowerBI', 'Statistical Inference'],
    milestones: [
      { title: 'Relational Database Hygiene & Normalization', desc: '3NF schema design, indexing strategies, query execution plans.', completed: true },
      { title: 'Complex SQL Window Functions & CTEs', desc: 'Cumulative totals, cohort retention analysis, and lag/lead windows.', completed: false },
      { title: 'Automated Python Extraction & Cleaning', desc: 'Pandas vectorization, anomaly detection, and data validation.', completed: false },
      { title: 'Interactive BI Dashboards & KPIs', desc: 'Executive metric tracking, drill-down visualizations, and alert triggers.', completed: false }
    ]
  }
];
