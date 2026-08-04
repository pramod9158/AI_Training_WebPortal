import React from 'react';
import Link from 'next/link';
import { Zap, Github, Twitter, Terminal, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070A12] border-t border-slate-800/80 pt-12 pb-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/60">
          
          {/* Col 1: Platform Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 p-[2px]">
                <div className="w-full h-full bg-[#0B0F19] rounded-[6px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-white tracking-tight">Waynautic <span className="text-cyan-400">Academy</span></span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering modern software developers with production-grade AI, Prompt Engineering, RAG, and Vector Database skills.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
                <Terminal className="w-3 h-3" />
                <span>Next.js 15 & Supabase</span>
              </span>
            </div>
          </div>

          {/* Col 2: Learning Modules */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/curriculum/llms" className="hover:text-cyan-300 transition-colors">1. Large Language Models</Link></li>
              <li><Link href="/curriculum/prompt-engineering" className="hover:text-cyan-300 transition-colors">2. Prompt Engineering</Link></li>
              <li><Link href="/curriculum/model-providers" className="hover:text-cyan-300 transition-colors">3. Model Providers API</Link></li>
              <li><Link href="/curriculum/ai-ides" className="hover:text-cyan-300 transition-colors">4. AI-Powered IDEs</Link></li>
              <li><Link href="/curriculum/local-ai" className="hover:text-cyan-300 transition-colors">5. Local AI Deployment</Link></li>
            </ul>
          </div>

          {/* Col 3: Advanced Tracks */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Advanced Tracks</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/curriculum/python-basics" className="hover:text-cyan-300 transition-colors">6. Python Fundamentals</Link></li>
              <li><Link href="/curriculum/git-fundamentals" className="hover:text-cyan-300 transition-colors">7. Git Version Control</Link></li>
              <li><Link href="/curriculum/mcp-foundations" className="hover:text-cyan-300 transition-colors">8. MCP Protocol</Link></li>
              <li><Link href="/curriculum/vector-databases" className="hover:text-cyan-300 transition-colors">9. Vector Databases</Link></li>
              <li><Link href="/curriculum/rag-systems" className="hover:text-cyan-300 transition-colors">10. RAG Systems</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/paths" className="hover:text-cyan-300 transition-colors">Learning Paths</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-300 transition-colors">Student Dashboard</Link></li>
              <li><Link href="/onboarding" className="hover:text-cyan-300 transition-colors">Interactive Tour</Link></li>
              <li><Link href="/about" className="hover:text-cyan-300 transition-colors">About & FAQ</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} Waynautic Academy. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built for AI Developers with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
