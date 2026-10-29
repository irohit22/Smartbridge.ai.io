import { storage, STORAGE_KEYS } from './storage';
import type { GeneratedNote, Flashcard, RevisionTask } from '../types';

export interface UserSkillProfile {
  primarySkill: string;
  skillCategory: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  selectedAt: string;
  isFirstTimeCompleted: boolean;
}

export interface SkillDefinition {
  id: string;
  name: string;
  icon: string;
  category: string;
  tagline: string;
  description: string;
  everydayAnalogy: {
    english: string;
    hinglish: string;
  };
  keyConcepts: {
    title: string;
    simpleExplanation: string;
    analogy: string;
    codeSnippet?: string;
  }[];
  tutorPrompts: string[];
  defaultSubject: string;
  suggestedNoteTopics: string[];
  defaultNote: GeneratedNote;
  flashcards: Flashcard[];
  revisionTasks: RevisionTask[];
  careerRoles: {
    title: string;
    area: string;
    reason: string;
    recommendedSkills: string[];
  }[];
  quizTopicId: string;
}

export const PRESET_SKILLS: SkillDefinition[] = [
  // 1. PYTHON
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    category: 'Programming & Data',
    tagline: 'Simple, beginner-friendly language with clean syntax and versatile power.',
    description: 'Python reads almost like everyday English. Used everywhere from automating daily tasks to data science and AI.',
    everydayAnalogy: {
      english:
        'Variables are like labeled kitchen spice boxes where you store ingredients. Loops are like doing 10 pushups one by one (count starts at 1 and stops at 10). Functions are like a mixer grinder: give it fruit and milk (inputs), it blends them, and outputs a delicious milkshake (return value).',
      hinglish:
        'Python ko samjho bilkul seedhi English jaisi language! Variables matlab kitchen ke labeled dabbe jisme cheez rakhte hain. Loops matlab 10 pushups ek-ek karke lagana. Aur Functions matlab ek mixer grinder — aam aur doodh dalo (inputs), andar blend hoga, aur mast mango shake bahar milega (return value)!'
    },
    keyConcepts: [
      {
        title: 'Variables & Data Types',
        simpleExplanation: 'Variables hold information so you can use it later without typing it again.',
        analogy: 'A labeled box with a tag on it. Change what is inside anytime.',
        codeSnippet: `# Labeled storage box for student score\nstudent_name = "Aman"\nscore = 92\nis_passed = True\n\nprint(f"{student_name} got {score}/100! Passed: {is_passed}")`
      },
      {
        title: 'For & While Loops',
        simpleExplanation: 'Repeat a block of code multiple times automatically instead of writing it again and again.',
        analogy: 'Doing 10 repetitions of pushups. You check: are we at 10 yet? If not, do one more.',
        codeSnippet: `# Doing 5 pushups one by one\nfor pushup in range(1, 6):\n    print(f"Pushup #{pushup} completed! 💪")\nprint("Workout done! Take rest.")`
      },
      {
        title: 'Functions (def)',
        simpleExplanation: 'A reusable recipe or machine that takes inputs, performs work, and returns an output.',
        analogy: 'A mixer grinder that turns ingredients into juice.',
        codeSnippet: `def mixer_grinder(fruit: str, liquid: str) -> str:\n    # Process ingredients\n    drink = f"Fresh {fruit} {liquid} shake"\n    return drink\n\nmy_shake = mixer_grinder("Mango", "Milk")\nprint(my_shake)  # Output: Fresh Mango Milk shake`
      }
    ],
    tutorPrompts: [
      'Explain Python variables with the kitchen spice box analogy',
      'What are Python loops in simple Hinglish? (Pushups analogy)',
      'How does a Python function work like a mixer grinder?',
      'Explain Python lists vs dictionaries with everyday examples',
      'How do Python if-else conditions work in plain English?',
      'Write a simple Python program to calculate student grades step by step'
    ],
    defaultSubject: 'Python Programming & Software Engineering',
    suggestedNoteTopics: [
      'Python Fundamentals: Variables, Loops & Functions',
      'Python Data Structures: Lists, Tuples & Dictionaries',
      'Python Object Oriented Programming (OOP) in Simple Words',
      'Python File Handling & Exception Handling Explained'
    ],
    defaultNote: {
      id: 'note-python-starter',
      topic: 'Python Fundamentals: Variables, Loops & Functions',
      title: 'Python Starter Guide: Everyday Analogies & Core Patterns',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. What is Python & Everyday Mental Model',
          content:
            'Python is designed to be readable and intuitive. You do not need semicolons or confusing curly braces.\n\n• **Variables**: A labeled kitchen box where you store sugar or spices. When you write `age = 20`, you put the number 20 into a box named `age`.\n• **Loops**: Like doing 10 pushups one by one. You repeat the exercise until the target count is reached.\n• **Functions**: Like a kitchen mixer grinder. You pass ingredients (arguments), it processes them, and returns fresh juice.'
        },
        {
          heading: '2. Working Code Example with Line-by-Line Breakdown',
          code: `# 1. Define a function (Mixer Grinder)\ndef make_juice(fruit, water_glasses):\n    # 2. Check if we have enough water\n    if water_glasses < 1:\n        return "Need at least 1 glass of water!"\n    # 3. Create the juice string\n    return f"{fruit} juice is ready for 2 people!"\n\n# 4. Use a loop to prepare juice for 3 orders\norders = ["Mango", "Orange", "Apple"]\nfor fruit_name in orders:\n    result = make_juice(fruit_name, 2)\n    print(f"Order: {result}")`,
          content:
            '• Line 2: `def make_juice` creates our reusable machine.\n• Line 4: `if water_glasses < 1` is an everyday safety check.\n• Line 9: `orders` is a Python List holding multiple items in order.\n• Line 10: `for fruit_name in orders` visits each fruit in line one by one.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** In Python, code reads like normal sentences. Use variables to hold data, loops to repeat actions without repetitive typing, and functions to package reusable logic.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** What happens if you define a function but never call it?\n*Answer:* Python stores the instructions in memory, but none of the code inside actually executes until you call it!\n\n**Q2:** In `for i in range(1, 4):`, what numbers will `i` be?\n*Answer:* 1, 2, and 3. In Python, the stop number (4) is excluded.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-py-1',
        subject: 'Python Core',
        question: 'What is the everyday difference between a Python List and a Dictionary?',
        answer:
          'A List is an ordered shopping list (item 0, item 1, item 2). A Dictionary is a phonebook or kitchen spice rack with specific labeled tags (key: value), like "roll_number": 42.',
        rationale: 'Lists use numbered indices [0]; Dictionaries use named keys ["name"].'
      },
      {
        id: 'fc-py-2',
        subject: 'Python Logic',
        question: 'Why do we use functions instead of copying and pasting code?',
        answer:
          'Functions let you write code once and reuse it anywhere. If you find a bug, you only fix it in one place (inside the function), instead of 50 different places.',
        rationale: 'DRY principle: Don\'t Repeat Yourself.'
      },
      {
        id: 'fc-py-3',
        subject: 'Python Memory',
        question: 'What is the difference between a mutable and immutable type in Python?',
        answer:
          'Mutable objects (like Lists and Dictionaries) can be modified in place. Immutable objects (like Integers and Strings) cannot be altered once created; any change creates a brand new object.',
        rationale: 'Strings and numbers are safe from unexpected side-effects because they cannot be mutated.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-py-1',
        title: 'Master Python Loops & Pushup Analogy',
        subject: 'Python Core',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 10,
        memoryScore: 85
      },
      {
        id: 'task-py-2',
        title: 'Build a Simple Function (Mixer Grinder)',
        subject: 'Python Core',
        priority: 'High',
        dueText: 'Due tomorrow',
        completed: false,
        estimatedMinutes: 15,
        memoryScore: 75
      },
      {
        id: 'task-py-3',
        title: 'Practice Lists vs Dictionaries with Real Data',
        subject: 'Data Structures in Python',
        priority: 'Medium',
        dueText: 'Due in 2 days',
        completed: false,
        estimatedMinutes: 12,
        memoryScore: 60
      }
    ],
    careerRoles: [
      {
        title: 'Junior Python Developer',
        area: 'Software Development',
        reason: 'Builds backend APIs, automates business workflows, and writes clean modular Python code.',
        recommendedSkills: ['Python', 'FastAPI or Flask', 'Git', 'SQL basics']
      },
      {
        title: 'Data Analyst Intern',
        area: 'Data Science & Analytics',
        reason: 'Uses Python with Pandas to clean messy business data and build decision dashboards.',
        recommendedSkills: ['Python', 'Pandas', 'SQL', 'Data Visualization']
      },
      {
        title: 'Backend Engineering Trainee',
        area: 'Backend Systems',
        reason: 'Designs database models, authenticates users, and serves JSON endpoints.',
        recommendedSkills: ['Python', 'Django / FastAPI', 'PostgreSQL', 'REST APIs']
      }
    ],
    quizTopicId: 'python'
  },

  // 2. JAVA
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    category: 'Object-Oriented Programming',
    tagline: 'Enterprise powerhouse language with strict typing, safety, and OOP discipline.',
    description: 'Java powers Android apps, massive banking backends, and enterprise systems worldwide with its "Write Once, Run Anywhere" engine.',
    everydayAnalogy: {
      english:
        'A Class is an architect’s blueprint of a house. An Object is the actual real house built from that blueprint. The JVM (Java Virtual Machine) is like a universal power adapter: it translates your Java bytecode to run smoothly on any computer or operating system.',
      hinglish:
        'Java me Class matlab architect ka naksha (blueprint). Aur Object matlab us nakshay se bani hui asli building! JVM matlab ek universal travel adapter jo kisi bhi country ke switch socket me fit ho jata hai — code ek baar likho, har platform pe chalao!'
    },
    keyConcepts: [
      {
        title: 'Classes & Objects',
        simpleExplanation: 'A class defines the properties and behaviors, while objects are real instances you create in memory.',
        analogy: 'Architect blueprint vs real constructed house.',
        codeSnippet: `// Blueprint\nclass Student {\n    String name;\n    int rollNo;\n\n    void study() {\n        System.out.println(name + " is preparing for exams!");\n    }\n}\n\n// Real Object\nStudent s1 = new Student();\ns1.name = "Rohan";\ns1.study();`
      },
      {
        title: 'Java Virtual Machine (JVM)',
        simpleExplanation: 'JVM executes compiled .class bytecode so your Java program works seamlessly on Windows, Mac, or Linux.',
        analogy: 'A universal translator plug.'
      }
    ],
    tutorPrompts: [
      'Explain Java classes and objects with the house blueprint analogy',
      'Why is Java called "Write Once, Run Anywhere"? Explain JVM in simple words',
      'What is the difference between JDK, JRE, and JVM in easy Hinglish?',
      'How does Java memory management and Garbage Collection work?',
      'Explain Java method overloading vs overriding with everyday examples'
    ],
    defaultSubject: 'Java Enterprise & Core OOP',
    suggestedNoteTopics: [
      'Java Fundamentals: Classes, Objects & JVM',
      'Java OOP Pillars: Encapsulation, Inheritance & Polymorphism',
      'Java Collections Framework: ArrayList, HashMap & Sets',
      'Java Exception Handling & Best Practices'
    ],
    defaultNote: {
      id: 'note-java-starter',
      topic: 'Java Fundamentals: Classes, Objects & JVM',
      title: 'Java Starter Guide: Blueprint Mental Model & JVM Architecture',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. What is Java & The Architect Blueprint Analogy',
          content:
            'Java is a strongly typed, object-oriented language.\n\n• **Class**: The architect’s paper blueprint. It defines what a house has (doors, windows, rooms).\n• **Object**: The concrete house built in your neighborhood. You can build 50 houses from one blueprint!\n• **JVM**: A universal engine that takes compiled bytecode and translates it into instructions your specific computer hardware understands.'
        },
        {
          heading: '2. Working Code Example with Explanation',
          code: `public class BankAccount {\n    private String accountHolder;\n    private double balance;\n\n    // Constructor (Initial setup)\n    public BankAccount(String holder, double initialAmount) {\n        this.accountHolder = holder;\n        this.balance = initialAmount;\n    }\n\n    // Method to deposit money safely\n    public void deposit(double amount) {\n        if (amount > 0) {\n            balance += amount;\n            System.out.println("Deposited ₹" + amount + ". New Balance: ₹" + balance);\n        }\n    }\n}`,
          content:
            '• `private double balance`: Protects the money from being directly manipulated from outside (Encapsulation).\n• `deposit(...)`: The safe ATM slot that verifies the amount before adding it to the balance.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** In Java, everything revolves around Classes (blueprints) and Objects (instances). The JVM guarantees your code runs reliably across all operating systems.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** What does `public static void main` do?\n*Answer:* It is the mandatory starting gate where Java begins executing your application.\n\n**Q2:** Can an object exist without a class?\n*Answer:* No! You cannot build a house without having a blueprint definition first.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-java-1',
        subject: 'Java OOP',
        question: 'What is Encapsulation in simple words?',
        answer:
          'Encapsulation means keeping variables private and allowing access only through controlled public methods (getters/setters), like an ATM machine protecting cash inside.',
        rationale: 'Prevents external code from corrupting internal object state.'
      },
      {
        id: 'fc-java-2',
        subject: 'Java Core',
        question: 'What is the role of the Java Garbage Collector?',
        answer:
          'It automatically sweeps and frees memory occupied by objects that are no longer referenced or needed by the program, preventing memory leaks.',
        rationale: 'Developers do not need to manually free memory like in C++.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-java-1',
        title: 'Review Classes & Blueprint Analogy',
        subject: 'Java OOP',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 12,
        memoryScore: 80
      },
      {
        id: 'task-java-2',
        title: 'Practice Encapsulation with BankAccount Class',
        subject: 'Java Core',
        priority: 'Medium',
        dueText: 'Due tomorrow',
        completed: false,
        estimatedMinutes: 15,
        memoryScore: 70
      }
    ],
    careerRoles: [
      {
        title: 'Junior Java Developer',
        area: 'Backend Systems',
        reason: 'Builds robust REST APIs and microservices using Spring Boot and Java.',
        recommendedSkills: ['Java', 'Spring Boot', 'SQL', 'Git']
      },
      {
        title: 'Android App Developer Intern',
        area: 'Mobile Engineering',
        reason: 'Creates performant native Android user experiences using Java and Android SDK.',
        recommendedSkills: ['Java', 'Android SDK', 'XML / Jetpack', 'REST APIs']
      }
    ],
    quizTopicId: 'java'
  },

  // 3. C / C++
  {
    id: 'cpp',
    name: 'C / C++',
    icon: '⚙️',
    category: 'Systems & Performance',
    tagline: 'High-speed systems programming with direct memory control and hardware intimacy.',
    description: 'The foundation of operating systems, game engines, and performance-critical engineering.',
    everydayAnalogy: {
      english:
        'A normal variable is like a physical house where someone lives. A Pointer is like a slip of paper with the house GPS address written on it. The pointer does not store the furniture; it just knows the exact location in RAM where the furniture is.',
      hinglish:
        'C/C++ me normal variable matlab ek asli ghar. Aur Pointer matlab ek kagaz ka tukda jisme us ghar ka address likha hai! Pointer khud ghar nahi hai, bas RAM memory ke kis kamre me data rakha hai, uska address store karta hai.'
    },
    keyConcepts: [
      {
        title: 'Pointers & Memory Addresses',
        simpleExplanation: 'Pointers store the numerical hexadecimal memory address of another variable.',
        analogy: 'A GPS address slip vs the actual house.',
        codeSnippet: `int score = 100;\nint* ptr = &score; // ptr stores address of score\n\nprintf("Score: %d\\n", score);\nprintf("Address: %p\\n", ptr);\nprintf("Value at address: %d\\n", *ptr); // Dereferencing`
      },
      {
        title: 'Dynamic Memory (malloc & free)',
        simpleExplanation: 'Booking hotel rooms at runtime. When done, you must check out (free) to avoid memory leaks.',
        analogy: 'Hotel room booking and checkout.'
      }
    ],
    tutorPrompts: [
      'Explain C/C++ pointers using the GPS house address analogy',
      'What is the difference between malloc and new in C vs C++?',
      'Why is memory management important in C/C++? What is a memory leak in Hinglish?',
      'Explain arrays and pointer arithmetic step by step',
      'What is the difference between pass by value and pass by reference?'
    ],
    defaultSubject: 'Systems Programming & C/C++',
    suggestedNoteTopics: [
      'C/C++ Fundamentals: Pointers, Addresses & Memory',
      'Dynamic Memory Allocation: Stack vs Heap & Memory Leaks',
      'Object Oriented Programming in C++: Classes, Structs & Constructors',
      'Data Structures in C++: Linked Lists and Pointers'
    ],
    defaultNote: {
      id: 'note-cpp-starter',
      topic: 'C/C++ Fundamentals: Pointers & Memory Management',
      title: 'C/C++ Starter Guide: Direct Memory & Pointer Navigation',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. What are Pointers & The GPS Address Analogy',
          content:
            'In C and C++, you have direct control over computer memory (RAM).\n\n• **Variable**: A storage locker with your stuff.\n• **Pointer**: The locker number key tag that tells you where that locker is located.\n• **Dereference (`*ptr`)**: Opening the locker with your key to see or change what is inside.'
        },
        {
          heading: '2. Working Code Example with Line Breakdown',
          code: `#include <stdio.h>\n\nint main() {\n    int battery = 85;\n    int* pBattery = &battery; // Storing memory address\n\n    printf("Current battery: %d%%\\n", battery);\n    // Change value directly via pointer\n    *pBattery = 100;\n    printf("Charged battery: %d%%\\n", battery); // Now 100!\n    return 0;\n}`,
          content:
            '• `&battery`: The ampersand operator extracts the exact memory address.\n• `int* pBattery`: Declares a pointer variable capable of holding an integer address.\n• `*pBattery = 100`: Goes directly to that memory spot and updates the value to 100.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** Pointers allow ultra-fast memory manipulation without copying large data blocks. Always ensure allocated memory is freed to prevent leaks.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** What happens if you access a pointer that points to freed memory (Dangling pointer)?\n*Answer:* Undefined behavior! The program may crash or corrupt unrelated data.\n\n**Q2:** Does `&x` give the value of x or its address?\n*Answer:* `&x` gives the memory address of x.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-cpp-1',
        subject: 'C/C++ Core',
        question: 'What is the difference between Stack and Heap memory?',
        answer:
          'Stack memory is fast, automatic, and managed by function call scopes. Heap memory is flexible, manually allocated (malloc/new), and must be manually freed.',
        rationale: 'Stack is like your office desk; Heap is a large storage warehouse.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-cpp-1',
        title: 'Practice Pointer Syntax & GPS Analogy',
        subject: 'C/C++ Memory',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 12,
        memoryScore: 78
      }
    ],
    careerRoles: [
      {
        title: 'Systems & Embedded Engineer Intern',
        area: 'Systems Engineering',
        reason: 'Programs microcontrollers, operating system drivers, and hardware interfaces.',
        recommendedSkills: ['C', 'C++', 'Data Structures', 'Linux CLI']
      },
      {
        title: 'Game Engine Programmer Trainee',
        area: 'Game Development',
        reason: 'Optimizes physics simulations and graphics rendering loops where microsecond speed matters.',
        recommendedSkills: ['C++', 'OpenGL/Vulkan', 'Math & 3D Vectors', 'Memory Management']
      }
    ],
    quizTopicId: 'cpp'
  },

  // 4. JAVASCRIPT
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '⚡',
    category: 'Web & Full Stack',
    tagline: 'The interactive language of the web, full-stack browsers, and asynchronous event loops.',
    description: 'Brings websites to life with button clicks, live API data fetches, and smooth animations.',
    everydayAnalogy: {
      english:
        'The JavaScript Event Loop is like a fast restaurant waiter. The waiter takes your table order, hands it to the kitchen chef, and immediately attends to the next customer instead of standing still waiting for the dish to cook. When the dish is ready, the waiter brings it to your table.',
      hinglish:
        'JavaScript ka Event Loop samjho ek super-active restaurant waiter ki tarah hai! Waiter order leke kitchen chef ko deta hai, aur wahan khade rehne ki jagah turant agle table par chala jata hai (non-blocking). Jab khana taiyaar hota hai, tab callback/promise ke through aapko serve kar deta hai!'
    },
    keyConcepts: [
      {
        title: 'Event Loop & Asynchronous Promises',
        simpleExplanation: 'Non-blocking I/O allows JavaScript to handle heavy network requests without freezing the UI.',
        analogy: 'Restaurant waiter handling multiple tables smoothly.'
      }
    ],
    tutorPrompts: [
      'Explain JavaScript Event Loop with the restaurant waiter analogy',
      'What are JavaScript Promises and async/await in simple Hinglish?',
      'Explain closures in JavaScript using a backpack analogy',
      'What is the difference between let, const, and var?',
      'How does the browser DOM work with JavaScript event listeners?'
    ],
    defaultSubject: 'JavaScript & Web Engineering',
    suggestedNoteTopics: [
      'JavaScript Event Loop & Asynchronous Architecture',
      'Modern ES6+: Destructuring, Arrow Functions & Modules',
      'DOM Manipulation & Event Propagation (Bubbling & Capturing)',
      'Closures & Scope Chain in Practice'
    ],
    defaultNote: {
      id: 'note-js-starter',
      topic: 'JavaScript & Web Architecture: Async & Event Loop',
      title: 'JavaScript Starter Guide: Event Loop & Non-Blocking Execution',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. Why JavaScript is Asynchronous & The Waiter Analogy',
          content:
            'JavaScript is single-threaded. If it froze every time it downloaded an image, web pages would feel completely locked.\n\n• **Call Stack**: What is executing right now on the plate.\n• **Web APIs (fetch, setTimeout)**: The kitchen doing the heavy background work.\n• **Callback Queue & Event Loop**: Bringing the ready results back to your plate when you are free.'
        },
        {
          heading: '2. Working Code Pattern',
          code: `// Fetching data without freezing the webpage\nasync function loadUserProfile(userId) {\n    try {\n        console.log("1. Sending request to server...");\n        const response = await fetch(\`https://api.example.com/users/\${userId}\`);\n        const data = await response.json();\n        console.log("2. Data received:", data.name);\n        return data;\n    } catch (error) {\n        console.error("Failed to load user:", error);\n    }\n}\n\nconsole.log("Starting app...");\nloadUserProfile(101);\nconsole.log("3. UI remains completely responsive!");`,
          content:
            '• `async/await`: Makes asynchronous code read synchronously line-by-line while keeping the browser thread free.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** JavaScript keeps the user interface smooth by offloading long network tasks and resuming execution when results return.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** Is JavaScript multi-threaded in the main browser thread?\n*Answer:* No! It runs on a single main thread with an event-driven loop.\n\n**Q2:** What does `await` do?\n*Answer:* It pauses execution of the surrounding `async` function until the Promise resolves, without blocking the browser thread.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-js-1',
        subject: 'JavaScript',
        question: 'What is a Closure in simple terms?',
        answer:
          'A closure is when an inner function remembers and has access to variables from its outer parent function, even after the parent function has finished executing.',
        rationale: 'Like carrying a backpack with snacks packed by your parent when you leave the house.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-js-1',
        title: 'Master Event Loop & Waiter Analogy',
        subject: 'JavaScript Asynchronous',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 10,
        memoryScore: 82
      }
    ],
    careerRoles: [
      {
        title: 'Frontend Developer Intern',
        area: 'Frontend & UI',
        reason: 'Builds dynamic user interfaces, integrates APIs, and manages web state.',
        recommendedSkills: ['JavaScript', 'React', 'HTML & CSS', 'REST APIs']
      }
    ],
    quizTopicId: 'javascript'
  },

  // 5. HTML & CSS
  {
    id: 'html-css',
    name: 'HTML & CSS',
    icon: '🎨',
    category: 'Web Design & UI',
    tagline: 'The structural skeleton and visual styling layer of the internet.',
    description: 'Learn how every web page is built from semantic elements and beautifully styled for phones, tablets, and desktops.',
    everydayAnalogy: {
      english:
        'HTML is the human skeleton and organs (bones, skull, lungs). CSS is the skin, hair, tailored clothes, sunglasses, and perfume that make the person look great.',
      hinglish:
        'HTML matlab sharir ka kankal (skeleton) aur CSS matlab stylish kapde, shoes aur haircut! HTML bina CSS ke bas ek sadha kagaz jaisa dikhega; CSS usme colors, layout aur styling add karti hai.'
    },
    keyConcepts: [
      {
        title: 'Semantic HTML & Flexbox',
        simpleExplanation: 'Semantic tags tell browsers what content means; Flexbox aligns items easily in rows or columns.',
        analogy: 'Arranging books on a shelf neatly.'
      }
    ],
    tutorPrompts: [
      'Explain the difference between HTML and CSS with the skeleton & clothes analogy',
      'How does CSS Flexbox work in simple Hinglish? (justify-content vs align-items)',
      'What is the CSS Box Model (margin, border, padding, content)?',
      'How do responsive media queries work for mobile screens?'
    ],
    defaultSubject: 'Web Design & Frontend Foundations',
    suggestedNoteTopics: [
      'HTML & CSS Fundamentals: Structure, Styling & Box Model',
      'Mastering CSS Flexbox & CSS Grid for Responsive Layouts',
      'Semantic HTML5 & Accessibility (a11y) Essentials',
      'Modern CSS Variables & Dark Mode Implementation'
    ],
    defaultNote: {
      id: 'note-html-starter',
      topic: 'HTML & CSS Fundamentals: Structure & Styling',
      title: 'HTML & CSS Starter Guide: Skeleton, Clothes & Box Model',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. Mental Model: Skeleton & Styling',
          content:
            '• **HTML**: Tells the browser WHAT elements exist: `<header>`, `<main>`, `<button>`.\n• **CSS**: Tells the browser HOW they look: colors, padding, responsive layout.'
        },
        {
          heading: '2. Working Code Example: Responsive Card Layout',
          code: `/* Responsive Card with Modern Flexbox */\n.card-container {\n  display: flex;\n  flex-direction: column;\n  padding: 1.5rem;          /* Inner breathing space */\n  border-radius: 12px;      /* Smooth rounded corners */\n  background: #1e293b;      /* Dark slate navy */\n  color: #f8fafc;           /* Crisp light text */\n  border: 1px solid rgba(255,255,255,0.1);\n}\n\n.card-button {\n  margin-top: 1rem;\n  padding: 0.75rem 1.25rem;\n  background: #06b6d4;      /* Electric Cyan */\n  color: #0f172a;\n  font-weight: 600;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n}`,
          content: '• `padding` creates room inside the card, while `margin` pushes other cards away outside.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** Semantic HTML provides accessible structure for screen readers, while CSS Flexbox and Grid handle fluid responsive presentation across all devices.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** What is the difference between padding and margin?\n*Answer:* Padding is space INSIDE the element border; Margin is space OUTSIDE the element border.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-html-1',
        subject: 'CSS Layout',
        question: 'What is the CSS Box Model composed of?',
        answer: 'From inside to outside: Content -> Padding -> Border -> Margin.',
        rationale: 'Padding cushions content inside; margin creates breathing room outside.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-html-1',
        title: 'Master CSS Box Model & Flexbox Alignment',
        subject: 'CSS & Styling',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 10,
        memoryScore: 90
      }
    ],
    careerRoles: [
      {
        title: 'UI/UX Web Designer & Developer',
        area: 'Web Design',
        reason: 'Designs beautiful landing pages, translates Figma mockups into responsive web code.',
        recommendedSkills: ['HTML5', 'CSS3', 'Tailwind', 'Figma', 'JavaScript']
      }
    ],
    quizTopicId: 'css'
  },

  // 6. SQL
  {
    id: 'sql',
    name: 'SQL',
    icon: '📊',
    category: 'Databases & Data Management',
    tagline: 'The universal language for storing, querying, and organizing structured data.',
    description: 'Find, filter, join, and analyze millions of records in relational databases like PostgreSQL, MySQL, and SQLite.',
    everydayAnalogy: {
      english:
        'A Database is like an organized filing cabinet or Excel workbook. A Table is a specific spreadsheet tab (like "Students"). Columns are attributes (Name, RollNo, Marks). Rows are individual student records. An SQL Query is like using Excel filters and Ctrl+F on steroids.',
      hinglish:
        'SQL samjho ek super-fast Excel sheet hai jisme hazaron-crore records ho sakte hain! Table matlab Excel sheet ki tab, Columns matlab headings (Name, Fee), aur Rows matlab ek-ek student ka data. SQL Queries matlab formula laga ke specific data ek jhatke me nikalna!'
    },
    keyConcepts: [
      {
        title: 'SELECT, WHERE & INNER JOIN',
        simpleExplanation: 'SELECT picks columns, WHERE filters rows, and JOIN combines data from two related tables using a common key.',
        analogy: 'Matching student ID card with their library book register.'
      }
    ],
    tutorPrompts: [
      'Explain SQL tables, rows, and columns using the Excel spreadsheet analogy',
      'What is the difference between INNER JOIN and LEFT JOIN in simple Hinglish?',
      'How do WHERE and HAVING clauses differ in SQL queries?',
      'What are primary keys and foreign keys with real-life examples?'
    ],
    defaultSubject: 'Relational Database Management Systems (RDBMS)',
    suggestedNoteTopics: [
      'SQL Querying Foundations: SELECT, WHERE, GROUP BY & ORDER BY',
      'Mastering SQL JOINs: INNER, LEFT, RIGHT & FULL OUTER',
      'Database Normalization & ACID Transactions Explained',
      'Database Indexing & Query Performance Optimization'
    ],
    defaultNote: {
      id: 'note-sql-starter',
      topic: 'SQL Foundations: Querying, Filtering & JOINs',
      title: 'SQL Starter Guide: Spreadsheet Mental Model & Relational Joins',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. Mental Model: Structured Spreadsheets & Queries',
          content:
            '• **SELECT**: "What information do I want to see?" (e.g., student name and marks)\n• **FROM**: "Which table is that information stored in?"\n• **WHERE**: "What conditions must be met?" (e.g., marks > 75)\n• **JOIN**: Connecting two tables that share a common ID (like student_id).'
        },
        {
          heading: '2. Working Query Example',
          code: `-- Find top students who borrowed library books\nSELECT \n    students.name,\n    students.roll_no,\n    books.book_title,\n    books.borrow_date\nFROM students\nINNER JOIN books ON students.id = books.student_id\nWHERE students.score >= 80\nORDER BY books.borrow_date DESC;`,
          content: '• `INNER JOIN` brings only records where a student exists in BOTH the student list and book register.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** Relational databases organize information into structured tables connected by keys. SQL queries ask precise questions to filter and aggregate records in milliseconds.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** What is the difference between `WHERE` and `HAVING`?\n*Answer:* `WHERE` filters individual rows before grouping; `HAVING` filters aggregated groups after `GROUP BY`.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-sql-1',
        subject: 'SQL Databases',
        question: 'What is a Primary Key vs Foreign Key?',
        answer:
          'A Primary Key uniquely identifies each row in its own table (like your Aadhaar / Roll Number). A Foreign Key in another table points back to that Primary Key to create a relationship.',
        rationale: 'Primary key ensures uniqueness; foreign key ensures referential integrity.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-sql-1',
        title: 'Review SQL JOIN Types (INNER vs LEFT)',
        subject: 'Database Systems',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 10,
        memoryScore: 88
      }
    ],
    careerRoles: [
      {
        title: 'Database & SQL Analyst',
        area: 'Data & Analytics',
        reason: 'Extracts critical business insights, generates KPI reports, and manages query health.',
        recommendedSkills: ['SQL', 'PostgreSQL', 'Excel / PowerBI', 'Data Modeling']
      }
    ],
    quizTopicId: 'sql'
  },

  // 7. DATA SCIENCE
  {
    id: 'datascience',
    name: 'Data Science',
    icon: '📈',
    category: 'Data & Analytics',
    tagline: 'Turning raw data numbers into actionable insights and strategic decisions.',
    description: 'Use statistics, data visualization, and Python tools like Pandas and NumPy to uncover hidden patterns.',
    everydayAnalogy: {
      english:
        'A Data Scientist is like a diagnostic doctor. Raw numbers are like blood test reports. You clean the data, analyze the metrics, look for abnormalities or patterns, and prescribe the right strategic solution.',
      hinglish:
        'Data Scientist samjho ek specialist doctor ki tarah hai! Raw numbers uske liye patient ke lab tests hain. Doctor reports dekhkar bimari aur health trends samajhta hai, waise hi Data Scientist numbers se business ke trends samajhta hai.'
    },
    keyConcepts: [
      {
        title: 'Data Cleaning & Exploratory Analysis (EDA)',
        simpleExplanation: 'Inspecting raw data, handling missing values, and summarizing core patterns before drawing conclusions.',
        analogy: 'Washing vegetables before cooking a meal.'
      }
    ],
    tutorPrompts: [
      'Explain Data Science workflow using the doctor diagnosis analogy',
      'What is the difference between NumPy and Pandas in simple Hinglish?',
      'How does data cleaning handle missing values (NaN)?',
      'What are common data visualization plots and when should you use each?'
    ],
    defaultSubject: 'Data Science & Applied Statistics',
    suggestedNoteTopics: [
      'Data Science Fundamentals: Data Cleaning, EDA & Pandas',
      'Statistical Foundations: Mean, Median, Variance & Normal Distribution',
      'Feature Engineering & Data Preprocessing for Beginners',
      'Data Storytelling with Matplotlib and Seaborn'
    ],
    defaultNote: {
      id: 'note-ds-starter',
      topic: 'Data Science Fundamentals: Pandas, EDA & Cleaning',
      title: 'Data Science Starter Guide: Diagnosis Analogy & Exploratory Data Analysis',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. What is Data Science & The Doctor Analogy',
          content:
            'Data Science combines programming, domain knowledge, and statistics.\n\n• **Step 1: Collect Data** (Patient gives blood sample)\n• **Step 2: Clean Data** (Remove duplicates, fill missing values)\n• **Step 3: Analyze & Visualize** (Identify trends and correlations)\n• **Step 4: Act on Insights** (Make decisions based on evidence).'
        },
        {
          heading: '2. Working Python Code with Line Breakdown',
          code: `import pandas as pd\n\n# Create a simple student marks dataframe\ndata = {\n    'name': ['Priya', 'Rahul', 'Sneha', 'Vikram'],\n    'study_hours': [4, 6, 2, 8],\n    'score': [78, 88, 62, 95]\n}\n\ndf = pd.DataFrame(data)\n\n# Calculate summary metrics\nprint("Average score:", df['score'].mean())\n# Filter students who scored over 80\ntop_students = df[df['score'] > 80]\nprint("Top Scorers:\\n", top_students)`,
          content: '• `pd.DataFrame` creates a supercharged Excel-like table in Python.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** Real-world data is almost always messy. Thorough exploratory data analysis and cleaning are 80% of any successful data science project.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** Why is the Median often preferred over the Mean when data has extreme outliers (like billionaire salaries)?\n*Answer:* Outliers pull the Mean drastically, while the Median remains stable at the true middle.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-ds-1',
        subject: 'Data Science',
        question: 'What is the difference between Mean and Median?',
        answer: 'Mean is the mathematical average (sum/count). Median is the exact middle value when data is sorted.',
        rationale: 'Median resists extreme outliers.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-ds-1',
        title: 'Review Pandas DataFrame Operations & EDA',
        subject: 'Data Science',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 12,
        memoryScore: 82
      }
    ],
    careerRoles: [
      {
        title: 'Associate Data Analyst',
        area: 'Data & Analytics',
        reason: 'Builds data pipelines, writes SQL aggregations, and delivers executive dashboards.',
        recommendedSkills: ['Python', 'Pandas', 'SQL', 'Tableau / PowerBI']
      }
    ],
    quizTopicId: 'datascience'
  },

  // 8. MACHINE LEARNING
  {
    id: 'machinelearning',
    name: 'Machine Learning',
    icon: '🤖',
    category: 'Artificial Intelligence',
    tagline: 'Teaching computers to learn from experience and pattern recognition without explicit rules.',
    description: 'Build predictive models, classification algorithms, and smart neural architectures from real data.',
    everydayAnalogy: {
      english:
        'Instead of programming 10,000 hardcoded rules describing what a cat looks like (whiskers, ears, tail), you show the computer 10,000 photos of cats and dogs. The algorithm detects the subtle patterns on its own, just like a child learning to recognize animals.',
      hinglish:
        'Machine Learning me aap computer ko 10,000 alag-alag rules likh ke nahi dete. Aap computer ko 10,000 photos dikhate ho — "Yeh billi hai, yeh kutta hai". Computer khud se patterns seekh leta hai, jaise ek chhota bachha cheezon ko dekh kar pehchanna seekhta hai!'
    },
    keyConcepts: [
      {
        title: 'Supervised Learning & Overfitting',
        simpleExplanation: 'Training with labeled examples; avoiding memorization so the model generalizes well to new data.',
        analogy: 'Understanding concepts vs rote memorization before exams.'
      }
    ],
    tutorPrompts: [
      'Explain Machine Learning using the child learning animal photos analogy',
      'What is the difference between Supervised and Unsupervised Learning in simple Hinglish?',
      'What is Overfitting and Underfitting with real-world student analogies?',
      'How does a simple linear regression predict numbers from features?'
    ],
    defaultSubject: 'Machine Learning & Applied AI',
    suggestedNoteTopics: [
      'Machine Learning Fundamentals: Supervised vs Unsupervised Learning',
      'The Bias-Variance Tradeoff & How to Prevent Overfitting',
      'Linear & Logistic Regression Step-by-Step with Scikit-Learn',
      'Evaluating Models: Precision, Recall & F1-Score Explained'
    ],
    defaultNote: {
      id: 'note-ml-starter',
      topic: 'Machine Learning Fundamentals: Supervised Learning & Generalization',
      title: 'Machine Learning Starter Guide: Pattern Recognition & Model Training',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. What is Machine Learning & The Exam Prep Analogy',
          content:
            '• **Traditional Programming**: Rules + Data = Answers\n• **Machine Learning**: Data + Answers = Rules (Model)\n\n• **Overfitting**: A student who memorizes past 5 years\' exam questions word-for-word. They get 100% on homework, but fail when a slightly new question appears on the final exam!'
        },
        {
          heading: '2. Working Scikit-Learn Code',
          code: `from sklearn.linear_model import LinearRegression\nimport numpy as np\n\n# Features: Hours studied\nX = np.array([[1], [2], [3], [4], [5]])\n# Labels: Exam score obtained\ny = np.array([50, 60, 70, 80, 90])\n\n# 1. Train the model\nmodel = LinearRegression()\nmodel.fit(X, y)\n\n# 2. Predict for a new student who studies 6 hours\npredicted_score = model.predict([[6]])\nprint(f"Predicted score for 6 study hours: {predicted_score[0]:.1f}")  # 100.0`,
          content: '• The model calculates the mathematical relationship (slope and intercept) automatically.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** Machine learning builds mathematical models from historical patterns. A good model generalizes well to unseen real-world data rather than merely memorizing training examples.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** What is the difference between classification and regression?\n*Answer:* Classification predicts a category/label (e.g., Spam vs Not Spam); Regression predicts a continuous numerical quantity (e.g., House Price).'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-ml-1',
        subject: 'Machine Learning',
        question: 'What is Overfitting in simple words?',
        answer: 'When a model learns training data noise and details too well, failing to generalize to fresh, unseen test data.',
        rationale: 'Like memorizing specific exam questions instead of understanding the formula.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-ml-1',
        title: 'Review Supervised Learning & Child Analogy',
        subject: 'Machine Learning',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 12,
        memoryScore: 84
      }
    ],
    careerRoles: [
      {
        title: 'Junior Machine Learning Engineer',
        area: 'Artificial Intelligence',
        reason: 'Preprocesses datasets, trains baseline models, and deploys inference endpoints.',
        recommendedSkills: ['Python', 'Scikit-Learn', 'PyTorch / TensorFlow', 'Data Preprocessing']
      }
    ],
    quizTopicId: 'machinelearning'
  },

  // 9. WEB DEVELOPMENT
  {
    id: 'webdev',
    name: 'Web Development',
    icon: '🌐',
    category: 'Full Stack Development',
    tagline: 'Connecting clients, servers, and databases into modern web applications.',
    description: 'Learn end-to-end full stack mechanics: modern UI components, backend APIs, and database persistence.',
    everydayAnalogy: {
      english:
        'A full-stack web application is like a restaurant. The Frontend is the beautifully decorated dining hall and menu where guests place orders. The Backend Server is the kitchen where chefs prepare food according to recipes. The Database is the cold storage pantry where ingredients and inventory are securely kept.',
      hinglish:
        'Full-Stack Web App samjho ek 3-star restaurant hai! Frontend matlab accha sa dining hall aur menu card jahan log aate hain. Backend server matlab kitchen jahan chefs order receive karte hain aur khana banate hain. Aur Database matlab pichhe ka storage room jahan sara saman aur hisab-kitab safe rehta hai!'
    },
    keyConcepts: [
      {
        title: 'Frontend vs Backend vs Database',
        simpleExplanation: 'Client renders the UI, Server handles security and business rules, Database stores records permanently.',
        analogy: 'Dining hall, kitchen, and storage pantry.'
      }
    ],
    tutorPrompts: [
      'Explain how a full-stack web application works using the restaurant dining hall analogy',
      'What happens under the hood when I type a URL into a web browser?',
      'What is the difference between a frontend framework (React) and a backend runtime (Node.js)?',
      'How does client-server communication work with REST APIs and JSON?'
    ],
    defaultSubject: 'Full Stack Web Architecture',
    suggestedNoteTopics: [
      'Full Stack Architecture: Client, Server, API & Database',
      'RESTful API Design & HTTP Status Codes Explained',
      'State Management & Unidirectional Data Flow in Modern Apps',
      'Web Security Essentials: CORS, Authentication & JWTs'
    ],
    defaultNote: {
      id: 'note-webdev-starter',
      topic: 'Full Stack Architecture: Client, Server, API & Database',
      title: 'Web Development Starter Guide: The Restaurant Mental Model',
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: '1. The 3-Tier Architecture & Restaurant Analogy',
          content:
            '• **Frontend (Client)**: The dining room. Built with HTML, CSS, React. What the user touches and sees.\n• **Backend (Server)**: The kitchen. Built with Node.js, Express, Python. Protects sensitive logic and passwords.\n• **Database**: The pantry. Stores user accounts, notes, and purchases permanently.'
        },
        {
          heading: '2. Working Client-Server Code Pattern',
          code: `// Simple Express REST Endpoint (The Kitchen)\nimport express from 'express';\nconst app = express();\napp.use(express.json());\n\napp.get('/api/menu', (req, res) => {\n  const menuItems = [\n    { id: 1, item: 'Paneer Butter Masala', price: 280 },\n    { id: 2, item: 'Garlic Naan', price: 45 }\n  ];\n  res.json({ success: true, data: menuItems });\n});\n\napp.listen(3000, () => console.log('Kitchen listening on port 3000'));`,
          content: '• When frontend requests `/api/menu`, the backend returns structured JSON data.'
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content:
            '**Key Takeaway:** Full stack applications decouple presentation from business logic. The browser requests data through APIs, and the backend securely validates and serves it.'
        },
        {
          heading: '4. Quick Practice Check',
          content:
            '**Q1:** Why do we never store database passwords directly in frontend React code?\n*Answer:* Anyone can open browser Developer Tools and view frontend code! Sensitive secrets belong solely on the backend server.'
        }
      ]
    },
    flashcards: [
      {
        id: 'fc-web-1',
        subject: 'Web Architecture',
        question: 'What is the role of an API in full-stack development?',
        answer: 'An API acts as a waiter / contract that lets the frontend request data from the backend and receive structured responses (JSON).',
        rationale: 'Decouples client user interface from server business logic.'
      }
    ],
    revisionTasks: [
      {
        id: 'task-web-1',
        title: 'Review Client-Server Architecture & Restaurant Model',
        subject: 'Web Development',
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 10,
        memoryScore: 86
      }
    ],
    careerRoles: [
      {
        title: 'Junior Full-Stack Web Developer',
        area: 'Full Stack Engineering',
        reason: 'Builds end-to-end features connecting React interfaces to Node.js / Express backends.',
        recommendedSkills: ['React', 'Node.js', 'Express', 'SQL or MongoDB', 'Git']
      }
    ],
    quizTopicId: 'react'
  }
];

