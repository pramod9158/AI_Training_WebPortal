export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  orderIndex: number;
  iconName: string;
}

export interface Topic {
  id: string;
  moduleId: string;
  moduleSlug: string;
  slug: string;
  title: string;
  description: string;
  videoUrl: string;
  videoProvider: 'youtube' | 'bunny' | 'cloudflare';
  orderIndex: number;
  textContent: string;
  estimatedMinutes: number;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  moduleSlugs: string[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-a',
    slug: 'path-a',
    title: 'New to AI Development',
    description: 'Foundational sequence covering Python, Git, LLM principles, Prompt Engineering, Model APIs, and AI-powered IDEs.',
    moduleSlugs: ['python-basics', 'git-fundamentals', 'llms', 'prompt-engineering', 'model-providers', 'ai-ides']
  },
  {
    id: 'path-b',
    slug: 'path-b',
    title: 'Building Production AI Systems',
    description: 'Advanced track focused on local runtimes, MCP protocol, high-scale Vector Databases, and complex RAG systems.',
    moduleSlugs: ['local-ai', 'mcp-foundations', 'vector-databases', 'rag-systems']
  }
];

export const MODULES: Module[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    slug: 'llms',
    title: 'LLMs',
    description: 'Understand how Large Language Models process data, transformer architecture, inference parameters, and selection strategies.',
    difficulty: 'Intermediate',
    orderIndex: 1,
    iconName: 'Brain'
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    slug: 'prompt-engineering',
    title: 'Prompt Engineering',
    description: 'Master prompt construction, advanced Chain-of-Thought techniques, provider nuances, and security safeguards.',
    difficulty: 'Intermediate',
    orderIndex: 2,
    iconName: 'Sparkles'
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    slug: 'model-providers',
    title: 'Model Providers (OpenAI, Claude, Gemini)',
    description: 'Learn API setup, calling patterns, structured outputs, function calling, multimodality, and vendor abstraction.',
    difficulty: 'Intermediate',
    orderIndex: 3,
    iconName: 'Cpu'
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    slug: 'ai-ides',
    title: 'AI-Powered IDEs & Editors',
    description: 'Harness Cursor, Copilot, Antigravity, and Claude IDE for inline editing, context engineering, and automation.',
    difficulty: 'Intermediate',
    orderIndex: 4,
    iconName: 'Code2'
  },
  {
    id: '55555555-5555-4555-a555-555555555555',
    slug: 'local-ai',
    title: 'Local AI Deployment',
    description: 'Deploy offline runtimes with Ollama, LM Studio, llama.cpp, quantization trade-offs, local RAG, and GPU containerization.',
    difficulty: 'Advanced',
    orderIndex: 5,
    iconName: 'Server'
  },
  {
    id: '66666666-6666-4666-a666-666666666666',
    slug: 'python-basics',
    title: 'Python',
    description: 'Master Python fundamentals, data structures, OOP, file handling, exception safety, and modern dev tools.',
    difficulty: 'Beginner',
    orderIndex: 6,
    iconName: 'Terminal'
  },
  {
    id: '77777777-7777-4777-a777-777777777777',
    slug: 'git-fundamentals',
    title: 'Git',
    description: 'Learn Git architecture, repository management, branching, merging, conflict resolution, and remote collaboration.',
    difficulty: 'Beginner',
    orderIndex: 7,
    iconName: 'GitBranch'
  },
  {
    id: '88888888-8888-4888-a888-888888888888',
    slug: 'mcp-foundations',
    title: 'Prompt & MCP Foundations',
    description: 'Explore Model Context Protocol architecture, stdio/HTTP transports, tools, resources, security, and client integrations.',
    difficulty: 'Advanced',
    orderIndex: 8,
    iconName: 'Layers'
  },
  {
    id: '99999999-9999-4999-a999-999999999999',
    slug: 'vector-databases',
    title: 'Vector Databases',
    description: 'Dive into dense/sparse embeddings, chunking strategies, ANN indexing, hybrid search, and vector storage platforms.',
    difficulty: 'Advanced',
    orderIndex: 9,
    iconName: 'Database'
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    slug: 'rag-systems',
    title: 'Retrieval-Augmented Generation (RAG)',
    description: 'Build end-to-end RAG pipelines: document ingestion, hybrid ranking, Graph & Agentic RAG, evaluation, and CI/CD.',
    difficulty: 'Advanced',
    orderIndex: 10,
    iconName: 'Workflow'
  }
];
