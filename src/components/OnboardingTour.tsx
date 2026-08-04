'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Compass, Rocket, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useWaynauticStore } from '@/lib/store';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { updateProfile } = useWaynauticStore();
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleSelectPath = (pathChoice: 'path-a' | 'path-b' | 'free') => {
    updateProfile({ selectedPath: pathChoice, hasCompletedOnboarding: true });
    if (pathChoice === 'path-a') {
      router.push('/curriculum/python-basics/python-fundamentals');
    } else if (pathChoice === 'path-b') {
      router.push('/curriculum/local-ai/runtimes-and-models');
    } else {
      router.push('/curriculum');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[#0D121F] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Welcome & Overview */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 p-[2px] shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Welcome to Waynautic Academy</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Master AI & Modern Software Skills
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Step-by-step video lessons, text guides, and interactive quizzes across 10 structured modules and 56 developer topic units.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="font-bold text-cyan-400 text-sm">10 Modules</div>
                <div className="text-[11px] text-slate-400">Structured Trees</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="font-bold text-violet-400 text-sm">56 Topics</div>
                <div className="text-[11px] text-slate-400">Videos & Notes</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="font-bold text-emerald-400 text-sm">Quizzes</div>
                <div className="text-[11px] text-slate-400">Instant Badges</div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Choose Your Learning Path</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Learning Path */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Step 2 of 2</span>
              <h3 className="text-2xl font-bold text-white">How would you like to start?</h3>
              <p className="text-xs text-slate-400">Select a curated sequence or explore freely</p>
            </div>

            <div className="space-y-3">
              
              {/* Option A */}
              <button
                onClick={() => handleSelectPath('path-a')}
                className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/60 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-cyan-300">New to AI Development</div>
                      <div className="text-xs text-slate-400">Python → Git → LLMs → Prompt Eng → APIs → AI IDEs</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option B */}
              <button
                onClick={() => handleSelectPath('path-b')}
                className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 to-slate-900/60 border border-violet-500/40 hover:border-violet-400 hover:bg-violet-950/60 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
                      B
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-violet-300">Building Production AI Systems</div>
                      <div className="text-xs text-slate-400">Local AI → MCP Protocol → Vector DBs → RAG Systems</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option C: Free */}
              <button
                onClick={() => handleSelectPath('free')}
                className="w-full text-left p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                      <Compass className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Let Me Explore Freely</div>
                      <div className="text-xs text-slate-400">Browse all 10 modules and 56 topics at your own pace</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
