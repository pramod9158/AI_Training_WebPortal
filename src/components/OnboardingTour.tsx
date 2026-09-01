'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  Play, 
  FileText, 
  HelpCircle, 
  Award, 
  Flame, 
  Search, 
  Bookmark, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Clock, 
  Zap, 
  Brain, 
  Cpu, 
  Code2, 
  Server, 
  Terminal, 
  GitBranch, 
  Layers, 
  Database, 
  Workflow, 
  ShieldCheck 
} from 'lucide-react';
import { MODULES, LEARNING_PATHS } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { useWaynauticStore } from '@/lib/store';

const ICON_MAP: Record<string, React.ElementType> = {
  Brain, Sparkles, Cpu, Code2, Server, Terminal, GitBranch, Layers, Database, Workflow
};

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STAGES = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'paths', label: 'Choose Path', icon: Compass },
  { id: 'modules', label: 'Curriculum', icon: BookOpen },
  { id: 'workspace', label: 'How to Learn', icon: Play },
  { id: 'gamification', label: 'Certificates', icon: Award },
  { id: 'tools', label: 'Search & Tools', icon: Search },
  { id: 'ready', label: 'Get Started', icon: Zap },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { profile, updateProfile } = useWaynauticStore();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string>(profile.selectedPath || 'path-a');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [showAllModules, setShowAllModules] = useState(false);
  const lastNavTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' && currentStageIndex < TOUR_STAGES.length - 1) {
        const now = Date.now();
        if (now - lastNavTimeRef.current >= 250) {
          lastNavTimeRef.current = now;
          setCurrentStageIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' && currentStageIndex > 0) {
        const now = Date.now();
        if (now - lastNavTimeRef.current >= 250) {
          lastNavTimeRef.current = now;
          setCurrentStageIndex(prev => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStageIndex]);

  if (!isOpen) return null;

  const currentStage = TOUR_STAGES[currentStageIndex];

  const handleNext = () => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 250) {
      return; // Throttle fast repetitive clicks
    }
    lastNavTimeRef.current = now;

    if (currentStageIndex < TOUR_STAGES.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 200) return;
    lastNavTimeRef.current = now;

    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };

  const handleSelectPath = (path: string) => {
    setSelectedPath(path);
    setSelectedModuleIndex(0);
  };

  const handleSkip = () => {
    updateProfile({ hasCompletedOnboarding: true });
    onClose();
  };

  const handleComplete = () => {
    updateProfile({ selectedPath, hasCompletedOnboarding: true });
    if (selectedPath === 'path-a') {
      router.push('/curriculum/python-basics/python-fundamentals');
    } else if (selectedPath === 'path-b') {
      router.push('/curriculum/local-ai/runtimes-and-models');
    } else {
      router.push('/curriculum');
    }
    onClose();
  };

  const selectedPathObj = LEARNING_PATHS.find(p => p.slug === selectedPath) || LEARNING_PATHS[0];
  const pathModules = MODULES.filter(m => selectedPathObj.moduleSlugs.includes(m.slug));
  const displayedModules = showAllModules ? MODULES : pathModules;
  const activeModule = displayedModules[selectedModuleIndex] || displayedModules[0] || MODULES[0];
  const activeModuleTopics = TOPICS.filter(t => t.moduleSlug === activeModule.slug);
  const ModuleIcon = ICON_MAP[activeModule.iconName] || Brain;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 cursor-default my-auto"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            <span>Interactive Platform Tour • Step {currentStageIndex + 1} of {TOUR_STAGES.length}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkip}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleSkip}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Close tour (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Progress Stepper Indicator */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0D121F]">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
            {TOUR_STAGES.map((stage, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const Icon = stage.icon;
              return (
                <button
                  key={stage.id}
                  onClick={() => setCurrentStageIndex(idx)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-black shadow-md'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40'
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span>{stage.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Stage Content Area */}
        <div className="p-6 sm:p-8 min-h-[460px] max-h-[64vh] overflow-y-auto">
          
          {/* STAGE 1: WELCOME */}
          {currentStage.id === 'welcome' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 p-[2px] shadow-xl">
                <div className="w-full h-full bg-white dark:bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-sky-600 dark:text-cyan-400" />
                </div>
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">Welcome to Waynautic Academy</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  Master Production AI & Modern Software Engineering
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Waynautic is built for developers to master everything from Python & Git foundations to Large Language Models, Prompt Engineering, Model APIs, Local Quantized Models, Vector Databases, and Agentic RAG.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
                <div className="p-4 bg-sky-50 dark:bg-slate-900/60 border-2 border-sky-200 dark:border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-sky-700 dark:text-cyan-400 font-extrabold text-base">
                    <BookOpen className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                    <span>10 Modules</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">56 interactive topic units with real code specifications.</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-slate-900/60 border-2 border-purple-200 dark:border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-violet-400 font-extrabold text-base">
                    <Play className="w-5 h-5 text-purple-600 dark:text-violet-400" />
                    <span>3-in-1 Learning</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">HD video streams, notes with 1-click copy, and instant quizzes.</p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-slate-900/60 border-2 border-emerald-200 dark:border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-base">
                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Credentials</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Daily streaks, milestone badges, and official PDF certificates.</p>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: CHOOSE LEARNING PATH */}
          {currentStage.id === 'paths' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">Step 1: Choose Your Journey</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Which learning track fits your background?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Select a roadmap below. The next step will display the exact modules for your chosen path.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Path A */}
                <div
                  onClick={() => handleSelectPath('path-a')}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all space-y-3 ${
                    selectedPath === 'path-a'
                      ? 'bg-sky-50 dark:bg-cyan-950/40 border-sky-400 dark:border-cyan-500/60 shadow-lg ring-2 ring-sky-300 dark:ring-cyan-500/30'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                        selectedPath === 'path-a' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        A
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">New to AI Dev</span>
                    </div>
                    {selectedPath === 'path-a' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-500 text-white">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Designed for developers starting with AI. Covers Python, Git, LLM principles, Prompt Engineering, Model APIs, and AI-powered IDEs.
                  </p>
                  
                  {/* Distinct Path A Modules List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono uppercase text-sky-700 dark:text-cyan-400 font-bold">Included Modules (6):</div>
                    <div className="flex flex-wrap gap-1">
                      {MODULES.filter(m => LEARNING_PATHS[0].moduleSlugs.includes(m.slug)).map(m => (
                        <span key={m.id} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-sky-100/90 dark:bg-cyan-950/80 text-sky-800 dark:text-cyan-300 border border-sky-200 dark:border-cyan-800/50">
                          {m.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono font-bold text-sky-600 dark:text-cyan-400 pt-1">
                    6 Modules • 35 Lesson Units
                  </div>
                </div>

                {/* Path B */}
                <div
                  onClick={() => handleSelectPath('path-b')}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all space-y-3 ${
                    selectedPath === 'path-b'
                      ? 'bg-purple-50 dark:bg-violet-950/40 border-purple-400 dark:border-violet-500/60 shadow-lg ring-2 ring-purple-300 dark:ring-violet-500/30'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                        selectedPath === 'path-b' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        B
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">Production AI Systems</span>
                    </div>
                    {selectedPath === 'path-b' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500 text-white">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Advanced track for experienced developers. Covers local quant models, MCP server protocols, Vector Databases, and Agentic RAG.
                  </p>

                  {/* Distinct Path B Modules List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono uppercase text-purple-700 dark:text-violet-400 font-bold">Included Modules (4):</div>
                    <div className="flex flex-wrap gap-1">
                      {MODULES.filter(m => LEARNING_PATHS[1].moduleSlugs.includes(m.slug)).map(m => (
                        <span key={m.id} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-100/90 dark:bg-violet-950/80 text-purple-800 dark:text-violet-300 border border-purple-200 dark:border-violet-800/50">
                          {m.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono font-bold text-purple-600 dark:text-violet-400 pt-1">
                    4 Modules • 21 Lesson Units
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STAGE 3: MODULES EXPLORER */}
          {currentStage.id === 'modules' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
                  {showAllModules ? 'All 10 Core Modules' : `${selectedPathObj.title} (${pathModules.length} Modules)`}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {showAllModules ? 'Explore All Curriculum Modules' : `Modules for "${selectedPathObj.title}"`}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {showAllModules 
                    ? 'Previewing all 10 core modules in Waynautic Academy.'
                    : `Showing the ${pathModules.length} sequential modules curated for ${selectedPathObj.title}.`}
                </p>
              </div>

              {/* Path Filter Pills Toggle */}
              <div className="flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowAllModules(false); setSelectedModuleIndex(0); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                    !showAllModules
                      ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-black shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {selectedPathObj.title} ({pathModules.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAllModules(true); setSelectedModuleIndex(0); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                    showAllModules
                      ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-black shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  View All (10)
                </button>
              </div>

              {/* Module selector pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
                {displayedModules.map((mod, idx) => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all shrink-0 ${
                      selectedModuleIndex === idx
                        ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-black shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    0{mod.orderIndex}. {mod.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Active Module Card Preview */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-500 text-white dark:bg-cyan-500/10 dark:text-cyan-400 border border-sky-400 dark:border-cyan-500/30 flex items-center justify-center font-bold">
                      <ModuleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-mono text-sky-600 dark:text-cyan-400 font-bold uppercase">
                        <span>Module 0{activeModule.orderIndex}</span>
                        <span>•</span>
                        <span className="text-slate-500">{activeModule.difficulty}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">{activeModule.title}</h4>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-sky-100 dark:bg-cyan-950 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-cyan-800/40">
                    {activeModuleTopics.length} Lessons
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {activeModule.description}
                </p>

                {/* Lesson Preview List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-mono uppercase text-slate-500 font-bold">Included Lessons:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeModuleTopics.slice(0, 4).map((topic, i) => (
                      <div key={topic.id} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {i + 1}
                        </span>
                        <span className="truncate font-semibold">{topic.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: TOPIC WORKSPACE & 3-IN-1 LEARNING */}
          {currentStage.id === 'workspace' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">Interactive Learning Experience</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">How Every Topic Lesson Works</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Each unit contains three integrated pillars to ensure full retention.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-slate-900/60 border-2 border-sky-200 dark:border-slate-800 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">1. HD Video Stream (1080p)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                      Stream in-depth visual explanations and coding sessions right in the workspace.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-slate-900/60 border-2 border-purple-200 dark:border-slate-800 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">2. Markdown Specifications & 1-Click Code Copy</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                      Read detailed architecture notes, best practice checklists, and copy ready-to-run code snippets.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-900/60 border-2 border-emerald-200 dark:border-slate-800 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">3. Knowledge Check Quizzes with Instant Scoring</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                      Validate what you learned with instant multiple-choice quizzes, scoring breakdown, and celebratory confetti.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: GAMIFICATION & CERTIFICATES */}
          {currentStage.id === 'gamification' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">Reward Your Progress</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Streaks, Badges & Official Certificates</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Keep learning daily to unlock verifiable credentials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-500/30 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                    <Flame className="w-6 h-6 fill-white" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Daily Streak</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Study every day to build your learning flame.</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-violet-950/20 border-2 border-purple-300 dark:border-violet-500/30 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Milestone Badges</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Earn badges as you finish modules and ace quizzes.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-500/30 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">PDF Certificate</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Download your personalized completion credential.</p>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 6: SEARCH & TOOLS */}
          {currentStage.id === 'tools' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">Fast Productivity Tools</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Omni-Search & Lesson Bookmarks</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Jump to any concept instantly whenever you need a quick reference.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Quick Search (⌘K / Ctrl+K)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px] font-bold">Cmd + K</kbd> anywhere on the site to search all 56 topics, modules, and code patterns.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Bookmark for Revision</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Click the bookmark icon on any lesson to save it directly to your Student Dashboard for easy future reference.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 7: READY TO START */}
          {currentStage.id === 'ready' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#58CC02] border-2 border-[#58A700] flex items-center justify-center shadow-xl">
                <Zap className="w-8 h-8 text-white fill-white" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs font-mono uppercase tracking-widest text-[#58CC02] font-extrabold">You&apos;re All Set!</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Ready to begin your learning journey?</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Your selected roadmap is <strong className="text-sky-600 dark:text-cyan-400">{selectedPath === 'path-a' ? 'Path A (New to AI Development)' : 'Path B (Production AI Systems)'}</strong>. Click below to start your very first lesson.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleComplete}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_4px_0_0_#58A700] active:translate-y-1 active:shadow-none text-white font-extrabold text-base transition-all inline-flex items-center justify-center space-x-2"
                >
                  <span>Start First Lesson Now</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <button
            onClick={handlePrev}
            disabled={currentStageIndex === 0}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              currentStageIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStageIndex < TOUR_STAGES.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] active:translate-y-0.5 active:shadow-none text-white font-extrabold text-xs transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] active:translate-y-0.5 active:shadow-none text-white font-extrabold text-xs transition-all"
              >
                <span>Start Learning</span>
                <Zap className="w-4 h-4 text-white fill-white" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