/**
 * Generate a dynamic skill configuration for custom skills entered by users.
 */
export function buildCustomSkillDefinition(customName: string): SkillDefinition {
  const trimmed = customName.trim();
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    id: slug || 'custom-skill',
    name: trimmed || 'Custom Skill',
    icon: '💡',
    category: 'Custom Learning Focus',
    tagline: `Personalized learning journey for ${trimmed}. Master fundamentals step by step.`,
    description: `Personalized track dedicated to mastering ${trimmed} with practical examples and clear analogies.`,
    everydayAnalogy: {
      english: `Mastering ${trimmed} is like learning to drive a car: first understand the steering and pedals (core basics), practice on quiet neighborhood roads (small starter projects), and soon navigate highways with confidence.`,
      hinglish: `${trimmed} sikhna bilkul car chalana sikhne jaisa hai: pehle steering aur pedals samjho (core basics), fir shaant sadak par practice karo (starter practice), aur fir smoothly highway par drive karo!`
    },
    keyConcepts: [
      {
        title: `${trimmed} Core Fundamentals`,
        simpleExplanation: `The essential building blocks and patterns required to build with ${trimmed}.`,
        analogy: 'Learning the steering and brakes before driving on the highway.'
      }
    ],
    tutorPrompts: [
      `Explain ${trimmed} fundamentals with an everyday real-life analogy`,
      `What are the most important concepts to learn in ${trimmed} for beginners in simple Hinglish?`,
      `Show me a simple, working code example for ${trimmed} with line-by-line explanation`,
      `What are common beginner mistakes in ${trimmed} and how do I avoid them?`,
      `Suggest a beginner-friendly project I can build with ${trimmed} to showcase on GitHub`
    ],
    defaultSubject: `${trimmed} Engineering & Fundamentals`,
    suggestedNoteTopics: [
      `${trimmed} Starter Guide: Core Concepts & Architecture`,
      `Mastering Key Patterns & Best Practices in ${trimmed}`,
      `Practical Project Implementation with ${trimmed}`,
      `Common Interview Questions & Gotchas in ${trimmed}`
    ],
    defaultNote: {
      id: `note-${slug}-starter`,
      topic: `${trimmed} Starter Guide: Core Concepts & Practice`,
      title: `${trimmed} Fundamentals: Step-by-Step Learning Guide`,
      styleLabel: 'Beginner Friendly Guide',
      language: 'English + Easy Hinglish',
      detailLevel: 'comprehensive',
      createdAt: 'Personalized Starter Note',
      sections: [
        {
          heading: `1. Introduction to ${trimmed} & Mental Model`,
          content: `${trimmed} is an essential tool in modern technology.\n\n• **Core Mental Model**: Start with the foundational building blocks.\n• **Analogy**: Like learning the steering wheel and pedals before driving on a busy highway.\n• **Goal**: Focus on understanding why things work, not just memorizing syntax.`
        },
        {
          heading: `2. Key Patterns for ${trimmed}`,
          content: `1. Master the syntax and basic operations.\n2. Break large problems into smaller, manageable functions or modules.\n3. Test each component incrementally.`
        },
        {
          heading: '3. Two-Line Key Takeaway',
          content: `**Key Takeaway:** Consistent daily practice with ${trimmed} and building small tangible projects will give you true confidence faster than reading theory alone.`
        },
        {
          heading: '4. Quick Practice Check',
          content: `**Q1:** What is the best way to solidify your understanding of ${trimmed}?\n*Answer:* Build a small, working mini-project and explain how it works in your own words!`
        }
      ]
    },
    flashcards: [
      {
        id: `fc-${slug}-1`,
        subject: trimmed,
        question: `What is the most critical foundational principle in ${trimmed}?`,
        answer: 'Understanding core building blocks and data flow before jumping into complex frameworks.',
        rationale: 'Strong fundamentals make learning advanced tools 10x easier.'
      }
    ],
    revisionTasks: [
      {
        id: `task-${slug}-1`,
        title: `Explore ${trimmed} Core Foundations`,
        subject: trimmed,
        priority: 'High',
        dueText: 'Due today',
        completed: false,
        estimatedMinutes: 15,
        memoryScore: 70
      }
    ],
    careerRoles: [
      {
        title: `${trimmed} Specialist / Trainee`,
        area: 'Software Engineering',
        reason: `Applies ${trimmed} skills to solve domain problems and build modern digital solutions.`,
        recommendedSkills: [trimmed, 'Git', 'Problem Solving', 'Data Structures']
      }
    ],
    quizTopicId: 'dsa'
  };
}

