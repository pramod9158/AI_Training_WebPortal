import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Sparkles, BookOpen, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-[#070A12] border-t border-slate-200 dark:border-slate-800/80 pt-10 sm:pt-12 pb-8 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800/60">
          
          {/* Col 1: Platform Brand */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-block group">
              <Image
                src="/waynautic-logo.png"
                alt="Waynautic Academy"
                width={150}
                height={34}
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Empowering modern software developers with production-grade AI, Prompt Engineering, RAG, and Vector Database skills.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Protocol 2.4 Active</span>
            </div>
          </div>

          {/* Col 2: Learning Modules */}
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              <span>Core Modules</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/curriculum/llms" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">1. Large Language Models</Link></li>
              <li><Link href="/curriculum/prompt-engineering" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">2. Prompt Engineering</Link></li>
              <li><Link href="/curriculum/model-providers" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">3. Model Providers API</Link></li>
              <li><Link href="/curriculum/ai-ides" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">4. AI-Powered IDEs</Link></li>
              <li><Link href="/curriculum/local-ai" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">5. Local AI Deployment</Link></li>
            </ul>
          </div>

          {/* Col 3: Advanced Tracks */}
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-violet-400" />
              <span>Advanced Tracks</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/curriculum/python-basics" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">6. Python Fundamentals</Link></li>
              <li><Link href="/curriculum/git-fundamentals" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">7. Git Version Control</Link></li>
              <li><Link href="/curriculum/mcp-foundations" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">8. MCP Protocol</Link></li>
              <li><Link href="/curriculum/vector-databases" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">9. Vector Databases</Link></li>
              <li><Link href="/curriculum/rag-systems" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">10. RAG Systems</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Navigation */}
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Navigation</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/paths" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">Learning Paths</Link></li>
              <li><Link href="/curriculum" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">Curriculum Directory</Link></li>
              <li><Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">Student Dashboard</Link></li>
              <li><Link href="/profile" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">Profile & Settings</Link></li>
              <li><Link href="/onboarding" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors">Interactive Tour</Link></li>
              <li>
                <Link href="/admin/login" className="flex items-center space-x-1 text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Shield className="w-3 h-3 text-indigo-500" />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} Waynautic Academy. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              About & Curriculum Guide
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Internal Ops
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
