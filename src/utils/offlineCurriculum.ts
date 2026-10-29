import type { GeneratedNote, NoteSection } from '../types';

export interface CurriculumTopicDefinition {
  id: string;
  name: string;
  keywords: string[];
  summary: {
    overview: string;
    principles: string[];
    code: string;
    interviewNotes: string;
  };
  cheatsheet: {
    syntaxHighlights: string;
    gotchas: string[];
    code: string;
    examTips: string;
  };
  flashcards: {
    cards: { q: string; a: string }[];
    code?: string;
  };
  tutorial: {
    stepByStep: { step: string; explanation: string; codeSnippet?: string }[];
    verification: string;
  };
}

export const VERIFIED_CURRICULUM_TOPICS: CurriculumTopicDefinition[] = [
  // 1. REACT 19 & FRONTEND ARCHITECTURE
  {
    id: 'react',
    name: 'React 19 State, Hooks & Reconciliation',
    keywords: ['react', 'hook', 'useeffect', 'usestate', 'reconciliation', 'virtual dom', 'fiber', 'compiler', 'frontend'],
    summary: {
      overview: 'React is a declarative UI library where state drives rendering. The React Reconciler (Fiber architecture) manages a priority-based virtual work tree, calculating minimal DOM mutations and scheduling render passes asynchronously.',
      principles: [
        'Unidirectional Data Flow: State flows down via props; changes flow up via explicit event callbacks.',
        'Immutability: State must never be mutated directly. Functional updates `setState(prev => ...)` preserve concurrent consistency.',
        'Pure Component Renders: Given the same props and state, render functions must produce identical JSX without side effects.',
        'Separation of Concerns: Keep UI presentation decoupled from business logic and data-fetching hooks.'
      ],
      code: `// Resilient Custom Hook with Auto-Cleanup\nimport { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delayMs: number = 300): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebouncedValue(value), delayMs);\n    return () => clearTimeout(timer); // Prevent memory leaks & stale updates\n  }, [value, delayMs]);\n\n  return debouncedValue;\n}`,
      interviewNotes: 'Explain how the Fiber reconciliation tree differs from the legacy stack reconciler (cooperative multitasking vs blocking execution). Understand React 19 compiler optimizations and automatic memoization.'
    },
    cheatsheet: {
      syntaxHighlights: '• `useState(initialVal)`: Local state. Functional updater `setCount(c => c + 1)` prevents batching race conditions.\n• `useEffect(fn, deps)`: Synchronizes with external systems. Omitted deps = runs after every render; `[]` = mount/unmount only.\n• `useRef()`: Mutable value container that does NOT trigger re-renders. Great for DOM handles.\n• `useMemo(fn, deps)` & `useCallback(fn, deps)`: Cache expensive calculations and function references.',
      gotchas: [
        'Never call hooks inside loops, conditions, or nested functions (enforces stable hook call ordering).',
        'Do not use `useEffect` for calculating derived state—compute it during render instead.',
        'Never use array indices as `key` props when list items can be reordered, filtered, or deleted.'
      ],
      code: `// Correct React 19 State Update Pattern\nconst [items, setItems] = useState<string[]>(['React', 'TypeScript']);\n\n// Safe immutable addition\nconst addItem = (newItem: string) => {\n  setItems(prev => [...prev, newItem]);\n};\n\n// Safe immutable removal\nconst removeItem = (targetIndex: number) => {\n  setItems(prev => prev.filter((_, idx) => idx !== targetIndex));\n};`,
      examTips: 'Know the 3 triggers of a component re-render: internal state update, parent re-render, and Context value change.'
    },
    flashcards: {
      cards: [
        { q: 'What is the Virtual DOM and why is it used?', a: 'An in-memory lightweight representation of the actual DOM. React diffs the Virtual DOM to batch and commit only the minimal necessary real DOM mutations.' },
        { q: 'Why must props be treated as immutable?', a: 'Props belong to the parent component. Mutating them directly breaks unidirectional data flow and causes unpredictable diffing bugs.' },
        { q: 'What is the purpose of the key prop in lists?', a: 'Keys give elements a stable identity across renders so React can track which items are added, removed, or moved without re-mounting the entire list.' },
        { q: 'How does React batch multiple setState calls?', a: 'React batches state updates inside event handlers and async callbacks into a single re-render pass to prevent unnecessary layout thrashing.' }
      ],
      code: `// Batching Example\nfunction handleClick() {\n  setCount(c => c + 1);\n  setFlag(f => !f);\n  // React re-renders once at the end of the handler\n}`
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Declare Component State', explanation: 'Use typed state hooks with sensible default initializers.', codeSnippet: 'const [search, setSearch] = useState<string>("");' },
        { step: 'Step 2: Compute Derived State During Render', explanation: 'Filter data inline without storing redundant state in useEffect.', codeSnippet: 'const filteredResults = items.filter(i => i.toLowerCase().includes(search.toLowerCase()));' },
        { step: 'Step 3: Attach Keyboard & Accessibility Handlers', explanation: 'Ensure ARIA attributes and focus management are configured.', codeSnippet: '<input aria-label="Search items" value={search} onChange={e => setSearch(e.target.value)} />' }
      ],
      verification: 'Run automated component tests with React Testing Library verifying that entering input updates the DOM correctly without console warnings.'
    }
  },

  // 2. JAVASCRIPT & WEB APIS
  {
    id: 'javascript',
    name: 'JavaScript & Web APIs (Event Loop & Asynchronous Architecture)',
    keywords: ['javascript', 'js', 'event loop', 'promise', 'async', 'await', 'closure', 'prototype', 'microtask', 'macrotask', 'web api'],
    summary: {
      overview: 'JavaScript is a single-threaded, non-blocking asynchronous language powered by the event loop. The call stack executes synchronous code while asynchronous callbacks wait in the Microtask Queue (Promises) or Task Queue (setTimeout, I/O).',
      principles: [
        'Single-Threaded Execution: Exactly one statement executes at a time on the main thread.',
        'Microtask Priority: The Microtask Queue is completely drained after each stack frame before any macrotask is processed.',
        'Lexical Scoping & Closures: Functions maintain access to their outer lexical environment even after that outer scope has returned.',
        'Prototypal Inheritance: Objects inherit directly from other objects via the internal [[Prototype]] link (`__proto__`).'
      ],
      code: `// Microtask vs Macrotask Execution Order\nconsole.log('1. Synchronous Stack');\n\nsetTimeout(() => console.log('4. Task Queue (Macrotask)'), 0);\n\nPromise.resolve().then(() => console.log('3. Microtask Queue'));\n\nconsole.log('2. Synchronous Stack End');\n// Output order: 1 -> 2 -> 3 -> 4`,
      interviewNotes: 'Be prepared to manually trace execution order through the call stack, microtask queue, requestAnimationFrame, and macrotask queue.'
    },
    cheatsheet: {
      syntaxHighlights: '• `Promise.all([p1, p2])`: Fails fast if any promise rejects.\n• `Promise.allSettled([p1, p2])`: Always waits for all promises, returning `{ status, value/reason }`.\n• `Promise.race([p1, p2])`: Resolves or rejects as soon as the first promise settles.\n• Closures: `const add = (x) => (y) => x + y;` encapsulates private state.',
      gotchas: [
        '`==` performs type coercion while `===` checks both value and type strictly.',
        'Arrow functions do NOT bind their own `this`, `arguments`, or `super`. They inherit `this` lexically.',
        '`NaN !== NaN`. Use `Number.isNaN(val)` to check for NaN reliably.'
      ],
      code: `// Safe Concurrent Fetching with Timeout Pattern\nexport async function fetchWithTimeout(url: string, timeoutMs: number = 5000) {\n  const controller = new AbortController();\n  const timer = setTimeout(() => controller.abort(), timeoutMs);\n  try {\n    const res = await fetch(url, { signal: controller.signal });\n    return await res.json();\n  } finally {\n    clearTimeout(timer);\n  }\n}`,
      examTips: 'Remember that unhandled promise rejections can crash Node.js processes. Always attach `.catch()` or use `try/catch` with `await`.'
    },
    flashcards: {
      cards: [
        { q: 'What is a closure in JavaScript?', a: 'A closure is the combination of a function and the lexical environment within which that function was declared, enabling persistent private variables.' },
        { q: 'What is the difference between microtasks and macrotasks?', a: 'Microtasks (Promise callbacks, queueMicrotask, MutationObserver) run immediately after synchronous code and before the next rendering or macrotask (setTimeout, setInterval, I/O).' },
        { q: 'What is prototypal inheritance?', a: 'A mechanism where objects inherit properties and methods directly from prototype objects via the prototype chain rather than classical classes.' },
        { q: 'How does the event loop prevent browser UI freezing?', a: 'By offloading long-running I/O and timers to browser background threads (Web APIs) and scheduling their completion callbacks onto queues.' }
      ],
      code: `// Closure Encapsulation\nfunction createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst count = createCounter();\ncount(); // 1\ncount(); // 2`
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Create an Async Function', explanation: 'Define an async function that returns a Promise.', codeSnippet: 'async function loadData(url: string) { ... }' },
        { step: 'Step 2: Handle AbortSignal & Cancellation', explanation: 'Pass an AbortSignal to avoid memory leaks if the user navigates away.', codeSnippet: 'const res = await fetch(url, { signal });' },
        { step: 'Step 3: Parse Response Gracefully', explanation: 'Check `res.ok` before calling `res.json()`.', codeSnippet: 'if (!res.ok) throw new Error(`HTTP ${res.status}`); return await res.json();' }
      ],
      verification: 'Simulate offline status in DevTools Network tab and verify error recovery executes without uncaught exceptions.'
    }
  },

  // 3. CSS & RESPONSIVE DESIGN
  {
    id: 'css',
    name: 'CSS & Responsive Design (Flexbox, Grid & Modern Layouts)',
    keywords: ['css', 'flexbox', 'grid', 'responsive', 'layout', 'specificity', 'box model', 'media query', 'container query', 'z-index'],
    summary: {
      overview: 'Modern CSS provides 1D (Flexbox) and 2D (CSS Grid) layout engines that eliminate legacy float and positioning hacks. Responsive design uses fluid units, media queries, container queries, and resilient flex wrapping to fit any viewport.',
      principles: [
        '1D vs 2D Layouts: Use Flexbox for linear alignment (bars, nav, pill rows) and CSS Grid for two-dimensional coordinate grids.',
        'CSS Box Model: Total element footprint = Content + Padding + Border + Margin. Always apply `box-sizing: border-box`.',
        'Stacking Context & z-index: `z-index` only applies to positioned elements (`relative`, `absolute`, `fixed`, `sticky`) or flex/grid items.',
        'Specificity Hierarchy: Inline styles (1000) > IDs (100) > Classes/Attributes/Pseudo-classes (10) > Elements/Pseudo-elements (1).'
      ],
      code: `/* Responsive Auto-Fitting Grid without Media Queries */\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n  align-items: stretch;\n}\n\n/* Perfect Vertical & Horizontal Flex Centering */\n.center-box {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`,
      interviewNotes: 'Be prepared to explain how `box-sizing: border-box` works, what triggers a new stacking context, and the difference between `auto-fit` and `auto-fill` in CSS Grid.'
    },
    cheatsheet: {
      syntaxHighlights: '• `display: flex`: Main axis (`justify-content`), Cross axis (`align-items`), Wrapping (`flex-wrap: wrap`).\n• `display: grid`: `grid-template-columns: repeat(12, 1fr)`, `gap: 1rem`.\n• Container Queries: `@container (min-width: 400px) { ... }` enables modular responsive components.\n• Modern Colors: `color: oklch(0.65 0.24 260)` provides uniform perceived lightness.',
      gotchas: [
        'Margins collapse vertically on block elements, but NEVER collapse inside Flexbox or Grid containers.',
        '`z-index: 9999` will not work if a parent container creates an isolated stacking context with a lower index.',
        'Using `vh` on mobile can cause jumpiness as browser URL address bars hide and show; prefer `dvh` (dynamic viewport height).'
      ],
      code: `/* Mobile-First Fluid Typography with clamp() */\nh1 {\n  font-size: clamp(1.75rem, 4vw + 1rem, 3rem);\n  line-height: 1.2;\n}`,
      examTips: 'Remember that specificity is calculated per selector, not by number of characters. `!important` should be used sparingly as an architectural last resort.'
    },
    flashcards: {
      cards: [
        { q: 'What is the difference between Flexbox and CSS Grid?', a: 'Flexbox is designed for 1-dimensional layouts (a single row OR a single column), while CSS Grid handles 2-dimensional layouts (rows AND columns simultaneously).' },
        { q: 'What does box-sizing: border-box do?', a: 'It includes padding and border in the element\'s total specified width and height, preventing layout breakage when styling elements.' },
        { q: 'What creates a new Stacking Context in CSS?', a: 'Root document, elements with opacity < 1, transform/filter properties, fixed/sticky positioning, or `isolation: isolate`.' },
        { q: 'How does minmax(250px, 1fr) work in CSS Grid?', a: 'It sets the minimum column track width to 250px and allows it to grow to fill any available proportional fractional space (1fr).' }
      ]
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Set Box-Sizing Reset', explanation: 'Ensure universal sizing consistency across all elements.', codeSnippet: '*, *::before, *::after { box-sizing: border-box; margin: 0; }' },
        { step: 'Step 2: Configure Layout Container', explanation: 'Use CSS Grid with auto-fit to eliminate rigid viewport breakpoints.', codeSnippet: '.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }' },
        { step: 'Step 3: Test Fluid Responsiveness', explanation: 'Resize browser window from 320px to 1440px to confirm zero horizontal overflow.', codeSnippet: 'body { overflow-x: hidden; min-height: 100dvh; }' }
      ],
      verification: 'Open Chrome DevTools device mode and check rendering across 320px (iPhone SE) and 1280px without scroll clipping.'
    }
  },

  // 4. SQL & DATABASE SYSTEMS
  {
    id: 'sql',
    name: 'SQL & Database Systems (Relational Modeling, Indexing & ACID)',
    keywords: ['sql', 'database', 'join', 'index', 'acid', 'transaction', 'normalization', 'b-tree', 'query', 'postgres', 'mysql'],
    summary: {
      overview: 'Relational Database Management Systems (RDBMS) guarantee data integrity through schemas, foreign keys, and ACID transactions. Efficient query execution relies on proper index selection (B-Trees) and optimized JOIN algorithms.',
      principles: [
        'ACID Guarantees: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent safety), Durability (persisted on disk).',
        'Index Mechanics: B-Tree indexes speed up lookups from O(N) sequential scans to O(log N) tree traversals at the cost of slower writes.',
        'Normalization vs Denormalization: Normalize (1NF, 2NF, 3NF) to eliminate anomalies; denormalize selectively for high-read performance.',
        'Query Planner: The RDBMS analyzes statistics to pick between Hash Join, Nested Loop, or Merge Join.'
      ],
      code: `/* Index-Backed High-Performance Query with Window Function */\nSELECT \n  user_id,\n  quiz_topic,\n  score,\n  DENSE_RANK() OVER (PARTITION BY quiz_topic ORDER BY score DESC) AS rank_in_topic\nFROM student_quiz_attempts\nWHERE completed_at >= NOW() - INTERVAL '30 days'\nORDER BY quiz_topic, rank_in_topic;`,
      interviewNotes: 'Understand the difference between clustered and secondary non-clustered indexes. Be prepared to explain transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) and phantom reads.'
    },
    cheatsheet: {
      syntaxHighlights: '• `INNER JOIN`: Only matching rows from both tables.\n• `LEFT JOIN`: All rows from left table + matches from right (NULL if none).\n• `GROUP BY` + `HAVING`: `WHERE` filters rows BEFORE aggregation; `HAVING` filters AFTER aggregation.\n• Indexes: `CREATE INDEX idx_user_topic ON quiz_attempts(user_id, topic);` (Composite index order matters!).',
      gotchas: [
        'Leading wildcard `LIKE "%term"` cannot use B-Tree indexes and forces a full table scan.',
        'Applying functions on indexed columns (e.g. `WHERE UPPER(email) = ...`) invalidates the index unless using an expression index.',
        'Uncommitted transactions hold row locks and can cause severe database deadlocks under concurrency.'
      ],
      code: `/* Transaction Boundary Pattern */\nBEGIN TRANSACTION;\n  UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;\n  UPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;`,
      examTips: 'Remember: 1NF = Atomic values; 2NF = 1NF + No partial key dependencies; 3NF = 2NF + No transitive dependencies.'
    },
    flashcards: {
      cards: [
        { q: 'What is the difference between WHERE and HAVING?', a: 'WHERE filters individual records before aggregation takes place, while HAVING filters aggregated grouped rows after GROUP BY is applied.' },
        { q: 'What does ACID stand for in databases?', a: 'Atomicity (all or nothing), Consistency (rules enforced), Isolation (concurrent independence), and Durability (persisted to storage).' },
        { q: 'What is a B-Tree index and why is it preferred?', a: 'A self-balancing search tree where nodes hold multiple keys. It keeps data sorted and allows search, sequential access, and insertions in O(log N) with minimal disk I/O.' },
        { q: 'What is a database deadlock?', a: 'A situation where two transactions each hold a lock the other needs, causing both to wait indefinitely until the DBMS detects and aborts one.' }
      ]
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Write Base Query & Explain Plan', explanation: 'Run EXPLAIN ANALYZE to identify sequential full-table scans.', codeSnippet: 'EXPLAIN ANALYZE SELECT * FROM users WHERE email = "alex@test.com";' },
        { step: 'Step 2: Create Targeted B-Tree Index', explanation: 'Index high-cardinality search columns.', codeSnippet: 'CREATE UNIQUE INDEX idx_users_email ON users(email);' },
        { step: 'Step 3: Verify Index Scan Execution', explanation: 'Re-run EXPLAIN to confirm "Index Scan" replaces "Seq Scan".', codeSnippet: 'EXPLAIN ANALYZE SELECT * FROM users WHERE email = "alex@test.com";' }
      ],
      verification: 'Execution cost should drop significantly from sequential scan cost to logarithmic index lookup.'
    }
  },

  // 5. DATA STRUCTURES & ALGORITHMS
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms (Complexity, Searching & Trees)',
    keywords: ['dsa', 'algorithm', 'data structure', 'binary search', 'big-o', 'sorting', 'quicksort', 'tree', 'hash table', 'stack', 'queue'],
    summary: {
      overview: 'Data structures organize memory for efficient computational access. Algorithm design balances asymptotic time complexity (CPU cycles) and space complexity (memory allocation) across best, average, and worst cases.',
      principles: [
        'Asymptotic Analysis: Big-O represents the upper bound growth rate as input size N scales towards infinity.',
        'Divide and Conquer: Break problems into independent sub-problems (e.g. Binary Search, MergeSort) to achieve logarithmic scaling.',
        'Hash Tables: Provide O(1) average lookup via hash functions, handling collisions through chaining or open addressing.',
        'Recursion vs Iteration: Recursive calls utilize call stack space (risk of stack overflow); iteration maintains O(1) auxiliary space.'
      ],
      code: `// Optimal Binary Search Implementation (Iterative)\nexport function binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left <= right) {\n    // Prevent integer overflow: left + (right - left) / 2\n    const mid = Math.floor(left + (right - left) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1; // Target not found\n}`,
      interviewNotes: 'Know QuickSort worst-case O(N^2) on sorted arrays with naive pivot vs average O(N log N). Understand why MergeSort is stable and preferred for linked lists while QuickSort is in-place for arrays.'
    },
    cheatsheet: {
      syntaxHighlights: '• Binary Search: O(log N) Time, O(1) Space. Input MUST be sorted.\n• Hash Table: O(1) Average Lookup/Insert, O(N) Worst Case (all collisions).\n• QuickSort: O(N log N) Average Time, O(log N) Space. Naive pivot worst case = O(N^2).\n• Stack (LIFO) & Queue (FIFO): O(1) Push/Pop/Enqueue/Dequeue operations.',
      gotchas: [
        'Calculating midpoint with `(left + right) / 2` can trigger 32-bit integer overflow in languages like Java/C++; use `left + Math.floor((right - left) / 2)`.',
        'In JavaScript, array `.sort()` converts numbers to strings by default! Always pass a comparator: `arr.sort((a, b) => a - b)`.',
        'Hash table keys in JS objects coerce keys to strings; use `Map` for arbitrary key types.'
      ],
      code: `// Safe In-Place QuickSort Partition\nfunction partition(arr: number[], low: number, high: number): number {\n  const pivot = arr[high];\n  let i = low - 1;\n  for (let j = low; j < high; j++) {\n    if (arr[j] <= pivot) {\n      i++;\n      [arr[i], arr[j]] = [arr[j], arr[i]];\n    }\n  }\n  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];\n  return i + 1;\n}`,
      examTips: 'Common complexities in order: O(1) < O(log N) < O(N) < O(N log N) < O(N^2) < O(2^N) < O(N!).'
    },
    flashcards: {
      cards: [
        { q: 'What is the prerequisite for Binary Search?', a: 'The input collection must be sorted in ascending (or descending) order beforehand.' },
        { q: 'What is the worst-case time complexity of QuickSort?', a: 'O(N^2), which occurs when the pivot chosen is consistently the smallest or largest element (such as an already sorted array with a naive end pivot).' },
        { q: 'What is the difference between a Stack and a Queue?', a: 'A Stack is Last-In-First-Out (LIFO), whereas a Queue is First-In-First-Out (FIFO).' },
        { q: 'How does a Hash Table achieve O(1) average lookups?', a: 'It passes a key into a hash function that computes an integer index into an underlying array, accessing memory directly in constant time.' }
      ]
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Identify Sorted Preconditions', explanation: 'Check if array is sorted. If unsorted, sort in O(N log N) first.', codeSnippet: 'const sorted = [...raw].sort((a, b) => a - b);' },
        { step: 'Step 2: Initialize Two Pointers', explanation: 'Set left at 0 and right at array.length - 1.', codeSnippet: 'let left = 0, right = sorted.length - 1;' },
        { step: 'Step 3: Halve the Search Space', explanation: 'Calculate midpoint and eliminate half the elements in each iteration.', codeSnippet: 'const mid = Math.floor((left + right) / 2);' }
      ],
      verification: 'Run unit test with targets at index 0, midpoint, last index, and a missing target returning -1.'
    }
  },

  // 6. SYSTEM ARCHITECTURE & MICROSERVICES
  {
    id: 'system-design',
    name: 'Distributed Microservices & Cloud Architecture',
    keywords: ['microservice', 'microservices', 'distributed', 'docker', 'container', 'kubernetes', 'rest', 'graphql', 'system design', 'distributed architecture', 'microservice architecture', 'service mesh'],
    summary: {
      overview: 'Modern cloud architectures transition monolithic services into decoupled microservices communicating through REST, gRPC, or asynchronous message queues (Kafka, RabbitMQ). Containerization (Docker) and orchestration (Kubernetes) ensure reproducible deployment and auto-scaling.',
      principles: [
        'Service Autonomy: Each microservice owns its domain logic and private database (Database-per-Service pattern).',
        'Asynchronous Decoupling: Use event-driven messaging to buffer spikes and prevent cascading failures.',
        'Observability: Implement distributed tracing (OpenTelemetry), centralized logging, and health probe endpoints.',
        'Resilience Patterns: Circuit breakers, exponential backoff with jitter, and bulkhead isolation prevent total system collapse.'
      ],
      code: `// Resilient Circuit Breaker Pattern Concept\nexport class CircuitBreaker {\n  private failures = 0;\n  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';\n  private nextAttempt = Date.now();\n\n  async execute<T>(fn: () => Promise<T>, threshold = 3, cooldownMs = 5000): Promise<T> {\n    if (this.state === 'OPEN') {\n      if (Date.now() < this.nextAttempt) throw new Error('Circuit Breaker is OPEN');\n      this.state = 'HALF_OPEN';\n    }\n    try {\n      const result = await fn();\n      this.state = 'CLOSED';\n      this.failures = 0;\n      return result;\n    } catch (err) {\n      this.failures++;\n      if (this.failures >= threshold) {\n        this.state = 'OPEN';\n        this.nextAttempt = Date.now() + cooldownMs;\n      }\n      throw err;\n    }\n  }\n}`,
      interviewNotes: 'Explain the CAP theorem (Consistency, Availability, Partition Tolerance) and why network partitions force distributed systems to choose between Consistency and Availability.'
    },
    cheatsheet: {
      syntaxHighlights: '• Dockerfile: Multi-stage builds (`FROM node:20-alpine AS builder`) reduce image size.\n• REST vs GraphQL: REST uses fixed HTTP verbs and endpoints; GraphQL allows clients to request exact fields in one query.\n• Kubernetes: Pod (smallest deployable unit), Service (stable networking/load balancer), Deployment (declarative replica manager).\n• API Gateway: Handles rate limiting, authentication, SSL termination, and routing.',
      gotchas: [
        'Avoid 2-Phase Commit (2PC) in high-throughput distributed systems; prefer the Saga pattern with compensating transactions.',
        'Never run Docker containers as the root user in production; use a dedicated non-privileged user (`USER node`).',
        'Without distributed tracing (trace ID propagation in HTTP headers), debugging microservices latency is nearly impossible.'
      ],
      code: `# Multi-stage Dockerfile Best Practice\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`,
      examTips: 'Remember that Kubernetes liveness probes restart containers when they fail, while readiness probes stop sending traffic until the app is ready.'
    },
    flashcards: {
      cards: [
        { q: 'What is the CAP Theorem?', a: 'In a distributed data store, under a network partition (P), you can only guarantee either Consistency (C) or Availability (A), but never both simultaneously.' },
        { q: 'What is the difference between a Container and a Virtual Machine?', a: 'Containers share the host OS kernel and isolate user space, making them lightweight (MBs, seconds to start). VMs virtualize entire hardware with a hypervisor and guest OS (GBs, minutes to start).' },
        { q: 'What problem does a Circuit Breaker solve?', a: 'It prevents an application from repeatedly executing an operation that is likely to fail, giving failing downstream services time to recover and avoiding thread pool exhaustion.' },
        { q: 'What is the Saga Pattern in microservices?', a: 'A sequence of local transactions across services where each step updates its local database and publishes an event; if a step fails, compensating transactions undo the previous steps.' }
      ]
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Containerize Application with Docker', explanation: 'Write a multi-stage Dockerfile keeping production image size minimal.', codeSnippet: 'docker build -t microservice-api:latest .' },
        { step: 'Step 2: Define Kubernetes Deployment & Service', explanation: 'Declare replica count and health probe endpoints.', codeSnippet: 'kubectl apply -f deployment.yaml' },
        { step: 'Step 3: Validate Rolling Update & Ingress', explanation: 'Perform zero-downtime rolling update deployment.', codeSnippet: 'kubectl rollout status deployment/microservice-api' }
      ],
      verification: 'Verify that pods respond to health check `/healthz` and zero dropped requests occur during rollout.'
    }
  },

  // 7. OPERATING SYSTEMS & SYSTEM ARCHITECTURE
  {
    id: 'os',
    name: 'Operating Systems & System Architecture',
    keywords: ['operating system', 'os', 'kernel', 'process', 'thread', 'scheduling', 'paging', 'deadlock', 'virtual memory', 'system call', 'concurrency'],
    summary: {
      overview: 'An Operating System (OS) is the fundamental system software that acts as an intermediary between computer hardware and user applications. It manages CPU scheduling, memory allocation, process lifecycle, file systems, and hardware I/O devices while enforcing protection via dual-mode operation (User vs Kernel space).',
      principles: [
        'Kernel Abstraction: Hides raw hardware complexity behind standardized POSIX / Win32 system calls.',
        'Dual-Mode Operation: Hardware execution modes (User Mode / Ring 3 vs Kernel Mode / Ring 0) prevent user programs from accessing hardware directly.',
        'Process vs Thread Isolation: Processes possess distinct virtual memory address spaces; threads within the same process share code, data, and heap while maintaining private stacks.',
        'Virtual Memory & Paging: Maps fragmented physical RAM into contiguous virtual address spaces using page tables and the Memory Management Unit (MMU).'
      ],
      code: `// C/POSIX Process Creation & State Lifecycle\n#include <stdio.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    pid_t pid = fork(); // Clones current process\n\n    if (pid < 0) {\n        perror("Fork failed");\n        return 1;\n    } else if (pid == 0) {\n        // Child process execution\n        printf("Child Process (PID: %d) executing task\\n", getpid());\n        execlp("/bin/ls", "ls", "-la", NULL);\n    } else {\n        // Parent process waits for child state termination\n        wait(NULL);\n        printf("Parent (PID: %d) completed after child terminated\\n", getpid());\n    }\n    return 0;\n}`,
      interviewNotes: 'Be prepared to explain the 4 Coffman conditions for Deadlock (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) and how virtual memory page faults are resolved.'
    },
    cheatsheet: {
      syntaxHighlights: '• Process States: New -> Ready -> Running -> Waiting/Blocked -> Terminated.\n• Context Switch: CPU saves current Process Control Block (PCB) registers and loads the next PCB.\n• Paging: Fixed-size memory blocks (pages/frames). Eliminates external fragmentation; allows internal fragmentation.\n• Scheduling: Preemptive (Round Robin, SRTF) vs Non-preemptive (FCFS, SJF).',
      gotchas: [
        'Threads share memory: Race conditions occur when multiple threads mutate shared variables without mutexes or semaphores.',
        'Thrashing: Occurs when the system spends more time swapping pages between RAM and disk than executing actual CPU instructions.',
        'Deadlock is not starvation: Deadlock is permanent blockage of mutually waiting processes; starvation is indefinite delay due to scheduling bias.'
      ],
      code: `/* Process vs Thread Characteristics\n * Feature            | Process               | Thread\n * -------------------|-----------------------|---------------------\n * Address Space      | Private / Isolated    | Shared with parent\n * Creation Overhead  | Heavy (new PCB/page)  | Lightweight (TCB)\n * Context Switch     | Slow (flush TLB)      | Fast (preserve TLB)\n * Communication      | IPC (pipes, sockets)  | Shared Memory\n */`,
      examTips: 'Remember that CPU scheduling algorithms prioritize either turnaround time, waiting time, or throughput. Round Robin guarantees responsiveness with fair time quantum allocation.'
    },
    flashcards: {
      cards: [
        { q: 'What are the 4 essential conditions for deadlock to occur?', a: '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.' },
        { q: 'What is the difference between paging and segmentation?', a: 'Paging divides memory into fixed-size physical blocks (pages/frames); segmentation divides memory into variable-sized logical modules (functions, arrays, stack).' },
        { q: 'What is a system call (syscall)?', a: 'A controlled programmatic mechanism where a user-space application requests a privileged service (file I/O, network send, process creation) from the OS kernel.' },
        { q: 'Why is a context switch between threads faster than between processes?', a: 'Threads share the same virtual address space, so the CPU MMU does not need to invalidate and reload the Translation Lookaside Buffer (TLB).' }
      ],
      code: `// Process State Transition ASCII Diagram:\n// [New] -> [Ready] <--(Time Slice Interrupt)-- [Running] -> [Terminated]\n//            ^                                    |\n//            |------- (I/O Complete) -------- [Waiting]`
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Understand Dual-Mode Execution', explanation: 'CPUs toggle between Ring 3 (User) and Ring 0 (Kernel) via software interrupts (syscall trap).', codeSnippet: '// trap instruction triggers privilege escalation' },
        { step: 'Step 2: Trace Process State Transitions', explanation: 'Follow a process from creation (fork) into the ready queue, CPU execution, I/O wait, and exit.', codeSnippet: '// Ready -> Running -> Waiting -> Terminated' },
        { step: 'Step 3: Analyze Virtual Memory Address Translation', explanation: 'MMU uses page tables and TLB cache to translate Virtual Page Numbers (VPN) to Physical Frame Numbers (PFN).', codeSnippet: '// Virtual Address: [Page Number (VPN) | Offset]' }
      ],
      verification: 'Verify understanding by explaining how the OS handles a Page Fault interrupt when requested data is on disk swap space.'
    }
  },

  // 9. PYTHON PROGRAMMING & CORE FOUNDATIONS
  {
    id: 'python',
    name: 'Python Fundamentals: Variables, Loops & Functions',
    keywords: ['python', 'python3', 'py', 'variable', 'loop', 'pushup', 'pushups', 'mixer', 'grinder', 'function', 'def', 'list', 'dict', 'dictionary'],
    summary: {
      overview: 'Python is a readable, intuitive programming language that allows developers to express concepts in fewer lines of code. It uses clear indentation instead of curly braces, making it ideal for beginners and scalable for AI/data engineering.',
      principles: [
        'Readability Counts: Code is read much more often than it is written. Plain English syntax reduces cognitive friction.',
        'Variables as Labeled Boxes: Variables are labeled kitchen dabbas (spice containers) holding numbers, strings, or lists.',
        'Loops as Repetitive Exercise: A loop is like doing 10 pushups one by one; you repeat an action until target count is reached.',
        'Functions as Kitchen Machines: Like a mixer grinder that accepts fruit and milk (inputs), blends them, and returns fresh juice (output).'
      ],
      code: `# Python Beginner Mastery: The Mixer Grinder Function\ndef make_fruit_shake(fruit: str, glasses: int) -> str:\n    # Safety check\n    if glasses <= 0:\n        return "Need at least 1 glass order!"\n    return f"Prepared {glasses} fresh glasses of {fruit} shake! 🥤"\n\n# Loop through 3 customer orders (like counting pushups)\norders = ["Mango", "Banana", "Strawberry"]\nfor idx, item in enumerate(orders, start=1):\n    message = make_fruit_shake(item, 2)\n    print(f"Order #{idx}: {message}")`,
      interviewNotes: 'Explain the difference between mutable (lists, dicts) and immutable (strings, tuples, ints) types. Understand Python dynamic typing and GIL (Global Interpreter Lock).'
    },
    cheatsheet: {
      syntaxHighlights: '• `variable = value`: Creates or updates a labeled storage box.\n• `for item in collection:`: Iterates through elements in order.\n• `range(start, stop)`: Generates numbers from start up to (stop - 1).\n• `def fn(args): return result`: Reusable machine block.',
      gotchas: [
        'Indentation is mandatory: inconsistent 2-space and 4-space indentation throws an IndentationError.',
        'Stop number in `range(1, 10)` is exclusive—it stops at 9.',
        'Avoid default mutable arguments like `def append_to(item, target_list=[])` as the list persists across calls.'
      ],
      code: `# Common Safe Python Patterns\n# Safe dictionary retrieval with fallback\nstudent = {"name": "Aman", "score": 92}\ngrade = student.get("grade", "Pending Evaluation")\n\n# List comprehension (compact, readable loop)\nsquares = [x**2 for x in range(1, 6)] # [1, 4, 9, 16, 25]`,
      examTips: 'Remember: Python uses zero-based indexing. `items[0]` is the first element, and `items[-1]` accesses the last element from the right.'
    },
    flashcards: {
      cards: [
        { q: 'What is the everyday analogy for a Python function?', a: 'A kitchen mixer grinder: you feed ingredients (arguments), it runs processing logic, and returns a tasty output (return value).' },
        { q: 'What is the difference between a Python List and a Dictionary?', a: 'A List is an ordered shopping list accessed by numbered indices [0, 1]; a Dictionary is a labeled spice rack accessed by unique keys ["salt", "turmeric"].' },
        { q: 'Why is Python considered beginner-friendly?', a: 'It eliminates verbose boilerplate, curly braces, and semicolons, letting learners focus on logical problem-solving in plain English.' }
      ]
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Declare Labeled Variables', explanation: 'Assign your data to clear, readable names like student_name and test_score.', codeSnippet: 'student_name = "Alex Kumar"\ntest_score = 94' },
        { step: 'Step 2: Control Logic with If-Else', explanation: 'Evaluate conditions just like deciding whether to carry an umbrella when it rains.', codeSnippet: 'if test_score >= 90:\n    print("Grade: A+")\nelse:\n    print("Keep practicing!")' },
        { step: 'Step 3: Package Reusable Logic into Functions', explanation: 'Wrap the logic in a def block so you can calculate grades for 100 students in one line.', codeSnippet: 'def calculate_grade(score):\n    return "A+" if score >= 90 else "B"' }
      ],
      verification: 'Run the function with test inputs to verify that valid grades return for all score ranges.'
    }
  },

  // 10. JAVA & OOP DISCIPLINES
  {
    id: 'java',
    name: 'Java Fundamentals: Classes, Objects & JVM',
    keywords: ['java', 'jvm', 'class', 'object', 'blueprint', 'encapsulation', 'bytecode', 'spring', 'oop', 'constructor'],
    summary: {
      overview: 'Java is an enterprise-grade, strongly typed, object-oriented language. It compiles source code into platform-independent bytecode executed by the Java Virtual Machine (JVM).',
      principles: [
        'Class as Blueprint: A class is an architect drawing; an Object is the real house built from it.',
        'Write Once, Run Anywhere: JVM acts as a universal travel adapter for bytecode across Windows, Linux, and Mac.',
        'Encapsulation: Like an ATM protecting money inside, data fields are kept private with controlled public methods.',
        'Type Safety: The compiler catches data type mismatches before runtime, ensuring enterprise stability.'
      ],
      code: `// The House Blueprint & Object Construction Pattern\npublic class House {\n    private String address;\n    private int roomCount;\n\n    public House(String address, int rooms) {\n        this.address = address;\n        this.roomCount = rooms;\n    }\n\n    public void ringDoorbell() {\n        System.out.println("Ding dong! Welcome to " + address);\n    }\n}`,
      interviewNotes: 'Understand the difference between JDK (development tools), JRE (runtime libraries), and JVM (execution engine). Explain how the Garbage Collector identifies unreachable heap objects.'
    },
    cheatsheet: {
      syntaxHighlights: '• `public class Name { ... }`: Every Java program requires at least one class.\n• `public static void main(String[] args)`: Application entry point.\n• `new ClassName()`: Allocates a new object instance on the heap.\n• `private` vs `public`: Access modifiers controlling encapsulation.',
      gotchas: [
        'Never compare Strings using `==`; always use `str1.equals(str2)` to compare character values rather than memory addresses.',
        'Forgetting `break` in switch statements causes accidental fall-through bugs.',
        'NullPointerException occurs when invoking methods on an uninitialized reference variable.'
      ],
      code: `// Safe String Comparison Pattern\nString input = "admin";\nif ("admin".equals(input)) {\n    System.out.println("Access granted.");\n}`,
      examTips: 'Remember: Primitive types (int, boolean, double) live directly on the stack; Object instances live in heap memory.'
    },
    flashcards: {
      cards: [
        { q: 'What is the difference between a Class and an Object in Java?', a: 'A Class is the architect blueprint; an Object is the actual house constructed from that blueprint.' },
        { q: 'What is the role of the JVM?', a: 'The Java Virtual Machine translates platform-independent .class bytecode into native machine instructions for the host OS.' }
      ]
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Write the Class Blueprint', explanation: 'Define fields and methods inside a public class.', codeSnippet: 'public class Student { String name; }' },
        { step: 'Step 2: Instantiate with new', explanation: 'Create an actual object instance in memory.', codeSnippet: 'Student s = new Student(); s.name = "Alex";' }
      ],
      verification: 'Compile with javac and execute with java to confirm error-free execution.'
    }
  },

  // 11. C / C++ SYSTEMS PROGRAMMING
  {
    id: 'cpp',
    name: 'C / C++ Fundamentals: Pointers & Direct Memory',
    keywords: ['c', 'c++', 'cpp', 'pointer', 'pointers', 'malloc', 'memory', 'stack', 'heap', 'address', 'dereference', 'systems'],
    summary: {
      overview: 'C and C++ are high-performance systems languages offering direct control over hardware and memory. Pointers store raw memory addresses, enabling ultra-fast execution with zero abstraction overhead.',
      principles: [
        'Variables vs Pointers: A variable is a physical house; a pointer is a slip of paper with the house GPS address written on it.',
        'Address Operator (&): Extracts the numerical RAM location of a variable.',
        'Dereference Operator (*): Follows the address to open the locker and modify its contents directly.',
        'Memory Discipline: Any memory allocated with `malloc` or `new` must be manually freed to avoid leaking resources.'
      ],
      code: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int battery = 80;\n    int* ptr = &battery; // Storing the memory address\n\n    printf("Battery via variable: %d%%\\n", battery);\n    // Direct memory update via pointer\n    *ptr = 100;\n    printf("Battery after pointer recharge: %d%%\\n", battery);\n    return 0;\n}`,
      interviewNotes: 'Explain the difference between Stack and Heap memory allocations. What is a dangling pointer and how does modern C++ RAII / smart pointers (unique_ptr) prevent leaks?'
    },
    cheatsheet: {
      syntaxHighlights: '• `&variable`: Address-of operator.\n• `type* ptr`: Declares a pointer variable.\n• `*ptr`: Dereferences the pointer.\n• `malloc(size) / free(ptr)`: Dynamic heap management in C.\n• `new / delete`: Dynamic object management in C++.',
      gotchas: [
        'Never dereference a NULL or uninitialized pointer—it immediately causes a Segmentation Fault crash.',
        'Always set freed pointers to NULL (`ptr = NULL`) to avoid dangling pointers.',
        'Array indexing does not bounds-check in C/C++; reading out of bounds corrupts memory silently.'
      ],
      code: `// Safe dynamic allocation in C\nint* buffer = (int*)malloc(10 * sizeof(int));\nif (buffer != NULL) {\n    buffer[0] = 42;\n    free(buffer); // Clean up immediately\n    buffer = NULL;\n}`,
      examTips: 'Know that array names decay into pointers to their first element: `arr == &arr[0]`.'
    },
    flashcards: {
      cards: [
        { q: 'What is a pointer in simple everyday words?', a: 'A slip of paper with a GPS house address written on it; it points to where the data lives in RAM.' },
        { q: 'What causes a memory leak?', a: 'Allocating heap memory (malloc/new) without freeing it, gradually consuming all available RAM until the system runs out.' }
      ]
    },
    tutorial: {
      stepByStep: [
        { step: 'Step 1: Declare variable and pointer', explanation: 'Link the pointer to the variable address with &.', codeSnippet: 'int x = 10; int* p = &x;' },
        { step: 'Step 2: Modify value via pointer', explanation: 'Use *p = 20 to update x indirectly.', codeSnippet: '*p = 20;' }
      ],
      verification: 'Print x to verify that its value changed from 10 to 20 without directly referencing x.'
    }
  }
];

