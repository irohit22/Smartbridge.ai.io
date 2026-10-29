/**
 * SMART BRIDGE Server — Offline Career Engine
 * Deterministic, offline-first career analysis module for node.js runtime.
 */

const ROLE_ARCHETYPES = [
  {
    id: 'frontend-dev',
    title: 'Junior Frontend Developer / React Intern',
    keywords: ['react', 'javascript', 'html', 'css', 'typescript', 'tailwind', 'vue', 'nextjs', 'web', 'ui', 'ux', 'responsive'],
    preferredAreas: ['Frontend Development', 'Web Development', 'UI/UX Design', 'Full Stack Development'],
    overview: 'Builds responsive user interfaces, connects UI components to backend REST APIs, and optimizes cross-browser web performance.',
    baseRequirements: [
      'Solid command of modern JavaScript (ES6+ array methods, async/await, closures)',
      'Working knowledge of a modern framework (React or Vue) and component state management',
      'HTML5 semantic structure, modern CSS (Flexbox, Grid), and mobile-first responsive layout',
      'Version control with Git (branching, pull requests, conventional commits)'
    ],
    recommendedProjects: [
      'Interactive Analytics Dashboard with dark mode, live search filters, and debounced API requests',
      'E-commerce Product Catalog with local storage cart persistence, checkout flow, and accessible modal dialogs'
    ],
    marketContext: 'High demand across SaaS startups and software consultancies. Recruiters specifically inspect live demo links and clean component modularity on GitHub.',
    defaultSearchQuery: 'Frontend Developer Intern Fresher React'
  },
  {
    id: 'backend-dev',
    title: 'Junior Backend & API Engineer / Node.js Intern',
    keywords: ['node', 'nodejs', 'express', 'python', 'django', 'fastapi', 'java', 'spring', 'sql', 'postgres', 'mongodb', 'rest', 'api', 'backend'],
    preferredAreas: ['Backend Development', 'API Engineering', 'Full Stack Development', 'Cloud Computing'],
    overview: 'Designs, implements, and secures server-side APIs, manages database schemas, and handles business logic and authentication.',
    baseRequirements: [
      'Server-side runtime proficiency in Node.js (Express), Python (FastAPI/Django), or Java',
      'CRUD database design and querying with relational (PostgreSQL/MySQL) or document (MongoDB) databases',
      'RESTful API conventions, request validation, error middleware, and JWT authentication',
      'Basic understanding of HTTP status codes, headers, and CORS policies'
    ],
    recommendedProjects: [
      'RESTful Resource API with JWT authentication, role-based access control (RBAC), and Swagger/OpenAPI docs',
      'Webhook or Task Processing Service with background queues and SQL transactions'
    ],
    marketContext: 'Valued for reliability and clean data validation. Hiring managers evaluate schema migrations, input sanitization, and structured unit tests.',
    defaultSearchQuery: 'Backend Developer Intern Fresher Node.js Python'
  },
  {
    id: 'fullstack-dev',
    title: 'Full-Stack Web Trainee / Associate Engineer',
    keywords: ['fullstack', 'full stack', 'mern', 'react', 'node', 'express', 'mongodb', 'sql', 'typescript', 'nextjs', 'api'],
    preferredAreas: ['Full Stack Development', 'Web Development', 'Software Engineering'],
    overview: 'Coordinates end-to-end web features across client-side interfaces, server APIs, and integrated database storage.',
    baseRequirements: [
      'Ability to build both client UI (React/Vue) and server endpoints (Express/FastAPI)',
      'Understanding of full request-response lifecycles, state synchronization, and database persistence',
      'Experience setting up end-to-end local development environments with environment variables',
      'Basic deployment experience on platforms like Render, Vercel, or Railway'
    ],
    recommendedProjects: [
      'Full-Stack Collaborative Workspace with live API, DB persistence, and responsive UI',
      'Role-based Management System with user signup, session handling, search/pagination, and export to CSV'
    ],
    marketContext: 'Very popular in fast-moving early-stage startups where versatile generalists can contribute across the entire product stack.',
    defaultSearchQuery: 'Full Stack Web Developer Intern Fresher'
  },
  {
    id: 'data-analyst',
    title: 'Junior Data Analyst / Python Trainee',
    keywords: ['python', 'pandas', 'numpy', 'sql', 'excel', 'data', 'tableau', 'power bi', 'visualization', 'analysis', 'statistics', 'matplotlib'],
    preferredAreas: ['Data Science / AI', 'Data Analytics', 'Business Intelligence'],
    overview: 'Extracts, cleans, and analyzes structured datasets to generate actionable business insights and visual reporting dashboards.',
    baseRequirements: [
      'Proficiency in Python data libraries (Pandas, NumPy, Matplotlib/Seaborn) or advanced SQL',
      'Ability to handle missing data, type casting, outliers, and group-by aggregations',
      'Data storytelling: translating numbers into charts and business summaries',
      'Working knowledge of spreadsheet pivot tables and basic statistical concepts'
    ],
    recommendedProjects: [
      'Exploratory Data Analysis (EDA) of a public Kaggle dataset with documented hypotheses and interactive charts',
      'Automated ETL Script that pulls public CSV/API data, cleans anomalies, and loads into an SQLite database'
    ],
    marketContext: 'Growing intake across fintech, e-commerce, and analytics agencies. Portfolios with clear Jupyter notebooks and visual takeaways stand out immediately.',
    defaultSearchQuery: 'Junior Data Analyst Intern Fresher Python SQL'
  },
  {
    id: 'qa-tester',
    title: 'QA & Software Testing Intern / Automation Trainee',
    keywords: ['testing', 'qa', 'selenium', 'cypress', 'jest', 'playwright', 'puppeteer', 'automation', 'test cases', 'debugging', 'quality'],
    preferredAreas: ['Software Testing & QA', 'Software Engineering', 'DevOps / QA'],
    overview: 'Identifies software defects, creates manual and automated test suites, and verifies application reliability across platforms.',
    baseRequirements: [
      'Understanding of software testing lifecycle (STLC), test case authoring, and bug reporting protocols',
      'Basic scripting in JavaScript or Python for test automation (Cypress, Playwright, or Selenium)',
      'Familiarity with inspecting browser DevTools, network tab payloads, and console errors',
      'Strong eye for detail, edge cases, and user experience regressions'
    ],
    recommendedProjects: [
      'Automated End-to-End Test Suite for an e-commerce or auth flow using Playwright or Cypress',
      'Comprehensive Test Matrix & Bug Tracking Document covering 25+ edge cases on an open-source web application'
    ],
    marketContext: 'A strategic gateway role into technology companies. Strong automated testing skills can fast-track transitions into full SDET or development roles.',
    defaultSearchQuery: 'QA Tester Intern Fresher Automation'
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps Support Intern',
    keywords: ['linux', 'docker', 'aws', 'cloud', 'devops', 'git', 'ci/cd', 'bash', 'shell', 'github actions', 'containers', 'kubernetes'],
    preferredAreas: ['Cloud Computing', 'DevOps & Infrastructure', 'Systems Engineering'],
    overview: 'Assists with continuous integration, containerization, environment configuration, and cloud infrastructure monitoring.',
    baseRequirements: [
      'Comfortable with Linux shell navigation, file permissions, and basic bash scripting',
      'Familiarity with container basics (writing Dockerfiles, building images, port mapping)',
      'Understanding of Git workflows and basic CI/CD configuration (GitHub Actions)',
      'Foundational concepts of cloud hosting (compute instances, DNS, object storage)'
    ],
    recommendedProjects: [
      'Multi-stage Dockerized Web Application with GitHub Actions CI pipeline running automated lint and test checks',
      'Cloud Deployment on AWS/GCP free tier with custom domain, SSL certificate, and health monitoring'
    ],
    marketContext: 'High demand for students who bridge software code and production infrastructure. Hands-on Docker and Linux literacy make candidates immediately attractive.',
    defaultSearchQuery: 'DevOps Intern Cloud Engineer Fresher'
  }
];