/**
 * Retrieve the active user skill configuration.
 */
export function getSkillConfig(skillName?: string): SkillDefinition {
  if (!skillName) {
    const profile = getUserSkillProfile();
    skillName = profile?.primarySkill || 'Python';
  }

  const normalized = skillName.trim().toLowerCase();

  // Match against preset skills
  const match = PRESET_SKILLS.find(
    (s) =>
      s.id.toLowerCase() === normalized ||
      s.name.toLowerCase() === normalized ||
      (normalized.includes('c++') && s.id === 'cpp') ||
      (normalized.includes('c / c++') && s.id === 'cpp') ||
      (normalized.includes('html') && s.id === 'html-css') ||
      (normalized.includes('data science') && s.id === 'datascience') ||
      (normalized.includes('machine learning') && s.id === 'machinelearning') ||
      (normalized.includes('web') && s.id === 'webdev')
  );

  if (match) {
    return match;
  }

  return buildCustomSkillDefinition(skillName);
}

/**
 * Get the saved user skill profile from localStorage.
 */
export function getUserSkillProfile(): UserSkillProfile | null {
  const profile = storage.get<UserSkillProfile | null>(STORAGE_KEYS.USER_SKILL, null);
  if (profile && profile.primarySkill) {
    return profile;
  }
  return null;
}

/**
 * Check if the user has completed the first-time welcome skill onboarding.
 */
export function hasCompletedSkillOnboarding(): boolean {
  const profile = getUserSkillProfile();
  return Boolean(profile && profile.isFirstTimeCompleted && profile.primarySkill);
}

/**
 * Save user skill preference to localStorage.
 */
export function saveUserSkillProfile(
  skillName: string,
  level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner'
): UserSkillProfile {
  const config = getSkillConfig(skillName);
  const updated: UserSkillProfile = {
    primarySkill: config.name,
    skillCategory: config.category,
    experienceLevel: level,
    selectedAt: new Date().toISOString(),
    isFirstTimeCompleted: true
  };

  storage.set(STORAGE_KEYS.USER_SKILL, updated);

  // Dispatch custom window event so all mounted views can react immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smartbridge:skill-changed', { detail: updated }));
  }

  return updated;
}
