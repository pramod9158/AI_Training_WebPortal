export interface CurriculumSession {
  sessionNumber: number;
  topic: string;
  module: string;
  subtopics: string[];
  durationMinutes?: number;
  outcome: string;
  prerequisite?: string;
  handsOnLab?: string;
}

export interface CurriculumWeek {
  weekNumber: number;
  title: string;
  subtitle: string;
  description: string;
  highlight: string;
  sessions: CurriculumSession[];
  weeklyProjectMilestone: {
    title: string;
    description: string;
    deliverable: string;
  };
}

export interface ProgramCurriculum {
  id: 'automation-testing' | 'performance-testing' | 'ai-training';
  slug: string;
  title: string;
  badge: string;
  trackNumber: string;
  trackSubtitle: string;
  themeColor: {
    primary: string;
    gradient: string;
    accent: string;
    border: string;
    bgSoft: string;
    badgeBg: string;
    badgeText: string;
    ring: string;
    glow: string;
  };
  shortDescription: string;
  fullOverview: string;
  targetAudience: string[];
  keyTools: {
    name: string;
    category: string;
    description: string;
    iconName?: string;
  }[];
  weeks: CurriculumWeek[];
  portfolioProjects: {
    title: string;
    tag: string;
    description: string;
    techStack: string[];
    features: string[];
  }[];
  careerServices: {
    mockInterviews: {
      title: string;
      description: string;
      features: string[];
    };
    resumeBuilding: {
      title: string;
      description: string;
      features: string[];
    };
    linkedInOptimization: {
      title: string;
      description: string;
      features: string[];
    };
    internshipProgram: {
      duration: string;
      title: string;
      description: string;
      features: string[];
      certificateTitle: string;
    };
  };
  pricingSnippet: {
    cohortPrice: string;
    originalPrice: string;
    duration: string;
    format: string;
  };
}

