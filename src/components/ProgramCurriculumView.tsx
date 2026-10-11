'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProgramCurriculum, 
  PROGRAMS_CURRICULUM_DATA 
} from '@/data/programsCurriculumData';
import { 
  Code2, 
  Zap, 
  Brain, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Briefcase, 
  Award, 
  Sparkles, 
  FileText, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  BookOpen, 
  MessageSquare, 
  Laptop, 
  Check, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FolderGit2
} from 'lucide-react';
import { RazorpayModal } from '@/components/RazorpayModal';
import { useWaynauticStore } from '@/lib/store';

interface ProgramCurriculumViewProps {
  currentProgramId: 'automation-testing' | 'performance-testing' | 'ai-training';
}

export const ProgramCurriculumView: React.FC<ProgramCurriculumViewProps> = ({ currentProgramId }) => {
  const router = useRouter();
  const { profile } = useWaynauticStore();
  const isLoggedIn = Boolean(profile.userId || profile.email);
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(0);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const currentProgram = PROGRAMS_CURRICULUM_DATA[currentProgramId] || PROGRAMS_CURRICULUM_DATA['automation-testing'];

  const trackTabs = [
    {
      id: 'automation-testing',
      title: 'Automation Testing',
      track: 'Track 01',
      icon: Code2,
      href: '/curriculum/automation-testing',
      color: 'violet',
      desc: 'Selenium, Playwright, Azure, Jira, CI/CD',
    },
    {
      id: 'performance-testing',
      title: 'Performance Testing',
      track: 'Track 02',
      icon: TrendingUp,
      href: '/curriculum/performance-testing',
      color: 'amber',
      desc: 'JMeter, LoadRunner, K6, Grafana, Datadog',
    },
    {
      id: 'ai-training',
      title: 'AI Training Program',
      track: 'Track 03',
      icon: Brain,
      href: '/curriculum/ai-training',
      color: 'cyan',
      desc: 'LLMs, Prompt Eng, Vector DB, RAG, Agents',
    },
  ];

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum],
    }));
  };

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      router.push('/signup?redirectTo=' + encodeURIComponent(window.location.pathname));
    } else {
      setPaymentModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300">
      
      {/* ── Background Ambient Glow ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl opacity-70 dark:opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Breadcrumb & Track Switcher ──────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-400">Curriculum</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{currentProgram.title}</span>
          </div>

          {/* 3-Track Program Switcher Bar */}
          <div className="p-2 rounded-2xl sm:rounded-3xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {trackTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === currentProgramId;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white dark:bg-[#0D121F] shadow-lg border-2 border-indigo-500/80 dark:border-indigo-400/80 ring-2 ring-indigo-500/20'
                        : 'hover:bg-white/60 dark:hover:bg-slate-800/50 border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                          }`}>
                            {tab.track}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {tab.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                          {tab.desc}
                        </div>
                      </div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Hero Banner Section ─────────────────────────────────────────── */}
        <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 mb-12 sm:mb-16 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-[#0D121F] dark:via-[#090D18] dark:to-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-5">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${currentProgram.themeColor.badgeBg} ${currentProgram.themeColor.badgeText} border border-slate-200 dark:border-slate-700 shadow-sm`}>
                {currentProgram.badge}
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>4-Week Cohort + 3-Month Industry Internship</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              {currentProgram.title}
            </h1>
            <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent mb-5">
              {currentProgram.trackSubtitle}
            </p>

            {/* Overview Paragraph */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-3xl">
              {currentProgram.fullOverview}
            </p>

            {/* Program Key Metrics / Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-mono text-slate-400">Duration</div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">4 Weeks</div>
                <div className="text-[11px] text-slate-500">Live Code Sessions</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">Main Highlight</div>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">3 Months</div>
                <div className="text-[11px] text-slate-500">Industry Internship</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-mono text-slate-400">Projects</div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">4–5 Projects</div>
                <div className="text-[11px] text-slate-500">Portfolio &amp; Git Ready</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-mono text-slate-400">Placement</div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">Dual Certs</div>
                <div className="text-[11px] text-slate-500">Mocks, Resume &amp; LinkedIn</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={handleEnrollClick}
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                <span>Enroll in Cohort (₹9,999)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-500 text-slate-800 dark:text-white font-bold text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                <span>Book Free 1-on-1 Consultation</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="https://wa.me/919158998226?text=Hi%20Pramod,%20I%20am%20interested%20in%20the%204-Week%20Curriculum%20details%20for%20"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 ml-2"
              >
                <span>Chat with Mentor on WhatsApp: +91 9158998226</span>
              </a>
            </div>

          </div>
        </div>

        {/* ── Key Tools & Technologies Grid ────────────────────────────────── */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Technology Stack &amp; Tools Mastered
            </h2>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
            Industry-Standard Tools You Will Build With
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {currentProgram.keyTools.map((tool) => (
              <div
                key={tool.name}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {tool.category}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5">
                    {tool.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Detailed 4-Week Curriculum Plan ──────────────────────────────── */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  Comprehensive Syllabus
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
                Detailed 4-Week Session Plan
              </h2>
            </div>
            
            {/* Quick Week Jump Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {currentProgram.weeks.map((w) => (
                <button
                  key={w.weekNumber}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`week-${w.weekNumber}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Week {w.weekNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Weeks Accordion Stack */}
          <div className="space-y-8 sm:space-y-10">
            {currentProgram.weeks.map((week) => {
              const isExpanded = expandedWeeks[week.weekNumber] ?? true;
              return (
                <div
                  key={week.weekNumber}
                  id={`week-${week.weekNumber}`}
                  className="rounded-3xl bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all scroll-mt-24"
                >
                  {/* Week Header */}
                  <div
                    onClick={() => toggleWeek(week.weekNumber)}
                    className="p-6 sm:p-8 cursor-pointer bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#0D121F] dark:via-[#111728] dark:to-[#0D121F] border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 select-none hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="space-y-2 max-w-4xl">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                          Week {week.weekNumber}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                          {week.sessions.length} In-Depth Sessions
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {week.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {week.subtitle}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {week.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Week Content (Sessions List) */}
                  {isExpanded && (
                    <div className="p-5 sm:p-8 space-y-6">
                      
                      {/* Highlight Banner */}
                      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                            Key Week Milestone
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                            {week.highlight}
                          </span>
                        </div>
                      </div>

                      {/* Sessions Cards */}
                      <div className="grid grid-cols-1 gap-4">
                        {week.sessions.map((session) => (
                          <div
                            key={session.sessionNumber}
                            className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-[#090D18] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                  Session {session.sessionNumber}
                                </span>
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  {session.module}
                                </span>
                              </div>
                              {session.durationMinutes && (
                                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>~{session.durationMinutes} mins</span>
                                </div>
                              )}
                            </div>

                            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-2.5">
                              {session.topic}
                            </h4>

                            {/* Subtopics Checklist */}
                            <div className="mb-4">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                                Topics &amp; Demonstrations Covered:
                              </div>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                                {session.subtopics.map((sub, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{sub}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Hands-on Lab & Outcome Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                              {session.handsOnLab && (
                                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800">
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                                    💻 Hands-on Code Lab:
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-300">
                                    {session.handsOnLab}
                                  </span>
                                </div>
                              )}
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                                  🎯 Verifiable Outcome:
                                </span>
                                <span className="text-slate-600 dark:text-slate-300">
                                  {session.outcome}
                                </span>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>

                      {/* Weekly Project Deliverable Box */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-[#111728] dark:to-[#0D121F] border-2 border-dashed border-indigo-300 dark:border-indigo-800/80">
                        <div className="flex items-center gap-2 mb-1.5">
                          <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {week.weeklyProjectMilestone.title}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-2">
                          {week.weeklyProjectMilestone.description}
                        </p>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <strong className="text-slate-900 dark:text-white">Deliverable:</strong> {week.weeklyProjectMilestone.deliverable}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* ── 4 Applied Portfolio Projects ─────────────────────────────────── */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Portfolio Showcase
            </h2>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            4 Production Projects for Your Resume &amp; GitHub
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mb-8">
            Hiring managers don't evaluate multiple-choice questions; they review deployed applications and GitHub codebases. Every student builds, tests, and deploys these 4 flagship projects.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {currentProgram.portfolioProjects.map((proj, idx) => (
              <div
                key={proj.title}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Project 0{idx + 1} • {proj.tag}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {proj.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {proj.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Key Technical Features:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {proj.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Career Launch & 3-Month Industry Internship ──────────────────── */}
        <div className="mb-14 sm:mb-20">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-[#0A0E1A] text-white border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider mb-6">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Placement &amp; Industry Career Acceleration</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-white">
              Continue with Internship — 3 Months After Training
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed mb-10">
              The completion of the 4-week cohort is not the end of your journey — it is where your real industry career begins. All students who complete the 4-week program transition directly into an official <strong>3-Month Industry Internship</strong> at Waynautic Technologies, writing code for live client systems and production environments.
            </p>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
              
              {/* Pillar 1: 3-Month Internship */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-extrabold text-white mb-1.5">
                    3-Month Industry Internship
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Work on production client projects, attend daily standups, and write production test suites or AI backends.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-300 font-bold pt-2 border-t border-white/10">
                  ✓ Official Internship Certificate + LOR
                </div>
              </div>

              {/* Pillar 2: 1-on-1 Mock Interviews */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-extrabold text-white mb-1.5">
                    1-on-1 Mock Interviews
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Rigorous technical coding, architecture defense, and scenario troubleshooting with senior industry leads.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-indigo-300 font-bold pt-2 border-t border-white/10">
                  ✓ Rubric Scorecard &amp; Personalized Coaching
                </div>
              </div>

              {/* Pillar 3: ATS Resume Building */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-extrabold text-white mb-1.5">
                    ATS Resume Building
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Engineered single-page resumes packed with high-impact metrics and keywords that pass corporate ATS filters.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 font-bold pt-2 border-t border-white/10">
                  ✓ Verified Project Bullet Points
                </div>
              </div>

              {/* Pillar 4: LinkedIn Profile Optimization */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 0 0 1.69-1.69 1.69 1.69 0 0 0-1.69-1.69 1.69 1.69 0 0 0-1.69 1.69 1.69 1.69 0 0 0 1.69 1.69m1.4 9.74v-8.37H5.06v8.37z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-extrabold text-white mb-1.5">
                    LinkedIn Profile Branding
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Revamp your headline, featured repository showcases, and network reach to get tech recruiters in your DMs.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-300 font-bold pt-2 border-t border-white/10">
                  ✓ Inbound Recruiter Outreach Optimization
                </div>
              </div>

            </div>

            {/* Bottom Callout Banner */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Dual Recognized Certification: Program Completion Certificate + 3-Month Industry Internship Certificate.
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnrollClick}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shrink-0 transition-colors shadow-lg"
              >
                Enroll in Cohort
              </button>
            </div>

          </div>
        </div>

        {/* ── Pricing & Enrollment Action Card ─────────────────────────────── */}
        <div className="mb-12">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 text-center max-w-3xl mx-auto shadow-xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-2">
              Ready to Advance Your Tech Career?
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Join the Next Live {currentProgram.title} Cohort
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
              Complete 4-week live personalized training + 3-month industry internship + Full Academy Portal access for 1 full year.
            </p>

            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="text-2xl font-bold text-slate-400 line-through font-mono">₹20,000</span>
              <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 font-mono">₹9,999</span>
              <span className="text-xs text-slate-500 font-semibold">(including 18% GST)</span>
            </div>

            <div className="flex flex-wrap justify-center gap-3.5">
              <button
                type="button"
                onClick={handleEnrollClick}
                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:-translate-y-0.5"
              >
                Enroll in 4-Week Cohort Now
              </button>
              <a
                href="https://wa.me/919158998226?text=Hi%20Pramod,%20I%20want%20to%20discuss%20the%20curriculum%20for%20"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:border-slate-900 text-slate-900 dark:text-white font-bold text-sm sm:text-base transition-all"
              >
                WhatsApp Inquiry (+91 9158998226)
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      <RazorpayModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        plan="cohort"
      />

    </div>
  );
};
