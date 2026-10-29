import type { EducationalVisualModel, TutorVisualSpec, VisualizationType } from '../types';
import { detectVisualModel, buildTutorVisualSpec } from './visualModelDetector';

export interface TutorAnswer {
  text: string;
  explanation: string;
  markdown?: string;
  bulletPoints: string[];
  codeSnippet?: string;
  suggestedFollowUp?: string;
  source: 'gemini' | 'ollama' | 'offline-curriculum' | 'offline-unsupported';
  sourceLabel: string;
  visual?: TutorVisualSpec;
  visualType?: VisualizationType;
  visualTitle?: string;
  visualDescription?: string;
  visualModel?: EducationalVisualModel;
}

interface TopicKnowledgeItem {
  id: string;
  topic: string;
  triggers: string[];
  generateAnswer: (query: string) => Omit<TutorAnswer, 'source' | 'sourceLabel' | 'visual' | 'visualType' | 'visualTitle' | 'visualDescription' | 'visualModel' | 'explanation'>;
}

export const VERIFIED_TUTOR_KNOWLEDGE: TopicKnowledgeItem[] = [
  // 0A. Python Fundamentals & Everyday Analogies
  {
    id: 'python-core',
    topic: 'Python Fundamentals: Variables, Loops & Functions',
    triggers: ['python', 'py', 'mixer grinder', 'pushup', 'pushups', 'python variable', 'python loop', 'python function', 'python list', 'python dictionary'],
    generateAnswer: () => ({
      text: 'Python is a clear, beginner-friendly language that reads like plain English. In simple Hinglish: Python me code likhte waqt brackets aur semicolons ka jhamela nahi hota!',
      bulletPoints: [
        '**Variables (Kitchen Spice Box)**: Variables are like labeled dabbas in your kitchen where you store ingredients (numbers, text strings). You can change what is inside whenever you want.',
        '**Loops (10 Pushups Analogy)**: A loop repeats an action step by step automatically. Jaise 10 pushups ek-ek karke lagana — har pushup ke baad count + 1 hota hai jab tak 10 poore na ho jayein.',
        '**Functions (Mixer Grinder)**: A function takes ingredients/inputs (arguments), blends them inside (processes logic), and returns a finished output (delicious milkshake).',
        '**Lists vs Dictionaries**: A List is an ordered shopping list `[item0, item1]`; a Dictionary is a labeled spice rack `{"spice": "turmeric", "quantity": 100}`.'
      ],
      codeSnippet: `# Python Beginner Code: Mixer Grinder Function\ndef make_shake(fruit: str, milk_glasses: int) -> str:\n    # Safety check\n    if milk_glasses < 1:\n        return "Need at least 1 glass of milk!"\n    return f"Fresh {fruit} shake ready for {milk_glasses} people! 🥤"\n\n# Doing 3 orders using a loop (like counting pushups)\norders = ["Mango", "Banana", "Chikoo"]\nfor fruit_name in orders:\n    drink = make_shake(fruit_name, 2)\n    print(f"Prepared: {drink}")`,
      suggestedFollowUp: 'Would you like to practice a quick Python quiz question or see how Python if-else conditions work?'
    })
  },

  // 0B. Java & Object-Oriented Blueprint Model
  {
    id: 'java-core',
    topic: 'Java & Object-Oriented Programming (Blueprint Model)',
    triggers: ['java', 'jvm', 'java class', 'java object', 'blueprint', 'encapsulation', 'bytecode', 'garbage collector'],
    generateAnswer: () => ({
      text: 'Java is an enterprise-grade, strongly typed language. Its foundation is Object-Oriented Programming (OOP) and the "Write Once, Run Anywhere" Java Virtual Machine (JVM).',
      bulletPoints: [
        '**Class vs Object (House Blueprint)**: A Class is the architect\'s paper drawing. An Object is the actual brick-and-mortar house constructed from that drawing. You can build 50 houses from 1 blueprint!',
        '**JVM (Universal Power Adapter)**: Java compiles source code into .class bytecode. The JVM acts like a universal travel adapter, running that exact bytecode on Windows, Mac, or Linux without changes.',
        '**Encapsulation (ATM Machine)**: Keeps sensitive balance variables private and provides controlled public methods (deposit/withdraw), preventing external code from corrupting internal data.',
        '**Garbage Collection**: Automatically sweeps unused heap objects so developers don\'t have to manually free memory.'
      ],
      codeSnippet: `// Java Class Blueprint & Real Object\npublic class Student {\n    private String name;\n    private int score;\n\n    public Student(String name, int score) {\n        this.name = name;\n        this.score = score;\n    }\n\n    public void displayResult() {\n        System.out.println(name + " scored " + score + "/100! 🎯");\n    }\n}\n\n// Instantiating real object:\n// Student s1 = new Student("Alex", 95);\n// s1.displayResult();`,
      suggestedFollowUp: 'Would you like to explore Java inheritance or practice an OOP flashcard?'
    })
  },

  // 0C. C / C++ Systems & Pointers (GPS Address Model)
  {
    id: 'cpp-core',
    topic: 'C / C++ Systems Programming & Pointers',
    triggers: ['c++', 'cpp', 'pointer', 'pointers', 'malloc', 'dereference', 'memory leak', 'stack vs heap'],
    generateAnswer: () => ({
      text: 'C and C++ are high-speed systems languages that give you direct control over computer hardware and RAM memory.',
      bulletPoints: [
        '**Pointers (GPS Address Analogy)**: A normal variable is like a physical house. A pointer is like a piece of paper with the house GPS address written on it. It stores the exact RAM memory address.',
        '**Address-of `&`**: Gets the address slip where the variable lives (e.g., `&battery`).',
        '**Dereferencing `*`**: Follows that GPS address to actually open the door and inspect or change what is inside.',
        '**Memory Leak (Hotel Checkout)**: If you book memory with `malloc` / `new` and never check out with `free` / `delete`, the hotel eventually runs out of rooms and the program crashes.'
      ],
      codeSnippet: `#include <stdio.h>\n\nint main() {\n    int battery = 85;\n    int* pBattery = &battery; // Storing memory address\n\n    printf("Original: %d%%\\n", battery);\n    // Direct memory update via pointer\n    *pBattery = 100;\n    printf("Recharged via pointer: %d%%\\n", battery); // 100!\n    return 0;\n}`,
      suggestedFollowUp: 'Would you like to practice a quiz question on C++ Stack vs Heap memory?'
    })
  },

  // 1. React useEffect & Lifecycle
  {
    id: 'react-useeffect',
    topic: 'React useEffect & Lifecycle Synchronization',
    triggers: ['useeffect', 'dependency array', 'deps array', 'effect hook', 'clean up function', 'cleanup function'],
    generateAnswer: () => ({
      text: 'The `useEffect` hook in React synchronizes a component with an external system (such as APIs, DOM listeners, or timers). It executes after the browser paints the DOM.',
      bulletPoints: [
        '**Empty Array `[]`**: Runs once when the component mounts and cleans up when it unmounts.',
        '**Dependencies `[prop, state]`**: Re-runs only when one of the specified dependencies changes by shallow reference equality (`Object.is`).',
        '**Omitted Array**: Re-runs after EVERY single render pass. This is rarely desired and often creates infinite rendering loops if state is updated inside.',
        '**Cleanup Function**: Always return a cleanup callback `() => { ... }` to remove event listeners, abort pending fetches, or clear intervals and prevent memory leaks.'
      ],
      codeSnippet: `import { useState, useEffect } from 'react';\n\nexport function UserProfile({ userId }: { userId: string }) {\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n\n    async function loadUser() {\n      try {\n        const res = await fetch(\`/api/users/\${userId}\`, { signal: controller.signal });\n        const data = await res.json();\n        setUser(data);\n      } catch (err: any) {\n        if (err.name !== 'AbortError') console.error('Fetch failed', err);\n      }\n    }\n\n    loadUser();\n    // Cleanup: cancel pending request if userId changes or component unmounts\n    return () => controller.abort();\n  }, [userId]);\n}`,
      suggestedFollowUp: 'Would you like to explore why calculating derived state inside useEffect is an anti-pattern?'
    })
  },

  // 2. React State & Reconciliation
  {
    id: 'react-state',
    topic: 'React 19 State, Virtual DOM & Fiber Reconciliation',
    triggers: ['react', 'usestate', 'virtual dom', 'fiber', 'reconciliation', 'render', 're-render', 'compiler', 'props'],
    generateAnswer: () => ({
      text: 'In React, state changes trigger the Fiber reconciler to compute the minimal diff between the new Virtual DOM representation and the actual browser DOM.',
      bulletPoints: [
        '**Unidirectional Data Flow**: Props pass downward from parents to children; mutations are dispatched upward via callbacks.',
        '**Functional Updates**: Always use `setCount(prev => prev + 1)` when the next state depends on the previous state to avoid race conditions with batched updates.',
        '**Key Stability**: The `key` prop gives elements a persistent identity across renders so React avoids re-mounting elements unnecessarily.',
        '**Immutability**: Never mutate state objects directly (`state.value = x`). Always construct a new object reference (`{ ...state, value: x }`).'
      ],
      codeSnippet: `// Proper Immutable State Updates\nconst [profile, setProfile] = useState({ name: 'Alex', skills: ['React'] });\n\nconst addSkill = (newSkill: string) => {\n  setProfile(prev => ({\n    ...prev,\n    skills: [...prev.skills, newSkill]\n  }));\n};`,
      suggestedFollowUp: 'Would you like to practice a quiz question on React component re-rendering triggers?'
    })
  },

  // 3. JavaScript Event Loop & Promises
  {
    id: 'js-event-loop',
    topic: 'JavaScript Event Loop, Microtasks & Promises',
    triggers: ['event loop', 'microtask', 'macrotask', 'promise', 'async', 'await', 'task queue', 'call stack', 'promises'],
    generateAnswer: () => ({
      text: 'JavaScript commonly runs application code on one main thread (executing synchronous call stack frames), while asynchronous operations are handled concurrently by host browser Web APIs or Node.js runtime environments (like libuv worker threads).',
      bulletPoints: [
        '**Single Main Thread**: JavaScript executes synchronous code sequentially on a single main thread via the Call Stack.',
        '**Host Concurrency**: Asynchronous operations (such as `fetch()`, timers, and I/O) do not block the main thread; they are handled by browser Web APIs or runtime worker threads.',
        '**Microtask Queue**: Promises (`.then`, `.catch`, `await`), `queueMicrotask`, and `MutationObserver`. The event loop drains ALL pending microtasks immediately after the current call stack clears, before running any macrotask.',
        '**Task Queue (Macrotasks)**: `setTimeout`, `setInterval`, I/O callbacks, and DOM events. Exactly one macrotask is processed per event loop tick before microtasks are re-checked.',
        '**Execution Lifecycle**: Synchronous Call Stack -> Drain Microtask Queue completely -> UI Render Phase (if in browser) -> Next Macrotask.'
      ],
      codeSnippet: `console.log('1: Synchronous Stack (Main Thread)');\n\n// Handled by browser Web API timer, queued to Macrotask Queue\nsetTimeout(() => console.log('4: Macrotask (setTimeout)'), 0);\n\n// Handled via Microtask Queue\nPromise.resolve().then(() => {\n  console.log('3: Microtask (Promise)');\n});\n\nconsole.log('2: Synchronous Stack End');\n\n// Actual Console Output:\n// 1: Synchronous Stack (Main Thread)\n// 2: Synchronous Stack End\n// 3: Microtask (Promise)\n// 4: Macrotask (setTimeout)`,
      suggestedFollowUp: 'Would you like to examine how Promise.allSettled handles partial network failures?'
    })
  },

  // 4. JavaScript Closures & Prototypal Inheritance
  {
    id: 'js-closures-prototypes',
    topic: 'JavaScript Closures, Lexical Scope & Prototypal Inheritance',
    triggers: ['closure', 'lexical scope', 'prototype', 'prototypal', 'hoisting', 'this keyword', 'bind', 'call', 'apply'],
    generateAnswer: () => ({
      text: 'A closure is a function that retains access to its outer lexical environment even after that outer function has finished executing.',
      bulletPoints: [
        '**Encapsulation**: Closures enable private variables without relying on global state or classes.',
        '**Prototype Chain**: Every JS object has an internal `[[Prototype]]` link. Property lookups traverse upward until found or reaching `null`.',
        '**`this` Binding**: In regular functions, `this` is determined at runtime by how the function is invoked. Arrow functions bind `this` lexically at definition time.',
        '**Memory Care**: Lingering closures that hold large references in memory can cause memory leaks if not dereferenced when done.'
      ],
      codeSnippet: `function makeRateLimiter(maxCalls: number, windowMs: number) {\n  let calls = 0;\n  let resetTime = Date.now() + windowMs;\n\n  // Inner closure retains access to calls and resetTime\n  return function isAllowed(): boolean {\n    const now = Date.now();\n    if (now > resetTime) {\n      calls = 0;\n      resetTime = now + windowMs;\n    }\n    if (calls < maxCalls) {\n      calls++;\n      return true;\n    }\n    return false;\n  };\n}`,
      suggestedFollowUp: 'Would you like to test your understanding with a diagnostic quiz question on closures?'
    })
  },

  // 5. CSS Flexbox vs Grid
  {
    id: 'css-layout',
    topic: 'CSS Flexbox vs CSS Grid Layout Models',
    triggers: ['flexbox', 'grid', 'css grid', 'layout', 'box model', 'specificity', 'z-index', 'stacking context'],
    generateAnswer: () => ({
      text: 'CSS Flexbox and CSS Grid are complementary layout systems designed for different dimensional requirements in web interfaces.',
      bulletPoints: [
        '**Flexbox (1-Dimensional)**: Aligns items along a single axis (either row OR column). Best for navigation menus, button bars, and centering.',
        '**CSS Grid (2-Dimensional)**: Controls placement simultaneously across rows and columns. Ideal for complete page architectures and multi-column card grids.',
        '**Auto-Fit Grid**: `repeat(auto-fit, minmax(280px, 1fr))` creates fully responsive card grids without requiring media query breakpoints.',
        '**Box-Sizing**: Always apply `box-sizing: border-box` so padding and borders do not expand specified element widths.'
      ],
      codeSnippet: `/* Modern Responsive CSS Grid Dashboard */\n.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}\n\n/* 1D Flexbox Alignment Inside Each Card */\n.card-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}`,
      suggestedFollowUp: 'Would you like to explore how CSS Stacking Contexts affect z-index behavior?'
    })
  },

  // 6. SQL Joins, Indexing & ACID
  {
    id: 'sql-db',
    topic: 'SQL Relational Queries, B-Tree Indexes & ACID Properties',
    triggers: ['sql', 'join', 'inner join', 'left join', 'b-tree', 'indexing', 'acid', 'transaction', 'where', 'having', 'normalization'],
    generateAnswer: () => ({
      text: 'Relational databases use structured schemas and foreign keys to link data. Query optimization relies on B-Tree indexes to replace full-table scans with logarithmic lookups.',
      bulletPoints: [
        '**INNER JOIN vs LEFT JOIN**: INNER JOIN returns only rows with matches in both tables; LEFT JOIN preserves all rows from the left table and populates missing right columns with `NULL`.',
        '**WHERE vs HAVING**: `WHERE` filters rows before grouping and aggregation; `HAVING` filters grouped rows after `GROUP BY`.',
        '**B-Tree Indexes**: Keep keys sorted for O(log N) searches and range queries. Avoid leading wildcards like `LIKE "%term"`, which bypass indexes.',
        '**ACID Transactions**: Atomicity, Consistency, Isolation, and Durability ensure reliable concurrent data operations.'
      ],
      codeSnippet: `/* Find Students with Zero Completed Quizzes */\nSELECT \n  students.id,\n  students.name,\n  COUNT(quiz_attempts.id) AS total_quizzes\nFROM students\nLEFT JOIN quiz_attempts ON students.id = quiz_attempts.student_id\nGROUP BY students.id, students.name\nHAVING COUNT(quiz_attempts.id) = 0;\n\n/* Create Index on Frequently Filtered Column */\nCREATE INDEX idx_quiz_completed_at ON quiz_attempts(completed_at);`,
      suggestedFollowUp: 'Would you like to examine how composite index column order influences query performance?'
    })
  },

  // 7. Data Structures & Algorithms (Binary Search, Big-O, Sorting)
  {
    id: 'dsa',
    topic: 'Data Structures & Algorithms (Binary Search, Big-O & Sorting)',
    triggers: ['binary search', 'big-o', 'big o', 'complexity', 'quicksort', 'mergesort', 'hash table', 'stack', 'queue', 'tree', 'dsa'],
    generateAnswer: () => ({
      text: 'Algorithmic efficiency is measured via asymptotic Big-O notation, representing how CPU execution time or memory space scales as input size N grows.',
      bulletPoints: [
        '**Binary Search (O(log N))**: Requires a sorted array. At each iteration, it halves the search boundary by testing the midpoint.',
        '**Hash Tables (O(1) Average)**: Provide constant time lookup via key hashing. Poor hash functions lead to collisions and O(N) degradation.',
        '**QuickSort**: Average O(N log N) time; worst case O(N^2) if the chosen pivot is consistently the minimum or maximum element on a sorted array.',
        '**Space Complexity**: Iterative algorithms usually maintain O(1) auxiliary space, whereas recursive approaches consume O(log N) to O(N) call stack memory.'
      ],
      codeSnippet: `export function binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left <= right) {\n    const mid = Math.floor(left + (right - left) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1; // Not found\n}`,
      suggestedFollowUp: 'Would you like to practice a quiz question on QuickSort pivot selection strategies?'
    })
  },

  // 8. Distributed Microservices & DevOps
  {
    id: 'system-design',
    topic: 'System Design, Microservices, Docker & Kubernetes',
    triggers: ['microservice', 'microservices', 'docker', 'container', 'kubernetes', 'rest', 'graphql', 'system design', 'service mesh', 'web workers'],
    generateAnswer: (query: string) => {
      const lower = query.toLowerCase();
      if (lower.includes('worker')) {
        return {
          text: 'Web Workers allow web applications to run background computation tasks in separate worker threads without blocking the main UI rendering thread.',
          bulletPoints: [
            '**Separate Thread Execution**: Web Workers run in an isolated global context (`DedicatedWorkerGlobalScope`) with no direct access to the DOM or window object.',
            '**Message Passing**: Communication between the main thread and workers occurs asynchronously using `postMessage()` and the `onmessage` event listener.',
            '**Structured Clone Algorithm**: Data passed via `postMessage()` is serialized and cloned deep, preventing shared-memory concurrency corruption.',
            '**Use Cases**: Cryptographic hashing, audio/video processing, large CSV parsing, and complex 3D math simulations.'
          ],
          codeSnippet: `// main.ts\nconst worker = new Worker(new URL('./computeWorker.ts', import.meta.url));\nworker.postMessage({ command: 'calculate', payload: [1, 2, 3] });\nworker.onmessage = (e) => console.log('Result from worker:', e.data);\n\n// computeWorker.ts\nself.onmessage = (e) => {\n  const result = e.data.payload.reduce((acc: number, n: number) => acc + n, 0);\n  self.postMessage(result);\n};`,
          suggestedFollowUp: 'Would you like to explore how Web Workers differ from Service Workers in offline PWAs?'
        };
      }

      return {
        text: 'Distributed architectures decouple monolithic systems into independent, independently deployable services communicating over networks via REST, gRPC, or message queues.',
        bulletPoints: [
          '**Database-per-Service**: Each microservice maintains its own private data store to enforce loose coupling and prevent schema locks.',
          '**Containers (Docker)**: Package code with OS libraries into standardized images, eliminating "works on my machine" discrepancies.',
          '**Orchestration (Kubernetes)**: Automates container provisioning, health check probing, zero-downtime rolling updates, and horizontal scaling.',
          '**Resilience**: Circuit breakers, retry backoff, and distributed tracing are critical to detect and isolate cascading failures.'
        ],
        codeSnippet: `// Circuit Breaker Pattern Concept\nif (circuitBreaker.isOpen()) {\n  // Fail fast: serve cached response or fallback without calling failing downstream service\n  return getCachedFallbackData();\n}`,
        suggestedFollowUp: 'Would you like to explore the trade-offs between REST and GraphQL in distributed systems?'
      };
    }
  },

  // 9. Technical Interview & Study Tips
  {
    id: 'interview-tips',
    topic: 'Technical Interview Strategy & Study Best Practices',
    triggers: ['interview', 'junior', 'tips', 'career', 'study tips', 'revision advice', 'resume'],
    generateAnswer: () => ({
      text: 'Preparing for software engineering technical interviews requires a balanced focus on computer science fundamentals, clear communication, and systematic problem solving.',
      bulletPoints: [
        '**Clarify Requirements First**: Never start coding immediately. Ask about edge cases (null inputs, empty arrays, scale constraints).',
        '**Think Out Loud**: Interviewers evaluate your thought process. Explain brute-force solutions first, then discuss how to optimize time and space complexity.',
        '**Active Recall & Spaced Repetition**: Practice writing algorithms on paper or a plain editor without auto-complete to build genuine syntactic fluency.',
        '**System Design Fundamentals**: Be prepared to explain load balancers, caching layers, database indexing, and RESTful API conventions.'
      ],
      codeSnippet: `// Problem Solving Framework:\n// 1. Re-state problem & constraints\n// 2. Identify test cases (empty, normal, large)\n// 3. Propose O(N) or O(log N) approach\n// 4. Implement clean, typed code\n// 5. Dry-run code with sample input before declaring finished`,
      suggestedFollowUp: 'Would you like to take a 5-question custom practice quiz to test your current skills?'
    })
  },

  // 10. CPU Architecture & Von Neumann Cycle
  {
    id: 'cpu-architecture',
    topic: 'Von Neumann CPU Architecture & Instruction Execution',
    triggers: ['cpu', 'processor', 'fetch decode execute', 'alu', 'control unit', 'von neumann', 'registers', 'data bus', 'address bus'],
    generateAnswer: () => ({
      text: 'The Von Neumann CPU architecture coordinates the Control Unit, Arithmetic Logic Unit (ALU), Registers, and Memory over system buses to execute instructions.',
      bulletPoints: [
        '**Fetch**: Program Counter (PC) loads the address into the Address Bus; memory delivers the opcode via the Data Bus into the Instruction Register (IR).',
        '**Decode**: The Control Unit decodes the instruction bits and generates electrical control lines for execution.',
        '**Execute**: The ALU computes mathematical operations or evaluates boolean conditionals.',
        '**Writeback & Increment**: The result is saved to destination registers or RAM, and the PC points to the next memory address.'
      ],
      codeSnippet: `// Concept: Von Neumann Instruction Cycle Loop\nwhile (cpu.isRunning()) {\n  const instruction = memory.read(cpu.pc);\n  cpu.pc += 4; // increment\n  const decoded = cpu.controlUnit.decode(instruction);\n  const result = cpu.alu.execute(decoded);\n  cpu.registers.write(decoded.dest, result);\n}`,
      suggestedFollowUp: 'Explore how pipelining and branch prediction accelerate modern superscalar processors.'
    })
  },

  // 11. Photosynthesis & Cellular Energy
  {
    id: 'photosynthesis',
    topic: 'Photosynthesis: Light Reactions & The Calvin Cycle',
    triggers: ['photosynthesis', 'chloroplast', 'chlorophyll', 'calvin cycle', 'thylakoid', 'light reaction', 'rubisco', 'stroma'],
    generateAnswer: () => ({
      text: 'Photosynthesis is the biochemical mechanism by which green plants and algae convert sunlight photons, water, and CO₂ into chemical energy stored as glucose and oxygen.',
      bulletPoints: [
        '**Light Reactions (Thylakoids)**: Solar photons excite chlorophyll in Photosystem II, photolysing H₂O into protons and releasing O₂ gas, while generating ATP and NADPH.',
        '**Calvin Cycle (Stroma)**: Atmospheric carbon dioxide is fixed by the enzyme RuBisCO, utilizing ATP and NADPH to synthesize high-energy G3P and glucose (C₆H₁₂O₆).',
        '**Chemical Equation**: 6 CO₂ + 6 H₂O + Photons ➔ C₆H₁₂O₆ + 6 O₂.'
      ],
      suggestedFollowUp: 'Would you like to examine how C4 and CAM plants prevent photorespiration in arid conditions?'
    })
  },

  // 12. Water Cycle & Hydrology
  {
    id: 'water-cycle',
    topic: 'Earth’s Hydrological Water Cycle',
    triggers: ['water cycle', 'hydrological cycle', 'evaporation', 'condensation', 'precipitation', 'transpiration', 'runoff'],
    generateAnswer: () => ({
      text: 'The hydrological cycle describes the continuous global movement of water between the lithosphere, hydrosphere, and atmosphere driven by solar energy and gravity.',
      bulletPoints: [
        '**Evaporation & Transpiration**: Solar radiation heats oceans, rivers, and plant leaves, turning liquid water into ascending water vapor.',
        '**Condensation**: Rising vapor cools and condenses around microscopic aerosols to build clouds and fog.',
        '**Precipitation**: When cloud droplets become heavy enough, gravity pulls them down as rain, snow, or hail.',
        '**Runoff & Infiltration**: Surface runoff flows into rivers, lakes, and oceans, while groundwater replenishes aquifers.'
      ],
      suggestedFollowUp: 'Would you like to explore how urban impervious surfaces alter stormwater runoff dynamics?'
    })
  },

  // 13. Human Heart & Cardiovascular Circulation
  {
    id: 'human-heart',
    topic: 'Human Heart Anatomy & Dual Cardiovascular Circulation',
    triggers: ['heart', 'cardiovascular', 'cardiac', 'atrium', 'ventricle', 'aorta', 'pulmonary artery', 'blood flow', 'blood circulation'],
    generateAnswer: () => ({
      text: 'The human heart is a four-chambered muscular organ operating as a synchronized dual-pump system that powers pulmonary and systemic circulation.',
      bulletPoints: [
        '**Right Atrium & Ventricle**: Receives oxygen-depleted venous blood from the body via the Vena Cava and pumps it to the lungs via the Pulmonary Artery.',
        '**Pulmonary Gas Exchange**: In the lungs, blood discharges CO₂ and absorbs fresh O₂.',
        '**Left Atrium & Ventricle**: Receives oxygen-rich blood via Pulmonary Veins; the powerful Left Ventricle contracts to eject blood into the Aorta to nourish the entire body.',
        '**Unidirectional Valves**: Tricuspid, Pulmonary, Mitral, and Aortic valves maintain strictly one-way forward blood flow.'
      ],
      suggestedFollowUp: 'Would you like to explore how the sinoatrial (SA) node sets the intrinsic cardiac pacemaker rhythm?'
    })
  },

  // 14. Solar System & Planetary Orbits
  {
    id: 'solar-system',
    topic: 'Heliocentric Solar System & Planetary Mechanics',
    triggers: ['solar system', 'planets', 'heliocentric', 'planetary orbit', 'mercury venus earth', 'jupiter saturn'],
    generateAnswer: () => ({
      text: 'Our solar system consists of the central Sun and eight gravitationally bound planets governed by Keplerian orbital mechanics.',
      bulletPoints: [
        '**Central Mass**: The Sun contains 99.86% of the solar system’s mass, exerting gravitational curvature that dictates planetary trajectories.',
        '**Terrestrial Planets**: Mercury, Venus, Earth, and Mars—dense rocky worlds with solid silicate surfaces.',
        '**Gas & Ice Giants**: Jupiter and Saturn (hydrogen/helium giants) and Uranus and Neptune (methane ice giants).',
        '**Kepler’s Third Law**: Planets farther from the Sun orbit with longer orbital periods (Mercury = 88 days; Neptune = 165 years).'
      ],
      suggestedFollowUp: 'Explore how gravitational slingshots (gravity assists) accelerate interplanetary spacecraft.'
    })
  },

  // 15. Deep Neural Networks
  {
    id: 'neural-networks',
    topic: 'Deep Neural Networks & Forward Propagation',
    triggers: ['neural network', 'deep learning', 'perceptron', 'forward propagation', 'activation function', 'relu', 'hidden layers'],
    generateAnswer: () => ({
      text: 'A deep neural network consists of interconnected node layers that learn non-linear representations from raw features via weighted matrix multiplications and non-linear activations.',
      bulletPoints: [
        '**Input Layer**: Accepts normalized feature vectors without transformation.',
        '**Synaptic Weights & Biases**: Parameters adjusted during training via backpropagation and gradient descent ($z = Wx + b$).',
        '**Activation Functions**: Introduce non-linearity (ReLU $\\max(0, z)$, Sigmoid, GELU) allowing networks to approximate complex mathematical functions.',
        '**Softmax Output**: Normalizes logits into a categorical probability distribution summing to 1.0.'
      ],
      codeSnippet: `// Forward Pass in JavaScript / TypeScript\nfunction forward(inputs: number[], weights: number[][], biases: number[]): number[] {\n  return weights.map((neuronWeights, i) => {\n    const dotProduct = neuronWeights.reduce((sum, w, j) => sum + w * inputs[j], 0);\n    // ReLU activation\n    return Math.max(0, dotProduct + biases[i]);\n  });\n}`,
      suggestedFollowUp: 'Explore how gradient clipping prevents vanishing and exploding gradients in deep nets.'
    })
  },

  // 16. Electric Circuits & Ohm's Law
  {
    id: 'electric-circuit',
    topic: 'Electric Circuits, Ohm’s Law & Power Dissipation',
    triggers: ['electric circuit', 'dc circuit', "ohm's law", 'resistor', 'battery circuit', 'voltage current', 'closed circuit'],
    generateAnswer: () => ({
      text: 'An electric circuit is a closed conductive path that allows electrical charges (electrons) to drift under an electric potential difference (voltage).',
      bulletPoints: [
        '**Ohm’s Law**: $V = I \\times R$ (Voltage = Current $\\times$ Resistance). Current is directly proportional to voltage and inversely proportional to resistance.',
        '**Closed Loop Requirement**: Current flows only when a complete, unbroken conductive path exists between the battery terminals.',
        '**Resistor Function**: Regulates and limits current to protect sensitive components from thermal damage.',
        '**Power Equation**: $P = V \\times I = I^2 \\times R$, quantifying electrical energy converted into light and heat per second (Watts).'
      ],
      codeSnippet: `// Ohm's Law Helper\nfunction calculateCircuitCurrent(voltageVolts: number, resistanceOhms: number): number {\n  if (resistanceOhms <= 0) throw new Error('Short circuit detected!');\n  return voltageVolts / resistanceOhms; // returns Amperes\n}`,
      suggestedFollowUp: 'Would you like to compare Kirchhoff’s Voltage Law (KVL) vs Current Law (KCL)?'
    })
  },

  // 17. Pythagorean Theorem
  {
    id: 'pythagorean-theorem',
    topic: 'Pythagorean Theorem & Geometric Proof (a² + b² = c²)',
    triggers: ['pythagorean', 'pythagoras', 'hypotenuse', 'a^2 + b^2', 'a2 + b2', 'right angled triangle'],
    generateAnswer: () => ({
      text: 'The Pythagorean Theorem states that in any Euclidean right-angled triangle, the area of the square on the hypotenuse is equal to the sum of the areas of the squares on the two adjacent legs.',
      bulletPoints: [
        '**Formula**: $a^2 + b^2 = c^2$, where $c$ is the hypotenuse opposite the 90-degree right angle.',
        '**Classic Triple**: A right triangle with legs $a=3$ and $b=4$ has a hypotenuse $c=5$, because $3^2 + 4^2 = 9 + 16 = 25 = 5^2$.',
        '**Geometric Interpretation**: Physical unit squares constructed on legs $a$ and $b$ can be dissected and perfectly rearranged to tile the square on side $c$.',
        '**Distance Metric**: Forms the basis of Euclidean distance calculations in 2D and 3D space: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$.'
      ],
      codeSnippet: `// Euclidean Distance via Pythagorean Theorem\nfunction calculateHypotenuse(legA: number, legB: number): number {\n  return Math.sqrt(legA ** 2 + legB ** 2);\n}\nconsole.log(calculateHypotenuse(3, 4)); // Output: 5`,
      suggestedFollowUp: 'Explore how Einstein used Pythagorean metrics to formulate spacetime intervals in Special Relativity.'
    })
  }
];