export const PROGRAMS_CURRICULUM_DATA: Record<string, ProgramCurriculum> = {
  // ───────────────────────────────────────────────────────────────────────────
  // TRACK 01: AUTOMATION TESTING PROGRAM
  // ───────────────────────────────────────────────────────────────────────────
  'automation-testing': {
    id: 'automation-testing',
    slug: 'automation-testing',
    title: 'Automation Testing Program',
    badge: 'Track 01 • Automation Engineering',
    trackNumber: 'Track 01',
    trackSubtitle: 'Full-Stack Test Automation & SDET Career Accelerator',
    themeColor: {
      primary: 'text-violet-600 dark:text-violet-400',
      gradient: 'from-violet-600 via-indigo-600 to-blue-600',
      accent: 'bg-violet-600',
      border: 'border-violet-500/40 dark:border-violet-500/30',
      bgSoft: 'bg-violet-50/70 dark:bg-violet-950/20',
      badgeBg: 'bg-violet-100 dark:bg-violet-950/70',
      badgeText: 'text-violet-700 dark:text-violet-300',
      ring: 'ring-violet-500/30',
      glow: 'shadow-violet-500/20',
    },
    shortDescription:
      'Master industry-standard web, API, and cross-browser automation with Selenium, Playwright, Azure DevOps, Jira, and CI/CD pipelines. Followed by a guaranteed 3-Month Industry Internship.',
    fullOverview:
      'The Waynautic Automation Testing Program is engineered for QA professionals, manual testers, and software engineers seeking to transition into high-paying SDET (Software Development Engineer in Test) roles. Over 4 weeks of hands-on, code-first live training, you will build production-grade automation suites using Selenium WebDriver and modern Playwright, master API automation, integrate Azure DevOps CI/CD pipelines, and manage real-world bug cycles in Jira. The training seamlessly transitions into a 3-month industry internship working on live production test frameworks.',
    targetAudience: [
      'Manual QA testers looking to switch to high-growth Automation / SDET roles',
      'Fresh CS/IT graduates aiming to kickstart a software engineering & test automation career',
      'Developers wishing to master robust E2E test frameworks and CI/CD automation quality gates',
      'QA Leads and Test Analysts aiming to upgrade to Playwright and Azure DevOps cloud pipelines',
    ],
    keyTools: [
      { name: 'Selenium WebDriver', category: 'Web Automation', description: 'Enterprise UI automation standard with dynamic waits, locators, and cross-browser execution.' },
      { name: 'Playwright', category: 'Modern Automation', description: 'Next-gen test runner with auto-waiting, network mocking, trace viewer, and WebKit/Chromium support.' },
      { name: 'Azure DevOps', category: 'CI/CD & Cloud', description: 'Automated test build pipelines, release gates, scheduled nocturnal regression runs, and artifact publishing.' },
      { name: 'Jira & Zephyr', category: 'Test Management', description: 'Sprint test execution tracking, defect life cycle workflows, traceability matrices, and Xray test suites.' },
      { name: 'Postman & REST Assured', category: 'API Testing', description: 'HTTP request automation, JSON schema validations, authentication tokens, and API regression testing.' },
      { name: 'Git & GitHub', category: 'Version Control', description: 'Branching workflows, pull request reviews, test repository maintenance, and webhook CI triggers.' },
      { name: 'TestNG / PyTest', category: 'Framework Runners', description: 'Assertions, data-driven test providers, parallel execution, test suites, and XML configurations.' },
      { name: 'Allure Reports', category: 'Test Reporting', description: 'Interactive visual test execution dashboards with screenshot attachments, logs, and failure analytics.' },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: 'Automation Foundations, Core Language & Selenium WebDriver Architecture',
        subtitle: 'OOP concepts, Git repositories, DOM locators & Web element automation',
        description:
          'Establish a rock-solid automation programming foundation. Master object-oriented principles, exception handling, Git branching, and dive into Selenium WebDriver architecture to automate complex web interactions.',
        highlight: 'Build your first end-to-end automated shopping cart checkout script in Selenium.',
        sessions: [
          {
            sessionNumber: 1,
            topic: 'Automation Foundations & Programming Language Refresher',
            module: 'Core Programming for QA',
            subtopics: [
              'Role of SDET vs Manual QA in modern agile teams',
              'Object-Oriented Programming: classes, objects, inheritance, encapsulation & polymorphism for test design',
              'Collections framework (Lists, Maps, Sets) for dynamic test data management',
              'Robust exception handling (try-catch, custom QA exceptions, screenshot on failure)',
              'Live demo: Writing clean, modular automation utility classes',
            ],
            durationMinutes: 75,
            outcome: 'Write clean, reusable test code adhering to OOP best practices and defensive exception handling.',
            handsOnLab: 'Develop a test utility library for reading test data and logging test steps cleanly.',
          },
          {
            sessionNumber: 2,
            topic: 'Git & GitHub Workflows for Test Automation Engineers',
            module: 'Version Control',
            subtopics: [
              'Git architecture: working directory, staging area, commit history & remote repos',
              'Essential Git commands: clone, branch, commit, push, pull, rebase & merge',
              'Feature branch workflows, resolving merge conflicts in test suites',
              'Writing `.gitignore` files for test logs, reports, and binary drivers',
              'Creating Pull Requests (PR) and code review standards for automation scripts',
            ],
            durationMinutes: 75,
            outcome: 'Collaborate seamlessly on enterprise test codebases using Git branching and PR reviews.',
            handsOnLab: 'Initialize a GitHub repository for your test suite and submit your first peer-reviewed PR.',
          },
          {
            sessionNumber: 3,
            topic: 'Selenium WebDriver Architecture & Advanced DOM Locators',
            module: 'Selenium WebDriver',
            subtopics: [
              'W3C WebDriver protocol, browser drivers & client libraries architecture',
              'Deep dive into XPath: absolute vs relative, XPath axes (parent, child, following-sibling, ancestor)',
              'CSS Selectors: attribute selectors, pseudo-classes, nth-child, and performance comparisons',
              'Handling dynamic IDs, shadow DOM, and nested iframe element resolution',
              'Inspection best practices with Chrome DevTools & XPath evaluation plugins',
            ],
            durationMinutes: 75,
            outcome: 'Author resilient, unbreakable locators that do not fail when UI CSS classes change.',
            handsOnLab: 'Construct dynamic XPath expressions for complex real-world e-commerce data grids.',
          },
          {
            sessionNumber: 4,
            topic: 'Synchronization, Waits & Complex UI Interactions in Selenium',
            module: 'Selenium WebDriver',
            subtopics: [
              'The danger of `Thread.sleep()`: Implicit Wait vs Explicit Wait vs Fluent Wait',
              '`WebDriverWait` with ExpectedConditions: elementToBeClickable, visibilityOfElementLocated, alertIsPresent',
              'Automating JavaScript alerts, browser popups, confirmation modal dialogs',
              'Multiple window & tab handling, switching contexts securely',
              'Actions class: mouse hover, drag-and-drop, right-click, slider movement & key combinations',
            ],
            durationMinutes: 75,
            outcome: 'Eliminate flaky tests with deterministic synchronization and master intricate UI gestures.',
            handsOnLab: 'Automate a complex multi-window drag-and-drop file upload workflow without flaky timeouts.',
          },
          {
            sessionNumber: 5,
            topic: 'Handling Dynamic Web Tables, Dropdowns & JavaScript Execution',
            module: 'Selenium WebDriver',
            subtopics: [
              'Select class for standard dropdowns vs custom React/Angular pseudo-dropdowns',
              'Iterating dynamic web tables: pagination, row-column coordinate lookups',
              'JavaScriptExecutor: scrolling into view, triggering clicks on obstructed elements, high-speed DOM reads',
              'Taking full-page and element-specific screenshots on test assertion failure',
              'Headless browser configuration for fast nocturnal execution',
            ],
            durationMinutes: 75,
            outcome: 'Handle modern single-page applications (SPAs) and dynamic tables reliably.',
            handsOnLab: 'Automate a paginated stock price ticker table and extract data into structured CSV format.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 1: E-Commerce Storefront Functional Automation Suite',
          description: 'Automate user registration, product search, filter application, dynamic cart calculation, and checkout workflows with robust explicit waits.',
          deliverable: 'A version-controlled Git repository containing automated Selenium tests executing against a live e-commerce web application.',
        },
      },
      {
        weekNumber: 2,
        title: 'Modern Playwright Automation Framework & Cross-Browser Mastery',
        subtitle: 'Auto-waiting, Trace Viewer, Network Interception & Parallel Runners',
        description:
          'Step into the cutting edge of web automation with Microsoft Playwright. Experience zero-config cross-browser execution across Chromium, Firefox, and WebKit, auto-waiting, visual debugging with Trace Viewer, and API network mocking.',
        highlight: 'Build a lightning-fast Playwright suite with video recordings, trace analysis, and network stubbing.',
        sessions: [
          {
            sessionNumber: 6,
            topic: 'Playwright Architecture & Project Setup',
            module: 'Playwright Mastery',
            subtopics: [
              'Why top engineering teams are migrating from Selenium to Playwright',
              'Playwright architecture: WebSocket communication, browser contexts & lightweight worker processes',
              'Project initialization with Node.js/TypeScript or Python',
              'Playwright Test Runner: configuration files, test fixtures, annotations, and multi-browser configs',
              'Understanding default Auto-Waiting and actionability checks (visible, stable, enabled)',
            ],
            durationMinutes: 75,
            outcome: 'Configure enterprise Playwright projects and leverage native auto-waiting for zero-flakiness.',
            handsOnLab: 'Initialize a Playwright suite running tests concurrently on Chrome, Firefox, and WebKit.',
          },
          {
            sessionNumber: 7,
            topic: 'Playwright Locators, Assertions & User Journey Automation',
            module: 'Playwright Mastery',
            subtopics: [
              'User-facing locators: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByTestId`',
              'Web-first assertions: `toBeVisible`, `toHaveText`, `toBeChecked`, with automatic polling',
              'Handling multi-page tabs and browser permissions (geolocation, notifications, camera)',
              'Authentication storage state: saving & reusing login cookies to bypass repetitive login steps',
              'File uploading and downloading workflows in Playwright',
            ],
            durationMinutes: 75,
            outcome: 'Write accessible, readable tests with user-centric locators and instant login session reuse.',
            handsOnLab: 'Implement an authentication state bypass to test authenticated dashboard views in under 2 seconds.',
          },
          {
            sessionNumber: 8,
            topic: 'Playwright Trace Viewer, Video Recording & Visual Debugging',
            module: 'Playwright Mastery',
            subtopics: [
              'Deep dive into the Playwright Trace Viewer: action snapshots, console logs, network waterfalls',
              'Configuring trace on first retry for zero-overhead production triage',
              'Video recording and screenshot capture on test failure',
              'Playwright Codegen (test generator) — using it effectively to scaffold complex DOM journeys',
              'UI Mode (`npx playwright test --ui`) for live interactive time-travel debugging',
            ],
            durationMinutes: 75,
            outcome: 'Debug test failures in minutes using interactive time-travel traces and visual network timelines.',
            handsOnLab: 'Diagnose a simulated asynchronous network race condition using Trace Viewer artifacts.',
          },
          {
            sessionNumber: 9,
            topic: 'Network Interception, Mocking & API Testing in Playwright',
            module: 'Playwright Advanced',
            subtopics: [
              'Why network mocking is essential for testing edge cases (500 errors, rate limits, empty states)',
              'Route mocking: `page.route()` to intercept HTTP requests and return custom JSON responses',
              'Modifying request headers and injecting auth bearer tokens',
              'Direct API testing using Playwright APIRequestContext: GET, POST, PUT, DELETE',
              'Combining UI actions with background API state seeding for high-speed end-to-end tests',
            ],
            durationMinutes: 75,
            outcome: 'Simulate server failures and fast-forward test preconditions using network mocking.',
            handsOnLab: 'Test a banking transfer UI under simulated 503 gateway timeouts and network disconnects.',
          },
          {
            sessionNumber: 10,
            topic: 'Visual Regression & Emulation in Playwright',
            module: 'Playwright Advanced',
            subtopics: [
              'Pixel-by-pixel visual comparison: `toHaveScreenshot()` and threshold calibration',
              'Masking dynamic elements (timestamps, user avatars, ads) in visual tests',
              'Mobile device emulation: iPhone, Pixel viewports, touch emulation, and user-agent overrides',
              'Dark mode, light mode, and color scheme media query testing',
              'Running Playwright in Docker containers for consistent rendering across platforms',
            ],
            durationMinutes: 75,
            outcome: 'Prevent visual UI regressions and validate responsive mobile layouts across multiple screen sizes.',
            handsOnLab: 'Create an automated visual regression test comparing dark vs light theme UI cards.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 2: Hybrid Modern Playwright Cross-Platform Suite',
          description: 'Develop a cross-browser, responsive test suite using user-facing locators, storage state reuse, and API stubbing.',
          deliverable: 'A comprehensive Playwright automation suite with automated Trace Viewer artifacts and HTML test report generation.',
        },
      },
      {
        weekNumber: 3,
        title: 'Enterprise Framework Design, API Automation & Azure DevOps CI/CD',
        subtitle: 'Page Object Model, REST Assured, Azure Pipelines & Jira Bug Management',
        description:
          'Architect an enterprise-scale test framework using Page Object Model (POM) and Data-Driven principles. Automate REST APIs, connect automated tests to Azure DevOps CI/CD pipelines, and link execution results to Jira tickets.',
        highlight: 'Trigger automatic regression runs on every Git push using an Azure DevOps CI/CD pipeline.',
        sessions: [
          {
            sessionNumber: 11,
            topic: 'Page Object Model (POM) & Clean Code Framework Architecture',
            module: 'Framework Architecture',
            subtopics: [
              'Why raw automation scripts fail at scale: code duplication, locator maintenance nightmares',
              'Page Object Model (POM) architectural design: separating locators, page actions, and test assertions',
              'BasePage and BaseTest design patterns for unified driver lifecycle management',
              'Fluent / Chained Page Object design pattern for expressive test readability (`login().goToDashboard()`)',
              'Component Object Model for reusable header, sidebar, and footer elements',
            ],
            durationMinutes: 75,
            outcome: 'Architect maintainable, scalable test frameworks that withstand frequent enterprise UI changes.',
            handsOnLab: 'Refactor an unorganized script suite into clean, decoupled Page Object Model classes.',
          },
          {
            sessionNumber: 12,
            topic: 'Data-Driven Testing & External Configurations',
            module: 'Framework Architecture',
            subtopics: [
              'Separating test logic from test data: DataProvider annotations and parameterized tests',
              'Reading external test datasets from JSON, CSV, and Excel (`Apache POI`) files',
              'Managing multi-environment configurations (DEV, QA, STAGING, PROD) via property files',
              'Thread-safe parallel test execution using `ThreadLocal<WebDriver>` and worker pools',
              'Allure Reports integration: `@Step`, `@Attachment`, `@Severity`, and historical trends',
            ],
            durationMinutes: 75,
            outcome: 'Run tests across dozens of data combinations simultaneously without thread collisions.',
            handsOnLab: 'Build a data-driven login test verifying 20+ valid and invalid credential combinations from JSON.',
          },
          {
            sessionNumber: 13,
            topic: 'REST API Test Automation & Backend Validation',
            module: 'API Automation',
            subtopics: [
              'REST API architecture: HTTP verbs, status codes, query vs path params, headers & payloads',
              'Automating REST calls with Postman collections & Newman command-line runner',
              'Code-based API testing with REST Assured / Requests: serialization & deserialization (POJO / Pydantic)',
              'Validating JSON response schemas, status codes, headers, and response latency',
              'Chaining APIs: extracting JWT authentication token and passing to downstream requests',
            ],
            durationMinutes: 75,
            outcome: 'Create high-speed backend API regression suites that catch bugs before UI tests run.',
            handsOnLab: 'Automate a complete CRUD lifecycle (Create, Read, Update, Delete) for an order management API.',
          },
          {
            sessionNumber: 14,
            topic: 'Azure DevOps CI/CD Pipelines for Automated Testing',
            module: 'Cloud CI/CD',
            subtopics: [
              'CI/CD concepts: continuous integration, continuous delivery, quality gates',
              'Azure DevOps overview: Repos, Pipelines, Test Plans, Artifacts',
              'Authoring `azure-pipelines.yml`: triggers, VM agents, dependency installation, headless browser execution',
              'Publishing test results (JUnit XML, NUnit) and Allure HTML report artifacts in Azure DevOps',
              'Configuring automated nightly regression runs and slack/email notifications on failure',
            ],
            durationMinutes: 75,
            outcome: 'Deploy automated test suites into cloud CI/CD pipelines triggered automatically on code commits.',
            handsOnLab: 'Set up an Azure DevOps pipeline that pulls test code from GitHub and runs automated tests on Linux agents.',
          },
          {
            sessionNumber: 15,
            topic: 'Jira Defect Management & Agile Test Life Cycle',
            module: 'Test Management',
            subtopics: [
              'Agile sprint workflows: User Stories, Acceptance Criteria, Definition of Done (DoD)',
              'Test case management in Jira using Zephyr Squad / Xray plugins',
              'Defect lifecycle: logging high-quality bug reports with repro steps, expected vs actual, logs & attachments',
              'Linking automated test executions to Jira requirements for 100% test coverage traceability',
              'Creating sprint test summary reports and defect density metrics for stakeholders',
            ],
            durationMinutes: 75,
            outcome: 'Operate fluently inside enterprise Jira agile workflows and document defects with SDET precision.',
            handsOnLab: 'Log a detailed bug ticket in Jira with reproduction steps, network logs, and attached trace file.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 3: CI/CD-Integrated End-to-End Test Framework',
          description: 'A complete Page Object Model framework combining UI and API tests running inside an Azure DevOps pipeline with Allure reporting.',
          deliverable: 'A live Azure DevOps pipeline badge showing successful continuous test integration runs on GitHub repository commits.',
        },
      },
      {
        weekNumber: 4,
        title: 'Portfolio Projects, Mock Interviews, Resume & Career Launch',
        subtitle: '4 Enterprise Projects, SDET Mock Rounds, ATS Resume, LinkedIn Branding & 3-Month Internship',
        description:
          'Assemble your production-grade SDET portfolio with 4 diverse projects. Undergo rigorous 1-on-1 mock technical interviews, optimize your resume for ATS screening, revamp your LinkedIn presence, and transition into the 3-month industry internship.',
        highlight: 'Complete comprehensive 1-on-1 technical mock interview with detailed mentor evaluation.',
        sessions: [
          {
            sessionNumber: 16,
            topic: 'Portfolio Project 1: Enterprise E-Commerce Full-Stack Test Suite',
            module: 'Applied Projects',
            subtopics: [
              'Architecture review: hybrid Selenium & Playwright framework with Page Object Model',
              'Automating search, filters, payment gateways (sandbox), invoice PDF downloads, and email alerts',
              'Multi-environment data-driven execution with parallel threads',
              'Containerized execution using Docker for consistent cross-browser runs',
              'Publishing an interactive Allure report to GitHub Pages',
            ],
            durationMinutes: 75,
            outcome: 'Complete a flagship E-Commerce test automation framework ready for recruiter inspection.',
            handsOnLab: 'Integrate automated screenshot attachments on failure into the flagship framework.',
          },
          {
            sessionNumber: 17,
            topic: 'Portfolio Project 2: Banking Application Secure Transaction Suite',
            module: 'Applied Projects',
            subtopics: [
              'FinTech test specifics: multi-factor authentication handling, session expiry, idempotency testing',
              'End-to-end money transfer journey with database verification (JDBC / SQLAlchemy validation)',
              'API + UI hybrid test: seeding user account balance via API before testing UI transfer form',
              'Auditing compliance: logging sensitive data masking and security header checks',
              'Packaging project documentation with clean README architecture diagrams',
            ],
            durationMinutes: 75,
            outcome: 'Demonstrate domain-specific testing mastery for high-paying FinTech & Banking SDET roles.',
            handsOnLab: 'Write a hybrid test that verifies database balance updates immediately after a UI transfer submission.',
          },
          {
            sessionNumber: 18,
            topic: 'Portfolio Project 3 & 4: Microservices API Suite & Visual Regression',
            module: 'Applied Projects',
            subtopics: [
              'Project 3: Microservices API Regression Suite with REST Assured / Requests and contract tests',
              'Project 4: Cross-Platform Playwright Visual Regression Suite for responsive web applications',
              'CI/CD integration for both projects with automated branch protection rules',
              'Writing comprehensive technical documentation: framework architecture, design patterns & setup instructions',
              'Publishing all 4 projects cleanly on GitHub with descriptive badges and demo GIFs',
            ],
            durationMinutes: 75,
            outcome: 'Finalize a 4-project public GitHub showcase that stands out decisively to engineering hiring managers.',
            handsOnLab: 'Add GitHub Actions CI badges and architecture flowcharts to all 4 repository README files.',
          },
          {
            sessionNumber: 19,
            topic: '1-on-1 SDET Technical Mock Interviews & Coding Challenges',
            module: 'Career Launch',
            subtopics: [
              'Live coding interview drills: string manipulation, locator design, dynamic wait scenarios',
              'Framework architecture interview questions: "Explain your framework from scratch"',
              'Answering tricky scenario-based questions: flakiness triage, handling non-reproducible bugs, testing without specs',
              'Individual technical mock interview session with personalized rubric scoring',
              'Constructive feedback report highlighting strengths and targeted technical areas for improvement',
            ],
            durationMinutes: 75,
            outcome: 'Acquire the confidence and technical articulation required to ace senior SDET interview rounds.',
            handsOnLab: 'Participate in live whiteboard coding challenge and framework architecture explanation.',
          },
          {
            sessionNumber: 20,
            topic: 'ATS Resume Building, LinkedIn Branding & Internship Onboarding',
            module: 'Career Launch',
            subtopics: [
              'Crafting an ATS-optimized SDET resume that passes corporate HR screening filters',
              'Framing test automation metrics: "Reduced regression execution time by 65% via parallel Playwright workers"',
              'LinkedIn profile overhaul: headline optimization, featured GitHub projects, skills endorsements',
              'Job application strategy: applying on LinkedIn, Naukri, Instahyre, and direct recruiter messaging templates',
              'Program Completion Certification briefing & official onboarding into the **3-Month Industry Internship**',
            ],
            durationMinutes: 75,
            outcome: 'Launch your job search with a high-converting resume, LinkedIn profile, and active internship placement.',
            handsOnLab: 'Submit final ATS-formatted resume and optimized LinkedIn profile for mentor sign-off.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 4: Dual Certification & 3-Month Industry Internship Onboarding',
          description: 'Pass the comprehensive technical framework assessment, complete mock interviews, and commence your 3-month industry internship working on live production client test frameworks.',
          deliverable: 'Official Program Completion Certificate + Verified Internship Placement Agreement.',
        },
      },
    ],
    portfolioProjects: [
      {
        title: 'Enterprise E-Commerce Full-Stack Test Suite',
        tag: 'Flagship UI & API',
        description: 'End-to-end functional automation suite covering user registration, multi-filter search, cart management, payment gateways, and order confirmation.',
        techStack: ['Selenium WebDriver', 'Playwright', 'Java / TypeScript', 'TestNG / PyTest', 'Allure Reports', 'Docker'],
        features: ['Page Object Model architecture', 'Data-driven parallel execution across 4 threads', 'Auto-recovery on transient DOM exceptions', 'Automated Allure reporting with screenshot attachments'],
      },
      {
        title: 'FinTech Banking Secure Transaction Automation',
        tag: 'Domain Automation',
        description: 'High-security financial workflow automation covering multi-factor authentication, funds transfers, statement generation, and SQL database balance verification.',
        techStack: ['Playwright', 'Node.js', 'REST API', 'PostgreSQL / JDBC', 'GitHub Actions'],
        features: ['API-seeded test preconditions for sub-second test setup', 'Deep database balance consistency assertions', 'Masked logging of sensitive PII data', 'Continuous regression runs on pull requests'],
      },
      {
        title: 'Microservices REST API Regression Suite',
        tag: 'API Automation',
        description: 'Headless, ultra-fast API automation suite validating 40+ REST endpoints across authentication, product catalogs, order processing, and inventory management.',
        techStack: ['REST Assured / Requests', 'Postman & Newman', 'JSON Schema Validator', 'Azure DevOps'],
        features: ['JWT token extraction and chained request authorization', 'JSON schema validation for contract reliability', 'Performance latency thresholds (< 500ms)', 'Execution in automated Azure DevOps build pipeline'],
      },
      {
        title: 'Responsive Visual Regression & Cross-Browser Suite',
        tag: 'Visual QA',
        description: 'Visual testing framework running automated pixel comparisons across desktop, tablet, and mobile viewport emulations in light and dark modes.',
        techStack: ['Playwright Test Runner', 'Chromium', 'WebKit', 'Firefox', 'Docker'],
        features: ['Pixel-by-pixel visual diffing with configurable tolerance', 'Dynamic element masking for timestamps and avatars', 'Emulation of mobile Safari and Android Chrome', 'Containerized execution for cross-OS stability'],
      },
    ],
    careerServices: {
      mockInterviews: {
        title: '1-on-1 Rigorous Technical Mock Interviews',
        description: 'Practice real-world SDET interview questions with experienced QA managers and receive structured feedback on your coding and framework design.',
        features: [
          'Live coding: automation algorithms, locators, dynamic waits',
          'Framework architecture deep-dive defense',
          'Scenario-based troubleshooting and flakiness elimination questions',
          'Personalized score card with specific action points',
        ],
      },
      resumeBuilding: {
        title: 'ATS-Optimized SDET Resume Creation',
        description: 'Transform your resume into a high-impact, metrics-driven document that clears corporate Applicant Tracking Systems (ATS).',
        features: [
          'Keywords optimization: Selenium, Playwright, CI/CD, POM, TestNG',
          'Action-verb bullet points highlighting measurable test efficiency gains',
          'Clean single-page format favored by top product companies',
          'Direct review and edits by senior hiring mentors',
        ],
      },
      linkedInOptimization: {
        title: 'LinkedIn Profile & Personal Brand Makeover',
        description: 'Position yourself as an in-demand Automation Engineer on LinkedIn so recruiters reach out directly to you.',
        features: [
          'High-converting headline and about section optimization',
          'Showcasing your public GitHub test repositories with demo recordings',
          'Custom connection request templates for reaching tech recruiters',
          'Strategies to gain visibility in SDET & QA community discussions',
        ],
      },
      internshipProgram: {
        duration: '3 Months Guaranteed',
        title: '3-Month Industry Internship — Production Test Frameworks',
        description: 'Directly following the 4-week intensive training, you transition into a 3-month industry internship at Waynautic Technologies, writing production test code.',
        features: [
          'Work on live production web apps, APIs, and client platforms',
          'Participate in real agile sprint standups and code reviews',
          'Author end-to-end tests merged into actual client CI/CD pipelines',
          'Official 3-Month Industry Internship Certificate recognized by employers',
          'Letter of Recommendation (LOR) based on project performance',
        ],
        certificateTitle: 'Official 3-Month Industry Internship Certificate',
      },
    },
    pricingSnippet: {
      cohortPrice: '₹9,999',
      originalPrice: '₹20,000',
      duration: '4 Weeks Live Training + 3 Months Industry Internship',
      format: 'Live Mentor-Guided Online Cohort',
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TRACK 02: PERFORMANCE TESTING PROGRAM
  // ───────────────────────────────────────────────────────────────────────────
  'performance-testing': {
    id: 'performance-testing',
    slug: 'performance-testing',
    title: 'Performance Testing Program',
    badge: 'Track 02 • Performance Engineering',
    trackNumber: 'Track 02',
    trackSubtitle: 'Enterprise Load Testing, Observability & APM Telemetry Accelerator',
    themeColor: {
      primary: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      accent: 'bg-amber-600',
      border: 'border-amber-500/40 dark:border-amber-500/30',
      bgSoft: 'bg-amber-50/70 dark:bg-amber-950/20',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
      badgeText: 'text-amber-700 dark:text-amber-300',
      ring: 'ring-amber-500/30',
      glow: 'shadow-amber-500/20',
    },
    shortDescription:
      'Master enterprise-scale load, stress, and endurance benchmarking with JMeter, LoadRunner, K6, and APM tools like AppDynamics, Grafana, and Datadog. Followed by a guaranteed 3-Month Industry Internship.',
    fullOverview:
      'The Waynautic Performance Testing & Engineering Program transforms software testers and engineers into high-value Performance Engineers and Site Reliability Engineers (SRE). Across 4 weeks of intensive, hands-on sessions, you master workload modeling, distributed load generation with Apache JMeter, legacy and enterprise systems with Micro Focus LoadRunner, and modern developer-first performance scripting with Grafana K6. Crucially, you go beyond just running load tests to mastering deep APM diagnostics using AppDynamics, Grafana, and Datadog to pinpoint CPU spikes, memory leaks, and database bottlenecks.',
    targetAudience: [
      'QA Engineers wanting to break into high-paying Performance Engineering & SRE domains',
      'Developers seeking to benchmark microservice architectures and pinpoint latency bottlenecks',
      'System administrators and DevOps engineers responsible for production capacity planning',
      'Freshers and career switchers aiming for specialized, high-demand testing roles',
    ],
    keyTools: [
      { name: 'Apache JMeter', category: 'Load Generation', description: 'Industry-standard open source load testing engine for HTTP/HTTPS, WebSockets, JDBC, and SOAP.' },
      { name: 'LoadRunner (OpenText)', category: 'Enterprise Load Testing', description: 'Enterprise testing platform: VuGen script recording, Controller scenarios, and Analysis engine.' },
      { name: 'Grafana K6', category: 'Modern Cloud Testing', description: 'Developer-centric, JavaScript-scripted performance testing with CLI, Docker, and CI/CD automation.' },
      { name: 'AppDynamics', category: 'APM & Diagnostics', description: 'Application Performance Monitoring, distributed business transaction tracing, and code-level diagnostics.' },
      { name: 'Grafana & Prometheus', category: 'Observability', description: 'Real-time telemetry metrics visualization, Prometheus scrapers, and infrastructure dashboards.' },
      { name: 'Datadog', category: 'Cloud Telemetry', description: 'Cloud infrastructure monitoring, APM flame graphs, error tracking, and database query profiling.' },
      { name: 'Azure DevOps & CI/CD', category: 'Automation Pipelines', description: 'Integrating automated performance test gates into release pipelines to prevent regressions.' },
      { name: 'Jira & Confluence', category: 'Performance Reports', description: 'NFR tracking, performance test summary reports, bottleneck defect tickets, and sign-offs.' },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: 'Performance Testing Fundamentals, NFR Modeling & Apache JMeter Mastery',
        subtitle: 'Throughput, P99 Percentiles, Workload Modeling & Script Parameterization',
        description:
          'Grasp the core scientific principles of performance engineering: SLA/SLO definitions, concurrency vs throughput, Little’s Law, and workload modeling. Master Apache JMeter from script recording to advanced correlation and parameterization.',
        highlight: 'Model and execute a 1,000+ concurrent user load test in Apache JMeter.',
        sessions: [
          {
            sessionNumber: 1,
            topic: 'Performance Engineering Core Concepts & Metric Fundamentals',
            module: 'Performance Fundamentals',
            subtopics: [
              'Why performance engineering matters: revenue loss, brand impact, and SLA breaches',
              'Performance test types: Load, Stress, Soak/Endurance, Spike, Scalability, Volume testing',
              'Key performance metrics: Response Time, Latency, Throughput (TPS/RPS), Error Rate, Concurrency',
              'Understanding statistical percentiles: Mean vs Median (P50), P90, P95, and P99 tail latency',
              'Non-Functional Requirements (NFR) gathering and translating business SLAs into technical targets',
            ],
            durationMinutes: 75,
            outcome: 'Analyze performance metrics mathematically and formulate precise NFR acceptance criteria.',
            handsOnLab: 'Calculate target throughput and concurrency for a 100,000 daily user platform using Little’s Law.',
          },
          {
            sessionNumber: 2,
            topic: 'Workload Modeling & Test Environment Sizing',
            module: 'Workload Modeling',
            subtopics: [
              'What is a Workload Model and why realistic traffic distribution is critical',
              'Analyzing production analytics (Google Analytics, server access logs) to identify peak hours',
              'Calculating transaction arrival rates, pacing, and user think times',
              'Test environment sizing: 1:1 prod replica vs scaled-down environments and extrapolation formulas',
              'Creating a formal Performance Test Strategy Document',
            ],
            durationMinutes: 75,
            outcome: 'Design real-world workload profiles that mirror true production customer behaviors.',
            handsOnLab: 'Build a workload model spreadsheet mapping out 5 user journeys during an e-commerce sale event.',
          },
          {
            sessionNumber: 3,
            topic: 'Apache JMeter Architecture & HTTP Samplers Deep Dive',
            module: 'Apache JMeter',
            subtopics: [
              'JMeter architecture: Thread Groups, Samplers, Logic Controllers, Listeners, Timers',
              'Setting up JMeter HTTP(S) Test Script Recorder and configuring browser proxy certificates',
              'Authoring modular test plans: HTTP Request Defaults, Header Manager, Cookie Manager, Cache Manager',
              'Structuring realistic user flows with Transaction Controllers and Random Timers (Think Time)',
              'Headless command-line execution (`jmeter -n -t test.jmx -l results.jtl -e -o report/`)',
            ],
            durationMinutes: 75,
            outcome: 'Record clean, modular JMeter test plans and execute high-speed non-GUI tests.',
            handsOnLab: 'Record an end-to-end shopping journey and generate a native JMeter HTML dashboard report.',
          },
          {
            sessionNumber: 4,
            topic: 'Correlation & Parameterization in JMeter',
            module: 'Apache JMeter',
            subtopics: [
              'Why recorded scripts fail: dynamic session tokens, CSRF tokens, cart IDs, and timestamps',
              'Dynamic value identification techniques using Request/Response comparison in View Results Tree',
              'Regular Expression Extractor, JSON Path Extractor, Boundary Extractor, and XPath2 Extractor',
              'Parameterizing test datasets using CSV Data Set Config (logins, search terms, addresses)',
              'Handling multi-threaded data sharing without thread collisions',
            ],
            durationMinutes: 75,
            outcome: 'Handle dynamic server tokens and feed unique test datasets to thousands of virtual threads.',
            handsOnLab: 'Extract dynamic CSRF tokens and cart IDs using JSON Extractor and pass them to subsequent requests.',
          },
          {
            sessionNumber: 5,
            topic: 'JMeter Assertions, Logic Controllers & Distributed Testing',
            module: 'Apache JMeter',
            subtopics: [
              'Validating responses: Response Assertion (text, code), JSON Assertion, Duration Assertion',
              'Logic Controllers: If Controller (conditional execution), Loop Controller, While Controller, Switch Controller',
              'JSR223 Pre/Post Processors with Groovy for high-performance custom data generation',
              'Distributed load injection: configuring Master-Slave JMeter server architecture across multiple machines',
              'Optimizing JMeter heap memory (`jmeter.bat` / `jmeter.sh`) to prevent OutOfMemory errors',
            ],
            durationMinutes: 75,
            outcome: 'Inject distributed load across multiple servers while maintaining strict assertion validations.',
            handsOnLab: 'Write Groovy scripts in JSR223 to generate dynamic UUIDs and simulate a distributed 2-node load test.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 1: E-Commerce Peak Sale JMeter Load & Stress Suite',
          description: 'A fully parameterized, correlated JMeter test suite simulating 1,000 concurrent users performing searches, cart additions, and checkouts.',
          deliverable: 'JMeter `.jmx` file and generated interactive HTML performance report analyzing TPS and response percentiles.',
        },
      },
      {
        weekNumber: 2,
        title: 'Enterprise LoadRunner & Modern Developer-Centric K6',
        subtitle: 'VuGen, C Scripting, Cloud K6, JavaScript Scripting & Docker Workflows',
        description:
          'Master Micro Focus / OpenText LoadRunner for enterprise legacy systems (banking, insurance, ERP) alongside modern cloud-native Grafana K6 for developer-first performance pipelines.',
        highlight: 'Create an automated K6 test in JavaScript and benchmark microservice APIs from Docker.',
        sessions: [
          {
            sessionNumber: 6,
            topic: 'LoadRunner Architecture & Virtual User Generator (VuGen)',
            module: 'LoadRunner (OpenText)',
            subtopics: [
              'LoadRunner architecture: VuGen, Controller, Analysis, Load Generators',
              'Protocol selection: Web HTTP/HTML, Web Services, TruClient',
              'Recording scripts in VuGen: Recording options, port mapping, recording levels',
              'Understanding `vuser_init`, `Actions`, and `vuser_end` lifecycle execution',
              'C-language basics for LoadRunner script customization and variable manipulation',
            ],
            durationMinutes: 75,
            outcome: 'Record and navigate enterprise VuGen scripts for mission-critical corporate platforms.',
            handsOnLab: 'Record a banking transfer portal in VuGen and structure transactions into appropriate action blocks.',
          },
          {
            sessionNumber: 7,
            topic: 'LoadRunner Correlation, Parameterization & Transactions',
            module: 'LoadRunner (OpenText)',
            subtopics: [
              'Manual vs Automatic correlation in VuGen; reading correlation scan results',
              '`web_reg_save_param_ex` deep dive: Ordinal, Boundaries, Flags, and regular expressions',
              'Parameterizing data with VuGen Parameter List: Unique, Sequential, Random, update per occurrence',
              'Transaction timing: `lr_start_transaction` and `lr_end_transaction` with status flags',
              '`lr_output_message` and debugging scripts via replay log outputs',
            ],
            durationMinutes: 75,
            outcome: 'Correlate complex enterprise session states in C and track sub-second transaction times.',
            handsOnLab: 'Extract dynamic session IDs using `web_reg_save_param_ex` and verify successful transaction completion.',
          },
          {
            sessionNumber: 8,
            topic: 'LoadRunner Controller Scenarios & Analysis Engine',
            module: 'LoadRunner (OpenText)',
            subtopics: [
              'Designing Controller scenarios: Manual vs Goal-Oriented scenarios',
              'Configuring schedule by scenario vs schedule by group; ramp-up, steady-state duration, ramp-down',
              'Assigning Load Generators and monitoring server connectivity during active execution',
              'Deep dive into LoadRunner Analysis: Hits per Second, Throughput, Transaction Response Time over time',
              'Merging graphs: Correlation between Throughput and Response Time to identify saturation points',
            ],
            durationMinutes: 75,
            outcome: 'Schedule large-scale multi-scenario Controller runs and produce executive performance analysis reports.',
            handsOnLab: 'Execute a Controller test with ramp-up schedule and export an Analysis summary report with SLA graphs.',
          },
          {
            sessionNumber: 9,
            topic: 'Introduction to Grafana K6: Modern Developer-First Testing',
            module: 'Grafana K6',
            subtopics: [
              'Why developer teams love K6: JavaScript scripting, Git-friendly code, ultra-low resource footprint',
              'K6 architecture: Go-based execution engine with JavaScript runtime (no JVM overhead)',
              'Writing your first K6 script: `http.get()`, `check()` assertions, and virtual user lifecycle',
              'Configuring test options: virtual users (VUs), duration, and ramping stages',
              'Understanding standard K6 metrics: `http_req_duration`, `http_req_failed`, `iterations`, `data_received`',
            ],
            durationMinutes: 75,
            outcome: 'Write clean, modern JavaScript load test scripts using Grafana K6.',
            handsOnLab: 'Author a K6 script that ramps from 10 to 200 VUs over 5 minutes and outputs summary statistics.',
          },
          {
            sessionNumber: 10,
            topic: 'Advanced K6: Thresholds, Custom Metrics & Docker Execution',
            module: 'Grafana K6',
            subtopics: [
              'Defining performance thresholds as code: `p(95) < 300`, `http_req_failed < 0.01` (Pass/Fail criteria)',
              'Custom metrics in K6: Trends, Rates, Gauges, and Counters for tracking business KPIs',
              'Parameterizing data using shared arrays from JSON files',
              'Running K6 inside Docker containers and exporting metrics to InfluxDB / Grafana dashboards',
              'K6 Cloud integration for global multi-region load injection',
            ],
            durationMinutes: 75,
            outcome: 'Establish automated quality gates with K6 thresholds running inside containerized environments.',
            handsOnLab: 'Run a K6 Docker container against a microservice API with strict p95 < 250ms threshold gates.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 2: Hybrid Enterprise LoadRunner & K6 Microservices Benchmark',
          description: 'A dual-technology milestone: an enterprise LoadRunner transaction scenario paired with a modern K6 Dockerized microservice suite.',
          deliverable: 'LoadRunner Analysis summary report and K6 JavaScript test repository with automated threshold validations.',
        },
      },
      {
        weekNumber: 3,
        title: 'APM Observability, Infrastructure Telemetry & Bottleneck Isolation',
        subtitle: 'AppDynamics, Grafana & Datadog Diagnostics, JVM Tuning & DB Profiling',
        description:
          'Shift from load generation to root-cause engineering. Master Application Performance Monitoring (APM) tools to trace distributed transactions, diagnose CPU spikes, isolate memory leaks, and profile slow SQL queries.',
        highlight: 'Diagnose a simulated memory leak and database thread exhaustion using AppDynamics and Grafana.',
        sessions: [
          {
            sessionNumber: 11,
            topic: 'Application Performance Monitoring (APM) Principles & AppDynamics',
            module: 'APM Diagnostics',
            subtopics: [
              'Why load testing is blind without APM telemetry; the three pillars of observability',
              'AppDynamics architecture: Agents (Java, .NET, Node.js), Controller, Application Flow Maps',
              'Business Transaction (BT) discovery and automatic baseline calculation',
              'Diagnosing slow, very slow, and stalled transactions in AppDynamics',
              'Deep dive into Call Graphs: pinpointing the exact Java class and method causing latency',
            ],
            durationMinutes: 75,
            outcome: 'Pinpoint exact application code bottlenecks down to the specific method and line of code.',
            handsOnLab: 'Navigate an AppDynamics Flow Map to isolate a 4-second method delay in an order processing service.',
          },
          {
            sessionNumber: 12,
            topic: 'Database Performance Profiling & Slow Query Isolation',
            module: 'Database Performance',
            subtopics: [
              'Database bottlenecks: slow queries, unindexed tables, missing foreign keys, lock contention',
              'Database connection pool sizing: thread starvation, max connections, connection timeout parameters',
              'AppDynamics Database Monitoring: analyzing Top Wait States, execution plans, and query response times',
              'Correlating database CPU and IOPS spikes with load test execution stages',
              'Recommending database tuning: query indexing, connection pool scaling, and query caching',
            ],
            durationMinutes: 75,
            outcome: 'Isolate database tier bottlenecks and recommend concrete connection pool and index optimizations.',
            handsOnLab: 'Identify a missing database index on a customer search table causing 80% DB CPU utilization.',
          },
          {
            sessionNumber: 13,
            topic: 'Server Infrastructure Telemetry: CPU, Memory, Disk & Network',
            module: 'Infrastructure Telemetry',
            subtopics: [
              'Operating system metrics (Linux/Windows): `%CPU` utilization (user, system, iowait), load average',
              'Memory analysis: Available memory, Swap usage, buffer cache, Out-Of-Memory (OOM) killer',
              'Disk I/O bottlenecks: IOPS, disk queue length, read/write latency, `%util` in `iostat`',
              'Network telemetry: bandwidth saturation, packet drops, TCP retransmissions',
              'Using command-line diagnostic tools: `top`, `htop`, `vmstat`, `iostat`, `netstat`, `sar`',
            ],
            durationMinutes: 75,
            outcome: 'Diagnose server hardware and OS resource saturation during peak load runs.',
            handsOnLab: 'Interpret `vmstat` and `iostat` output to determine whether a server bottleneck is CPU-bound or disk I/O-bound.',
          },
          {
            sessionNumber: 14,
            topic: 'JVM Architecture, Garbage Collection Tuning & Memory Leaks',
            module: 'JVM Engineering',
            subtopics: [
              'Java Virtual Machine (JVM) memory model: Heap (Young Gen, Old Gen, Metaspace) vs Non-Heap',
              'Garbage Collection (GC) algorithms: G1GC, ZGC, ParallelGC; understanding Stop-The-World (STW) pauses',
              'Analyzing Garbage Collection logs using tools like GCViewer or GCeasy',
              'What is a Java memory leak and how does it manifest during Soak / Endurance tests',
              'Taking and analyzing Java Heap Dumps using Eclipse Memory Analyzer Tool (MAT) to identify leak suspects',
            ],
            durationMinutes: 75,
            outcome: 'Identify JVM memory leaks and optimize Garbage Collection parameters to prevent system crashes.',
            handsOnLab: 'Analyze an Eclipse MAT heap dump file and find an accumulating uncollected HashMap object leak.',
          },
          {
            sessionNumber: 15,
            topic: 'Grafana & Datadog Full-Stack Telemetry Dashboards',
            module: 'Observability',
            subtopics: [
              'Prometheus metric collection and authoring PromQL queries for application telemetry',
              'Building unified Grafana dashboards: overlaying JMeter throughput on server CPU graphs',
              'Datadog APM setup: tracing distributed requests, latency percentiles, and error rate monitors',
              'Flame graphs in Datadog: visually dissecting CPU consumption across microservice call stacks',
              'Configuring proactive Slack alerts for high latency and error rate spikes',
            ],
            durationMinutes: 75,
            outcome: 'Build end-to-end observability dashboards correlating load injection with cloud infrastructure health.',
            handsOnLab: 'Create a custom Grafana dashboard tracking K6 virtual users alongside host server CPU and memory.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 3: End-to-End APM Telemetry & Bottleneck Isolation Case Study',
          description: 'A comprehensive root-cause analysis report documenting a diagnosed memory leak, slow database query, and recommended tuning.',
          deliverable: 'A formal Performance Bottleneck Analysis Report with AppDynamics / Datadog call graphs and telemetry screenshots.',
        },
      },
      {
        weekNumber: 4,
        title: 'CI/CD Performance Gates, 4 Projects, Mock Interviews & Internship Launch',
        subtitle: 'Azure DevOps CI/CD, 4 Real-World Projects, SRE Mock Rounds, ATS Resume & 3-Month Internship',
        description:
          'Integrate automated performance tests into Azure DevOps CI/CD quality gates. Finalize 4 enterprise portfolio projects, undergo rigorous 1-on-1 technical mock interviews, optimize your resume for Performance & SRE roles, and launch your 3-month industry internship.',
        highlight: 'Complete comprehensive 1-on-1 technical mock interview with detailed mentor evaluation.',
        sessions: [
          {
            sessionNumber: 16,
            topic: 'CI/CD Automated Performance Testing with Azure DevOps',
            module: 'CI/CD Quality Gates',
            subtopics: [
              'Shifting performance testing left: why testing only before release is too late',
              'Integrating headless JMeter and K6 runs into `azure-pipelines.yml` and GitHub Actions',
              'Automated pass/fail quality gates based on response time percentiles and error rates',
              'Publishing automated performance test trends into CI build dashboards',
              'Configuring baseline comparisons: alerting if a new build degrades latency by > 10%',
            ],
            durationMinutes: 75,
            outcome: 'Implement automated performance regression gates in continuous deployment pipelines.',
            handsOnLab: 'Build an Azure DevOps pipeline that executes K6 tests on build deployment and halts the release on SLA violation.',
          },
          {
            sessionNumber: 17,
            topic: 'Portfolio Project 1: High-Volume E-Commerce Flash Sale Benchmarking',
            module: 'Applied Projects',
            subtopics: [
              'Modeling an aggressive 5,000 concurrent user Flash Sale spike in JMeter',
              'Simulating payment gateway throttling, inventory locks, and cart concurrency',
              'Monitoring load injection across distributed master-slave nodes',
              'Analyzing cache hit ratios (Redis / CDN) and database read/write split impact',
              'Drafting the executive summary and performance recommendations report',
            ],
            durationMinutes: 75,
            outcome: 'Deliver a production-scale flash sale stress testing project with clear scalability conclusions.',
            handsOnLab: 'Simulate a 5x traffic spike over 60 seconds and document the application recovery curve.',
          },
          {
            sessionNumber: 18,
            topic: 'Portfolio Project 2 & 3: Banking Core & Microservices K6 Pipeline',
            module: 'Applied Projects',
            subtopics: [
              'Project 2: Core Banking Transaction Testing using LoadRunner VuGen with correlation and data security',
              'Project 3: Cloud Microservices Continuous Performance Pipeline with K6, Docker, and GitHub Actions',
              'Authoring comprehensive technical documentation and architecture diagrams for GitHub',
              'Publishing repository artifacts, test scripts, and Grafana dashboard templates',
              'Project peer review and mentor feedback session',
            ],
            durationMinutes: 75,
            outcome: 'Finalize 2 production-grade performance repositories ready for technical interview showcase.',
            handsOnLab: 'Publish the GitHub Actions K6 automated pipeline repository with detailed README documentation.',
          },
          {
            sessionNumber: 19,
            topic: '1-on-1 Performance Engineering Mock Interviews',
            module: 'Career Launch',
            subtopics: [
              'Core performance interview questions: Little’s Law, correlation vs parameterization, percentile definitions',
              'Scenario-based questions: "Production response time tripled after the last release, how do you investigate?"',
              'APM and architecture defense: explaining flame graphs, memory leaks, and database locks',
              'Individual 1-on-1 mock interview with realistic hiring manager scoring rubric',
              'Personalized feedback report with targeted technical guidance',
            ],
            durationMinutes: 75,
            outcome: 'Articulate performance engineering findings confidently and ace senior technical interview rounds.',
            handsOnLab: 'Participate in a live root-cause diagnosis scenario interview with a senior mentor.',
          },
          {
            sessionNumber: 20,
            topic: 'ATS Resume Building, LinkedIn Branding & Internship Onboarding',
            module: 'Career Launch',
            subtopics: [
              'Crafting an ATS-compliant resume tailored for Performance Engineer & SRE positions',
              'Highlighting high-impact business metrics: "Isolated memory leak in JVM, preventing downtime during 50k user peak"',
              'LinkedIn profile overhaul: keywords, featured case studies, APM badges, and recruiter visibility',
              'Application strategies for top tech firms and specialized performance engineering consultancies',
              'Program Completion Certification briefing & official onboarding into the **3-Month Industry Internship**',
            ],
            durationMinutes: 75,
            outcome: 'Launch your career as a qualified Performance Engineer with an active 3-month industry internship.',
            handsOnLab: 'Finalize and submit your ATS resume and updated LinkedIn profile for mentor approval.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 4: Dual Certification & 3-Month Industry Internship Onboarding',
          description: 'Pass the comprehensive technical performance engineering evaluation, complete mock interviews, and commence your 3-month industry internship working on live production client load generation clusters.',
          deliverable: 'Official Program Completion Certificate + Verified Internship Placement Agreement.',
        },
      },
    ],
    portfolioProjects: [
      {
        title: 'High-Volume E-Commerce Flash Sale Benchmarking',
        tag: 'Massive Load Testing',
        description: 'Comprehensive load, stress, and spike test suite simulating 5,000 concurrent shoppers checking out within a 15-minute flash sale window.',
        techStack: ['Apache JMeter', 'Distributed Load Nodes', 'Grafana', 'Prometheus', 'Linux OS'],
        features: ['Realistic workload model with think time and pacing', 'Dynamic CSRF and cart correlation', 'Distributed multi-node master-slave load injection', 'HTML dashboard report analyzing P90/P95/P99 latency trends'],
      },
      {
        title: 'Core Banking Secure Transaction Benchmark',
        tag: 'Enterprise LoadRunner',
        description: 'Enterprise LoadRunner VuGen test suite simulating concurrent wire transfers, account lookups, and statement downloads against a core banking application.',
        techStack: ['LoadRunner (OpenText)', 'VuGen', 'Controller', 'Analysis Engine', 'Oracle DB'],
        features: ['Complex C-language script correlation and token handling', 'Multi-scenario Controller scheduling with ramp-up stages', 'Transaction timing tracking across 12 business actions', 'Executive SLA compliance and bottleneck analysis report'],
      },
      {
        title: 'Cloud Microservices Continuous K6 Performance Pipeline',
        tag: 'Cloud & CI/CD',
        description: 'Developer-centric automated performance testing pipeline running containerized K6 tests on every release with strict threshold quality gates.',
        techStack: ['Grafana K6', 'Docker', 'GitHub Actions', 'JavaScript', 'REST APIs'],
        features: ['JavaScript test scripts version-controlled in Git', 'Automated pass/fail threshold gates (p95 < 200ms)', 'Containerized execution inside GitHub Actions runners', 'Automated export of performance metrics to Prometheus / Grafana'],
      },
      {
        title: 'Full-Stack APM Root-Cause Diagnostics & Memory Profiling',
        tag: 'APM Observability',
        description: 'Deep observability case study analyzing application telemetry, identifying a high-severity JVM memory leak, and profiling unindexed SQL queries.',
        techStack: ['AppDynamics', 'Datadog', 'Eclipse MAT', 'Java Virtual Machine', 'PostgreSQL'],
        features: ['Business Transaction flow map tracing', 'Eclipse MAT heap dump analysis identifying uncollected objects', 'Database wait state analysis and missing index isolation', 'Actionable tuning recommendations for engineering leadership'],
      },
    ],
    careerServices: {
      mockInterviews: {
        title: '1-on-1 Performance Engineering Mock Interviews',
        description: 'Practice workload modeling, metrics articulation, and root-cause troubleshooting case studies with experienced Performance Architects.',
        features: [
          'Workload modeling & NFR derivation exercises',
          'Triage scenarios: diagnosing production slowdowns and crashes',
          'Deep dive into JMeter, LoadRunner, K6, and APM internals',
          'Detailed scoring rubric and targeted technical coaching',
        ],
      },
      resumeBuilding: {
        title: 'ATS-Optimized Performance Engineer & SRE Resume',
        description: 'Structure your resume to showcase high-impact scalability wins, APM tool proficiencies, and concrete tuning achievements.',
        features: [
          'Keywords optimization: JMeter, K6, LoadRunner, AppDynamics, Datadog, JVM, SRE',
          'Metrics-driven bullet points highlighting latency reductions and capacity expansions',
          'Formatted for corporate ATS parsers and technical hiring managers',
          'Detailed review and iterative polish with your dedicated mentor',
        ],
      },
      linkedInOptimization: {
        title: 'LinkedIn Presence & Performance Engineering Branding',
        description: 'Optimize your LinkedIn profile to attract recruiters seeking specialized Performance Engineers and SREs.',
        features: [
          'Headline and summary tailored for Performance & SRE recruiter searches',
          'Featured project links with architecture diagrams and test reports',
          'Recruiter outreach messaging scripts and networking advice',
          'Best practices for contributing to QA and SRE technical forums',
        ],
      },
      internshipProgram: {
        duration: '3 Months Guaranteed',
        title: '3-Month Industry Internship — Live Performance Engineering',
        description: 'Directly following the 4-week training, you join Waynautic Technologies as an active Performance Engineering Intern working on production systems.',
        features: [
          'Work on real enterprise client infrastructure and high-traffic platforms',
          'Build, execute, and analyze distributed load tests using JMeter and K6',
          'Monitor live production servers using AppDynamics and Grafana',
          'Official 3-Month Industry Internship Certificate recognized nationwide',
          'Letter of Recommendation (LOR) for outstanding project contributions',
        ],
        certificateTitle: 'Official 3-Month Industry Internship Certificate',
      },
    },
    pricingSnippet: {
      cohortPrice: '₹9,999',
      originalPrice: '₹20,000',
      duration: '4 Weeks Live Training + 3 Months Industry Internship',
      format: 'Live Mentor-Guided Online Cohort',
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TRACK 03: AI TRAINING PROGRAM (Based on 26-Session Detailed Plan)
  // ───────────────────────────────────────────────────────────────────────────
  'ai-training': {
    id: 'ai-training',
    slug: 'ai-training',
    title: 'AI Training Program',
    badge: 'Track 03 • AI Engineering',
    trackNumber: 'Track 03',
    trackSubtitle: 'AI Market-Readiness, Generative AI & Agentic Systems Accelerator',
    themeColor: {
      primary: 'text-cyan-600 dark:text-cyan-400',
      gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
      accent: 'bg-cyan-600',
      border: 'border-cyan-500/40 dark:border-cyan-500/30',
      bgSoft: 'bg-cyan-50/70 dark:bg-cyan-950/20',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/70',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
      ring: 'ring-cyan-500/30',
      glow: 'shadow-cyan-500/20',
    },
    shortDescription:
      'Master Python AI backends, OpenAI/Claude/Gemini APIs, Prompt Engineering, Vector DBs, RAG pipelines, Model Context Protocol (MCP), and ReAct Agentic Workflows across 26 detailed sessions. Followed by a guaranteed 3-Month Industry Internship.',
    fullOverview:
      'The Waynautic AI Market-Readiness Training Program is an intensive, code-first engineering curriculum built from the ground up for software developers, engineers, and ambitious college students. Over 4 weeks and 26 detailed hands-on sessions, you progress from Python & FastAPI fundamentals to mastering Large Language Model APIs (OpenAI, Anthropic Claude, Google Gemini), advanced Prompt Engineering with structured JSON outputs and Chain-of-Thought reasoning, local model deployments via Ollama, enterprise Vector Databases (Chroma, FAISS, Pinecone), production RAG pipelines, Anthropic’s Model Context Protocol (MCP), and multi-step Agentic AI workflows. The program concludes with 4 applied portfolio projects and transitions into a 3-month industry internship developing production AI applications.',
    targetAudience: [
      'Software engineers and developers wanting to transition into AI Engineering and LLM Application roles',
      'CS/IT students and freshers seeking industry-grade Generative AI and Agentic portfolio projects',
      'Tech leads and architects looking to implement production RAG and autonomous AI agents in their organizations',
      'Working professionals seeking practical, code-first GenAI mastery without heavy mathematical theory',
    ],
    keyTools: [
      { name: 'Python & FastAPI', category: 'Backend Engine', description: 'Modern asynchronous REST API frameworks with Pydantic schemas, routing, and SQLite integrations.' },
      { name: 'Model APIs', category: 'Foundation Models', description: 'Enterprise SDK integration across OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, and Google Gemini.' },
      { name: 'Prompt Engineering', category: 'Prompt Architecture', description: 'Few-shot CoT, structured JSON schemas, delimiters, prompt injection security, and token optimization.' },
      { name: 'Vector Databases', category: 'Semantic Search', description: 'Embedding generation, similarity search, and hybrid vector indexing using Chroma, FAISS, and Pinecone.' },
      { name: 'RAG Pipelines', category: 'Information Retrieval', description: 'Document chunking, context injection, relevance evaluation, and multi-turn chat over documents.' },
      { name: 'Model Context Protocol (MCP)', category: 'Tool Architecture', description: 'Anthropic’s open standard for connecting AI models to local files, external APIs, and tools.' },
      { name: 'Agentic AI & ReAct', category: 'Autonomous Agents', description: 'Reasoning + Acting execution loops, prompt chaining, and dynamic function / tool calling.' },
      { name: 'Local AI (Ollama & LM Studio)', category: 'Edge & Local Models', description: 'Running open-source models (Llama 3, Mistral, Qwen) locally on device with zero cloud cost.' },
      { name: 'Cursor & GitHub Copilot', category: 'AI Developer Tools', description: 'Context engineering, inline code generation, and AI-accelerated end-to-end development.' },
      { name: 'Docker & Local Deployment', category: 'Packaging & Deploy', description: 'Containerizing AI backend services with requirements.txt, environment variables, and local testing.' },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: 'Programming Foundations, FastAPI & AI/LLM Core Architecture',
        subtitle: 'Sessions 1 to 6 • Python Refresher, APIs, FastAPI, LLM Mechanics & Provider SDKs',
        description:
          'Establish your AI programming foundation. Refactor Python scripts for clean exception handling, manage API keys securely, expose REST endpoints with FastAPI, understand LLM tokens and transformer architecture, and author a unified wrapper calling OpenAI, Claude, and Gemini.',
        highlight: 'Build a provider-agnostic Python wrapper that seamlessly switches between OpenAI, Claude, and Gemini.',
        sessions: [
          {
            sessionNumber: 1,
            topic: 'Python & Git Refresher',
            module: 'Programming Foundations',
            subtopics: [
              'Program introduction: Python, Gen AI, prompting, local AI, and agentic frameworks overview (5 min)',
              'OOP quick refresher: abstraction, inheritance, polymorphism, overview only (15 min)',
              'Git basics: init, add, commit, push, pull, branch (10 min)',
              'Exception handling: try/except, custom exceptions (15 min)',
              'Live demo: simple Python script calling an LLM API to fetch "latest AI trends" (15 min)',
              'Wrap-up & Q&A (5 min)',
            ],
            durationMinutes: 75,
            outcome: 'Run a Python script that calls an LLM API and handles basic error cases cleanly.',
            prerequisite: 'College-level Python & basic Git familiarity',
            handsOnLab: 'Write a Python script that calls an LLM API to fetch and print current AI trends with custom exception handling.',
          },
          {
            sessionNumber: 2,
            topic: 'Python Essentials for AI Development',
            module: 'Programming Foundations',
            subtopics: [
              'File handling: reading/writing text & JSON files (15 min)',
              'Environment variables & .env files for safe API key management (10 min)',
              'List/dict comprehensions & lambda functions — quick refresher (10 min)',
              'Multithreading vs multiprocessing: concept-level, when to use which (15 min)',
              'Live demo: refactor Session 1 script to read a prompt from a file and save the AI response to a file (10 min)',
            ],
            durationMinutes: 60,
            outcome: 'Read/write JSON files and safely manage API keys via .env files without hardcoded secrets.',
            prerequisite: 'Session 1 (Python basics, exception handling)',
            handsOnLab: 'Refactor the Session 1 script to load prompts dynamically from a JSON file and write responses to an output file.',
          },
          {
            sessionNumber: 3,
            topic: 'Working with APIs in Python',
            module: 'Programming Foundations',
            subtopics: [
              'HTTP fundamentals: GET/POST, headers, status codes (10 min)',
              'Using the requests library in Python (15 min)',
              'Parsing nested JSON responses (10 min)',
              'Error handling, retries & rate limits for API calls (10 min)',
              'Hands-on: call a free public API and print structured output (15 min)',
            ],
            durationMinutes: 60,
            outcome: 'Call any external REST API, handle rate limits and retries, and cleanly extract nested JSON data.',
            prerequisite: 'Session 2 (file handling, environment variables)',
            handsOnLab: 'Build a Python client that queries a public weather/news API, handles potential 429 rate limits, and extracts key fields.',
          },
          {
            sessionNumber: 4,
            topic: 'FastAPI Fundamentals',
            module: 'Programming Foundations',
            subtopics: [
              'What is FastAPI & why it is used for AI backends (10 min)',
              'REST API concepts recap (5 min)',
              'Building routes and request/response models with Pydantic (15 min)',
              'Basic data modeling + connecting a simple SQLite DB (15 min)',
              'Hands-on: wrap the Session 3 API call into a FastAPI endpoint and test it via Swagger UI (20 min)',
            ],
            durationMinutes: 65,
            outcome: 'Expose a working Python function as a tested, interactive API endpoint with automatic Swagger UI documentation.',
            prerequisite: 'Session 3 (requests library, working with APIs)',
            handsOnLab: 'Create a FastAPI microservice that accepts prompt requests and validates input schemas with Pydantic.',
          },
          {
            sessionNumber: 5,
            topic: 'Understanding LLMs',
            module: 'AI & LLM Fundamentals',
            subtopics: [
              'What is an LLM & how it processes text: tokens, context window (15 min)',
              'Transformer architecture: high-level, intuitive, non-mathematical overview (10 min)',
              'Inference parameters: temperature, top_p, max tokens (10 min)',
              'Choosing between models: OpenAI, Claude, Gemini — strengths & typical use cases (10 min)',
            ],
            durationMinutes: 45,
            outcome: 'Explain in plain terms how an LLM generates a response, what tokens represent, and how inference parameters tune output creativity.',
            prerequisite: 'Session 1 (first LLM API call demo)',
            handsOnLab: 'Experiment with temperature (0.0 vs 1.0) and top_p settings to observe the shift from deterministic code generation to creative writing.',
          },
          {
            sessionNumber: 6,
            topic: 'Model Provider APIs (OpenAI, Claude, Gemini)',
            module: 'AI & LLM Fundamentals',
            subtopics: [
              'Setting up API keys & SDKs for each provider (10 min)',
              'Making a basic chat completion call for each provider (15 min)',
              'Comparing structured-output / function-calling support across providers (10 min)',
              'Hands-on: build one Python wrapper function that can call any of the three providers (20 min)',
            ],
            durationMinutes: 55,
            outcome: 'Build a reusable, provider-agnostic Python function capable of dispatching prompts to OpenAI, Claude, or Gemini dynamically.',
            prerequisite: 'Session 4 (env vars, API basics), Session 5 (LLM fundamentals)',
            handsOnLab: 'Author a unified LLMClient class that accepts a provider flag ("openai" | "claude" | "gemini") and returns standardized text responses.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 1: Multi-Provider Unified AI Gateway API',
          description: 'A production FastAPI service that accepts prompt requests, authenticates callers, and routes completions to OpenAI, Anthropic Claude, or Google Gemini based on cost and capability parameters.',
          deliverable: 'A version-controlled FastAPI backend with Pydantic schemas and interactive Swagger UI documentation.',
        },
      },
      {
        weekNumber: 2,
        title: 'Advanced Prompt Engineering, AI Coding Tools & Local Deployments',
        subtitle: 'Sessions 7 to 12 • Prompt Control, JSON Schemas, CoT, AI Security, Cursor & Ollama',
        description:
          'Transform prompts from informal questions into deterministic software interfaces. Master few-shot Chain-of-Thought (CoT) reasoning, guarantee clean JSON schema responses, safeguard against prompt injection attacks, supercharge coding with Cursor/Copilot, and run local LLMs offline using Ollama.',
        highlight: 'Deploy and benchmark an open-source Llama-3 model running 100% locally on your machine via Ollama.',
        sessions: [
          {
            sessionNumber: 7,
            topic: 'Prompt Engineering Fundamentals',
            module: 'Prompt Engineering',
            subtopics: [
              'What is prompt engineering & why it matters (5 min)',
              'Prompt anatomy: system/user/assistant roles, personas, delimiters (15 min)',
              'Zero-shot vs few-shot prompting with worked examples (10 min)',
              'Common failure modes: vague instructions, ambiguity, missing constraints (10 min)',
              'Hands-on: rewrite weak prompts into effective, deterministic ones (15 min)',
            ],
            durationMinutes: 55,
            outcome: 'Write well-structured prompts using distinct system/user roles, contextual personas, delimiters, and few-shot examples.',
            prerequisite: 'Session 6 (calling model provider APIs)',
            handsOnLab: 'Refactor 5 fragile, ambiguous real-world prompts into rock-solid templates with clear delimiters and constraints.',
          },
          {
            sessionNumber: 8,
            topic: 'Structured Outputs & Prompt Control',
            module: 'Prompt Engineering',
            subtopics: [
              'Getting structured output: JSON mode, defining output schemas (15 min)',
              'Delimiters & formatting techniques: XML tags, markdown sections (10 min)',
              'Provider-specific nuances: XML tags (Claude) vs system instructions & JSON schema (OpenAI/Gemini) (10 min)',
              'Hands-on: build a prompt that reliably returns clean JSON and parse it in Python (20 min)',
            ],
            durationMinutes: 55,
            outcome: 'Force any model to return valid, parseable JSON adhering to a strict schema without markdown backticks or commentary.',
            prerequisite: 'Session 7 (prompt anatomy)',
            handsOnLab: 'Build a prompt pipeline that extracts product details from unformatted text and parses directly into a Pydantic model.',
          },
          {
            sessionNumber: 9,
            topic: 'Reasoning Techniques in Prompting',
            module: 'Prompt Engineering',
            subtopics: [
              'Chain-of-Thought (CoT) prompting fundamentals (15 min)',
              'Few-shot CoT with worked mathematical and logic examples (10 min)',
              'Self-consistency: running multiple attempts and picking the majority consensus answer (10 min)',
              'Hands-on: compare direct-answer vs CoT prompting on a reasoning task and observe the accuracy difference (15 min)',
            ],
            durationMinutes: 50,
            outcome: 'Apply Chain-of-Thought prompting to dramatically boost LLM accuracy on complex reasoning and problem-solving tasks.',
            prerequisite: 'Session 8 (structured prompting)',
            handsOnLab: 'Test a multi-step logic puzzle with zero-shot prompting vs Few-Shot CoT and record the accuracy improvement.',
          },
          {
            sessionNumber: 10,
            topic: 'Prompt Security, Debugging & Cost Optimization',
            module: 'Prompt Engineering',
            subtopics: [
              'Prompt injection: what it is, direct vs indirect injection, and basic mitigation patterns (15 min)',
              'Handling untrusted user input safely inside prompt templates (10 min)',
              'Debugging & evaluation: testing, versioning, and iterating prompts (10 min)',
              'Token & cost optimization techniques for production use: token pruning, caching (10 min)',
            ],
            durationMinutes: 45,
            outcome: 'Identify prompt injection vulnerabilities, build defensive guardrail templates, and optimize token usage to reduce production API costs.',
            prerequisite: 'Session 9 (reasoning techniques)',
            handsOnLab: 'Construct an adversarial prompt injection attack against a customer service bot and implement a defensive sanitization layer.',
          },
          {
            sessionNumber: 11,
            topic: 'AI-Powered Development Tools',
            module: 'AI-Assisted Development',
            subtopics: [
              'Overview of AI coding assistants: Cursor, GitHub Copilot (10 min)',
              'Inline code generation & completion workflows (15 min)',
              'Context engineering: providing the assistant the right project context, `.cursorrules`, and doc references (15 min)',
              'Hands-on: use Cursor/Copilot to build a small feature end-to-end (20 min)',
            ],
            durationMinutes: 60,
            outcome: 'Use modern AI-powered IDEs (Cursor / Copilot) with context engineering to develop features 3x faster than traditional coding.',
            prerequisite: 'Session 1 (Python & Git basics)',
            handsOnLab: 'Write a `.cursorrules` file and use Cursor agent mode to scaffold a complete CRUD database utility in Python.',
          },
          {
            sessionNumber: 12,
            topic: 'Local AI Deployment',
            module: 'AI Deployment',
            subtopics: [
              'Why and when to use local AI vs cloud AI: data privacy, zero API costs, offline capabilities (10 min)',
              'Introduction to Ollama and LM Studio: what they are and architecture (15 min)',
              'Model selection (Llama 3, Mistral, Qwen) & installation (15 min)',
              'Hands-on: run a local model and compare a cloud-model prompt vs the same prompt run locally (20 min)',
            ],
            durationMinutes: 60,
            outcome: 'Run open-source LLMs locally on your workstation and make informed engineering tradeoffs between cloud vs on-premise AI.',
            prerequisite: 'Session 6 (calling model APIs), Session 9 (prompting technique to compare fairly)',
            handsOnLab: 'Install Ollama, pull `llama3.2:latest`, and execute a Python script comparing local response latency against OpenAI.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 2: Secure Prompt Engineering & Local AI Benchmark Suite',
          description: 'A production testbench featuring structured JSON extraction, anti-injection sanitization guards, and a benchmark comparing local Ollama models vs cloud APIs on speed, cost, and output accuracy.',
          deliverable: 'A comprehensive benchmark report and Python testing harness evaluated across multiple prompt variations.',
        },
      },
      {
        weekNumber: 3,
        title: 'Vector Databases, Production RAG Pipelines & Agentic AI Workflows',
        subtitle: 'Sessions 13 to 19 • Chroma, FAISS, Chunking, Hybrid Search, MCP & ReAct Agents',
        description:
          'Overcome LLM knowledge-cutoff limitations. Master text embeddings, document chunking strategies, vector stores (Chroma, FAISS, Pinecone), and build end-to-end Retrieval-Augmented Generation (RAG) pipelines. Then, advance to Anthropic’s Model Context Protocol (MCP) and ReAct Agentic workflows.',
        highlight: 'Build an end-to-end "Chat With Your PDF" RAG system and connect an LLM to local tools via MCP.',
        sessions: [
          {
            sessionNumber: 13,
            topic: 'Introduction to Vector Databases',
            module: 'Vector DB & RAG',
            subtopics: [
              'Why traditional relational & keyword databases fall short for semantic AI search (10 min)',
              'What are embeddings & high-dimensional vector representations (15 min)',
              'Overview of common vector DB options: Chroma, FAISS, Pinecone, pgvector (15 min)',
              'Hands-on: generate embeddings for sample text and inspect mathematical distances (15 min)',
            ],
            durationMinutes: 55,
            outcome: 'Explain the mathematics of semantic embeddings and generate vector representations via OpenAI / HuggingFace embedding models.',
            prerequisite: 'Session 6 (using model provider APIs — embeddings are also API calls)',
            handsOnLab: 'Compute cosine similarity between 5 diverse sentences to see how semantic proximity is quantified mathematically.',
          },
          {
            sessionNumber: 14,
            topic: 'Chunking & Embedding Strategies',
            module: 'Vector DB & RAG',
            subtopics: [
              'Document chunking strategies: fixed-size vs semantic vs recursive character chunking (15 min)',
              'Choosing chunk size & chunk overlap tradeoffs (10 min)',
              'Storing & querying embeddings in a vector DB (Chroma) (20 min)',
              'Hands-on: build a small searchable embedding index from a text/PDF file (20 min)',
            ],
            durationMinutes: 65,
            outcome: 'Chunk unstructured documents intelligently, generate embeddings, and store them in a persistent vector database.',
            prerequisite: 'Session 13 (embeddings basics)',
            handsOnLab: 'Load a 20-page technical PDF, chunk it using recursive character splitting, and index it into a local ChromaDB collection.',
          },
          {
            sessionNumber: 15,
            topic: 'Retrieval-Augmented Generation (RAG) Fundamentals',
            module: 'Vector DB & RAG',
            subtopics: [
              'What is RAG & why it solves LLM hallucination and knowledge-cutoff limitations (10 min)',
              'RAG pipeline stages: ingestion, retrieval, augmentation, generation (15 min)',
              'Basic hybrid search concepts: keyword (BM25) + semantic vector search (10 min)',
              'Hands-on: retrieve the most relevant chunks for a sample natural language query (15 min)',
            ],
            durationMinutes: 50,
            outcome: 'Demonstrate and explain the retrieval half of a RAG pipeline and formulate hybrid search queries.',
            prerequisite: 'Session 14 (chunking & embeddings)',
            handsOnLab: 'Execute top-k semantic retrieval queries against ChromaDB and inspect similarity scores of returned chunks.',
          },
          {
            sessionNumber: 16,
            topic: 'Building a Complete RAG Pipeline',
            module: 'Vector DB & RAG',
            subtopics: [
              'Connecting retrieval output to prompt construction (15 min)',
              'Injecting retrieved context into prompts effectively with clear citations (15 min)',
              'Evaluating RAG output quality: basic relevance checks and citation verification (10 min)',
              'Hands-on: build an end-to-end "chat with your document" mini pipeline in Python (25 min)',
            ],
            durationMinutes: 65,
            outcome: 'Build a complete, working RAG pipeline that ingests documents and answers user questions strictly based on retrieved context.',
            prerequisite: 'Session 15 (RAG fundamentals), Session 8 (structured prompting)',
            handsOnLab: 'Build an end-to-end CLI application where a user asks questions about a company policy document and receives cited answers.',
          },
          {
            sessionNumber: 17,
            topic: 'Model Context Protocol (MCP) Basics',
            module: 'MCP & Tool Use',
            subtopics: [
              'What is MCP & why it matters for connecting AI to external tools and data sources (15 min)',
              'MCP architecture: clients, servers, resources, prompts, and tools at a conceptual level (15 min)',
              'Overview of stdio and HTTP/SSE transports (10 min)',
              'Hands-on: explore and connect to a simple existing MCP server (15 min)',
            ],
            durationMinutes: 55,
            outcome: 'Explain Anthropic’s Model Context Protocol (MCP) architecture and connect an LLM client to an external MCP server.',
            prerequisite: 'Session 6 (model provider APIs), Session 4 (API/FastAPI concepts)',
            handsOnLab: 'Configure an MCP client to interact with a filesystem/database MCP server and fetch live data dynamically.',
          },
          {
            sessionNumber: 18,
            topic: 'Function / Tool Calling',
            module: 'MCP & Tool Use',
            subtopics: [
              'What is function calling & how an LLM decides when and which tool to use (15 min)',
              'Defining a strict JSON schema for functions the model can call (15 min)',
              'Handling the model’s tool-call response in Python and executing the actual code (15 min)',
              'Hands-on: build a simple tool-calling flow (e.g., calculator or live weather lookup) (20 min)',
            ],
            durationMinutes: 65,
            outcome: 'Equip an LLM with external Python tools so it can query live APIs, perform calculations, and return verified results.',
            prerequisite: 'Session 8 (structured output), Session 17 (MCP basics)',
            handsOnLab: 'Create an LLM agent with 3 tools (stock quote lookup, currency converter, tax calculator) and execute multi-turn tool calling.',
          },
          {
            sessionNumber: 19,
            topic: 'Introduction to Agentic AI Workflows',
            module: 'Agentic AI (Intro)',
            subtopics: [
              'What makes an AI system "agentic": autonomous decision making vs static prompt/response (10 min)',
              'The ReAct pattern: Reasoning + Acting loop at a conceptual & practical level (15 min)',
              'Prompt chaining: breaking a complex task into multiple linked, specialized prompts (15 min)',
              'Hands-on: build a simple 2-step chained-prompt workflow (15 min)',
            ],
            durationMinutes: 55,
            outcome: 'Describe and construct a minimal multi-step agentic execution loop (ReAct) without relying on bloated external frameworks.',
            prerequisite: 'Session 18 (tool calling), Session 9 (CoT reasoning)',
            handsOnLab: 'Build a research agent that breaks down a complex user question, gathers information step-by-step, and compiles a final report.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 3: Production RAG & Tool-Augmented Agent Engine',
          description: 'A fully functional RAG application combined with an MCP-compatible tool-calling agent capable of answering questions from private files and querying external APIs.',
          deliverable: 'A working Python/FastAPI codebase integrating ChromaDB semantic retrieval and an autonomous multi-step tool-calling workflow.',
        },
      },
      {
        weekNumber: 4,
        title: '4 Applied Projects, Guardrails, Docker, Capstone & Career Launch',
        subtitle: 'Sessions 20 to 26 • 4 Mini Projects, Evaluation, Docker Deploy, Mock Interviews & Internship',
        description:
          'Apply all your accumulated knowledge across 4 market-ready projects: an AI Chatbot, an AI PDF Q&A RAG app, an AI Resume Analyzer, and an AI Email Assistant. Implement output evaluation guardrails, package with Docker, complete 1-on-1 mock interviews, and transition directly into the 3-month industry internship.',
        highlight: 'Complete comprehensive 1-on-1 technical mock interview and onboard into your 3-month industry internship.',
        sessions: [
          {
            sessionNumber: 20,
            topic: 'Mini Project 1 — AI Chatbot',
            module: 'Applied Projects',
            subtopics: [
              'Project brief & requirements walkthrough (10 min)',
              'Building conversation / message-history management in memory and database (20 min)',
              'Wrapping chatbot logic in a high-performance FastAPI endpoint (20 min)',
              'Testing, streaming responses, and refinement (15 min)',
            ],
            durationMinutes: 65,
            outcome: 'A working, stateful AI Chatbot exposed via a FastAPI endpoint with conversation memory, ready to demo.',
            prerequisite: 'Session 4 (FastAPI), Session 6 (model APIs), Session 8 (structured output)',
            handsOnLab: 'Deploy a multi-turn chat endpoint that maintains user session history and supports system persona injection.',
          },
          {
            sessionNumber: 21,
            topic: 'Mini Project 2 — AI PDF Q&A (RAG-based)',
            module: 'Applied Projects',
            subtopics: [
              'Project brief: document upload & natural language Q&A flow (10 min)',
              'Implementing the ingestion + retrieval pipeline with ChromaDB (25 min)',
              'Connecting semantic retrieval to verified answer generation (15 min)',
              'Testing with sample complex multi-page PDF documents (15 min)',
            ],
            durationMinutes: 65,
            outcome: 'A working "upload a PDF and ask questions about it" application with source chunk citation.',
            prerequisite: 'Session 16 (complete RAG pipeline)',
            handsOnLab: 'Build a document analysis pipeline that accepts PDF uploads, indexes vectors, and answers domain-specific queries.',
          },
          {
            sessionNumber: 22,
            topic: 'Mini Project 3 — AI Resume Analyzer',
            module: 'Applied Projects',
            subtopics: [
              'Project brief & expected structured output format (10 min)',
              'Extracting text from resume files: PDF/DOCX parsing (15 min)',
              'Prompting the model to analyze, score skills, and compare against a job description (20 min)',
              'Structuring & displaying the score and improvement suggestions (15 min)',
            ],
            durationMinutes: 60,
            outcome: 'A working AI tool that parses candidate resumes, computes ATS match scores, and generates structured hiring feedback.',
            prerequisite: 'Session 8 (structured output), Session 2 (file handling)',
            handsOnLab: 'Develop an automated resume scoring tool that evaluates candidate experience against target job descriptions.',
          },
          {
            sessionNumber: 23,
            topic: 'Mini Project 4 — AI Email Assistant',
            module: 'Applied Projects',
            subtopics: [
              'Project brief: draft / summarize / reply use cases (10 min)',
              'Prompt design for tone-, length-, and context-aware replies (20 min)',
              'Building the FastAPI endpoint for the email assistant (15 min)',
              'Testing across different realistic workplace email scenarios (15 min)',
            ],
            durationMinutes: 60,
            outcome: 'A working AI assistant capable of summarizing lengthy email threads and drafting context-aware professional replies.',
            prerequisite: 'Session 4 (FastAPI), Session 9 (prompting techniques)',
            handsOnLab: 'Create an email assistant endpoint with options for reply tone ("formal", "concise", "assertive", "friendly").',
          },
          {
            sessionNumber: 24,
            topic: 'Evaluation, Testing & Guardrails',
            module: 'Evaluation & Guardrails',
            subtopics: [
              'Why prompts and outputs need systematic evaluation, not just eyeballing (10 min)',
              'Building a simple evaluation harness: run a prompt N times and log outputs (20 min)',
              'Basic guardrails: input validation, toxicity checking, and output JSON schema enforcement (15 min)',
              'Hands-on: add an automated evaluation check to one of the mini projects (15 min)',
            ],
            durationMinutes: 60,
            outcome: 'Demonstrate that an AI prompt/response pipeline is consistently safe, reliable, and deterministic beyond simple one-off tests.',
            prerequisite: 'Session 10 (debugging/evaluation basics), Sessions 20-23 (a project to evaluate)',
            handsOnLab: 'Build an automated evaluation test script that runs 20 test inputs against the Resume Analyzer and flags malformed responses.',
          },
          {
            sessionNumber: 25,
            topic: 'Deployment Essentials',
            module: 'Deployment',
            subtopics: [
              'Local deployment recap: running a FastAPI app locally in production mode (10 min)',
              'Packaging an app: requirements.txt, pyproject.toml, and conceptual overview of Docker (20 min)',
              'Introduction to cloud deployment concepts: environment variables, container registries (15 min)',
              'Hands-on: containerize and deploy one mini project locally, end-to-end (15 min)',
            ],
            durationMinutes: 60,
            outcome: 'Package and run a complete AI project inside a Docker container, decoupling it from local machine dependencies.',
            prerequisite: 'Session 4 (FastAPI), Session 12 (local AI setup experience)',
            handsOnLab: 'Write a Dockerfile for the AI Chatbot project, build the image, and run the container locally with environment variables.',
          },
          {
            sessionNumber: 26,
            topic: 'Capstone Review & Certification Prep',
            module: 'Capstone & Certification',
            subtopics: [
              'Recap of the full learning journey: Python to Prompting to RAG to Agentic workflows to Projects (15 min)',
              'Student presentations: each student demos one mini project of their choice (30 min)',
              'Common interview / placement questions on AI engineering and LLM applications (15 min)',
              'Certification assessment briefing & official onboarding into the **3-Month Industry Internship** (10 min)',
            ],
            durationMinutes: 70,
            outcome: 'Present your completed AI project, pass the certification readiness briefing, and transition into the 3-month industry internship.',
            prerequisite: 'All previous sessions (1 to 25)',
            handsOnLab: 'Deliver a live 5-minute technical walkthrough of your chosen mini project demonstrating architecture and API execution.',
          },
        ],
        weeklyProjectMilestone: {
          title: 'Milestone 4: 4-Project AI Showcase & 3-Month Industry Internship Onboarding',
          description: 'Package all 4 mini projects with clean GitHub repositories, complete your live project walkthrough, undergo 1-on-1 mock interviews, and commence your 3-month industry internship.',
          deliverable: 'Official Program Completion Certificate + Verified Internship Placement Agreement.',
        },
      },
    ],
    portfolioProjects: [
      {
        title: 'Stateful AI Conversational Assistant',
        tag: 'Conversational AI',
        description: 'Multi-turn conversational AI engine with persistent SQLite message history, dynamic persona injection, and low-latency streaming endpoints.',
        techStack: ['Python', 'FastAPI', 'OpenAI / Claude API', 'Pydantic', 'Docker'],
        features: ['Sliding window conversation memory', 'System persona & constraint enforcement', 'FastAPI streaming response generator', 'Robust error recovery on model timeout'],
      },
      {
        title: 'Production RAG "Chat With Your PDF" Engine',
        tag: 'Retrieval Augmented Generation',
        description: 'Semantic document intelligence platform enabling natural language queries over uploaded complex multi-page PDFs with cited source snippets.',
        techStack: ['Python', 'ChromaDB', 'OpenAI Embeddings', 'FastAPI', 'PyPDF'],
        features: ['Recursive character document chunking with overlap', 'Top-k semantic similarity search in ChromaDB', 'Context injection preventing model hallucination', 'Strict document-grounded citation synthesis'],
      },
      {
        title: 'AI Resume Matcher & ATS Scoring Analyzer',
        tag: 'Automated Evaluation',
        description: 'Intelligent candidate evaluation tool parsing PDF/DOCX resumes, comparing skill proficiencies against job descriptions, and outputting structured JSON metrics.',
        techStack: ['Python', 'Claude 3.5 Sonnet', 'JSON Mode', 'Pydantic', 'FastAPI'],
        features: ['Automated PDF text extraction and normalization', 'Structured JSON output schema validation', 'Deterministic scoring rubrics across technical competencies', 'Actionable recommendation generation for candidates'],
      },
      {
        title: 'Context-Aware AI Workplace Email Assistant',
        tag: 'Productivity AI',
        description: 'Smart email processing microservice capable of summarizing multi-party email threads, detecting urgency, and drafting tone-customized replies.',
        techStack: ['Python', 'FastAPI', 'Google Gemini', 'Pydantic', 'Docker'],
        features: ['Email thread summarization with action item extraction', 'Tone customization (formal, assertive, friendly, concise)', 'REST API endpoint with Swagger UI documentation', 'Containerized for turnkey deployment'],
      },
    ],
    careerServices: {
      mockInterviews: {
        title: '1-on-1 AI Engineer Technical Mock Interviews',
        description: 'Undergo rigorous interview preparation with experienced AI leads covering prompt architecture, RAG pipelines, and agentic systems.',
        features: [
          'LLM system architecture & trade-off discussions',
          'Live coding: API wrapper design, chunking algorithms, JSON schema enforcement',
          'RAG debugging scenarios: fixing hallucination, improving chunk retrieval precision',
          'Personalized rubric feedback with actionable study guides',
        ],
      },
      resumeBuilding: {
        title: 'ATS-Optimized AI & LLM Engineer Resume',
        description: 'Transform your resume to target high-growth AI Engineer, GenAI Developer, and LLM Application Specialist roles.',
        features: [
          'Keyword optimization: RAG, ChromaDB, MCP, Prompt Engineering, FastAPI, Agentic AI',
          'Highlighting all 4 deployed portfolio projects with live GitHub and API links',
          'Single-page modern format vetted by AI startup founders and hiring managers',
          'Iterative 1-on-1 mentor resume reviews and polishing',
        ],
      },
      linkedInOptimization: {
        title: 'LinkedIn AI Personal Branding & Recruiter Visibility',
        description: 'Establish yourself as a visible, capable AI Engineer on LinkedIn to attract direct outreach from tech recruiters.',
        features: [
          'High-impact headline and summary highlighting production GenAI skills',
          'Featured project showcases with demo recordings and architecture flowcharts',
          'Custom networking templates for reaching AI Engineering hiring managers',
          'Guidance on writing insightful posts discussing AI project learnings',
        ],
      },
      internshipProgram: {
        duration: '3 Months Guaranteed',
        title: '3-Month Industry Internship — Production AI Systems',
        description: 'Continue immediately after the 4-week training into a 3-month industry internship at Waynautic Technologies, writing code for real AI products.',
        features: [
          'Work on live production AI applications, RAG pipelines, and agent systems',
          'Collaborate with senior engineering mentors in real sprint standups',
          'Write production Python and FastAPI code reviewed by senior engineers',
          'Official 3-Month Industry Internship Certificate recognized by employers',
          'Letter of Recommendation (LOR) for high-performing interns',
        ],
        certificateTitle: 'Official 3-Month Industry Internship Certificate',
      },
    },
    pricingSnippet: {
      cohortPrice: '₹9,999',
      originalPrice: '₹20,000',
      duration: '4 Weeks Live Training + 3 Months Industry Internship',
      format: 'Live Mentor-Guided Online Cohort',
    },
  },
};
