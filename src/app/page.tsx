'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  CheckCircle2,
  Flame,
  Compass,
  Terminal,
  Brain,
  Code2,
  Server,
  Layers,
  Database,
  GitBranch,
  Cpu,
  Workflow,
  ChevronDown,
  ChevronUp,
  Users,
  Star,
  Clock,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  Rocket,
  Target,
  Award,
  TrendingUp,
  LayoutGrid,
  Lightbulb,
  PhoneCall,
} from 'lucide-react';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { getAllTopics, getResumeTopic, getResumeLearningUrl } from '@/lib/curriculumService';
import { useWaynauticStore } from '@/lib/store';
import { OnboardingTour } from '@/components/OnboardingTour';

// ─── Module icon mapping ─────────────────────────────────────────────────────
const MODULE_ICON_MAP: Record<string, React.ReactNode> = {
  Terminal: <Terminal className="w-6 h-6" />,
  GitBranch: <GitBranch className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
  Code2: <Code2 className="w-6 h-6" />,
  Database: <Database className="w-6 h-6" />,
  Workflow: <Workflow className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
  Server: <Server className="w-6 h-6" />,
};

const DIFF_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
  Intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
  Advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
};

const DIFF_BADGE_BG: Record<string, string> = {
  Beginner: 'from-emerald-500 to-teal-600',
  Intermediate: 'from-amber-500 to-orange-500',
  Advanced: 'from-rose-500 to-pink-600',
};

// ─── FAQ data ────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = ['Courses', 'Learning', 'Placements'];

const FAQS: { category: string; q: string; a: string }[] = [
  { category: 'Courses', q: 'What topics does Waynautic Academy cover?', a: 'We cover Python, Git, Model Providers (OpenAI/Claude/Gemini), Prompt Engineering, LLMs, AI-Powered IDEs, Vector Databases, RAG Systems, MCP Foundations, and Local AI Deployment — 56 topics across 10 structured modules.' },
  { category: 'Courses', q: 'Is the curriculum beginner-friendly?', a: 'Yes! We start with Python and Git fundamentals before progressing to advanced AI topics. The curriculum is designed for developers at all levels, with beginner, intermediate, and advanced modules clearly labeled.' },
  { category: 'Courses', q: 'How many topics and modules are available?', a: 'Currently 56 in-depth topics organized across 10 core modules. Each topic includes video lectures, reading notes, and interactive quizzes to reinforce your learning.' },
  { category: 'Learning', q: 'Is the learning self-paced?', a: 'Absolutely. You can learn at your own pace — access any topic at any time, track your progress, earn badges for milestones, and build a daily learning streak to stay motivated.' },
  { category: 'Learning', q: 'Do topics include practical projects and quizzes?', a: 'Yes. Every topic has a quiz to test understanding, and the modules include hands-on exercises covering real-world AI engineering scenarios such as building RAG pipelines and deploying local AI models.' },
  { category: 'Learning', q: 'What makes Waynautic different from free YouTube tutorials?', a: 'Waynautic provides a structured, curated learning path with streak tracking, progress analytics, quizzes, badges, bookmarks, and a community discussion layer — all designed for developers who want depth, not just surface-level content.' },
  { category: 'Placements', q: 'Will completing the curriculum help me get a job?', a: 'Our curriculum is built around real-world AI engineering skills that are in high demand. Completing the full path equips you to confidently apply for AI/ML Engineer, LLM Engineer, and Backend AI roles.' },
  { category: 'Placements', q: 'How do I get in touch for enrollment or career guidance?', a: 'You can reach us directly on WhatsApp at +91 9158998226, or use the contact form on this page. Our team is happy to help you choose the right learning path for your goals.' },
];

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1400;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else { setCount(Math.floor(start)); }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="w-full text-left px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-cyan-400/50 dark:hover:border-cyan-500/40 transition-all group"
      onClick={() => setOpen(!open)}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors text-left">
          {q}
        </span>
        {open
          ? <ChevronUp className="w-5 h-5 text-cyan-500 shrink-0" />
          : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
        }
      </div>
      {open && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-left">
          {a}
        </p>
      )}
    </button>
  );
}