/**
 * Safely tests if a query matches a trigger keyword without false substring collisions (e.g. 'java' in 'javascript').
 */
function matchTrigger(text: string, trigger: string): boolean {
  const lower = text.toLowerCase();
  const tLower = trigger.toLowerCase();

  if (tLower === 'java') {
    return /\bjava\b/i.test(lower) && !lower.includes('javascript');
  }
  if (tLower === 'c' || tLower === 'py') {
    return new RegExp(`\\b${tLower}\\b`, 'i').test(lower);
  }
  return lower.includes(tLower);
}

/**
 * Evaluates a student's question and produces a pedagogical response.
 * Uses verified technical curriculum for supported topics, and provides an honest,
 * transparent offline limitation message for out-of-scope or unsupported topics.
 */
export function getOfflineTutorResponse(query: string): TutorAnswer {
  const clean = (query || '').trim();

  // Search verified knowledge base
  for (const item of VERIFIED_TUTOR_KNOWLEDGE) {
    if (item.triggers.some(trigger => matchTrigger(clean, trigger))) {
      const generated = item.generateAnswer(clean);
      const markdown = `## ${item.topic}\n\n${generated.text}\n\n### Key Educational Concepts\n${generated.bulletPoints.map((b) => `* ${b}`).join('\n')}${generated.codeSnippet ? `\n\n\`\`\`typescript\n${generated.codeSnippet}\n\`\`\`` : ''}${generated.suggestedFollowUp ? `\n\n> 💡 **Follow-Up Concept**: ${generated.suggestedFollowUp}` : ''}`;
      
      const visualModel = detectVisualModel(clean, markdown) || undefined;
      const visual = visualModel ? buildTutorVisualSpec(visualModel) : undefined;

      return {
        ...generated,
        explanation: generated.text,
        markdown,
        source: 'offline-curriculum',
        sourceLabel: `📖 Built-in Offline Tutor · ${item.topic} (Offline Knowledge Base)`,
        visual,
        visualType: visual?.visualType,
        visualTitle: visual?.visualTitle,
        visualDescription: visual?.visualDescription,
        visualModel
      };
    }
  }

  // --------------------------------------------------------------------------
  // TRANSPARENT OFFLINE FALLBACK FOR UNSUPPORTED / OUT-OF-CURRICULUM QUESTIONS
  // --------------------------------------------------------------------------
  const fallbackMarkdown = `I am currently operating as an **Offline Technical Study Tutor** for SMART BRIDGE.

I can provide step-by-step guidance, code patterns, and interview takeaways for our verified technical curriculum:
• **React 19 & Frontend Architecture** (Hooks, State, Virtual DOM, Fiber)
• **JavaScript & Web APIs** (Event Loop, Promises, Closures, Web Workers)
• **CSS & Layouts** (Flexbox vs Grid, Box Model, Stacking Context)
• **SQL & Database Systems** (JOINs, Indexing, ACID, Transactions)
• **Data Structures & Algorithms** (Binary Search, Big-O, Sorting)
• **System Design & Hardware** (CPU Architecture, Microservices, Circuits)
• **Sciences & Mathematics** (Photosynthesis, Water Cycle, Heart, Solar System, Pythagoras)

Because an external AI cloud service (e.g. Gemini API) is currently not connected on this device, I cannot reliably answer questions outside this verified curriculum.`;

  const fallbackVisualModel = detectVisualModel(clean) || undefined;
  const fallbackVisual = fallbackVisualModel ? buildTutorVisualSpec(fallbackVisualModel) : undefined;

  return {
    text: `I am currently operating as an **Offline Technical Study Tutor** for SMART BRIDGE.

I can provide step-by-step guidance, code patterns, and interview takeaways for our verified technical curriculum:
• **React 19 & Frontend Architecture** (Hooks, State, Virtual DOM, Fiber)
• **JavaScript & Web APIs** (Event Loop, Promises, Closures, Web Workers)
• **CSS & Layouts** (Flexbox vs Grid, Box Model, Stacking Context)
• **SQL & Database Systems** (JOINs, Indexing, ACID, Transactions)
• **Data Structures & Algorithms** (Binary Search, Big-O, Sorting)
• **System Design & Hardware** (CPU Architecture, Microservices, Circuits)
• **Sciences & Mathematics** (Photosynthesis, Water Cycle, Heart, Solar System, Pythagoras)

Because an external AI cloud service (e.g. Gemini API) is currently not connected on this device, I cannot reliably answer questions outside this verified curriculum.`,
    explanation: `I am currently operating as an Offline Technical Study Tutor for SMART BRIDGE.`,
    markdown: fallbackMarkdown,
    bulletPoints: [
      'Try asking: *"How does the JavaScript event loop handle promises and microtasks?"*',
      'Try asking: *"What is the difference between CSS Grid and Flexbox?"*',
      'Try asking: *"Explain SQL INNER JOIN vs LEFT JOIN with a code example."*',
      'Try asking: *"How does binary search work and what is its Big-O complexity?"*',
      'Try asking: *"Explain CPU architecture and the fetch-decode-execute cycle."*'
    ],
    suggestedFollowUp: 'Choose any of the suggested topics above to explore deep technical explanations and runnable code examples!',
    source: 'offline-unsupported',
    sourceLabel: '⚠️ Built-in Offline Tutor · Offline Curriculum Mode (Out of Scope Notice)',
    visual: fallbackVisual,
    visualType: fallbackVisual?.visualType,
    visualTitle: fallbackVisual?.visualTitle,
    visualDescription: fallbackVisual?.visualDescription,
    visualModel: fallbackVisualModel
  };
}
