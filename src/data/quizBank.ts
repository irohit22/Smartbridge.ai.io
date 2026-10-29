import type { QuizQuestion, QuizTopicBreakdown } from '../types';

export interface QuizTopicMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  track: 'webdev' | 'cs' | 'data';
}

export const AVAILABLE_TOPICS: QuizTopicMeta[] = [
  {
    id: 'react',
    name: 'React & Frontend Architecture',
    description: 'Components, Hooks, State Management, Fiber & Virtual DOM',
    icon: '⚛️',
    track: 'webdev'
  },
  {
    id: 'javascript',
    name: 'JavaScript & Web APIs',
    description: 'Event Loop, Promises, Microtasks, Closures & Prototypal Inheritance',
    icon: '⚡',
    track: 'webdev'
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Binary Search, Trees, Big-O Complexity, Hash Tables & Sorting',
    icon: '💻',
    track: 'cs'
  },
  {
    id: 'sql',
    name: 'SQL & Database Systems',
    description: 'JOINs, Indexing, Transactions, ACID Properties & Normalization',
    icon: '📊',
    track: 'data'
  },
  {
    id: 'css',
    name: 'CSS & Responsive Design',
    description: 'Flexbox, CSS Grid, Stacking Context, Specificity & Media Queries',
    icon: '🎨',
    track: 'webdev'
  },
  {
    id: 'python',
    name: 'Python Programming',
    description: 'Variables, Loops (10 Pushups), Functions (Mixer Grinder), Lists & OOP',
    icon: '🐍',
    track: 'cs'
  },
  {
    id: 'java',
    name: 'Java & Object-Oriented Programming',
    description: 'Classes & Objects (Blueprint Model), JVM Architecture & Collections',
    icon: '☕',
    track: 'cs'
  },
  {
    id: 'cpp',
    name: 'C / C++ Systems Programming',
    description: 'Pointers (GPS Address Model), Memory Allocation & Hardware Control',
    icon: '⚙️',
    track: 'cs'
  },
  {
    id: 'datascience',
    name: 'Data Science & Applied Analytics',
    description: 'Pandas, Exploratory Data Analysis, Data Cleaning & Statistics',
    icon: '📈',
    track: 'data'
  },
  {
    id: 'machinelearning',
    name: 'Machine Learning & AI',
    description: 'Supervised Learning, Model Training, Overfitting & Prediction',
    icon: '🤖',
    track: 'data'
  }
];

export const WEAK_TOPIC_ACCURACY_THRESHOLD = 60; // Accuracy below 60% flags topic as weak
export const MIN_QUESTIONS_FOR_WEAK_ASSESSMENT = 2; // At least 2 questions needed for reliable topic assessment

