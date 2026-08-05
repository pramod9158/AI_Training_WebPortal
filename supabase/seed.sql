-- Seed Data for Waynautic Academy

-- Clear existing data
truncate table public.quiz_questions cascade;
truncate table public.topics cascade;
truncate table public.modules cascade;
truncate table public.learning_paths cascade;

-- Insert Modules (Ordered 1 to 10)
insert into public.modules (id, slug, title, description, difficulty, order_index, icon_name) values
('66666666-6666-4666-a666-666666666666', 'python-basics', 'Python', 'Master Python fundamentals, data structures, OOP, file handling, exception safety, and modern dev tools.', 'Beginner', 1, 'Terminal'),
('77777777-7777-4777-a777-777777777777', 'git-fundamentals', 'Git', 'Learn Git architecture, repository management, branching, merging, conflict resolution, and remote collaboration.', 'Beginner', 2, 'GitBranch'),
('33333333-3333-4333-a333-333333333333', 'model-providers', 'Model Providers (OpenAI, Claude, Gemini)', 'Learn API setup, calling patterns, structured outputs, function calling, multimodality, and vendor abstraction.', 'Intermediate', 3, 'Cpu'),
('22222222-2222-4222-a222-222222222222', 'prompt-engineering', 'Prompt Engineering', 'Master prompt construction, advanced Chain-of-Thought techniques, provider nuances, and security safeguards.', 'Intermediate', 4, 'Sparkles'),
('11111111-1111-4111-a111-111111111111', 'llms', 'LLMs', 'Understand how Large Language Models process data, transformer architecture, inference parameters, and selection strategies.', 'Intermediate', 5, 'Brain'),
('44444444-4444-4444-a444-444444444444', 'ai-ides', 'AI-Powered IDEs & Editors', 'Harness Cursor, Copilot, Antigravity, and Claude IDE for inline editing, context engineering, and automation.', 'Intermediate', 6, 'Code2'),
('99999999-9999-4999-a999-999999999999', 'vector-databases', 'Vector Databases', 'Dive into dense/sparse embeddings, chunking strategies, ANN indexing, hybrid search, and vector storage platforms.', 'Advanced', 7, 'Database'),
('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'rag-systems', 'Retrieval-Augmented Generation (RAG)', 'Build end-to-end RAG pipelines: document ingestion, hybrid ranking, Graph & Agentic RAG, evaluation, and CI/CD.', 'Advanced', 8, 'Workflow'),
('88888888-8888-4888-a888-888888888888', 'mcp-foundations', 'Prompt & MCP Foundations', 'Explore Model Context Protocol architecture, stdio/HTTP transports, tools, resources, security, and client integrations.', 'Advanced', 9, 'Layers'),
('55555555-5555-4555-a555-555555555555', 'local-ai', 'Local AI Deployment', 'Deploy offline runtimes with Ollama, LM Studio, llama.cpp, quantization trade-offs, local RAG, and GPU containerization.', 'Advanced', 10, 'Server');

-- Insert Learning Paths
insert into public.learning_paths (slug, title, description, module_order) values
('path-a', 'New to AI Development', 'Complete foundational developer sequence covering Python, Git, Model APIs, Prompt Engineering, LLMs, and AI IDEs.', '["python-basics", "git-fundamentals", "model-providers", "prompt-engineering", "llms", "ai-ides"]'::jsonb),
('path-b', 'Building Production AI Systems', 'Advanced track focused on Vector Databases, RAG systems, MCP protocol, and local runtimes.', '["vector-databases", "rag-systems", "mcp-foundations", "local-ai"]'::jsonb);
