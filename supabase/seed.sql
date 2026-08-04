-- Seed Data for Waynautic Academy

-- Clear existing data
truncate table public.quiz_questions cascade;
truncate table public.topics cascade;
truncate table public.modules cascade;
truncate table public.learning_paths cascade;

-- Insert Modules
insert into public.modules (id, slug, title, description, difficulty, order_index, icon_name) values
('11111111-1111-4111-a111-111111111111', 'llms', 'LLMs', 'Understand how Large Language Models process data, transformer architecture, inference parameters, and selection strategies.', 'Intermediate', 1, 'Brain'),
('22222222-2222-4222-a222-222222222222', 'prompt-engineering', 'Prompt Engineering', 'Master prompt construction, advanced Chain-of-Thought techniques, provider nuances, and security safeguards.', 'Intermediate', 2, 'Sparkles'),
('33333333-3333-4333-a333-333333333333', 'model-providers', 'Model Providers (OpenAI, Claude, Gemini)', 'Learn API setup, calling patterns, structured outputs, function calling, multimodality, and vendor abstraction.', 'Intermediate', 3, 'Cpu'),
('44444444-4444-4444-a444-444444444444', 'ai-ides', 'AI-Powered IDEs & Editors', 'Harness Cursor, Copilot, Antigravity, and Claude IDE for inline editing, context engineering, and automation.', 'Intermediate', 4, 'Code2'),
('55555555-5555-4555-a555-555555555555', 'local-ai', 'Local AI Deployment', 'Deploy offline runtimes with Ollama, LM Studio, llama.cpp, quantization trade-offs, local RAG, and GPU containerization.', 'Advanced', 5, 'Server'),
('66666666-6666-4666-a666-666666666666', 'python-basics', 'Python', 'Master Python fundamentals, data structures, OOP, file handling, exception safety, and modern dev tools.', 'Beginner', 6, 'Terminal'),
('77777777-7777-4777-a777-777777777777', 'git-fundamentals', 'Git', 'Learn Git architecture, repository management, branching, merging, conflict resolution, and remote collaboration.', 'Beginner', 7, 'GitBranch'),
('88888888-8888-4888-a888-888888888888', 'mcp-foundations', 'Prompt & MCP Foundations', 'Explore Model Context Protocol architecture, stdio/HTTP transports, tools, resources, security, and client integrations.', 'Advanced', 8, 'Layers'),
('99999999-9999-4999-a999-999999999999', 'vector-databases', 'Vector Databases', 'Dive into dense/sparse embeddings, chunking strategies, ANN indexing, hybrid search, and vector storage platforms.', 'Advanced', 9, 'Database'),
('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'rag-systems', 'Retrieval-Augmented Generation (RAG)', 'Build end-to-end RAG pipelines: document ingestion, hybrid ranking, Graph & Agentic RAG, evaluation, and CI/CD.', 'Advanced', 10, 'Workflow');

-- Insert Learning Paths
insert into public.learning_paths (slug, title, description, module_order) values
('path-a', 'New to AI Development', 'Complete foundational developer sequence covering Python, Git, LLM principles, Prompt Engineering, Model APIs, and AI IDEs.', '["python-basics", "git-fundamentals", "llms", "prompt-engineering", "model-providers", "ai-ides"]'::jsonb),
('path-b', 'Building Production AI Systems', 'Advanced track focused on local runtimes, MCP protocol, high-scale Vector Databases, and complex Agentic RAG pipelines.', '["local-ai", "mcp-foundations", "vector-databases", "rag-systems"]'::jsonb);