export function generateOfflineCareerAnalysis(profile) {
  const skillsList = Array.isArray(profile.skills) ? profile.skills : [];
  const normalizedSkillNames = skillsList.map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim());
  const projectsLower = (profile.projects || '').toLowerCase();
  const areasLower = (Array.isArray(profile.preferredAreas) ? profile.preferredAreas : []).map(a => String(a).toLowerCase().trim());
  const branchLower = (profile.branch || '').toLowerCase();

  const demonstratedSkills = [];
  const selfReportedSkills = [];

  skillsList.forEach(skill => {
    const sName = typeof skill === 'string' ? skill : (skill.name || '');
    const sLevel = typeof skill === 'string' ? 'Intermediate' : (skill.level || 'Intermediate');
    const sLower = sName.toLowerCase().trim();
    const inProjects = projectsLower.includes(sLower) || (sLower.length > 2 && projectsLower.includes(sLower.replace(/\.js$/, '')));

    if (inProjects) {
      demonstratedSkills.push(`${sName} (${sLevel} — Project Backed)`);
    } else {
      selfReportedSkills.push(`${sName} (${sLevel})`);
    }
  });

  const commonTools = ['git', 'github', 'rest api', 'sql', 'docker', 'figma', 'postman', 'jest', 'tailwind'];
  commonTools.forEach(tool => {
    if (projectsLower.includes(tool) && !normalizedSkillNames.some(s => s.includes(tool))) {
      demonstratedSkills.push(`${tool.toUpperCase()} (Applied in Projects)`);
    }
  });

  const transferableStrengths = [];
  if (branchLower.includes('computer') || branchLower.includes('it') || branchLower.includes('science')) {
    transferableStrengths.push('Solid baseline in core Computer Science fundamentals (data structures, algorithms, OS)');
  } else if (branchLower.includes('electronics') || branchLower.includes('electrical')) {
    transferableStrengths.push('Strong analytical, hardware-software logic, and mathematical problem-solving ability');
  } else {
    transferableStrengths.push('Adaptable technical curiosity with multi-disciplinary perspectives');
  }

  if (profile.projects && profile.projects.length > 50) {
    transferableStrengths.push('Hands-on initiative: Able to build end-to-end features rather than purely studying theory');
  }
  if (demonstratedSkills.length >= 2) {
    transferableStrengths.push('Practical implementation experience with component or API architecture');
  }
  transferableStrengths.push('Self-directed learning agility: Proactively experimenting with modern tech stacks');

  let primaryReadinessObservation = '';
  if (demonstratedSkills.length >= 2) {
    primaryReadinessObservation = `You possess concrete, project-backed experience in ${demonstratedSkills.slice(0, 2).map(s => s.split(' ')[0]).join(' and ')}. Your primary focus now should be refining code architecture, polishing GitHub documentation, and targeting entry-level internships.`;
  } else if (skillsList.length > 0) {
    primaryReadinessObservation = `You have built a solid foundation across ${skillsList.slice(0, 3).map(s => (typeof s === 'string' ? s : s.name)).join(', ')}. To stand out to hiring recruiters, translate these theoretical skills into 1-2 public GitHub projects with live deployments.`;
  } else {
    primaryReadinessObservation = `You are at the foundational stage of your technical journey. Completing 2 structured hands-on projects will dramatically increase your internship readiness.`;
  }

  const scoredRoles = ROLE_ARCHETYPES.map(archetype => {
    let score = 0;
    const skillsYouHave = [];
    const skillsToImprove = [];

    archetype.keywords.forEach(keyword => {
      const hasSkill = normalizedSkillNames.some(s => s.includes(keyword) || keyword.includes(s));
      const inProject = projectsLower.includes(keyword);

      if (hasSkill || inProject) {
        score += inProject ? 3 : 2;
        const matchingEntry = skillsList.find(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().includes(keyword));
        const skillLabel = matchingEntry ? (typeof matchingEntry === 'string' ? matchingEntry : matchingEntry.name) : keyword.toUpperCase();
        if (!skillsYouHave.includes(skillLabel)) {
          skillsYouHave.push(skillLabel);
        }
      }
    });

    archetype.preferredAreas.forEach(area => {
      if (areasLower.some(a => area.toLowerCase().includes(a) || a.includes(area.toLowerCase()))) {
        score += 3;
      }
    });

    archetype.baseRequirements.forEach(req => {
      const reqLower = req.toLowerCase();
      const covered = skillsYouHave.some(s => reqLower.includes(s.toLowerCase()));
      if (!covered && skillsToImprove.length < 3) {
        const cleanReq = req.split('(')[0].replace(/Solid command of |Working knowledge of |Proficiency in |Familiarity with /i, '').trim();
        if (!skillsToImprove.includes(cleanReq)) {
          skillsToImprove.push(cleanReq);
        }
      }
    });

    if (skillsToImprove.length === 0) {
      skillsToImprove.push('Writing unit & integration tests', 'Production deployment with CI/CD', 'System design basics');
    }

    const isReady = score >= 5 || (skillsYouHave.length >= 2 && demonstratedSkills.length >= 1);
    const readinessStatus = isReady
      ? 'Ready to Explore Now (Intern / Junior)'
      : 'Explore After Preparation (2-3 Months)';

    const matchAssessment = score >= 8
      ? 'Strong alignment with your current project demonstrations and preferred career interests.'
      : score >= 4
      ? 'Good foundational fit; completing 1 targeted project will bridge the remaining knowledge gaps.'
      : 'Viable adjacent path with high industry growth; requires focused skill acquisition.';

    return {
      id: `role-${archetype.id}`,
      title: archetype.title,
      overview: archetype.overview,
      whyItFits: `Matches your current profile with ${skillsYouHave.length > 0 ? skillsYouHave.slice(0, 3).join(', ') : 'foundational capabilities'} and your academic background in ${profile.branch || 'engineering'}.`,
      skillsYouHave: skillsYouHave.length > 0 ? skillsYouHave : ['Core Computer Science concepts', 'Problem-solving mindset'],
      skillsToImprove: skillsToImprove.slice(0, 3),
      typicalRequirements: archetype.baseRequirements,
      matchAssessment,
      readinessStatus,
      suggestedPortfolioProjects: archetype.recommendedProjects,
      marketContextNote: archetype.marketContext,
      safeSearchQuery: archetype.defaultSearchQuery,
      score
    };
  });

  scoredRoles.sort((a, b) => b.score - a.score);
  const topRecommendations = scoredRoles.slice(0, 3).map(({ score, ...rest }) => rest);

  const topRole = topRecommendations[0];
  const primarySkillsToLearn = topRole.skillsToImprove.slice(0, 2);

  const learningRoadmap = [
    {
      phaseTitle: 'Phase 1: Foundation Deep-Dive & Code Hygiene',
      timeframe: 'Weeks 1 – 3 (10–12 hrs/week)',
      focusSkills: [
        topRole.skillsYouHave[0] || 'Core Language Mastery',
        primarySkillsToLearn[0] || 'Modern API & Data Handling',
        'Git Branching, Semantic Commits & GitHub Collaboration'
      ],
      actionMilestones: [
        `Audit your grasp of ${topRole.skillsYouHave[0] || 'fundamentals'} by completing 5 practical challenge exercises without using AI generators`,
        `Set up a clean GitHub repository profile with a professional README and license`,
        `Study ${primarySkillsToLearn[0] || 'best architectural patterns'} via official docs and open-source codebases`
      ],
      deliverableEvidence: '1 clean, well-tested GitHub repository featuring modular code and passing automated tests'
    },
    {
      phaseTitle: 'Phase 2: Production-Grade Portfolio Project',
      timeframe: 'Weeks 4 – 7 (12–15 hrs/week)',
      focusSkills: [
        topRole.skillsToImprove[0] || 'State & Error Architecture',
        topRole.skillsToImprove[1] || 'End-to-End Integration',
        'Live Cloud Deployment (Vercel / Render / Railway)'
      ],
      actionMilestones: [
        `Build a dedicated portfolio application: "${topRole.suggestedPortfolioProjects[0] || 'Full-Stack Showcase App'}"`,
        'Implement robust error boundaries, graceful loading skeletons, and responsive mobile layouts',
        'Deploy the project to a live public URL with automated CI deployment from GitHub main branch'
      ],
      deliverableEvidence: 'A live, deployed web application URL linked to a public GitHub repo with a comprehensive README, architectural diagram, and setup instructions'
    },
    {
      phaseTitle: 'Phase 3: Interview Readiness & Targeted Outreach',
      timeframe: 'Weeks 8 – 10 (8–10 hrs/week)',
      focusSkills: [
        'Technical Communication & Code Walkthroughs',
        'Core Behavioral STAR Responses for Tech Interviews',
        'Targeted Application Strategy (Internships & Freshers)'
      ],
      actionMilestones: [
        `Record a 2-minute Loom or video walkthrough explaining your project's architectural decisions and trade-offs`,
        'Prepare 10 fundamental interview questions covering the specific technologies in your primary stack',
        'Begin applying directly to verified internship & junior listings on LinkedIn and Internshala (5 quality applications/week)'
      ],
      deliverableEvidence: 'Polished 1-page PDF Resume + active LinkedIn profile + 3 curated GitHub pinned repositories with live demo links'
    }
  ];

  return {
    id: `career-analysis-${Date.now()}`,
    studentSummary: {
      demonstratedSkills: demonstratedSkills.length > 0 ? demonstratedSkills : ['Foundational Coursework & Labs'],
      selfReportedSkills: selfReportedSkills.length > 0 ? selfReportedSkills : skillsList.map(s => (typeof s === 'string' ? s : `${s.name} (${s.level || 'Intermediate'})`)),
      transferableStrengths,
      primaryReadinessObservation
    },
    jobRecommendations: topRecommendations,
    learningRoadmap,
    source: 'offline',
    sourceLabel: '💾 SMART BRIDGE Offline Career Engine',
    analyzedAt: new Date().toISOString()
  };
}