/**
 * Searches the verified offline curriculum for a matching topic.
 */
export function findCurriculumTopic(query: string): CurriculumTopicDefinition | null {
  if (!query || !query.trim()) return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct ID or Name match
  const exact = VERIFIED_CURRICULUM_TOPICS.find(
    t => t.id === clean || t.name.toLowerCase() === clean
  );
  if (exact) return exact;

  // 2. Substring match on name
  const substring = VERIFIED_CURRICULUM_TOPICS.find(
    t => t.name.toLowerCase().includes(clean) || clean.includes(t.name.toLowerCase())
  );
  if (substring) return substring;

  // 3. Keyword matching (strict full-token matching for single words, phrase matching for multi-words)
  const tokens = clean.split(/[\s&,/+_-]+/).filter(w => w.length >= 2);
  const keywordMatch = VERIFIED_CURRICULUM_TOPICS.find(t =>
    t.keywords.some(kw => {
      if (kw.includes(' ')) {
        return clean.includes(kw);
      }
      return tokens.includes(kw);
    })
  );
  return keywordMatch || null;
}

/**
 * Generates structured, rich educational notes for a given topic, format, and language.
 * Pure deterministic offline generator.
 */
export function generateOfflineTopicNotes(params: {
  topic: string;
  style: string;
  language: string;
  detailLevel: string;
}): GeneratedNote {
  const { topic, style, language, detailLevel } = params;
  const matchedCurriculum = findCurriculumTopic(topic);

  const styleLabels: Record<string, string> = {
    summary: 'Executive Summary',
    cheatsheet: 'Exam Cheatsheet & Syntax',
    flashcards: 'Flashcards',
    tutorial: 'Hands-on Tutorial'
  };

  const styleLabel = styleLabels[style] || 'Technical Study Guide';
  const now = new Date();
  const timestamp = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;

  // -------------------------------------------------------------
  // CASE A: Topic is matched in the Verified Curriculum
  // -------------------------------------------------------------
  if (matchedCurriculum) {
    let sections: NoteSection[] = [];

    if (style === 'summary') {
      sections = [
        {
          heading: `1. Executive Overview (${language} · ${detailLevel})`,
          content: `${matchedCurriculum.summary.overview}\n\n*Source: Verified Offline Engineering Curriculum (${matchedCurriculum.name})*`
        },
        {
          heading: '2. Core Architecture Principles',
          content: matchedCurriculum.summary.principles.map(p => `• ${p}`).join('\n')
        },
        {
          heading: '3. Production Code Pattern',
          code: matchedCurriculum.summary.code
        },
        {
          heading: '4. Interview & Production Takeaways',
          content: matchedCurriculum.summary.interviewNotes
        }
      ];
    } else if (style === 'cheatsheet') {
      sections = [
        {
          heading: `1. Syntax Quick-Reference (${language})`,
          content: `${matchedCurriculum.cheatsheet.syntaxHighlights}\n\n*Format: High-Yield Exam Cheatsheet*`
        },
        {
          heading: '2. Critical Gotchas & Common Pitfalls',
          content: matchedCurriculum.cheatsheet.gotchas.map(g => `⚠️ ${g}`).join('\n')
        },
        {
          heading: '3. Reference Code Implementation',
          code: matchedCurriculum.cheatsheet.code
        },
        {
          heading: '4. Key Takeaways & Exam Checklist',
          content: matchedCurriculum.cheatsheet.examTips
        }
      ];
    } else if (style === 'flashcards') {
      sections = [
        {
          heading: '1. Flashcard Set: Core Concept Recall',
          content: matchedCurriculum.flashcards.cards.map((c, i) => `Q${i + 1}: ${c.q}\nA: ${c.a}\n`).join('\n')
        },
        ...(matchedCurriculum.flashcards.code ? [{
          heading: '2. Code Recall Example',
          code: matchedCurriculum.flashcards.code
        }] : []),
        {
          heading: '3. Spaced Repetition Advice',
          content: 'Test yourself on these flashcards after 24 hours, 3 days, and 1 week to lock concepts into long-term memory.'
        }
      ];
    } else { // tutorial
      sections = [
        {
          heading: `1. Tutorial Overview: Mastering ${matchedCurriculum.name}`,
          content: `In this practical guide, we will step through the core implementation of **${matchedCurriculum.name}** with verified best practices.`
        },
        ...matchedCurriculum.tutorial.stepByStep.map((s, idx) => ({
          heading: `${idx + 2}. ${s.step}`,
          content: s.explanation,
          code: s.codeSnippet
        })),
        {
          heading: `${matchedCurriculum.tutorial.stepByStep.length + 2}. Verification & Quality Checks`,
          content: matchedCurriculum.tutorial.verification
        }
      ];
    }

    return {
      id: `note-${Date.now()}`,
      topic,
      title: topic,
      styleLabel,
      language,
      detailLevel,
      createdAt: timestamp,
      sourceType: 'offline',
      sourceLabel: `📖 Offline Curriculum (${matchedCurriculum.name})`,
      sections
    };
  }

  // -------------------------------------------------------------
  // CASE B: Unsupported or Freeform Topic (Transparent Fallback)
  // -------------------------------------------------------------
  return {
    id: `note-${Date.now()}`,
    topic,
    title: `${topic} (Basic Offline Overview)`,
    styleLabel: 'Basic Offline Note',
    language,
    detailLevel,
    createdAt: timestamp,
    sourceType: 'offline',
    sourceLabel: '⚠️ Offline Curriculum Mode (Basic Overview)',
    sections: [
      {
        heading: `1. Offline Topic Outline (${language})`,
        content: `You requested a study guide for **${topic}**.\n\n⚠️ **Notice: Operating in Verified Offline Mode**\nThis topic is not part of the standard offline engineering curriculum (React, JavaScript, CSS, SQL, Algorithms, and System Design). Below is a structured conceptual study framework created by the local offline engine.`
      },
      {
        heading: '2. Recommended Learning Objectives for this Topic',
        content: `• Fundamentals: Identify the core problem that **${topic}** solves.\n• Trade-offs: What are the advantages and constraints of choosing this approach?\n• Best Practices: Review industry-standard conventions and testing requirements.\n• Integration: How does **${topic}** communicate with surrounding systems or components?`
      },
      {
        heading: '3. Synthesized Starter Template',
        code: `// Starter Exploration Shell for: ${topic.replace(/"/g, '')}\nexport interface TopicOutline {\n  readonly topicName: string;\n  readonly status: 'researching' | 'verified';\n}\n\nexport const currentSubject: TopicOutline = {\n  topicName: "${topic.replace(/"/g, '')}",\n  status: 'researching'\n};`
      },
      {
        heading: '4. Suggested Next Step',
        content: `For comprehensive deep-dives with verified code and interview questions, explore our core topics: **React 19 State & Hooks**, **JavaScript Event Loop**, **CSS Flexbox vs Grid**, **SQL Database Indexing**, or **Data Structures & Algorithms**.`
      }
    ]
  };
}