export const MASTER_QUIZ_BANK: QuizQuestion[] = [
  // ==========================================
  // TOPIC 0: Python Programming
  // ==========================================
  {
    id: 'py-1',
    track: 'cs',
    topic: 'Python Programming',
    subtopic: 'Variables & Data Types',
    difficulty: 'Easy',
    question: 'In Python, what is the best mental model for how a variable works?',
    options: [
      'A permanent metal stamp on computer hardware that can never be changed.',
      'A labeled kitchen box or tag pointing to an object in memory whose contents can be retrieved by name.',
      'A special file created on the computer hard drive for every single number.',
      'A network cable connecting the keyboard to the monitor.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Variables in Python act like labeled tags or kitchen dabbas pointing to values in memory. When you name a variable, you are creating a friendly label to reference and update that data later.'
  },
  {
    id: 'py-2',
    track: 'cs',
    topic: 'Python Programming',
    subtopic: 'Loops & Iteration',
    difficulty: 'Easy',
    question: 'How do Python loops relate to the everyday "10 pushups" analogy?',
    options: [
      'Each pushup is executed in a random, unpredictable order.',
      'A loop repeats an action one step at a time (like counting pushups 1 to 10) until the target condition is satisfied.',
      'Loops stop the program permanently after 1 repetition.',
      'Loops only work with mathematical decimals and cannot work with numbers.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Just like counting pushups one by one (count = count + 1 until target count is reached), a Python loop repeats a block of instructions automatically without you having to retype the code 10 times.'
  },
  {
    id: 'py-3',
    track: 'cs',
    topic: 'Python Programming',
    subtopic: 'Functions & Reusability',
    difficulty: 'Easy',
    question: 'Why is a Python function often compared to a kitchen mixer grinder?',
    options: [
      'It takes inputs/ingredients (arguments), performs processing inside, and returns an output (return value).',
      'It deletes all variables from the computer memory automatically.',
      'It can only run when connected to the internet.',
      'It converts text strings into audio files.'
    ],
    correctAnswerIndex: 0,
    explanation: 'A function takes arguments (ingredients like fruit and milk), executes internal logic (blending), and returns a finished result (a fresh milkshake). You can reuse the mixer grinder anytime with different ingredients!'
  },
  {
    id: 'py-4',
    track: 'cs',
    topic: 'Python Programming',
    subtopic: 'Data Structures',
    difficulty: 'Medium',
    question: 'What is the main difference between a Python List and a Dictionary?',
    options: [
      'Lists are stored on the hard drive; Dictionaries are stored on the graphics card.',
      'Lists are ordered sequences indexed by numbers (0, 1, 2); Dictionaries store key-value pairs indexed by unique labels ("name", "age").',
      'Lists can only store numbers; Dictionaries can only store words.',
      'There is no difference; they are exact aliases in Python 3.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A List is like a numbered shopping list where order matters [0, 1, 2]. A Dictionary is like a labeled spice rack or phonebook where each item has a unique name/key ("turmeric", "cumin").'
  },
  {
    id: 'py-5',
    track: 'cs',
    topic: 'Python Programming',
    subtopic: 'Mutability',
    difficulty: 'Medium',
    question: 'Which of the following built-in Python data types is immutable (cannot be modified in place)?',
    options: [
      'List (e.g., [1, 2, 3])',
      'Dictionary (e.g., {"score": 100})',
      'String (e.g., "SmartBridge")',
      'Set (e.g., {1, 2, 3})'
    ],
    correctAnswerIndex: 2,
    explanation: 'Strings and tuples in Python are immutable. Any operation that modifies a string creates a brand new string object in memory rather than mutating the existing one.'
  },
  {
    id: 'py-6',
    track: 'cs',
    topic: 'Python Programming',
    subtopic: 'Object-Oriented Programming',
    difficulty: 'Hard',
    question: 'In Python classes, what is the role of the special `__init__` method?',
    options: [
      'It terminates the program when an error occurs.',
      'It is the constructor automatically called when a new object instance is created to initialize its attributes.',
      'It imports external packages from the Python Package Index (PyPI).',
      'It encrypts passwords before saving them to disk.'
    ],
    correctAnswerIndex: 1,
    explanation: '`__init__` is Python\'s constructor method. When you write `s = Student("Alex")`, Python calls `__init__` to set up the student\'s name and initial attributes.'
  },

  // ==========================================
  // TOPIC 0B: Java & Object-Oriented Programming
  // ==========================================
  {
    id: 'java-1',
    track: 'cs',
    topic: 'Java & Object-Oriented Programming',
    subtopic: 'Classes & Objects',
    difficulty: 'Easy',
    question: 'According to the architect blueprint analogy, what is the relationship between a Java Class and an Object?',
    options: [
      'A Class is the real concrete building, and an Object is the paper blueprint.',
      'A Class is the architect\'s blueprint, and an Object is the actual house constructed from that blueprint.',
      'Classes and Objects are two names for identical things.',
      'A Class is a compiler error, while an Object is a successful build.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A Class defines the blueprint (the plan of what rooms and doors exist). An Object is the actual living instance built from that blueprint. You can build dozens of houses from one single blueprint.'
  },
  {
    id: 'java-2',
    track: 'cs',
    topic: 'Java & Object-Oriented Programming',
    subtopic: 'JVM Architecture',
    difficulty: 'Easy',
    question: 'Why does Java use the Java Virtual Machine (JVM) and bytecode (.class)?',
    options: [
      'To force users to install extra software.',
      'To achieve "Write Once, Run Anywhere" by decoupling Java bytecode from physical operating system architectures.',
      'To delete previous versions of Windows automatically.',
      'To convert Java code into JavaScript for web browsers.'
    ],
    correctAnswerIndex: 1,
    explanation: 'JVM functions like a universal travel adapter. The Java compiler generates platform-independent bytecode, and each OS has its own JVM to execute that bytecode natively.'
  },
  {
    id: 'java-3',
    track: 'cs',
    topic: 'Java & Object-Oriented Programming',
    subtopic: 'Encapsulation',
    difficulty: 'Medium',
    question: 'How does Encapsulation protect data in a Java class?',
    options: [
      'By turning all variables into public global variables.',
      'By keeping fields private and providing controlled public methods (getters/setters), like an ATM protecting cash inside.',
      'By saving code to a password-protected zip file.',
      'By running code only during business hours.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Encapsulation bundles data and methods together while hiding internal details. An ATM does not let customers open the cash safe directly; customers must use the PIN slot and withdrawal button (controlled methods).'
  },
  {
    id: 'java-4',
    track: 'cs',
    topic: 'Java & Object-Oriented Programming',
    subtopic: 'Memory Management',
    difficulty: 'Medium',
    question: 'What is the responsibility of the Java Garbage Collector?',
    options: [
      'Deleting unused desktop shortcuts on the user\'s computer.',
      'Automatically identifying and reclaiming heap memory occupied by objects that are no longer referenced.',
      'Formatting the hard drive when memory is full.',
      'Removing comments from Java source files.'
    ],
    correctAnswerIndex: 1,
    explanation: 'The Java Garbage Collector runs automatically in the background to sweep away orphan objects that have no active references, preventing memory leaks without manual free() calls.'
  },
  {
    id: 'java-5',
    track: 'cs',
    topic: 'Java & Object-Oriented Programming',
    subtopic: 'Polymorphism',
    difficulty: 'Hard',
    question: 'What is the key difference between Method Overloading and Method Overriding in Java?',
    options: [
      'Overloading happens in different classes with different names; Overriding happens in the same class.',
      'Overloading has the same method name but different parameter signatures in the same class; Overriding replaces a parent method in a child class with the exact same signature.',
      'Overloading is illegal in Java 17+; Overriding is mandatory.',
      'Overloading only works with static methods; Overriding only works with private methods.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Method Overloading provides multiple versions of a method (e.g., add(int, int) vs add(double, double)) in the same class. Method Overriding customizes inherited behavior from a superclass in a subclass.'
  },

  // ==========================================
  // TOPIC 0C: C / C++ Systems Programming
  // ==========================================
  {
    id: 'cpp-1',
    track: 'cs',
    topic: 'C / C++ Systems Programming',
    subtopic: 'Pointers & Addresses',
    difficulty: 'Easy',
    question: 'Using the GPS house address analogy, what does a C/C++ pointer actually store?',
    options: [
      'The physical furniture and walls of the house.',
      'The memory address (GPS location) in RAM where the actual variable is located.',
      'A backup copy of the entire operating system.',
      'The user\'s keyboard password.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A normal variable is like a house with furniture. A pointer is like a piece of paper with the house address written on it. The pointer does not duplicate the house; it just points to where it is in RAM.'
  },
  {
    id: 'cpp-2',
    track: 'cs',
    topic: 'C / C++ Systems Programming',
    subtopic: 'Dereferencing',
    difficulty: 'Easy',
    question: 'In C/C++, if `int* p = &x;`, what does the dereference operator `*p` do?',
    options: [
      'Multiplies p by x.',
      'Accesses or modifies the actual value stored at the memory location pointed to by p.',
      'Deletes the variable x from RAM.',
      'Prints the memory address in hexadecimal.'
    ],
    correctAnswerIndex: 1,
    explanation: 'The asterisk `*` when applied to a pointer (dereferencing) follows the address link to retrieve or change the value living at that address.'
  },
  {
    id: 'cpp-3',
    track: 'cs',
    topic: 'C / C++ Systems Programming',
    subtopic: 'Memory Management',
    difficulty: 'Medium',
    question: 'What is a "Memory Leak" in C/C++ and why is it dangerous?',
    options: [
      'Water physically leaking from the computer motherboard.',
      'Heap memory dynamically allocated with malloc/new that is never freed, gradually starving the system of available RAM.',
      'Variables being printed to the console too fast.',
      'A virus that changes wallpaper colors.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A memory leak happens when you book hotel rooms (malloc/new) but forget to check out (free/delete). Over time, all available rooms in the hotel run out, causing the program or system to crash.'
  },
  {
    id: 'cpp-4',
    track: 'cs',
    topic: 'C / C++ Systems Programming',
    subtopic: 'Stack vs Heap',
    difficulty: 'Medium',
    question: 'What is the fundamental difference between Stack memory and Heap memory in C/C++?',
    options: [
      'Stack is slow and manually managed; Heap is ultra-fast and automatic.',
      'Stack memory is fast and automatically cleaned up when functions return; Heap memory is flexible, manually allocated, and persists until freed.',
      'Stack memory is stored on the cloud; Heap memory is stored on flash drives.',
      'Stack is only for graphics; Heap is only for text strings.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Stack memory works like plates at a buffet (LIFO)—super fast, local to function scope, and automatically cleared. Heap memory is like a storage warehouse where you request custom space that stays allocated until you explicitly release it.'
  },
  {
    id: 'cpp-5',
    track: 'cs',
    topic: 'C / C++ Systems Programming',
    subtopic: 'Pointers & Dangling References',
    difficulty: 'Hard',
    question: 'What is a "Dangling Pointer" in C++?',
    options: [
      'A pointer pointing to a hardware sound card.',
      'A pointer that still references a memory location that has already been deallocated/freed.',
      'A pointer initialized to NULL.',
      'A pointer declared inside a header file.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A dangling pointer still points to a memory address after the memory was freed or went out of scope. Accessing it leads to undefined behavior, data corruption, or severe security vulnerabilities.'
  },

  // ==========================================
  // TOPIC 0D: Data Science & Applied Analytics
  // ==========================================
  {
    id: 'ds-1',
    track: 'data',
    topic: 'Data Science & Applied Analytics',
    subtopic: 'EDA & Statistics',
    difficulty: 'Easy',
    question: 'Why is a Data Scientist often compared to a diagnostic doctor?',
    options: [
      'Data Scientists work exclusively in hospitals.',
      'They examine raw test numbers and data indicators, diagnose patterns or problems, and recommend evidence-based solutions.',
      'They write software that manufactures medicines.',
      'They operate medical hardware devices.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Just like a doctor inspects blood reports to diagnose health trends before prescribing treatment, a data scientist examines raw metrics to uncover business health and diagnose issues.'
  },
  {
    id: 'ds-2',
    track: 'data',
    topic: 'Data Science & Applied Analytics',
    subtopic: 'Descriptive Statistics',
    difficulty: 'Easy',
    question: 'Why is the Median preferred over the Mean (average) when evaluating income data with billionaires?',
    options: [
      'Because the Median is much harder to calculate.',
      'Extreme high outliers (billionaires) pull the Mean artificially upward, while the Median reflects the true middle of the population.',
      'Because the Mean cannot handle numbers with decimal points.',
      'Because government tax laws prohibit using the Mean.'
    ],
    correctAnswerIndex: 1,
    explanation: 'The mean is sensitive to outliers. If 9 people earn ₹30,000 and 1 person earns ₹10 Crore, the mean suggests everyone is wealthy, whereas the median accurately shows the true middle income is ₹30,000.'
  },
  {
    id: 'ds-3',
    track: 'data',
    topic: 'Data Science & Applied Analytics',
    subtopic: 'Data Preprocessing',
    difficulty: 'Medium',
    question: 'Why is data cleaning considered 80% of real-world data science work?',
    options: [
      'Because computer monitors get dusty during data analysis.',
      'Real-world raw data contains missing values (NaN), typos, duplicate entries, and inconsistent formats that ruin analysis if not handled.',
      'Because Python refuses to open clean files.',
      'Because databases delete 80% of data automatically every night.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Like washing and chopping vegetables before cooking, real data from web forms, sensors, and legacy logs is messy. Cleaning and normalizing it ensures models and reports don\'t produce "Garbage In, Garbage Out".'
  },
  {
    id: 'ds-4',
    track: 'data',
    topic: 'Data Science & Applied Analytics',
    subtopic: 'Pandas Library',
    difficulty: 'Medium',
    question: 'In Python Data Science, what is a Pandas DataFrame?',
    options: [
      'A picture frame for hanging certificates on the wall.',
      'A 2-dimensional tabular data structure with labeled rows and columns, like a supercharged Excel spreadsheet.',
      'A hardware chip for training neural networks.',
      'A web server for hosting video games.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A Pandas DataFrame is Python\'s standard spreadsheet-like table. It lets you slice, filter, group, aggregate, and merge millions of rows with simple, expressive methods.'
  },

  // ==========================================
  // TOPIC 0E: Machine Learning & AI
  // ==========================================
  {
    id: 'ml-1',
    track: 'data',
    topic: 'Machine Learning & AI',
    subtopic: 'Supervised Learning',
    difficulty: 'Easy',
    question: 'How does Machine Learning training compare to teaching a child with picture flashcards?',
    options: [
      'Instead of programming 10,000 rigid rules for animal features, we show 10,000 labeled animal photos so the model learns patterns on its own.',
      'Children must be taught using binary machine code 0s and 1s.',
      'Machine learning algorithms can only recognize pictures of cars, not animals.',
      'Flashcards are banned in machine learning research.'
    ],
    correctAnswerIndex: 0,
    explanation: 'In supervised learning, models learn by example. Instead of hardcoding rules like "if whiskers and fur then cat", we feed labeled data so the neural weights adjust to recognize the visual patterns naturally.'
  },
  {
    id: 'ml-2',
    track: 'data',
    topic: 'Machine Learning & AI',
    subtopic: 'Overfitting',
    difficulty: 'Easy',
    question: 'What is the real-world student analogy for "Overfitting" in machine learning?',
    options: [
      'A student who studies nothing and sleeps through the exam.',
      'A student who memorizes textbook questions word-for-word: gets 100% on practice homework, but fails when new questions appear on the exam.',
      'A student who finishes their exam in 5 minutes.',
      'A student who changes schools every month.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Overfitting occurs when a model memorizes the training data and noise instead of understanding the underlying general concept. It scores high on training data, but fails on fresh, unseen real-world test data.'
  },
  {
    id: 'ml-3',
    track: 'data',
    topic: 'Machine Learning & AI',
    subtopic: 'Problem Types',
    difficulty: 'Medium',
    question: 'What is the key difference between Classification and Regression in Machine Learning?',
    options: [
      'Classification predicts a discrete category/label (e.g., Spam vs Not Spam); Regression predicts a continuous numerical quantity (e.g., House Price).',
      'Classification is only for images; Regression is only for text.',
      'Classification requires no training data; Regression requires 10 billion parameters.',
      'There is no difference; they are interchangeable mathematical terms.'
    ],
    correctAnswerIndex: 0,
    explanation: 'Classification answers "Which bucket/category does this belong to?" (discrete classes). Regression answers "How much / what number will this be?" (continuous quantitative value).'
  },
  {
    id: 'ml-4',
    track: 'data',
    topic: 'Machine Learning & AI',
    subtopic: 'Model Evaluation',
    difficulty: 'Medium',
    question: 'Why is Accuracy often a misleading metric when testing a model on highly imbalanced data (e.g., detecting rare fraudulent credit card transactions in 0.01% of cases)?',
    options: [
      'Because accuracy is calculated using subtraction instead of division.',
      'A dummy model that always predicts "Not Fraud" would achieve 99.99% accuracy while detecting zero actual fraud cases.',
      'Accuracy cannot be expressed as a percentage.',
      'Because credit cards cannot be processed by computers.'
    ],
    correctAnswerIndex: 1,
    explanation: 'In imbalanced datasets, predicting the majority class all the time yields deceptive 99.9% accuracy. In such cases, Precision, Recall, and F1-score are necessary to measure true detection capability.'
  },

  // ==========================================
  // TOPIC 1: React & Frontend Architecture
  // ==========================================
  {
    id: 'react-1',
    track: 'webdev',
    topic: 'React & Frontend Architecture',
    subtopic: 'JSX & Props',
    difficulty: 'Easy',
    question: 'In React, why must props passed to components be treated as immutable (read-only)?',
    options: [
      'JavaScript freezes all objects passed as function arguments automatically.',
      'Modifying props directly bypasses React state tracking and breaks unidirectional data flow.',
      'Props are compiled to static CSS variables in Vite builds.',
      'React creates a new browser worker thread whenever props are mutated.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'React relies on unidirectional data flow. Props belong to the parent component, so mutating them directly in a child violates React contract and leads to unpredictable render bugs.',
  },
  {
    id: 'react-2',
    track: 'webdev',
    topic: 'React & Frontend Architecture',
    subtopic: 'Lists & Keys',
    difficulty: 'Easy',
    question: 'Why should you avoid using an array index as the "key" prop in dynamic React lists?',
    options: [
      'React throws an uncatchable syntax error on build.',
      'Keys must always be cryptographically signed hashes in modern React.',
      'Reordering or filtering items causes component state to attach to the wrong item and ruins diffing performance.',
      'Index keys are forbidden by HTML5 accessibility standards.'
    ],
    correctAnswerIndex: 2,
    explanation:
      'React relies on stable keys to identify elements across renders. When using indexes, deleting or reordering elements alters the key associated with each child, causing local state corruption.',
  },
  {
    id: 'react-3',
    track: 'webdev',
    topic: 'React & Frontend Architecture',
    subtopic: 'Hooks & Dependency Array',
    difficulty: 'Medium',
    question: 'What happens if a state variable used inside a useEffect callback is omitted from its dependency array?',
    options: [
      'The effect callback will automatically subscribe to all component variables regardless.',
      'The effect will close over stale values from the initial render and will not re-run when the state changes.',
      'The application will immediately crash with a Maximum Call Stack Exceeded error.',
      'React will force synchronous re-mounting of the entire DOM tree.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'JavaScript closures capture variables from their outer scope at definition time. Without listing the dependency, the effect retains stale variable references and never runs its updated logic.',
  },
  {
    id: 'react-4',
    track: 'webdev',
    topic: 'React & Frontend Architecture',
    subtopic: 'State Batching',
    difficulty: 'Medium',
    question: 'How does React 18+ automatic batching affect multiple setState calls inside asynchronous callbacks (like setTimeout or fetch)?',
    options: [
      'Each setState call triggers an immediate synchronous DOM reflow.',
      'All setState calls within the tick are batched into a single re-render to prevent unnecessary UI paints.',
      'Automatic batching is only supported in Class Components, not Functional Components.',
      'React requires wrapping async calls in flushSync for state to update at all.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'React 18 introduced universal automatic batching across timeouts, promises, and native event handlers, bundling state updates together into one efficient re-render pass.',
  },
  {
    id: 'react-5',
    track: 'webdev',
    topic: 'React & Frontend Architecture',
    subtopic: 'Fiber Architecture',
    difficulty: 'Hard',
    question: 'What is the main architectural benefit of React Fiber over the legacy stack reconciler?',
    options: [
      'It executes React components directly in WebAssembly instead of JavaScript.',
      'It breaks reconciliation work into incremental units that can be paused, aborted, or prioritized across frames.',
      'It replaces the DOM with Canvas 2D rendering for faster mobile performance.',
      'It compiles React JSX directly into raw Web Components.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Fiber is a complete rewrite of the reconciliation algorithm that models call stack frames as linked list nodes, allowing React to yield execution back to the browser main thread to avoid dropping frames.',
  },
  {
    id: 'react-6',
    track: 'webdev',
    topic: 'React & Frontend Architecture',
    subtopic: 'useMemo & useCallback',
    difficulty: 'Hard',
    question: 'When is wrapping a function in useCallback genuinely beneficial rather than premature optimization?',
    options: [
      'Every time any function is defined inside a component body.',
      'When the function is passed to an unmemoized HTML element like <button onClick={fn}>.',
      'When the function is passed to a memoized child component (React.memo) or used as a dependency in another Hook.',
      'Only when the function performs asynchronous network operations.'
    ],
    correctAnswerIndex: 2,
    explanation:
      'useCallback has allocation and comparison overhead. It only provides value when reference equality prevents expensive re-renders in React.memo children or stabilizes Hook dependencies.',
  },

  // ==========================================
  // TOPIC 2: JavaScript & Web APIs
  // ==========================================
  {
    id: 'js-1',
    track: 'webdev',
    topic: 'JavaScript & Web APIs',
    subtopic: 'Equality Operators',
    difficulty: 'Easy',
    question: 'What is the fundamental difference between the "==" and "===" operators in JavaScript?',
    options: [
      '"==" performs type coercion before comparison; "===" checks both value and type without coercion.',
      '"===" compares memory pointers, while "==" compares primitive values.',
      '"==" is deprecated in modern ECMAScript standards.',
      '"===" only works on numbers and strings, not objects.'
    ],
    correctAnswerIndex: 0,
    explanation:
      'Strict equality (===) requires operands to share both the identical data type and value. Loose equality (==) coerces types according to ECMAScript Abstract Equality algorithm.',
  },
  {
    id: 'js-2',
    track: 'webdev',
    topic: 'JavaScript & Web APIs',
    subtopic: 'Variable Scoping',
    difficulty: 'Easy',
    question: 'How do "let" and "const" declarations differ from "var" regarding variable scope?',
    options: [
      '"var" is block-scoped; "let" and "const" are function-scoped.',
      '"let" and "const" are block-scoped ({ ... }); "var" is function-scoped and hoisted to the enclosing function.',
      '"const" variables can be reassigned as long as they are primitives.',
      '"let" declarations are globally accessible across all browser windows.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'let and const are confined to the nearest enclosing curly braces (block scope) and live in a Temporal Dead Zone until initialized. var hoists to the function boundary.',
  },
  {
    id: 'js-3',
    track: 'webdev',
    topic: 'JavaScript & Web APIs',
    subtopic: 'Closures',
    difficulty: 'Medium',
    question: 'What is a JavaScript closure and when is it formed?',
    options: [
      'A method used to close database connections when a script terminates.',
      'A function bundled together with references to its surrounding lexical environment when defined.',
      'An encrypted JSON object sent over an HTTPS connection.',
      'A syntax error caused by unmatched closing curly brackets.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'A closure gives an inner function access to an outer enclosing function’s scope even after the outer function has completed execution and returned.',
  },
  {
    id: 'js-4',
    track: 'webdev',
    topic: 'JavaScript & Web APIs',
    subtopic: 'Event Loop & Task Queues',
    difficulty: 'Medium',
    question: 'How does the JavaScript Event Loop prioritize Microtasks (Promises) versus Macrotasks (setTimeout)?',
    options: [
      'Macrotasks are always executed before microtasks in the event loop.',
      'All pending Microtasks in the queue are drained completely immediately after the synchronous stack clears, before the next Macrotask runs.',
      'Microtasks and Macrotasks run concurrently in multi-threaded browser workers.',
      'setTimeout callbacks bypass the task queue and execute synchronously.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'The microtask queue (Promise.then, queueMicrotask) has higher priority. When the call stack empties, the browser flushes all microtasks before yielding to render or running the next macrotask.',
  },
  {
    id: 'js-5',
    track: 'webdev',
    topic: 'JavaScript & Web APIs',
    subtopic: 'Event Bubbling & Capturing',
    difficulty: 'Hard',
    question: 'In the DOM event flow, what is the exact chronological sequence of event propagation?',
    options: [
      'Target Phase -> Bubbling Phase -> Capturing Phase.',
      'Capturing Phase (window down to target) -> Target Phase -> Bubbling Phase (target up to window).',
      'Bubbling Phase (window down to target) -> Target Phase -> Capturing Phase (target up to window).',
      'DOM events propagate simultaneously in both directions at once.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'DOM Level 3 Events defines three phases: Capturing (trickling down from window to target), Target phase (reaching the dispatched element), and Bubbling (bubbling back up toward window).',
  },
  {
    id: 'js-6',
    track: 'webdev',
    topic: 'JavaScript & Web APIs',
    subtopic: 'Prototypal Inheritance',
    difficulty: 'Hard',
    question: 'What happens when a property is accessed on an object that does not exist directly on that instance?',
    options: [
      'JavaScript throws a ReferenceError immediately.',
      'The JavaScript engine traverses up the [[Prototype]] chain until the property is found or null is reached.',
      'The engine automatically creates the property with a value of undefined on the instance.',
      'The browser queries the global window object and assigns the closest matching variable.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Objects in JavaScript link to a prototype. If property lookup misses on the instance, the engine checks its prototype, and that prototype’s prototype, ending at Object.prototype whose prototype is null.',
  },

  // ==========================================
  // TOPIC 3: Data Structures & Algorithms
  // ==========================================
  {
    id: 'dsa-1',
    track: 'cs',
    topic: 'Data Structures & Algorithms',
    subtopic: 'Big-O Complexity',
    difficulty: 'Easy',
    question: 'What is the time complexity of looking up a value in an unsorted array of size N by linear search?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
    correctAnswerIndex: 2,
    explanation:
      'In an unsorted array, the target element might be at the very end or not present at all, requiring inspecting every one of the N elements in the worst case (O(N)).',
  },
  {
    id: 'dsa-2',
    track: 'cs',
    topic: 'Data Structures & Algorithms',
    subtopic: 'Stack Data Structure',
    difficulty: 'Easy',
    question: 'Which processing principle does a standard Stack data structure adhere to?',
    options: [
      'FIFO (First-In, First-Out)',
      'LIFO (Last-In, First-Out)',
      'LRU (Least Recently Used)',
      'Priority-based Scheduling'
    ],
    correctAnswerIndex: 1,
    explanation:
      'A stack is a Last-In, First-Out (LIFO) structure. The most recently pushed element is the first one popped off (e.g. browser back history, call stack).',
  },
  {
    id: 'dsa-3',
    track: 'cs',
    topic: 'Data Structures & Algorithms',
    subtopic: 'Binary Search',
    difficulty: 'Medium',
    question: 'What precondition is strictly required before executing a Binary Search on an array?',
    options: [
      'The array must contain only positive prime numbers.',
      'The array must be sorted in ascending or descending order.',
      'The array length must be an exact power of two.',
      'The array elements must be unique with no duplicates.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Binary Search works by comparing the middle element and halving the search space. This logic relies entirely on the array being sorted so halves can be safely eliminated.',
  },
  {
    id: 'dsa-4',
    track: 'cs',
    topic: 'Data Structures & Algorithms',
    subtopic: 'Hash Table Collisions',
    difficulty: 'Medium',
    question: 'What is the worst-case time complexity of retrieving a key from a Hash Map when every key hashes to the exact same bucket?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N!)'],
    correctAnswerIndex: 2,
    explanation:
      'If all keys collide in a single bucket (e.g. linked list in chaining), the search degenerates into a linear search over all N entries, yielding O(N) worst-case time.',
  },
  {
    id: 'dsa-5',
    track: 'cs',
    topic: 'Data Structures & Algorithms',
    subtopic: 'Sorting Algorithms',
    difficulty: 'Hard',
    question: 'What is the worst-case time complexity of QuickSort when a naive pivot (e.g. first or last element) is chosen on an already sorted array?',
    options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(N²)'],
    correctAnswerIndex: 3,
    explanation:
      'Selecting an extreme pivot on already sorted data creates heavily skewed partitions of size (N-1) and 0 at each level, causing recursion depth of N and O(N²) quadratic time.',
  },
  {
    id: 'dsa-6',
    track: 'cs',
    topic: 'Data Structures & Algorithms',
    subtopic: 'Tree Traversal',
    difficulty: 'Hard',
    question: 'In a Binary Search Tree (BST), which tree traversal order visits all node keys in strictly ascending sorted order?',
    options: [
      'Pre-order traversal (Root, Left, Right)',
      'In-order traversal (Left, Root, Right)',
      'Post-order traversal (Left, Right, Root)',
      'Breadth-first search (Level by level)'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Because all nodes in the left subtree are smaller than the root, and all in the right subtree are greater, in-order traversal (Left -> Current -> Right) guarantees ascending output.',
  },

  // ==========================================
  // TOPIC 4: SQL & Database Systems
  // ==========================================
  {
    id: 'sql-1',
    track: 'data',
    topic: 'SQL & Database Systems',
    subtopic: 'Basic Queries',
    difficulty: 'Easy',
    question: 'Which SQL clause is used to filter rows before any GROUP BY aggregation takes place?',
    options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
    correctAnswerIndex: 1,
    explanation:
      'WHERE filters individual rows prior to grouping. In contrast, HAVING filters the aggregated summary rows created after GROUP BY.',
  },
  {
    id: 'sql-2',
    track: 'data',
    topic: 'SQL & Database Systems',
    subtopic: 'SQL Joins',
    difficulty: 'Easy',
    question: 'When should you use a LEFT JOIN instead of an INNER JOIN in a SQL relational query?',
    options: [
      'When you need to join tables without any primary or foreign keys.',
      'When you want to keep all records from the left table even if there are no matching rows in the right table.',
      'When the right table contains more than 100,000 rows.',
      'When calculating aggregate averages with the AVG() function.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'INNER JOIN excludes unmatched rows. LEFT JOIN returns all rows from the left table, populating NULL values for any non-matching columns on the right.',
  },
  {
    id: 'sql-3',
    track: 'data',
    topic: 'SQL & Database Systems',
    subtopic: 'HAVING vs WHERE',
    difficulty: 'Medium',
    question: 'Why can you NOT use aggregate functions like COUNT() or SUM() directly inside a WHERE clause in standard SQL?',
    options: [
      'Aggregate functions are only permitted in UPDATE statements.',
      'WHERE evaluates rows individually before groups are formed and before aggregates are calculated.',
      'COUNT and SUM require full table locks that violate ACID properties.',
      'SQL standards deprecate arithmetic operators in WHERE filters.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'The SQL query lifecycle processes FROM and WHERE before GROUP BY. Aggregate values do not exist yet when WHERE is evaluated; HAVING is used to filter aggregated groups.',
  },
  {
    id: 'sql-4',
    track: 'data',
    topic: 'SQL & Database Systems',
    subtopic: 'Database Indexing',
    difficulty: 'Medium',
    question: 'What is the primary trade-off of adding multiple secondary B-Tree indexes to an existing database table?',
    options: [
      'SELECT read queries become significantly slower.',
      'Read queries become faster, but INSERT, UPDATE, and DELETE write queries become slower due to index maintenance.',
      'Database foreign keys are automatically detached.',
      'Transactions can no longer operate under Repeatable Read isolation.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Indexes provide fast logarithmic pointer lookups for reads, but every insert or update must rebalance and modify each index structure, adding write overhead.',
  },
  {
    id: 'sql-5',
    track: 'data',
    topic: 'SQL & Database Systems',
    subtopic: 'ACID Properties',
    difficulty: 'Hard',
    question: 'In database ACID properties, what does "Isolation" specifically guarantee?',
    options: [
      'Data is written to isolated hardware disks across multiple availability zones.',
      'Concurrent execution of transactions produces a state equivalent to executing them serially without cross-contamination.',
      'Committed transactions survive database server crashes and power outages.',
      'All constraints (foreign keys, types) remain valid after a crash.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Isolation ensures concurrent transactions operate independently without viewing partial, uncommitted modifications from each other (preventing dirty reads and lost updates).',
  },
  {
    id: 'sql-6',
    track: 'data',
    topic: 'SQL & Database Systems',
    subtopic: 'Normalization',
    difficulty: 'Hard',
    question: 'What condition distinguishes Third Normal Form (3NF) from Second Normal Form (2NF)?',
    options: [
      'The table must contain zero null values in all non-primary columns.',
      'The table is in 2NF and contains no transitive dependencies (non-key columns must not depend on other non-key columns).',
      'The table must have only one column in its composite primary key.',
      'The table must be stored in columnar format rather than row-oriented.'
    ],
    correctAnswerIndex: 1,
    explanation:
      '3NF requires that every non-prime attribute is non-transitively dependent on every candidate key. In simple terms: attributes must depend on the key, the whole key, and nothing but the key.',
  },

  // ==========================================
  // TOPIC 5: CSS & Responsive Design
  // ==========================================
  {
    id: 'css-1',
    track: 'webdev',
    topic: 'CSS & Responsive Design',
    subtopic: 'Box Model',
    difficulty: 'Easy',
    question: 'What is the main advantage of setting "box-sizing: border-box" across all elements in CSS?',
    options: [
      'It centers all text inside div elements automatically.',
      'Padding and border are included in the element’s total declared width and height, preventing unexpected layout overflows.',
      'It forces elements to render in 3D perspective.',
      'It enables CSS Grid support in legacy browsers.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'In standard content-box, adding padding expands the element beyond its set width. border-box keeps width fixed and absorbs padding and border within the dimensions.',
  },
  {
    id: 'css-2',
    track: 'webdev',
    topic: 'CSS & Responsive Design',
    subtopic: 'Flexbox vs Grid',
    difficulty: 'Easy',
    question: 'What is the primary architectural difference between CSS Flexbox and CSS Grid?',
    options: [
      'Flexbox is 1-dimensional (row OR column), while Grid is 2-dimensional (rows AND columns simultaneously).',
      'Grid only supports fixed pixel units, while Flexbox only supports percentages.',
      'Flexbox works only in mobile viewports, while Grid works only on desktop screens.',
      'Grid cannot contain interactive elements or links.'
    ],
    correctAnswerIndex: 0,
    explanation:
      'Flexbox distributes space along a single directional axis at a time. CSS Grid is a 2D layout model allowing simultaneous alignment along columns and rows.',
  },
  {
    id: 'css-3',
    track: 'webdev',
    topic: 'CSS & Responsive Design',
    subtopic: 'CSS Specificity',
    difficulty: 'Medium',
    question: 'Given the selectors "#nav .link" and "header ul li a.active", which rule takes precedence due to higher CSS specificity?',
    options: [
      '"header ul li a.active" because it has 5 chained selectors.',
      '"#nav .link" because an ID selector (1,0,0) outweighs any number of classes and element tags.',
      'Whichever rule appears earliest in the stylesheet.',
      'They have equal specificity and cancel each other out.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Specificity weights are counted as (ID, Class/Attribute, Type). "#nav .link" is (1, 1, 0), whereas "header ul li a.active" is (0, 1, 4). The single ID selector dominates.',
  },
  {
    id: 'css-4',
    track: 'webdev',
    topic: 'CSS & Responsive Design',
    subtopic: 'Positioning & Document Flow',
    difficulty: 'Medium',
    question: 'When an element is assigned "position: absolute", relative to what is it positioned?',
    options: [
      'Always relative to the root <html> viewport element.',
      'Relative to its closest ancestor element that has a position other than "static" (or the viewport if none).',
      'Relative to its immediately preceding sibling element in the DOM.',
      'Relative to the center point of the user’s physical monitor screen.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'An absolute element is removed from normal document flow and positioned relative to its nearest positioned ancestor (relative, absolute, fixed, or sticky).',
  },
  {
    id: 'css-5',
    track: 'webdev',
    topic: 'CSS & Responsive Design',
    subtopic: 'Stacking Context & z-index',
    difficulty: 'Hard',
    question: 'Why might an element with "z-index: 9999" still render underneath an element with "z-index: 1"?',
    options: [
      'Browsers limit z-index values to a maximum of 255.',
      'The element belongs to a parent stacking context whose z-index is lower than the other element’s stacking context.',
      'z-index only applies when CSS animations are active.',
      'z-index cannot be applied to elements with background colors.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Stacking contexts form a hierarchy. If parent A is rendered below parent B, child elements inside parent A cannot break out and appear above elements in parent B, regardless of child z-index.',
  },
  {
    id: 'css-6',
    track: 'webdev',
    topic: 'CSS & Responsive Design',
    subtopic: 'Container Queries',
    difficulty: 'Hard',
    question: 'What is the key advantage of CSS Container Queries (@container) over standard Media Queries (@media)?',
    options: [
      'Container queries compress CSS file sizes during gzip distribution.',
      'They allow a component to style itself based on the dimensions of its parent container rather than the global browser viewport.',
      'They allow styling elements based on the client device’s battery percentage.',
      'They eliminate the need for CSS class names.'
    ],
    correctAnswerIndex: 1,
    explanation:
      'Media queries only evaluate viewport width, making modular reusable components difficult in varying column widths. Container queries evaluate the component’s parent container size.',
  }
];

/**
 * Returns list of topics with current question counts.
 */

// =========================================================================
// EXPANDED QUESTION BANK: High-Quality Offline Practice Questions
// 75 additional curated, verified questions across all 5 engineering domains
// =========================================================================
export const EXPANDED_QUIZ_BANK: QuizQuestion[] = [
  {
    "id": "react-exp-1",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Component Composition",
    "difficulty": "Easy",
    "question": "What is the primary architectural purpose of the \"children\" prop in React?",
    "options": [
      "To enable component composition by rendering arbitrary nested elements inside container components.",
      "To automatically synchronize child state changes directly with the browser local storage.",
      "To force React Fiber to render child components inside a separate web worker.",
      "To convert standard React JSX into raw SVG vector graphics."
    ],
    "correctAnswerIndex": 0,
    "explanation": "The children prop is React’s idiomatic mechanism for composition, allowing layout or wrapper components to accept and render arbitrary nested content without hardcoding child types."
  },
  {
    "id": "react-exp-2",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Event Handling",
    "difficulty": "Easy",
    "question": "Why should you pass an event handler reference like onClick={handleClick} rather than calling it directly like onClick={handleClick()}?",
    "options": [
      "Calling handleClick() immediately invokes the function during render, often causing premature state updates or infinite loops.",
      "Direct function execution causes modern browsers to reject React event listeners for security reasons.",
      "React does not allow function invocations anywhere inside JSX tags.",
      "Direct execution compiles the function into CSS stylesheet rules."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Writing onClick={handleClick()} invokes the function as soon as the JSX is evaluated during render. Passing the reference ensures the handler only executes when the user actually interacts with the element."
  },
  {
    "id": "react-exp-3",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "React Fragments",
    "difficulty": "Easy",
    "question": "What problem does React.Fragment (<>...</>) solve when authoring components?",
    "options": [
      "It groups multiple child elements without creating an extra wrapper DOM node that could break CSS layouts.",
      "It caches component network requests across page refreshes.",
      "It isolates child components from the parent’s error boundary.",
      "It compiles React code directly to WebAssembly bytecode."
    ],
    "correctAnswerIndex": 0,
    "explanation": "React components must return a single root node. React.Fragment lets you group a list of children without adding extra wrapper nodes to the DOM."
  },
  {
    "id": "react-exp-4",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Controlled Components",
    "difficulty": "Easy",
    "question": "What defines a \"controlled component\" in React form management?",
    "options": [
      "A form element whose current value is driven by React state and updated through an onChange event handler.",
      "An input element whose value is strictly managed by native browser HTML5 form validation.",
      "A component that cannot be unmounted once rendered on screen.",
      "An input field that only accepts cryptographically signed strings."
    ],
    "correctAnswerIndex": 0,
    "explanation": "In a controlled component, form data is handled by a React component’s state, making React the single source of truth for the input’s value."
  },
  {
    "id": "react-exp-5",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Default Props & Destructuring",
    "difficulty": "Easy",
    "question": "In modern React functional components, what is the recommended way to define default prop values?",
    "options": [
      "Using standard JavaScript default parameter values in props destructuring (e.g., ({ size = \"md\" })).",
      "Assigning a static defaultProps object to the functional component function.",
      "Mutating the props object directly inside the component body.",
      "Creating a global window variable for each prop."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Standard ES6 default parameter values during props destructuring is the idiomatic, modern standard in React, replacing the older defaultProps pattern for function components."
  },
  {
    "id": "react-exp-6",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "useReducer Pattern",
    "difficulty": "Medium",
    "question": "When is useReducer architecturally preferable over multiple useState hooks in a React component?",
    "options": [
      "When state logic involves complex transitions, multiple interrelated sub-values, or predictable state machines.",
      "Only when building native mobile apps with React Native.",
      "When you need to perform synchronous HTTP GET requests inside the render loop.",
      "When the component uses more than two external CSS stylesheets."
    ],
    "correctAnswerIndex": 0,
    "explanation": "useReducer centralizes complex state transitions into a pure, testable reducer function, making updates predictable and decoupling action dispatching from state update mechanics."
  },
  {
    "id": "react-exp-7",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Context API Performance",
    "difficulty": "Medium",
    "question": "What is a common performance bottleneck associated with React Context when passing an object value?",
    "options": [
      "All consumers re-render whenever the context value reference changes, even if they only read an unchanged property.",
      "React Context serializes all data into JSON strings on every render pass.",
      "Context values can only be read once per browser session.",
      "Context prevents garbage collection of all parent components."
    ],
    "correctAnswerIndex": 0,
    "explanation": "When a Context Provider receives a new object reference, all consuming components are scheduled for re-rendering. Splitting contexts or using dedicated state managers prevents redundant consumer re-renders."
  },
  {
    "id": "react-exp-8",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "useRef vs useState",
    "difficulty": "Medium",
    "question": "How does mutating ref.current differ from updating state with useState?",
    "options": [
      "Mutating ref.current persists values across renders without scheduling a component re-render.",
      "Mutating ref.current immediately forces a synchronous re-paint of the whole browser window.",
      "useRef can only store references to HTML <canvas> tags.",
      "useRef values are wiped out whenever a parent component updates."
    ],
    "correctAnswerIndex": 0,
    "explanation": "useRef creates a mutable container whose .current property persists across re-renders without triggering component re-renders when mutated, making it ideal for DOM nodes and timer IDs."
  },
  {
    "id": "react-exp-9",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Error Boundaries",
    "difficulty": "Medium",
    "question": "Which of the following errors is NOT caught by a React Error Boundary?",
    "options": [
      "Errors inside asynchronous callbacks (like setTimeout or fetch) and event handlers.",
      "Errors thrown during component render methods.",
      "Errors thrown in component constructor methods.",
      "Errors thrown in child lifecycle hooks."
    ],
    "correctAnswerIndex": 0,
    "explanation": "React Error Boundaries catch rendering and lifecycle errors within their child tree. They do not catch errors inside asynchronous callbacks or event handlers, which should use standard try/catch blocks."
  },
  {
    "id": "react-exp-10",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "useLayoutEffect Timing",
    "difficulty": "Medium",
    "question": "What is the primary timing difference between useLayoutEffect and useEffect?",
    "options": [
      "useLayoutEffect runs synchronously immediately after DOM mutations before browser paint; useEffect runs asynchronously after paint.",
      "useLayoutEffect only runs on server-side rendering; useEffect runs on the client.",
      "useEffect blocks browser paint while useLayoutEffect runs in a web worker.",
      "useLayoutEffect is triggered before the component JavaScript is loaded."
    ],
    "correctAnswerIndex": 0,
    "explanation": "useLayoutEffect runs synchronously after DOM mutations but before the browser paints the screen, making it essential for reading layout dimensions and preventing visual flickers."
  },
  {
    "id": "react-exp-11",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Concurrent Transitions",
    "difficulty": "Hard",
    "question": "How does React 18 useTransition optimize user responsiveness during heavy UI updates?",
    "options": [
      "It marks non-urgent state updates as interruptible transitions, keeping urgent inputs like keystrokes fluid.",
      "It offloads component rendering to a multi-threaded WebAssembly worker.",
      "It converts functional components into static pre-rendered web assets.",
      "It automatically debounces all keyboard event handlers by 300 milliseconds."
    ],
    "correctAnswerIndex": 0,
    "explanation": "useTransition enables developers to distinguish urgent interactions (typing, clicking) from transition updates (filtering data, switching tabs), allowing React to interrupt slow renders for user input."
  },
  {
    "id": "react-exp-12",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Server Hydration",
    "difficulty": "Hard",
    "question": "In SSR architectures, what causes a client-side React hydration mismatch error?",
    "options": [
      "The HTML tree generated on the server differs from the initial client-side virtual DOM render tree.",
      "The client browser does not support ECMAScript 2022 syntax.",
      "Vite fails to bundle CSS modules into the client distribution folder.",
      "The client machine uses a different screen aspect ratio than the server."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Hydration matches client React virtual DOM to pre-rendered server HTML. If non-deterministic values (like Date.now() or window access) cause the trees to differ, React throws a hydration mismatch."
  },
  {
    "id": "react-exp-13",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "React Compiler",
    "difficulty": "Hard",
    "question": "What is the primary architectural goal of the React Compiler (React Forget)?",
    "options": [
      "To automatically memoize values and component trees at build time, eliminating manual useMemo and useCallback boilerplate.",
      "To compile React components directly to raw Web Components without the React runtime.",
      "To replace Virtual DOM diffing with direct imperative DOM mutation scripts.",
      "To enforce strict TypeScript typing across all legacy JavaScript packages."
    ],
    "correctAnswerIndex": 0,
    "explanation": "The React Compiler analyzes JavaScript semantics at compile time to automatically generate fine-grained memoization, ensuring optimal re-render boundaries without manual useMemo/useCallback."
  },
  {
    "id": "react-exp-14",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Rules of Hooks",
    "difficulty": "Hard",
    "question": "Why does React strictly prohibit invoking hooks inside loops, conditions, or nested functions?",
    "options": [
      "React relies on the call order of hooks being identical across renders to pair state and effects with internal fiber nodes.",
      "JavaScript strict mode forbids function calls inside conditional statements.",
      "Calling hooks conditionally causes memory leaks in the browser V8 garbage collector.",
      "React compiles conditional hooks into infinite recursive while loops."
    ],
    "correctAnswerIndex": 0,
    "explanation": "React tracks hook state via an internal linked list tied to each fiber node. Calling hooks out of order across renders corrupts the pointers and maps state to the wrong hook."
  },
  {
    "id": "react-exp-15",
    "track": "webdev",
    "topic": "React & Frontend Architecture",
    "subtopic": "Portals & Synthetic Events",
    "difficulty": "Hard",
    "question": "When a component is rendered through React.createPortal into a different DOM subtree, how do synthetic events bubble?",
    "options": [
      "Events bubble up through the React virtual component tree ancestors, regardless of physical DOM placement.",
      "Events are immediately swallowed and do not bubble anywhere.",
      "Events only bubble through the physical DOM tree where the portal container was mounted.",
      "Events trigger a synchronous page navigation event."
    ],
    "correctAnswerIndex": 0,
    "explanation": "React Portals maintain component tree hierarchy for synthetic events. Even if a portal mounts a modal at document.body, events bubble up through the React parent component tree."
  },
  {
    "id": "js-exp-1",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Types & Coercion",
    "difficulty": "Easy",
    "question": "What is the result of typeof null in JavaScript, and why?",
    "options": [
      "\"object\", which is a historical legacy bug from the original JavaScript implementation.",
      "\"null\", because null is a distinct primitive type in ECMAScript.",
      "\"undefined\", because null represents uninitialized memory.",
      "\"boolean\", because null evaluates to false in Boolean contexts."
    ],
    "correctAnswerIndex": 0,
    "explanation": "In the original JavaScript implementation, values were stored with a type tag in the lower bits. Objects had a tag of 000, and null was represented as the null pointer (0x00), causing typeof null to return \"object\"."
  },
  {
    "id": "js-exp-2",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Equality Operators",
    "difficulty": "Easy",
    "question": "What is the fundamental difference between == (loose equality) and === (strict equality) in JavaScript?",
    "options": [
      "=== compares both value and type without coercion, while == performs implicit type coercion before comparison.",
      "== is faster because it bypasses ECMAScript type checking algorithms.",
      "=== converts both values to floating-point numbers before comparing.",
      "== only works on strings, while === works only on numbers."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Strict equality (===) checks both value and type without converting types. Loose equality (==) uses the Abstract Equality Comparison Algorithm to coerce types before evaluating equality."
  },
  {
    "id": "js-exp-3",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Scoping & Declarations",
    "difficulty": "Easy",
    "question": "How do let and const declarations differ from var in terms of variable scope?",
    "options": [
      "let and const are block-scoped, whereas var is function-scoped (or globally scoped).",
      "var variables cannot be reassigned once declared, whereas const variables can.",
      "let declarations are hoisted to the top and initialized with the value null.",
      "var variables are automatically garbage collected at the end of each if statement."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Variables declared with let and const are confined to the block ({ ... }) in which they are defined. Variables declared with var ignore block boundaries and are scoped to the containing function."
  },
  {
    "id": "js-exp-4",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Arrow Functions",
    "difficulty": "Easy",
    "question": "How does an arrow function handle the \"this\" keyword compared to a standard function declaration?",
    "options": [
      "Arrow functions do not bind their own \"this\"; they lexically inherit \"this\" from the surrounding outer scope.",
      "Arrow functions bind \"this\" to the global window object in strict mode.",
      "Arrow functions bind \"this\" to the element that triggered the latest DOM event.",
      "Arrow functions make \"this\" permanently immutable across the entire application."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Arrow functions establish \"this\" based on the lexical context in which the function was defined, rather than how or where the function is invoked."
  },
  {
    "id": "js-exp-5",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Template Literals",
    "difficulty": "Easy",
    "question": "What is a key capability of ES6 template literals (enclosed by backticks) beyond basic string concatenation?",
    "options": [
      "They support multiline strings natively and embedded expression interpolation using ${...}.",
      "They automatically encrypt sensitive text before transmission over WebSockets.",
      "They prevent XSS attacks without any sanitization libraries.",
      "They compile text strings into binary protocol buffers."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Template literals allow embedded expressions with ${...} and multi-line strings without needing manual newline escape characters (\\n)."
  },
  {
    "id": "js-exp-6",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Closures",
    "difficulty": "Medium",
    "question": "What is a closure in JavaScript, and what enables it?",
    "options": [
      "A function bundled with references to its surrounding lexical environment, allowing it to access outer variables even after the outer function has returned.",
      "A mechanism that seals JavaScript objects to prevent adding new properties.",
      "A method to close network sockets when a user closes a browser tab.",
      "A design pattern that forces asynchronous code to run synchronously."
    ],
    "correctAnswerIndex": 0,
    "explanation": "A closure is created whenever a function is created. It retains access to variables declared in its lexical scope even after the outer function has finished executing."
  },
  {
    "id": "js-exp-7",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Promise Combinators",
    "difficulty": "Medium",
    "question": "What is the key difference between Promise.all() and Promise.allSettled()?",
    "options": [
      "Promise.all rejects immediately upon the first rejected promise; Promise.allSettled waits for all promises to finish and returns their individual outcomes.",
      "Promise.allSettled rejects if any promise takes longer than 5 seconds to resolve.",
      "Promise.all executes promises sequentially on the main thread; Promise.allSettled executes them in parallel on web workers.",
      "Promise.allSettled only accepts promises that resolve with numeric values."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Promise.all short-circuits on the first rejection. Promise.allSettled guarantees all promises complete, returning an array of objects describing the outcome of each promise (fulfilled or rejected)."
  },
  {
    "id": "js-exp-8",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Event Delegation",
    "difficulty": "Medium",
    "question": "How does event delegation work in browser DOM programming?",
    "options": [
      "Attaching a single event listener to a common parent element and using event.target to handle events on dynamic child elements via bubbling.",
      "Delegating JavaScript event processing to a serverless backend cloud function.",
      "Using window.postMessage to transfer click events to an iframe.",
      "Creating a new listener on every child element individually inside a while loop."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Event delegation leverages event bubbling by listening on a parent container. You inspect event.target to handle interactions on existing or dynamically added child elements with minimal memory overhead."
  },
  {
    "id": "js-exp-9",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Debounce vs Throttle",
    "difficulty": "Medium",
    "question": "What is the behavioral difference between debouncing and throttling a function?",
    "options": [
      "Debouncing delays execution until a pause in events occurs; throttling guarantees execution at most once per specified time interval.",
      "Throttling completely discards all events after the first one forever.",
      "Debouncing is used only for server-side APIs, while throttling is used only for CSS animations.",
      "Debouncing executes on every animation frame, while throttling executes on worker threads."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Debounce resets the delay timer on each event, executing only after inactivity (ideal for search input). Throttle enforces a maximum rate of execution at steady intervals (ideal for scroll or resize)."
  },
  {
    "id": "js-exp-10",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Temporal Dead Zone",
    "difficulty": "Medium",
    "question": "What is the Temporal Dead Zone (TDZ) in JavaScript?",
    "options": [
      "The time between entering a block scope and the actual variable declaration, during which accessing let or const throws a ReferenceError.",
      "The idle latency between setTimeout callback execution and browser screen refresh.",
      "The period during which the garbage collector freezes the JavaScript execution thread.",
      "A state where promises remain pending due to network disconnection."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Variables declared with let and const are hoisted to the top of their block, but remain uninitialized. Accessing them before their declaration line is reached triggers a TDZ ReferenceError."
  },
  {
    "id": "js-exp-11",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Event Loop & Microtasks",
    "difficulty": "Hard",
    "question": "In what exact order will the following code log to the console?\\n\\nconsole.log(1);\\nsetTimeout(() => console.log(2), 0);\\nPromise.resolve().then(() => console.log(3));\\nconsole.log(4);",
    "options": [
      "1, 4, 3, 2",
      "1, 2, 3, 4",
      "1, 3, 4, 2",
      "1, 4, 2, 3"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Synchronous code runs first (1, 4). The microtask queue (Promise.then) is drained immediately after the current call stack clears (3). Finally, the macrotask/task queue callback (setTimeout) runs on the next tick (2)."
  },
  {
    "id": "js-exp-12",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "WeakMap & Memory",
    "difficulty": "Hard",
    "question": "Why are WeakMaps uniquely suited for caching metadata about DOM elements without causing memory leaks?",
    "options": [
      "WeakMap holds weak references to its object keys; if a key object has no other references, it and its associated value can be garbage collected.",
      "WeakMap automatically writes all cached properties directly to disk cache.",
      "WeakMap keys are strictly primitive strings that require zero RAM.",
      "WeakMap values are encrypted so they cannot be inspected in browser memory snapshots."
    ],
    "correctAnswerIndex": 0,
    "explanation": "WeakMap keys must be objects and are held weakly. When the object key (e.g. a removed DOM node) is dereferenced elsewhere, the garbage collector safely reclaims both the key and value."
  },
  {
    "id": "js-exp-13",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Generators & Iterables",
    "difficulty": "Hard",
    "question": "What happens when a generator function encounters a \"yield\" keyword during execution?",
    "options": [
      "It pauses its execution, yields the specified value to the consumer, and preserves its internal call stack state until next() is called.",
      "It terminates the function completely and clears all local variables.",
      "It creates an asynchronous background thread that executes the rest of the function in parallel.",
      "It forces the browser to trigger a garbage collection cycle."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Generators can pause their execution upon reaching yield. They produce an iterator result object { value, done } and resume execution from that exact spot when next() is called."
  },
  {
    "id": "js-exp-14",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Prototypal Inheritance",
    "difficulty": "Hard",
    "question": "What is the architectural benefit of creating an object using Object.create(null)?",
    "options": [
      "It creates a completely clean dictionary object with no prototype chain, preventing prototype pollution and accidental key collisions with Object.prototype.",
      "It allocates memory on the GPU instead of the CPU heap.",
      "It makes all properties of the object read-only and immutable.",
      "It automatically parses incoming JSON strings without error handling."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Object.create(null) creates an object that has no prototype (proto is null). It does not inherit toString, hasOwnProperty, or constructor, making it safe for dictionary lookups without prototype pollution."
  },
  {
    "id": "js-exp-15",
    "track": "webdev",
    "topic": "JavaScript & Web APIs",
    "subtopic": "Web Workers & Transferables",
    "difficulty": "Hard",
    "question": "When communicating with a Web Worker, how does passing an ArrayBuffer as a Transferable object differ from standard postMessage()?",
    "options": [
      "Transferring moves ownership of the underlying memory to the worker with zero-copy overhead, rendering it neutered (length 0) on the sender.",
      "Transferring encrypts the buffer using AES-256 before transferring.",
      "Standard postMessage modifies the buffer in place simultaneously across both threads without any locks.",
      "Transferring converts binary data into a base64 string in memory."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Standard postMessage performs a structured clone (deep memory copy). Transferable objects transfer ownership of the underlying buffer instantaneously without copying, detaching it from the sender thread."
  },
  {
    "id": "dsa-exp-1",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Hash Tables",
    "difficulty": "Easy",
    "question": "What is the average time complexity for searching, inserting, and deleting elements in a well-designed hash table?",
    "options": [
      "O(1) constant time.",
      "O(N) linear time.",
      "O(log N) logarithmic time.",
      "O(N log N) linearithmic time."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Under uniform hashing and a reasonable load factor, hash table lookups, insertions, and deletions run in O(1) average time by computing the key’s hash index directly."
  },
  {
    "id": "dsa-exp-2",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Stacks & Queues",
    "difficulty": "Easy",
    "question": "What are the fundamental access principles governing Stacks and Queues respectively?",
    "options": [
      "Stacks follow LIFO (Last-In, First-Out); Queues follow FIFO (First-In, First-Out).",
      "Stacks follow FIFO; Queues follow LIFO.",
      "Both Stacks and Queues allow random index access in O(1) time.",
      "Stacks can only store strings, while Queues can only store numbers."
    ],
    "correctAnswerIndex": 0,
    "explanation": "A Stack processes the most recently added item first (LIFO, like a stack of plates). A Queue processes items in the order they arrived (FIFO, like a line at a store)."
  },
  {
    "id": "dsa-exp-3",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Binary Search",
    "difficulty": "Easy",
    "question": "What strict precondition must be met before Binary Search can be applied to an array?",
    "options": [
      "The elements in the array must be sorted in monotonic order (ascending or descending).",
      "The array must contain only unique positive integers.",
      "The array length must be an exact power of 2.",
      "The array must be stored as a doubly linked list."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Binary Search relies on dividing the search space in half by comparing with the middle element, which is only valid if the data is sorted monotonically."
  },
  {
    "id": "dsa-exp-4",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Linked Lists",
    "difficulty": "Easy",
    "question": "What is the time complexity of prepending a new node to the head of a singly linked list?",
    "options": [
      "O(1) constant time.",
      "O(N) linear time.",
      "O(N²) quadratic time.",
      "O(log N) logarithmic time."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Prepending to a linked list only requires setting the new node’s next pointer to the current head and updating the head pointer, taking O(1) time regardless of list size."
  },
  {
    "id": "dsa-exp-5",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Memory Locality",
    "difficulty": "Easy",
    "question": "Why do arrays often outperform linked lists in iteration benchmarks despite identical O(N) theoretical time complexity?",
    "options": [
      "Arrays allocate contiguous memory blocks, providing superior CPU cache locality and hardware prefetching.",
      "Linked lists require garbage collection on every iteration step.",
      "Arrays execute directly on the graphics processing unit (GPU).",
      "Linked list nodes are always stored on external flash storage."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Array elements occupy adjacent memory addresses. When accessing one element, modern CPU hardware prefetches neighboring elements into high-speed CPU L1/L2 caches, vastly speeding up sequential access."
  },
  {
    "id": "dsa-exp-6",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Two Pointers",
    "difficulty": "Medium",
    "question": "How does the Two Pointers technique achieve O(N) time complexity on a sorted array for finding a target pair sum?",
    "options": [
      "By placing one pointer at the start and one at the end, moving inward based on whether the current sum is less than or greater than the target.",
      "By sorting the array repeatedly after every element comparison.",
      "By converting the array into a binary search tree in place.",
      "By checking all N*(N-1)/2 possible pairs using nested while loops."
    ],
    "correctAnswerIndex": 0,
    "explanation": "On a sorted array, if sum < target, incrementing the left pointer increases the sum; if sum > target, decrementing the right pointer decreases it. Each step eliminates a candidate in O(1), yielding O(N) total time."
  },
  {
    "id": "dsa-exp-7",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Sliding Window",
    "difficulty": "Medium",
    "question": "When is the Sliding Window pattern optimal for solving array/string problems?",
    "options": [
      "When calculating aggregates or conditions over contiguous subarrays or subsegments of fixed or dynamic length.",
      "When sorting an array using non-comparative bucket sort.",
      "When traversing all permutations of an arbitrary set.",
      "When balancing an unbalanced AVL tree."
    ],
    "correctAnswerIndex": 0,
    "explanation": "The Sliding Window pattern maintains a running state over a contiguous window as it advances, adding new incoming elements and subtracting outgoing elements in O(1) instead of recalculating from scratch."
  },
  {
    "id": "dsa-exp-8",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Tree Traversal",
    "difficulty": "Medium",
    "question": "Which depth-first traversal order on a Binary Search Tree (BST) visits nodes in strictly ascending numerical order?",
    "options": [
      "In-Order traversal (Left -> Node -> Right).",
      "Pre-Order traversal (Node -> Left -> Right).",
      "Post-Order traversal (Left -> Right -> Node).",
      "Level-Order traversal (Breadth-First)."
    ],
    "correctAnswerIndex": 0,
    "explanation": "In a BST, all nodes in the left subtree are smaller than the node, and all nodes in the right subtree are larger. Visiting Left -> Node -> Right guarantees ascending sorted order."
  },
  {
    "id": "dsa-exp-9",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Graph Search",
    "difficulty": "Medium",
    "question": "Why is Breadth-First Search (BFS) preferred over Depth-First Search (DFS) for finding the shortest path in an unweighted graph?",
    "options": [
      "BFS explores nodes layer by layer in order of distance from the source, guaranteeing the first time a destination is reached, it is via the fewest edges.",
      "DFS consumes significantly less memory than BFS on deep graphs.",
      "BFS sorts all graph vertices using QuickSort before traversing.",
      "DFS can only traverse directed acyclic graphs."
    ],
    "correctAnswerIndex": 0,
    "explanation": "BFS uses a FIFO queue to visit vertices in strictly increasing order of path length (distance 1, distance 2, etc.), ensuring the first path found to any target is minimal in an unweighted graph."
  },
  {
    "id": "dsa-exp-10",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Binary Heaps",
    "difficulty": "Medium",
    "question": "In a Min-Heap data structure, what invariant is guaranteed at every node?",
    "options": [
      "Every parent node’s value is less than or equal to the values of its children, with the minimum element at the root.",
      "The left child is always less than the parent and the right child is always greater.",
      "All leaf nodes must have identical values.",
      "The root node contains the median value of all stored elements."
    ],
    "correctAnswerIndex": 0,
    "explanation": "In a Min-Heap, the parent key is always <= its children’s keys. The global minimum element is always accessible at the root in O(1) time."
  },
  {
    "id": "dsa-exp-11",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "LRU Cache Design",
    "difficulty": "Hard",
    "question": "Which combination of data structures allows an LRU (Least Recently Used) cache to achieve O(1) time complexity for both get() and put() operations?",
    "options": [
      "A Hash Map paired with a Doubly Linked List.",
      "A Binary Search Tree paired with a Dynamic Array.",
      "A Min-Heap paired with a Singly Linked List.",
      "A B-Tree stored inside an indexed Redis cluster."
    ],
    "correctAnswerIndex": 0,
    "explanation": "The Hash Map provides O(1) lookup to find node pointers, while the Doubly Linked List allows O(1) removal and re-insertion of nodes to the front (most recently used) or tail (eviction candidate)."
  },
  {
    "id": "dsa-exp-12",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Trie Prefix Trees",
    "difficulty": "Hard",
    "question": "What is the time complexity to search for a word of length L in a Trie containing N words?",
    "options": [
      "O(L) time, completely independent of the total number of words N stored in the Trie.",
      "O(N * L) time, because all words in the Trie must be scanned.",
      "O(log N) time, using binary splitting at each character level.",
      "O(N²) time due to character collisions."
    ],
    "correctAnswerIndex": 0,
    "explanation": "A Trie traverses down child node edges corresponding to each character of the search word. Searching takes O(L) steps (where L is word length), regardless of how many millions of words exist in the Trie."
  },
  {
    "id": "dsa-exp-13",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Topological Sort",
    "difficulty": "Hard",
    "question": "Under what condition does Topological Sort fail, and what does this indicate about the graph?",
    "options": [
      "It fails if the graph contains a directed cycle, proving that no valid linear dependency ordering exists.",
      "It fails if any vertex has an in-degree of zero.",
      "It fails if the graph has an odd number of vertices.",
      "It fails if edge weights are non-negative."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Topological sort is strictly defined only for Directed Acyclic Graphs (DAGs). If a cycle exists (e.g. A depends on B and B depends on A), circular dependencies make linear ordering impossible."
  },
  {
    "id": "dsa-exp-14",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Dynamic Programming",
    "difficulty": "Hard",
    "question": "What are the two core properties a problem must possess to be solvable via Dynamic Programming?",
    "options": [
      "Optimal Substructure and Overlapping Subproblems.",
      "Greedy Choice Property and Infinite Search Space.",
      "Monotonic Sorting and Deterministic Finite Automata.",
      "Constant Time Lookups and Asymmetrical Recursion."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Dynamic Programming applies when an optimal solution to the problem contains optimal solutions to subproblems (Optimal Substructure), and recursive solutions encounter the same subproblems repeatedly (Overlapping Subproblems)."
  },
  {
    "id": "dsa-exp-15",
    "track": "cs",
    "topic": "Data Structures & Algorithms",
    "subtopic": "Monotonic Stack",
    "difficulty": "Hard",
    "question": "Why is a Monotonic Stack ideal for solving the \"Next Greater Element\" problem in O(N) total time?",
    "options": [
      "Each array element is pushed and popped at most once, maintaining elements in strictly monotonic order.",
      "It sorts the entire array in O(N log N) using a hidden heap.",
      "It uses multithreaded SIMD vector instructions on the CPU.",
      "It replaces recursive stack frames with circular buffer arrays."
    ],
    "correctAnswerIndex": 0,
    "explanation": "A monotonic stack maintains elements in increasing or decreasing order. As you iterate through the array, elements are resolved and popped once a greater element appears. Since each index is pushed and popped at most once, total time is O(N)."
  },
  {
    "id": "sql-exp-1",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Primary Keys",
    "difficulty": "Easy",
    "question": "What constraints are automatically enforced on a table column designated as a PRIMARY KEY in relational databases?",
    "options": [
      "UNIQUE and NOT NULL constraints, ensuring each row has a distinct, defined identifier.",
      "FOREIGN KEY and CHECK constraints automatically.",
      "AUTO_INCREMENT and ZEROFILL constraints across all databases.",
      "FULLTEXT and SPATIAL index requirements."
    ],
    "correctAnswerIndex": 0,
    "explanation": "A PRIMARY KEY uniquely identifies each record in a relational table. By definition of relational calculus, it implicitly enforces both UNIQUE values and NOT NULL constraints."
  },
  {
    "id": "sql-exp-2",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Inner Joins",
    "difficulty": "Easy",
    "question": "What does an INNER JOIN query return when joining Table A and Table B on a matching condition?",
    "options": [
      "Only the rows that satisfy the join condition in both tables.",
      "All rows from Table A and only matching rows from Table B.",
      "All rows from both tables, filling non-matching fields with NULL.",
      "The Cartesian product (A * B) of all records unconditionally."
    ],
    "correctAnswerIndex": 0,
    "explanation": "An INNER JOIN creates a new result table by combining column values of two tables based on the join predicate, returning only rows where the match condition evaluates to true in both tables."
  },
  {
    "id": "sql-exp-3",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Aggregate Functions & NULL",
    "difficulty": "Easy",
    "question": "How does COUNT(column_name) behave differently from COUNT(*) when a column contains NULL values?",
    "options": [
      "COUNT(column_name) ignores NULL values, whereas COUNT(*) counts all rows regardless of NULLs.",
      "COUNT(*) throws a runtime SQL syntax exception if any column is NULL.",
      "COUNT(column_name) replaces NULLs with zero and adds them to the total count.",
      "Both functions produce identical counts under all circumstances."
    ],
    "correctAnswerIndex": 0,
    "explanation": "COUNT(*) counts the total number of rows in the table. COUNT(column_name) only counts rows where that specific column contains a non-NULL value."
  },
  {
    "id": "sql-exp-4",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Pattern Matching",
    "difficulty": "Easy",
    "question": "In standard SQL LIKE clauses, what do the \"%\" and \"_\" wildcard symbols represent respectively?",
    "options": [
      "\"%\" matches zero or more characters; \"_\" matches exactly one single character.",
      "\"%\" matches exactly one character; \"_\" matches zero or more characters.",
      "Both symbols match arbitrary regular expressions.",
      "\"%\" matches numeric digits only; \"_\" matches alphabetical characters only."
    ],
    "correctAnswerIndex": 0,
    "explanation": "In ANSI SQL LIKE pattern matching, % represents any string of zero or more characters, while _ represents any single character."
  },
  {
    "id": "sql-exp-5",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Distinct Values",
    "difficulty": "Easy",
    "question": "What is the effect of including the DISTINCT keyword in a SELECT statement?",
    "options": [
      "It removes duplicate rows from the final result set so each returned row is unique.",
      "It forces the database engine to sort the output in descending numerical order.",
      "It encrypts distinct column values before returning them over the network.",
      "It prevents other concurrent transactions from writing to the table."
    ],
    "correctAnswerIndex": 0,
    "explanation": "SELECT DISTINCT filters out duplicate tuples across the selected columns, returning only distinct combinations of values."
  },
  {
    "id": "sql-exp-6",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Window Functions",
    "difficulty": "Medium",
    "question": "What is the key difference between RANK() and DENSE_RANK() window functions when encountering tied values?",
    "options": [
      "RANK() skips ranks after ties (e.g., 1, 2, 2, 4); DENSE_RANK() does not skip ranks (e.g., 1, 2, 2, 3).",
      "DENSE_RANK() assigns fractional ranks like 1.5; RANK() assigns integer ranks.",
      "RANK() can only be used with PostgreSQL; DENSE_RANK() can only be used with MySQL.",
      "DENSE_RANK() reverses the sort order automatically."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Both functions assign the same rank to identical values. However, RANK() leaves gaps in the sequence reflecting the number of tied rows, while DENSE_RANK() maintains a gapless sequence."
  },
  {
    "id": "sql-exp-7",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Common Table Expressions",
    "difficulty": "Medium",
    "question": "What is the primary readability and architectural advantage of Common Table Expressions (WITH cte AS (...))?",
    "options": [
      "They break complex nested subqueries into modular, named temporary result sets that can be referenced multiple times in the query.",
      "They automatically write query results to permanent tables on disk.",
      "They disable database query timeouts for long-running batch jobs.",
      "They convert SQL queries into GraphQL schema files."
    ],
    "correctAnswerIndex": 0,
    "explanation": "CTEs improve query readability and maintainability by defining temporary, named result sets before the main query, and can also be used recursively for hierarchical and graph data."
  },
  {
    "id": "sql-exp-8",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "B-Tree Indexes",
    "difficulty": "Medium",
    "question": "Why are B-Tree indexes particularly well-suited for database queries involving range predicates (e.g., BETWEEN, >, <)?",
    "options": [
      "B-Tree leaf nodes are linked in a sorted doubly linked list, enabling rapid sequential scans once the start boundary is located.",
      "B-Trees store data in unsorted hash buckets that eliminate disk I/O.",
      "B-Trees compress all numeric values using gzip before writing to disk.",
      "B-Trees execute range queries on CPU registers without accessing RAM."
    ],
    "correctAnswerIndex": 0,
    "explanation": "In a B+ Tree, keys are sorted and leaf nodes contain pointers to neighboring leaves. Finding the start value takes O(log N) tree traversal, followed by a fast sequential scan along the linked leaves."
  },
  {
    "id": "sql-exp-9",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Foreign Key Actions",
    "difficulty": "Medium",
    "question": "What happens when a referenced parent row is deleted in a relationship configured with ON DELETE CASCADE?",
    "options": [
      "All child rows in the foreign key table that reference that parent row are automatically deleted.",
      "The database engine throws a foreign key constraint violation error and rolls back.",
      "The foreign key column in child rows is silently updated to NULL.",
      "The parent row is moved to an archive table while child rows remain unchanged."
    ],
    "correctAnswerIndex": 0,
    "explanation": "ON DELETE CASCADE instructs the database to automatically propagate the deletion: when a parent record is deleted, all dependent child rows referencing it are automatically removed."
  },
  {
    "id": "sql-exp-10",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Three-Valued Logic",
    "difficulty": "Medium",
    "question": "In SQL Three-Valued Logic, what is the evaluation result of the expression: NULL = NULL?",
    "options": [
      "UNKNOWN (neither TRUE nor FALSE), which is why IS NULL must be used instead.",
      "TRUE, because both operands are null.",
      "FALSE, because null values are always unequal.",
      "A fatal compilation syntax error."
    ],
    "correctAnswerIndex": 0,
    "explanation": "In SQL, NULL represents an unknown value. Comparing two unknown values with = yields UNKNOWN. In WHERE clauses, rows are only returned if the predicate evaluates to TRUE, which is why IS NULL is required."
  },
  {
    "id": "sql-exp-11",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Transaction Isolation",
    "difficulty": "Hard",
    "question": "In the ANSI SQL transaction isolation hierarchy, what anomaly is prevented by REPEATABLE READ that is permitted under READ COMMITTED?",
    "options": [
      "Non-repeatable reads: where re-reading the same row within a transaction produces different data because another transaction modified and committed it.",
      "Dirty reads: where a transaction reads uncommitted changes from another transaction.",
      "Deadlocks: where two transactions lock each other indefinitely.",
      "Database server memory exhaustion."
    ],
    "correctAnswerIndex": 0,
    "explanation": "READ COMMITTED prevents dirty reads. REPEATABLE READ further guarantees that any row read during a transaction will retain identical values if read again, preventing non-repeatable reads."
  },
  {
    "id": "sql-exp-12",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Composite Indexes",
    "difficulty": "Hard",
    "question": "Given a composite index on (department_id, hire_date, salary), which of the following WHERE clauses CANNOT utilize this index effectively?",
    "options": [
      "WHERE hire_date = \"2023-01-01\" AND salary > 50000 (missing the leading column department_id).",
      "WHERE department_id = 5 AND hire_date = \"2023-01-01\"",
      "WHERE department_id = 10",
      "WHERE department_id = 2 AND hire_date = \"2023-06-15\" AND salary = 80000"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Composite indexes follow the Leftmost Prefix Rule. Queries must filter on the leading column (department_id) to traverse the index tree. Queries skipping the leading column cannot use the index efficiently."
  },
  {
    "id": "sql-exp-13",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Query Execution Plans",
    "difficulty": "Hard",
    "question": "When analyzing a query with EXPLAIN ANALYZE, why might the query optimizer choose a Sequential Scan (Seq Scan) over an Index Scan even if an index exists?",
    "options": [
      "When the query condition matches a large percentage of total rows, sequential disk reads are faster than random I/O index lookups.",
      "Because indexes are automatically disabled whenever a table exceeds 1,000 rows.",
      "Because Sequential Scans use asynchronous GPU vector execution.",
      "Because foreign keys disable index scans in relational engines."
    ],
    "correctAnswerIndex": 0,
    "explanation": "When a query retrieves a significant fraction of table rows (e.g. 20-30%+), sequential page reads have lower I/O overhead than repeatedly alternating between random index page lookups and table data pages."
  },
  {
    "id": "sql-exp-14",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Concurrency & Locking",
    "difficulty": "Hard",
    "question": "What is the purpose of appending FOR UPDATE to a SELECT statement in a transaction?",
    "options": [
      "It acquires exclusive row-level locks on the selected records, preventing concurrent transactions from modifying or locking them until commit.",
      "It immediately commits all pending database changes to disk.",
      "It converts read-only database replicas into writable primary masters.",
      "It drops the table after the query finishes executing."
    ],
    "correctAnswerIndex": 0,
    "explanation": "SELECT ... FOR UPDATE implements pessimistic locking. It locks the qualifying rows against concurrent modifications or competing FOR UPDATE locks until the holding transaction ends with COMMIT or ROLLBACK."
  },
  {
    "id": "sql-exp-15",
    "track": "data",
    "topic": "SQL & Database Systems",
    "subtopic": "Database Normalization",
    "difficulty": "Hard",
    "question": "What is the primary condition required for a relational database schema to satisfy Third Normal Form (3NF)?",
    "options": [
      "It must be in 2NF and have no transitive functional dependencies (non-key attributes must depend solely on candidate keys).",
      "Every column must store multiple comma-separated values in an array.",
      "All tables must have at least three composite foreign key relationships.",
      "Data must be partitioned horizontally across at least three cloud storage nodes."
    ],
    "correctAnswerIndex": 0,
    "explanation": "A table is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on any candidate key (in short: every non-key attribute must depend on \"the key, the whole key, and nothing but the key\")."
  },
  {
    "id": "css-exp-1",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "CSS Box Model",
    "difficulty": "Easy",
    "question": "How does setting box-sizing: border-box affect the calculated width and height of an element?",
    "options": [
      "The element’s declared width and height include padding and borders, preventing layout blowouts when padding is added.",
      "Padding and borders are added outside the declared width and height.",
      "The element ignores all margin properties declared in stylesheets.",
      "It forces the browser to render the element as an SVG polygon."
    ],
    "correctAnswerIndex": 0,
    "explanation": "With box-sizing: border-box, padding and border thicknesses are absorbed within the specified width and height, ensuring the total rendered dimension matches the declared value."
  },
  {
    "id": "css-exp-2",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Flexbox Alignment",
    "difficulty": "Easy",
    "question": "Which CSS Flexbox properties center child content both horizontally and vertically inside a row-oriented flex container?",
    "options": [
      "justify-content: center; align-items: center;",
      "text-align: center; vertical-align: middle;",
      "margin: auto; float: center;",
      "display: block; center: true;"
    ],
    "correctAnswerIndex": 0,
    "explanation": "In a flex container with flex-direction: row, justify-content: center aligns items along the main (horizontal) axis, while align-items: center centers them along the cross (vertical) axis."
  },
  {
    "id": "css-exp-3",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Specificity Hierarchy",
    "difficulty": "Easy",
    "question": "Rank the following CSS selector categories in order of increasing specificity weight:",
    "options": [
      "Type/Element selector < Class/Attribute selector < ID selector < Inline style attribute",
      "Inline style < ID selector < Class selector < Element selector",
      "ID selector < Type selector < Class selector < Inline style",
      "Class selector < ID selector < Type selector < Inline style"
    ],
    "correctAnswerIndex": 0,
    "explanation": "CSS specificity is calculated in tiers: Type selectors (0,0,1) < Classes, attributes, and pseudo-classes (0,1,0) < IDs (1,0,0) < Inline styles (1,0,0,0)."
  },
  {
    "id": "css-exp-4",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Units & Scaling",
    "difficulty": "Easy",
    "question": "What is the key difference between the rem unit and the em unit in CSS font sizing?",
    "options": [
      "rem scales relative to the root <html> font-size; em scales relative to the font-size of the element’s immediate parent.",
      "rem is a physical millimeter unit; em is an abstract viewport percentage.",
      "em is fixed at 16px across all devices; rem adapts to screen orientation.",
      "rem can only be used with media queries; em can only be used inside CSS Grid."
    ],
    "correctAnswerIndex": 0,
    "explanation": "rem (root em) always references the font-size of the root element (<html>), avoiding compounding cascading multiplication issues common with nested em units."
  },
  {
    "id": "css-exp-5",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Hiding Elements",
    "difficulty": "Easy",
    "question": "What is the visual and layout difference between display: none and visibility: hidden?",
    "options": [
      "display: none removes the element from the document flow; visibility: hidden hides the element while preserving its physical layout space.",
      "visibility: hidden deletes the DOM node entirely from memory.",
      "display: none reduces opacity to 0.1; visibility: hidden removes CSS classes.",
      "Both properties behave identically in all modern rendering engines."
    ],
    "correctAnswerIndex": 0,
    "explanation": "display: none causes the element to produce no box in the layout tree. visibility: hidden renders an invisible box that still occupies its calculated geometric width and height."
  },
  {
    "id": "css-exp-6",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "CSS Grid Auto-Placement",
    "difficulty": "Medium",
    "question": "In CSS Grid, how does grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) behave when there are few items on a wide viewport?",
    "options": [
      "auto-fit collapses empty tracks to 0px, allowing the existing items to expand and fill the available container width.",
      "auto-fit creates empty empty placeholder tracks of 200px each across the screen.",
      "auto-fit forces items to wrap into a single vertical column.",
      "auto-fit triggers a JavaScript window resize event."
    ],
    "correctAnswerIndex": 0,
    "explanation": "auto-fit drops empty tracks and stretches the filled tracks across the full container width. auto-fill keeps empty tracks allocated, preventing items from expanding."
  },
  {
    "id": "css-exp-7",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Stacking Context",
    "difficulty": "Medium",
    "question": "Which of the following CSS declarations triggers the creation of a new stacking context on an element?",
    "options": [
      "opacity: 0.95 (or any value less than 1), or transform: translate(0, 0)",
      "margin: 0 auto",
      "color: #ffffff",
      "border: 1px solid black"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Properties like opacity < 1, transform, filter, will-change, and position: fixed create a new stacking context, isolating the z-index stacking of its children from the outer page."
  },
  {
    "id": "css-exp-8",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "CSS Custom Properties",
    "difficulty": "Medium",
    "question": "What makes CSS Custom Properties (--variable-name) superior to preprocessor variables (like Sass $variable)?",
    "options": [
      "CSS Custom Properties participate in the DOM cascade, can be updated dynamically at runtime via JavaScript, and respect media queries.",
      "CSS Custom Properties compile into binary WebAssembly modules.",
      "CSS variables can only store encrypted cryptographic keys.",
      "Preprocessor variables cannot be used with colors."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Native CSS variables exist in the live browser DOM. They inherit down the tree, can be overridden per component scope, react to media queries, and update in real-time with element.style.setProperty()."
  },
  {
    "id": "css-exp-9",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Fluid Typography",
    "difficulty": "Medium",
    "question": "What is the purpose of the modern CSS clamp() function in responsive design (e.g. font-size: clamp(1rem, 2.5vw, 2rem))?",
    "options": [
      "It clamps a fluid scaling value between a defined minimum floor and a maximum ceiling without requiring multiple media queries.",
      "It restricts user text selection in responsive tables.",
      "It compresses long text strings with an ellipsis (...) overflow.",
      "It synchronizes font loading across background service workers."
    ],
    "correctAnswerIndex": 0,
    "explanation": "clamp(MIN, VAL, MAX) allows values to scale smoothly with viewport units while ensuring they never shrink below the minimum or grow beyond the maximum threshold."
  },
  {
    "id": "css-exp-10",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Flexbox Shorthand",
    "difficulty": "Medium",
    "question": "What do the three values in the shorthand property flex: 1 0 auto represent in order?",
    "options": [
      "flex-grow: 1, flex-shrink: 0, flex-basis: auto",
      "flex-basis: 1, flex-direction: 0, flex-wrap: auto",
      "flex-shrink: 1, flex-grow: 0, flex-align: auto",
      "flex-order: 1, flex-columns: 0, flex-gap: auto"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The flex shorthand specifies flex-grow (ability to expand), flex-shrink (ability to shrink), and flex-basis (default size before distributing remaining space) in that exact sequence."
  },
  {
    "id": "css-exp-11",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Container Queries",
    "difficulty": "Hard",
    "question": "How do CSS Container Queries (@container) solve the classic modular component problem where Media Queries (@media) fall short?",
    "options": [
      "They apply styles based on the width or height of the component’s parent container rather than the overall browser viewport.",
      "They allow CSS to inspect the user’s operating system battery level.",
      "They containerize CSS files inside Docker containers for edge delivery.",
      "They prevent child elements from inheriting any CSS custom properties."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Media queries only evaluate the global viewport dimensions. Container queries allow a component (like a card) to adapt its layout based on the exact width of the column or slot it is placed in."
  },
  {
    "id": "css-exp-12",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": ":has() Relational Selector",
    "difficulty": "Hard",
    "question": "Why is the CSS :has() pseudo-class often described as a \"parent selector\"?",
    "options": [
      "It allows you to style an ancestor or preceding element based on the presence or state of matching descendant or sibling elements.",
      "It links HTML components to their parent React class constructor.",
      "It permanently attaches child styles to the document <body> element.",
      "It executes a JavaScript querySelector call behind the scenes."
    ],
    "correctAnswerIndex": 0,
    "explanation": ":has() enables selecting and styling a parent or previous element if it contains or is followed by elements matching a specified selector (e.g. form:has(input:invalid))."
  },
  {
    "id": "css-exp-13",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Rendering Optimization",
    "difficulty": "Hard",
    "question": "What performance benefit does content-visibility: auto provide for long, content-rich web pages?",
    "options": [
      "It instructs the browser engine to skip layout and rendering work for elements currently off-screen until the user scrolls near them.",
      "It pre-loads all off-screen images into browser cache before page load.",
      "It converts HTML text into pre-rendered SVG canvas elements.",
      "It reduces CSS bundle sizes by minifying selectors at runtime."
    ],
    "correctAnswerIndex": 0,
    "explanation": "content-visibility: auto tells the browser rendering engine to skip the layout and painting phases for off-screen elements, drastically reducing initial page load time and memory usage."
  },
  {
    "id": "css-exp-14",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "CSS Subgrid",
    "difficulty": "Hard",
    "question": "What architectural limitation does CSS Subgrid (grid-template-columns: subgrid) overcome?",
    "options": [
      "It allows nested grid items to align directly with the parent grid’s track lines, creating consistent alignment across nested component boundaries.",
      "It enables 3D perspective transformations inside 2D table columns.",
      "It eliminates the need for any CSS stylesheets in web applications.",
      "It forces all grid tracks to animate synchronously at 60fps."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Standard CSS Grid creates isolated grid contexts for children. Subgrid allows a child element that is itself a grid to adopt and align with the track rows and columns of its parent grid."
  },
  {
    "id": "css-exp-15",
    "track": "webdev",
    "topic": "CSS & Responsive Design",
    "subtopic": "Hardware Acceleration",
    "difficulty": "Hard",
    "question": "What is the trade-off of misusing or overusing the will-change CSS property across many elements?",
    "options": [
      "Excessive will-change promotes too many elements to dedicated GPU composite layers, consuming massive amounts of video memory and degrading performance.",
      "It prevents the browser from loading external font files.",
      "It converts hardware-accelerated animations into software CPU reflows.",
      "It causes JavaScript setTimeout timers to stop executing."
    ],
    "correctAnswerIndex": 0,
    "explanation": "will-change signals the browser to promote an element to its own GPU layer ahead of time. Overusing it on many elements creates excessive GPU composite layers, exhausting device VRAM and causing stutter."
  }
];

/**
 * Combined master and expanded question pool for rich local variation.
 */
export const ALL_LOCAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...MASTER_QUIZ_BANK,
  ...EXPANDED_QUIZ_BANK
];

export function getAvailableTopicsWithCounts(): {
  id: string;
  name: string;
  description: string;
  icon: string;
  track: string;
  totalCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}[] {
  return AVAILABLE_TOPICS.map((topic) => {
    const questions = MASTER_QUIZ_BANK.filter((q) => q.topic === topic.name);
    return {
      ...topic,
      totalCount: questions.length,
      easyCount: questions.filter((q) => q.difficulty === 'Easy').length,
      mediumCount: questions.filter((q) => q.difficulty === 'Medium').length,
      hardCount: questions.filter((q) => q.difficulty === 'Hard').length
    };
  });
}

/**
 * Checks if a topic string or topic ID is supported.
 */
export function isTopicSupported(topicIdOrName: string): boolean {
  if (topicIdOrName === 'all') return true;
  return AVAILABLE_TOPICS.some(
    (t) => t.id === topicIdOrName || t.name === topicIdOrName
  );
}


// =========================================================================
// QUESTION NORMALIZATION, SIMILARITY DETECTION & SEEN TRACKING
// =========================================================================

export const RECENT_QUIZ_STORAGE_KEY = 'smartbridge_recent_quiz_q_ids_v1';
export const SEEN_QUESTIONS_STORAGE_KEY = 'smartbridge_seen_quiz_questions_v2';
export const LEGACY_QUIZ_HISTORY_KEY = 'smartbridge_quiz_history_v1';

export interface SeenQuestionEntry {
  id: string;
  normalizedText: string;
  topic: string;
  difficulty?: string;
  seenCount: number;
  lastSeenAt: string;
}

/**
 * Normalizes question text by lowercasing, stripping leading numbers or labels,
 * stripping code backticks/punctuation, and collapsing whitespace.
 */
export function normalizeQuestionText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/^(\d+[\.\)]\s*|q:\s*|question:\s*)/i, '')
    .replace(/[`"'“”‘’]/g, '')
    .replace(/[\?\!\.,;:—\-\(\)\[\]\{\}\/\\_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const COMMON_STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'and', 'or', 'not', 'that', 'this', 'these', 'those',
  'what', 'which', 'who', 'whom', 'whose', 'why', 'how', 'when', 'where',
  'can', 'could', 'should', 'would', 'will', 'does', 'used', 'using'
]);

export function getQuestionKeyWords(normalizedText: string): Set<string> {
  const words = normalizedText.split(/\s+/).filter((w) => w.length > 2 && !COMMON_STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Checks if two question texts are semantically duplicate or near-identical
 * using token Jaccard similarity.
 */
export function isQuestionSimilar(textA: string, textB: string, threshold = 0.70): boolean {
  const normA = normalizeQuestionText(textA);
  const normB = normalizeQuestionText(textB);
  if (normA === normB) return true;

  const wordsA = getQuestionKeyWords(normA);
  const wordsB = getQuestionKeyWords(normB);
  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++;
  });
  const union = new Set([...wordsA, ...wordsB]).size;
  if (union === 0) return false;
  return (intersection / union) >= threshold;
}

/**
 * Loads the persistent seen questions tracker, automatically incorporating past attempts
 * from smartbridge_quiz_history_v1 for backward compatibility.
 */
export function getSeenQuestionsTracker(): SeenQuestionEntry[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SEEN_QUESTIONS_STORAGE_KEY) : null;
    let seenMap: Record<string, SeenQuestionEntry> = {};

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((entry) => {
          if (entry && entry.id) {
            seenMap[entry.id] = entry;
          }
        });
      }
    }

    // Also ingest historical records from smartbridge_quiz_history_v1
    try {
      const historyRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(LEGACY_QUIZ_HISTORY_KEY) : null;
      if (historyRaw) {
        const historyArr = JSON.parse(historyRaw);
        if (Array.isArray(historyArr)) {
          historyArr.forEach((attempt) => {
            if (Array.isArray(attempt?.answeredHistory)) {
              attempt.answeredHistory.forEach((ans: any) => {
                if (ans && ans.questionId && !seenMap[ans.questionId]) {
                  seenMap[ans.questionId] = {
                    id: ans.questionId,
                    normalizedText: normalizeQuestionText(ans.questionText || ''),
                    topic: ans.topic || attempt.track || 'General Practice',
                    seenCount: 1,
                    lastSeenAt: attempt.completedAt || new Date().toISOString()
                  };
                }
              });
            }
          });
        }
      }
    } catch {}

    return Object.values(seenMap);
  } catch {
    return [];
  }
}

/**
 * Records newly presented questions into both bounded recent IDs and long-term seen tracker.
 */
export function recordSeenQuestions(questions: QuizQuestion[]): void {
  try {
    if (typeof localStorage === 'undefined' || !Array.isArray(questions) || questions.length === 0) return;

    // 1. Update recent IDs (bounded at 25)
    const existingRecent = getRecentQuizQuestionIds();
    const newIds = questions.map((q) => q.id);
    const combinedRecent = Array.from(new Set([...newIds, ...existingRecent])).slice(0, 25);
    localStorage.setItem(RECENT_QUIZ_STORAGE_KEY, JSON.stringify(combinedRecent));

    // 2. Update persistent seen questions tracker
    const existingSeen = getSeenQuestionsTracker();
    const seenMap: Record<string, SeenQuestionEntry> = {};
    existingSeen.forEach((e) => {
      seenMap[e.id] = e;
    });

    const now = new Date().toISOString();
    questions.forEach((q) => {
      const current = seenMap[q.id];
      if (current) {
        current.seenCount = (current.seenCount || 1) + 1;
        current.lastSeenAt = now;
      } else {
        seenMap[q.id] = {
          id: q.id,
          normalizedText: normalizeQuestionText(q.question),
          topic: q.topic || 'General Practice',
          difficulty: q.difficulty,
          seenCount: 1,
          lastSeenAt: now
        };
      }
    });

    localStorage.setItem(SEEN_QUESTIONS_STORAGE_KEY, JSON.stringify(Object.values(seenMap)));
  } catch {
    // Fail-safe if storage quota exceeded
  }
}

/**
 * Resets seen question history for a given topic or for all topics.
 */
export function clearSeenQuestionsTracker(topic?: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (!topic || topic === 'all') {
      localStorage.removeItem(SEEN_QUESTIONS_STORAGE_KEY);
      localStorage.removeItem(RECENT_QUIZ_STORAGE_KEY);
      return;
    }

    const current = getSeenQuestionsTracker();
    const matchedMeta = AVAILABLE_TOPICS.find((t) => t.id === topic || t.name === topic);
    const topicName = matchedMeta ? matchedMeta.name : topic;

    const remaining = current.filter((e) => e.topic !== topicName && e.topic !== topic);
    localStorage.setItem(SEEN_QUESTIONS_STORAGE_KEY, JSON.stringify(remaining));

    // Remove matching IDs from recent
    const recent = getRecentQuizQuestionIds();
    const matchingIds = new Set(current.filter((e) => e.topic === topicName || e.topic === topic).map((e) => e.id));
    const filteredRecent = recent.filter((id) => !matchingIds.has(id));
    localStorage.setItem(RECENT_QUIZ_STORAGE_KEY, JSON.stringify(filteredRecent));
  } catch {}
}

export function getRecentQuizQuestionIds(): string[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(RECENT_QUIZ_STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordRecentQuizQuestionIds(newIds: string[]): void {
  try {
    if (typeof localStorage === 'undefined' || !Array.isArray(newIds) || newIds.length === 0) return;
    const existing = getRecentQuizQuestionIds();
    const combined = Array.from(new Set([...newIds, ...existing])).slice(0, 25);
    localStorage.setItem(RECENT_QUIZ_STORAGE_KEY, JSON.stringify(combined));
  } catch {}
}

/**
 * Checks whether a candidate question has been previously seen by the user.
 */
export function isQuestionSeen(
  q: QuizQuestion,
  seenEntries: SeenQuestionEntry[],
  excludeRecentIds: string[] = []
): boolean {
  if (excludeRecentIds.includes(q.id)) return true;
  if (seenEntries.some((e) => e.id === q.id)) return true;

  const candidateNorm = normalizeQuestionText(q.question);
  if (seenEntries.some((e) => e.normalizedText === candidateNorm)) return true;

  // Check similarity against seen questions
  if (seenEntries.some((e) => isQuestionSimilar(q.question, e.normalizedText, 0.72))) {
    return true;
  }

  return false;
}

/**
 * Selects a fresh set of questions for Quick Diagnostic Mode across tracks.
 */
export function getDiagnosticQuestions(
  track: string = 'all',
  count: number = 3,
  excludeIds: string[] = []
): QuizQuestion[] {
  let pool = ALL_LOCAL_QUIZ_QUESTIONS;
  if (track !== 'all') {
    pool = pool.filter((q) => q.track === track);
  }

  const seen = getSeenQuestionsTracker();
  const unseen = pool.filter((q) => !isQuestionSeen(q, seen, excludeIds));

  // Fisher-Yates shuffle
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const candidatePool = unseen.length >= count ? shuffle(unseen) : [...shuffle(unseen), ...shuffle(pool)];
  const result: QuizQuestion[] = [];
  const chosenIds = new Set<string>();

  for (const q of candidatePool) {
    if (!chosenIds.has(q.id) && !result.some((r) => isQuestionSimilar(r.question, q.question))) {
      chosenIds.add(q.id);
      result.push(q);
      if (result.length >= count) break;
    }
  }

  return result;
}

export interface CustomQuizRequestParams {
  topicId: string;
  difficulty: 'Any' | 'Easy' | 'Medium' | 'Hard';
  requestedCount: number;
  seed?: number;
  excludeRecentIds?: string[];
  excludeSimilarTexts?: string[];
  isPreview?: boolean;
}

export interface CustomQuizResult {
  questions: QuizQuestion[];
  availableCount: number;
  unseenAvailableCount: number;
  isExhausted: boolean;
  exhaustedMessage?: string;
  error?: string;
}

/**
 * Retrieves questions based on user's setup parameters.
 * Guarantees zero duplicate questions within an attempt.
 * Produces fresh, varied, non-repeating question sets across attempts using persistent seen tracking.
 * When the pool for a specific topic/difficulty is exhausted, provides clear exhaustion reporting.
 */
export function getQuestionsForCustomQuiz(params: CustomQuizRequestParams): CustomQuizResult {
  const { topicId, difficulty, requestedCount, seed, excludeRecentIds = [], isPreview = false } = params;

  // 1. Topic filtering
  // In preview mode: use MASTER_QUIZ_BANK to preserve deterministic setup counts & capping checks
  let pool = isPreview ? MASTER_QUIZ_BANK : ALL_LOCAL_QUIZ_QUESTIONS;

  if (topicId !== 'all') {
    const matchedMeta = AVAILABLE_TOPICS.find((t) => t.id === topicId || t.name === topicId);
    if (!matchedMeta) {
      return {
        questions: [],
        availableCount: 0,
        unseenAvailableCount: 0,
        isExhausted: false,
        error: `The topic "${topicId}" is not currently supported in the question bank.`
      };
    }
    pool = pool.filter((q) => q.topic === matchedMeta.name);
  }

  // 2. Difficulty filtering
  if (difficulty !== 'Any') {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  const availableCount = pool.length;

  if (availableCount === 0) {
    return {
      questions: [],
      availableCount: 0,
      unseenAvailableCount: 0,
      isExhausted: true,
      exhaustedMessage: `No questions found matching topic "${topicId}" with difficulty "${difficulty}". Please select different criteria.`,
      error: `No questions found matching topic "${topicId}" with difficulty "${difficulty}". Please select different criteria.`
    };
  }

  const targetCount = Math.min(requestedCount, availableCount);

  // If preview mode, return deterministic first slice without altering order
  if (isPreview) {
    return {
      questions: pool.slice(0, targetCount),
      availableCount,
      unseenAvailableCount: availableCount,
      isExhausted: false
    };
  }

  // 3. Question variation & selection algorithm
  // When seed is provided, use seeded PRNG shuffle for controlled randomized tests
  if (seed !== undefined) {
    let state = Math.abs(seed) || 12345;
    const rng = (): number => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return {
      questions: shuffled.slice(0, targetCount),
      availableCount,
      unseenAvailableCount: shuffled.length,
      isExhausted: false
    };
  }

  // Live / standard mode:
  // Identify seen questions using persistent tracker + recent IDs
  const seenTracker = getSeenQuestionsTracker();
  const unseen = pool.filter((q) => !isQuestionSeen(q, seenTracker, excludeRecentIds));
  const seen = pool.filter((q) => isQuestionSeen(q, seenTracker, excludeRecentIds));

  const isExhausted = unseen.length < targetCount;
  const topicLabel = topicId === 'all' ? 'this criteria' : AVAILABLE_TOPICS.find((t) => t.id === topicId)?.name || topicId;
  const exhaustedMessage = isExhausted
    ? `You have explored all ${availableCount} offline questions for ${topicLabel}${difficulty !== 'Any' ? ' (' + difficulty + ')' : ''}. Showing a refreshed review mix, or reset your tracker below.`
    : undefined;

  // Helper for Fisher-Yates shuffle
  const fyShuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Special preservation for clean first attempt (e.g., initial test runs):
  // If recent IDs are empty and no questions for this topic were seen yet, maintain base order
  const hasSeenForThisTopic = seen.length > 0;
  let candidatePool: QuizQuestion[];

  if (excludeRecentIds.length === 0 && !hasSeenForThisTopic) {
    candidatePool = [...unseen, ...seen];
  } else {
    // Shuffled unseen questions first
    const shuffledUnseen = fyShuffle(unseen);

    // For seen questions, sort by lowest seenCount (least practiced) first, then shuffle among equals
    const shuffledSeen = [...seen].sort((a, b) => {
      const entryA = seenTracker.find((e) => e.id === a.id);
      const entryB = seenTracker.find((e) => e.id === b.id);
      const countA = entryA ? entryA.seenCount : 0;
      const countB = entryB ? entryB.seenCount : 0;
      return countA - countB;
    });

    candidatePool = [...shuffledUnseen, ...shuffledSeen];
  }

  // Strict deduplication: ensure no duplicate IDs and no semantically similar questions in attempt
  const selected: QuizQuestion[] = [];
  const chosenIds = new Set<string>();

  for (const q of candidatePool) {
    if (chosenIds.has(q.id)) continue;
    // Check similarity against already selected questions in this attempt
    const isSimilarToSelected = selected.some((s) => isQuestionSimilar(s.question, q.question));
    if (isSimilarToSelected) continue;

    chosenIds.add(q.id);
    selected.push(q);
    if (selected.length >= targetCount) break;
  }

  // Fallback in rare case similarity filtering resulted in fewer than targetCount
  if (selected.length < targetCount) {
    for (const q of candidatePool) {
      if (!chosenIds.has(q.id)) {
        chosenIds.add(q.id);
        selected.push(q);
        if (selected.length >= targetCount) break;
      }
    }
  }

  return {
    questions: selected,
    availableCount,
    unseenAvailableCount: unseen.length,
    isExhausted,
    exhaustedMessage
  };
}

export function analyzeQuizTopicPerformance(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, number>
): QuizTopicBreakdown[] {
  const topicMap = new Map<string, { correct: number; total: number }>();

  questions.forEach((q) => {
    const topicName = q.topic || 'General Practice';
    if (!topicMap.has(topicName)) {
      topicMap.set(topicName, { correct: 0, total: 0 });
    }
    const current = topicMap.get(topicName)!;
    current.total += 1;

    const chosenIdx = selectedAnswers[q.id];
    if (chosenIdx !== undefined && chosenIdx === q.correctAnswerIndex) {
      current.correct += 1;
    }
  });

  const breakdowns: QuizTopicBreakdown[] = [];

  topicMap.forEach((stats, topicName) => {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const isWeak = stats.total >= MIN_QUESTIONS_FOR_WEAK_ASSESSMENT && pct < WEAK_TOPIC_ACCURACY_THRESHOLD;
    const insufficientEvidence = stats.total < MIN_QUESTIONS_FOR_WEAK_ASSESSMENT;

    breakdowns.push({
      topic: topicName,
      correct: stats.correct,
      total: stats.total,
      percentage: pct,
      isWeak,
      insufficientEvidence
    });
  });

  // Sort weak topics to the top, then by lowest percentage
  return breakdowns.sort((a, b) => {
    if (a.isWeak && !b.isWeak) return -1;
    if (!a.isWeak && b.isWeak) return 1;
    return a.percentage - b.percentage;
  });
}