// ─── Hero floating card keywords ─────────────────────────────────────────────
const HERO_TAGS = [
  { label: 'LLMs', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-400/30' },
  { label: 'Prompt Engineering', color: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-400/30' },
  { label: 'Vector Databases', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-400/30' },
  { label: 'RAG Systems', color: 'bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-400/30' },
  { label: 'AI-Powered IDEs', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30' },
  { label: 'Model APIs', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30' },
  { label: 'Local AI', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-400/30' },
  { label: 'MCP Foundations', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-400/30' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HomePage() {
  const { profile, progress, streak } = useWaynauticStore();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [topics, setTopics] = useState(getAllTopics());
  const [faqCategory, setFaqCategory] = useState('Courses');
  const isLoggedIn = Boolean(profile.userId || profile.email);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.hash.includes('error=') || window.location.hash.includes('error_code='))) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleCurriculumChange = () => setTopics(getAllTopics());
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  const continueTopic = useMemo(() => getResumeTopic(profile, progress), [profile, progress]);
  const resumeUrl = useMemo(() => getResumeLearningUrl(profile, progress), [profile, progress]);

  const filteredFaqs = FAQS.filter((f) => f.category === faqCategory);

  return (
    <div className="relative overflow-x-hidden">

      {/* ── Ambient background glows ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-cyan-500/10 via-blue-600/8 to-violet-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-violet-500/8 to-transparent blur-[120px] rounded-full" />
      </div>

      <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 sm:pt-24 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Left: Copy ────────────────────────────────────────────── */}
          <div className="flex-1 text-center lg:text-left">

            {/* Badge */}
            <div className="flex justify-center lg:justify-start mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/8 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                AI-First Curriculum — 56 Curated Topics
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6">
              The{' '}
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500">
                  Fastest Way
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full opacity-60" />
              </span>
              {' '}to Master{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
                AI Engineering
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
              Waynautic Academy is a structured, hands-on learning platform for developers.
              Go from <strong className="text-slate-800 dark:text-white">Python basics</strong> to building{' '}
              <strong className="text-slate-800 dark:text-white">production-grade RAG pipelines</strong> and{' '}
              <strong className="text-slate-800 dark:text-white">agentic AI systems</strong> — at your own pace.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8">
              <Link
                href={isLoggedIn ? '/curriculum' : '/signup'}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-500/25 hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
              >
                <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                {isLoggedIn ? 'Continue Learning' : 'Start Learning — Free'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/curriculum"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 bg-white dark:bg-slate-900/60"
              >
                <BookOpen className="w-5 h-5" />
                Browse Curriculum
              </Link>
            </div>

            {/* Trust badges row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Self-Paced' },
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Expert-Curated' },
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Project-Based' },
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Quizzes & Badges' },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  {icon}
                  {label}
                </span>
              ))}
            </div>

            {/* Resume banner for logged-in users */}
            {isLoggedIn && continueTopic && (
              <div className="mt-8">
                <Link
                  href={resumeUrl}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-2 border-cyan-200 dark:border-cyan-800/60 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 fill-cyan-600 text-cyan-600 dark:fill-cyan-400 dark:text-cyan-400 ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">Continue Learning</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                      {continueTopic.title}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-cyan-500 ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* ── Right: Floating course preview card ───────────────────── */}
          <div className="flex-shrink-0 w-full max-w-lg mx-auto lg:mx-0 lg:w-[440px] xl:w-[500px]">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-violet-500/20 blur-3xl rounded-3xl scale-110" />

              <div className="relative rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8">

                {/* Card header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waynautic Academy</p>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Engineering Path</h3>
                  </div>
                  <span className="ml-auto text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    LIVE ●
                  </span>
                </div>

                {/* Topic tags cloud */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {HERO_TAGS.map((tag) => (
                    <span
                      key={tag.label}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${tag.color} transition-all hover:scale-105 cursor-default`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>

                {/* Progress preview */}
                <div className="space-y-3">
                  {[
                    { label: 'Python & Git', pct: 100, color: 'bg-emerald-500' },
                    { label: 'Model APIs & Prompts', pct: 78, color: 'bg-blue-500' },
                    { label: 'RAG & Agents', pct: 45, color: 'bg-violet-500' },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        <span>{label}</span>
                        <span className="font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-1000`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom stats */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-center">
                  {[
                    { val: '56', label: 'Topics' },
                    { val: '10', label: 'Modules' },
                    { val: '4.9★', label: 'Rating' },
                  ].map(({ val, label }) => (
                    <div key={label} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div className="font-extrabold text-slate-900 dark:text-white text-base">{val}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 right-3 sm:-top-4 sm:-right-4 px-3 py-2 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-violet-500/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-white" />
                500+ Active Learners
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — STATS STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { val: 500, suffix: '+', label: 'Active Learners', icon: <Users className="w-5 h-5" /> },
              { val: 56, suffix: '', label: 'Topics Available', icon: <BookOpen className="w-5 h-5" /> },
              { val: 10, suffix: '', label: 'Core Modules', icon: <LayoutGrid className="w-5 h-5" /> },
              { val: 4, suffix: '.9★', label: 'Average Rating', icon: <Star className="w-5 h-5" /> },
            ].map(({ val, suffix, label, icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-800/40">
                  {icon}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  <AnimatedCounter target={val} suffix={suffix} />
                </div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — WHAT YOU'LL LEARN (Curriculum Bento Grid)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-3">
            Structured Curriculum
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            What You&apos;ll{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-violet-500">
              Master
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            10 carefully sequenced modules — from language fundamentals to cutting-edge AI systems.
            Every topic includes video lectures, reading notes, and quizzes.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {MODULES.map((mod) => {
            const modTopics = topics.filter((t) => t.moduleSlug === mod.slug);
            const icon = MODULE_ICON_MAP[mod.iconName] || <Brain className="w-6 h-6" />;
            return (
              <Link
                key={mod.id}
                href={`/curriculum/${mod.slug}`}
                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 dark:hover:border-cyan-600/50 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col gap-4 overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-500 rounded-2xl" />

                <div className="flex items-start justify-between relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${DIFF_BADGE_BG[mod.difficulty] || 'from-cyan-500 to-blue-600'} text-white shadow-md`}>
                    {icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${DIFF_COLORS[mod.difficulty]}`}>
                    {mod.difficulty}
                  </span>
                </div>

                <div className="relative">
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Module {String(mod.orderIndex).padStart(2, '0')}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs relative">
                  <span className="text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300">{modTopics.length}</strong> Topics
                  </span>
                  <span className="flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-all shadow-xl"
          >
            <LayoutGrid className="w-5 h-5" />
            View Full Curriculum Map
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — HOW TO JOIN (3 Steps)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-3">
              Simple Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              Get Started in{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              No complex admission process. Just sign up and start learning immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line (desktop only, safely positioned) */}
            <div className="hidden sm:block absolute top-[4.5rem] left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 dark:from-cyan-700 dark:via-blue-600 dark:to-violet-600 z-0" />

            {[
              {
                num: '1',
                icon: <PhoneCall className="w-6 h-6" />,
                title: 'Create Your Account',
                desc: 'Sign up for free in under 60 seconds. No credit card required to get started.',
                color: 'from-cyan-500 to-blue-500',
                href: '/signup',
                action: 'Sign Up Free',
              },
              {
                num: '2',
                icon: <Compass className="w-6 h-6" />,
                title: 'Choose Your Path',
                desc: 'Browse 10 AI engineering modules and start from Python basics or jump straight to LLMs.',
                color: 'from-blue-500 to-violet-500',
                href: '/paths',
                action: 'Explore Paths',
              },
              {
                num: '3',
                icon: <Rocket className="w-6 h-6" />,
                title: 'Learn & Get Certified',
                desc: 'Build a daily streak, complete quizzes, earn milestone badges, and showcase your skills.',
                color: 'from-violet-500 to-pink-500',
                href: '/curriculum',
                action: 'View Curriculum',
              },
            ].map(({ num, icon, title, desc, color, href, action }) => (
              <div key={num} className="relative z-10 flex flex-col items-center text-center bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-lg hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-700 transition-all group">
                {/* Number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white text-sm font-extrabold flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 font-mono">
                  {num}
                </div>

                <div className={`mt-4 w-16 h-16 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-xl mb-5 group-hover:scale-105 transition-transform`}>
                  {icon}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{desc}</p>

                <Link
                  href={href}
                  className={`mt-auto px-5 py-2.5 rounded-xl bg-gradient-to-r ${color} text-white text-sm font-bold shadow-md hover:brightness-110 transition-all`}
                >
                  {action}
                </Link>
              </div>
            ))}
          </div>

          {/* OR separator + WhatsApp CTA */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
              <div className="h-px w-16 bg-slate-200 dark:bg-slate-700" />
              <span>OR</span>
              <div className="h-px w-16 bg-slate-200 dark:bg-slate-700" />
            </div>
            <a
              href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20know%20more%20about%20your%20AI%20engineering%20course"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/25 hover:brightness-110 hover:-translate-y-0.5 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              Request a Callback on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — WHY CHOOSE US
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-3">
            Our Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Why Choose{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-violet-500">
              Waynautic Academy
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We built what we wish existed — a no-fluff, depth-first AI engineering curriculum for serious developers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[
            {
              icon: <Target className="w-6 h-6" />,
              title: 'Production-Ready Curriculum',
              desc: 'Every topic reflects real-world AI engineering tasks — not academic theory. You learn to build, deploy, and operate AI systems.',
              color: 'from-cyan-500 to-blue-600',
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: 'Streak & Progress Tracking',
              desc: 'Stay motivated with daily learning streaks, visual progress maps, milestone badges, and personalised continuation prompts.',
              color: 'from-blue-500 to-violet-500',
            },
            {
              icon: <Lightbulb className="w-6 h-6" />,
              title: 'Expert-Curated Content',
              desc: 'Content written and reviewed by practicing AI engineers — LLM architects, RAG system builders, and AI IDE power-users.',
              color: 'from-violet-500 to-pink-500',
            },
            {
              icon: <Clock className="w-6 h-6" />,
              title: 'Self-Paced, Anytime Access',
              desc: 'Learn at your own speed. No batch deadlines, no zoom call schedules. Access all 56 topics whenever works for you.',
              color: 'from-amber-500 to-orange-500',
            },
            {
              icon: <Award className="w-6 h-6" />,
              title: 'Quizzes & Badges',
              desc: 'Earn skill badges at every milestone. Quizzes after each topic reinforce concepts and prove mastery to yourself and employers.',
              color: 'from-emerald-500 to-teal-600',
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: 'Dedicated Support',
              desc: 'Real humans on WhatsApp and email. Our team is available to answer questions, guide your learning path, and keep you on track.',
              color: 'from-rose-500 to-red-500',
            },
          ].map(({ icon, title, desc, color }) => (
            <div
              key={title}
              className="group p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6 — FAQ
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-3">FAQs</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">Frequently</span>
              {' '}Asked Questions
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                type="button"
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  faqCategory === cat
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7 — CONTACT / CTA BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* BG gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-950/80 to-violet-950/80" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6TTI0IDM0djZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-r from-cyan-500/15 to-violet-500/15 blur-[100px]" />

          <div className="relative z-10 px-6 sm:px-12 lg:px-16 py-14 sm:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left */}
            <div className="text-center lg:text-left max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Build Your{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400">
                  AI Engineering Career?
                </span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Join hundreds of developers already upskilling with Waynautic Academy.
                Have questions? Our team is just one WhatsApp message away.
              </p>
            </div>

            {/* Right: Contact options */}
            <div className="flex flex-col gap-4 shrink-0 w-full lg:w-64">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 hover:brightness-110 hover:-translate-y-0.5 transition-all"
              >
                <Zap className="w-5 h-5 fill-white" />
                Start Learning — Free
              </Link>
              <a
                href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20learn%20more%20about%20your%20AI%20engineering%20curriculum"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:contact@waynautic.com"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/15 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
              >
                <Mail className="w-5 h-5" />
                Send us an Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating WhatsApp button ─────────────────────────────────────── */}
      <a
        href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20learn%20more%20about%20your%20AI%20engineering%20curriculum"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 transition-all"
        title="Chat with us on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        {/* WhatsApp icon SVG */}
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.552 4.116 1.518 5.847L0 24l6.335-1.652A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.004-1.37l-.358-.214-3.76.98 1.006-3.65-.234-.374A9.775 9.775 0 012.182 12c0-5.422 4.396-9.818 9.818-9.818 5.423 0 9.818 4.396 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/>
        </svg>
      </a>

    </div>
  );
}
