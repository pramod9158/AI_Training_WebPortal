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
import { PaymentBarcodeModal } from '@/components/PaymentBarcodeModal';

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
const FAQ_CATEGORIES = ['Courses', 'Learning', 'Placements & Certificates'];

const FAQS: { category: string; q: string; a: string }[] = [
  { category: 'Courses', q: 'What topics does Waynautic Academy cover?', a: 'We cover Python, Git, Model Providers (OpenAI/Claude/Gemini), Prompt Engineering, LLMs, AI-Powered IDEs, Vector Databases, RAG Systems, MCP Foundations, and Local AI Deployment — 56 topics across 10 structured modules.' },
  { category: 'Courses', q: 'Is the curriculum beginner-friendly?', a: 'Yes! We start with Python and Git fundamentals before progressing to advanced AI topics. The curriculum is designed for students and working professionals across all streams — no prior AI experience needed.' },
  { category: 'Courses', q: 'How long does the program take?', a: 'The structured path is designed to be completed in 4 weeks — covering basics to advanced AI in a fast, focused format. The curriculum is also available for self-paced learners who want to go at their own speed.' },
  { category: 'Courses', q: 'How many topics and modules are available?', a: 'Currently 56 in-depth topics organized across 10 core modules. Each topic includes video lectures, live session reinforcement, reading notes, and interactive quizzes.' },
  { category: 'Learning', q: 'Is the learning self-paced or does it include live sessions?', a: 'Both! Every topic is covered via recorded video lectures, and reinforced through live sessions with your mentor. You get the flexibility of recorded content plus the depth of live interaction.' },
  { category: 'Learning', q: 'Will I build real AI projects?', a: 'Yes — you will build 4 to 5 agentic, market-ready AI projects during the program. These are portfolio-ready projects that demonstrate your skills to employers, not just theory or toy examples.' },
  { category: 'Learning', q: 'Do I get a personal mentor?', a: 'Yes. Every student is assigned a dedicated mentor who provides personalized guidance throughout the program, answers your questions, and keeps you on track to complete the curriculum.' },
  { category: 'Learning', q: 'What makes Waynautic different from free YouTube tutorials?', a: 'Waynautic provides a structured, mentor-guided path with live sessions, agentic AI projects, streak tracking, quizzes, certificates, mock interviews, and placement support — all designed for developers who want real skills, not just surface-level content.' },
  { category: 'Placements & Certificates', q: 'What certificates do I get after completing the program?', a: 'Upon successful completion, you receive two certificates: (1) an Internship Certificate for the hands-on project work, and (2) a Program Completion Certificate from Waynautic Academy — both recognized credentials you can showcase on LinkedIn and your resume.' },
  { category: 'Placements & Certificates', q: 'How long do I get access to the academy portal?', a: 'You get 1 full year of access to the Waynautic Academy portal after enrollment — including all 56 topics, future content updates, live session recordings, and resources added during your access period.' },
  { category: 'Placements & Certificates', q: 'What placement assistance does Waynautic provide?', a: 'We provide comprehensive placement support including: mock interviews with real feedback, resume building assistance, LinkedIn profile optimization, and guidance on how to apply for AI/ML Engineer and LLM Engineer roles effectively.' },
  { category: 'Placements & Certificates', q: 'Will I be job-ready after completing this program?', a: 'Yes — that is our goal. By the end of the program you will have real AI projects in your portfolio, a polished resume and LinkedIn profile, interview practice, and two certificates. You will be equipped to confidently apply for AI engineering roles.' },
  { category: 'Placements & Certificates', q: 'Who is this program designed for?', a: 'This program is open to college students and working professionals across all streams. No prior AI experience is required. Whether you are looking to switch careers or upskill in your current role, this program will get you AI-ready.' },
  { category: 'Placements & Certificates', q: 'How do I enroll or get more details?', a: 'Reach out directly to Pramod Gogadare on WhatsApp at +91 9158998226. Our team will walk you through the enrollment process, batch details, and answer any questions you have.' },
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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
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

  // ═════════════════════════════════════════════════════════════════════════
  // LOGGED-IN VIEW: Dashboard-style home page restored for active students
  // ═════════════════════════════════════════════════════════════════════════
  if (isLoggedIn) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-violet-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Onboarding Tour Overlay */}
        <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

        {/* Hero Section */}
        <section className="relative pt-8 pb-16 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Top Announcement Badge */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-mono tracking-wide shadow-sm shadow-cyan-500/10 max-w-full text-center flex-wrap justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[200px] xs:max-w-none">
                Welcome, {profile.displayName || 'Developer'}!
              </span>
              <span className="bg-cyan-500 text-black px-1.5 py-0.2 text-[10px] font-bold rounded font-sans shrink-0">56 Topics</span>
            </div>
          </div>

          {/* Hero Title & Subheading */}
          <div className="text-center max-w-4xl mx-auto space-y-5 sm:space-y-6">
            <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.1] break-words">
              Build the Future with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
                AI & Dev Skills
              </span>
            </h1>
            <p className="text-sm sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-1 font-normal">
              The high-engagement interactive academy for developers. Learn Large Language Models, Prompt Engineering, Model APIs, Local Runtimes, Vector Databases, and Agentic RAG.
            </p>

            {/* Call to Actions */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/curriculum"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold text-sm sm:text-base hover:brightness-110 shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group min-h-[48px]"
              >
                <Zap className="w-5 h-5 text-cyan-300 fill-cyan-300 group-hover:scale-110 transition-transform shrink-0" />
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>
          </div>

          {/* "Continue Learning" Quick Action Banner (If Student Active) */}
          {continueTopic && (
            <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
              <Link
                href={resumeUrl}
                className="group block p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-cyan-950/40 dark:to-slate-900 border-2 border-slate-200 dark:border-cyan-500/30 hover:border-sky-400 dark:hover:border-cyan-400/60 shadow-lg dark:shadow-cyan-500/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-100 dark:bg-cyan-500/10 border border-sky-300 dark:border-cyan-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-400 shrink-0">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-sky-600 dark:fill-cyan-400 ml-0.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] sm:text-[11px] font-mono uppercase text-sky-600 dark:text-cyan-400 font-bold">Continue Learning</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-cyan-400 animate-ping" />
                      </div>
                      <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 text-sm sm:text-lg truncate">
                        {continueTopic.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-extrabold text-sky-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                    <span className="hidden xs:inline">Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </section>

        {/* Modules Overview — logged-in users */}
        <section className="py-12 sm:py-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Structured Curriculum</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">10 Core Modules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {MODULES.map((mod) => {
              const modTopics = topics.filter((t) => t.moduleSlug === mod.slug);
              return (
                <Link
                  key={mod.id}
                  href={`/curriculum/${mod.slug}`}
                  className="group p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-cyan-400">Module {String(mod.orderIndex).padStart(2, '0')}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                        mod.difficulty === 'Beginner'
                          ? 'badge-diff-beginner'
                          : mod.difficulty === 'Intermediate'
                          ? 'badge-diff-intermediate'
                          : 'badge-diff-advanced'
                      }`}>
                        {mod.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>{modTopics.length} Lessons</span>
                    <div className="flex items-center space-x-1 text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                      <span>View Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Floating WhatsApp button */}
        <a
          href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20have%20a%20question%20regarding%20my%20course"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 transition-all"
          title="Chat with mentor on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.552 4.116 1.518 5.847L0 24l6.335-1.652A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.004-1.37l-.358-.214-3.76.98 1.006-3.65-.234-.374A9.775 9.775 0 012.182 12c0-5.422 4.396-9.818 9.818-9.818 5.423 0 9.818 4.396 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/>
          </svg>
        </a>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // GUEST / VISITOR VIEW: Full Marketing & Value Landing Page
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative overflow-x-hidden">

      {/* ── Ambient background glows ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-cyan-500/10 via-blue-600/8 to-violet-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-violet-500/8 to-transparent blur-[120px] rounded-full" />
      </div>

      <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — AI UPSKILLING JOURNEY & PRICING PLANS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-mono font-bold tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            AI Training & Mentorship Programs
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-4">
            Choose Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500">
              AI Upskilling Journey
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Personalized roadmaps, 1-on-1 industry mentorship, and comprehensive cohort training tailored for developers and tech professionals.
          </p>
        </div>

        {/* 3 Pricing & Consultation Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Card 1: Free Consultation */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Consultation</h3>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Starter
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">₹0</span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ Free</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Get a personalized AI learning roadmap based on your current job & background.
                </p>
              </div>

              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-6" />

              <ul className="space-y-3.5 mb-8 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Personalized AI learning roadmap</strong> tailored to your education/job profile
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Custom upskilling plan & curriculum recommendations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    1-on-1 strategy & doubt-clearing consultation session
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Career transition advisory for AI/LLM engineering
                  </span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20book%20a%20Free%20Consultation%20Session%20for%20a%20personalized%20AI%20learning%2Fupskilling%20plan%20based%20on%20my%20background."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-500 text-slate-800 dark:text-white font-bold text-sm text-center transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Book Free Session</span>
              <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          {/* Card 2: Pay ₹19 — Expert Deep Dive */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Expert Deep Dive</h3>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Popular
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">₹19</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ml-2">Intro Offer</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Everything in Free tier + an additional 1-on-1 session with an AI Expert.
                </p>
              </div>

              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-6" />

              <ul className="space-y-3.5 mb-8 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>All features in Free Consultation</strong> (Roadmap & custom plan)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>+1 Additional personalized session</strong> with an AI Industry Expert
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Personalized resume & tech profile audit
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Direct Q&A and hands-on guidance on projects to build
                  </span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20pay%20%E2%82%B919%20for%20the%20Personalized%20Curated%20Plan%20plus%201%20additional%201-on-1%20session%20with%20an%20AI%20Expert."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm text-center transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Started for ₹19</span>
              <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          {/* Card 3: Pay ₹10,000 — 4-Week Intensive Cohort (Flagship Tier) */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white via-white to-cyan-50/30 dark:from-[#0D121F] dark:via-[#0D121F] dark:to-[#071324] border-2 border-cyan-400 dark:border-cyan-500 shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-400/20 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]">
            {/* Top Badge */}
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-mono font-extrabold uppercase tracking-wider shadow-lg shadow-cyan-500/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3 fill-white" />
              Flagship Masterclass
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">4-Week Intensive Cohort</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">₹10,000</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">all-inclusive</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Complete 4-week live personalized training & full Academy Portal access.
                </p>
              </div>

              <div className="h-px w-full bg-cyan-100 dark:bg-cyan-950 mb-6" />

              <ul className="space-y-3.5 mb-8 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">
                    <strong>All benefits from ₹19 & Free tiers included</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">
                    <strong>4 Weeks of live, personalized training & mentoring</strong> sessions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">
                    <strong>Full Academy Portal access:</strong> 56+ video topics, notes, quizzes & code labs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">
                    <strong>4–5 agentic AI portfolio projects</strong> with mentor code reviews
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">
                    <strong>Dual Certification:</strong> Internship Certificate + Course Completion
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">
                    Full placement assistance, mock interviews & LinkedIn profile optimization
                  </span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setPaymentModalOpen(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:brightness-110 text-white font-bold text-sm sm:text-base text-center transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Enroll in 4-Week Program</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
              icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
              title: '56 Topics — Video + Live Sessions',
              desc: 'Every topic is covered through recorded video lectures and reinforced through live sessions with your mentor. Maximum depth, maximum flexibility.',
              color: 'from-cyan-500 to-blue-600',
              points: [],
            },
            {
              icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
              title: '4-Week Structured Path',
              desc: 'A fast, focused journey from Python & Git fundamentals all the way to advanced RAG systems, agentic AI, and local model deployment.',
              color: 'from-blue-500 to-violet-500',
              points: [],
            },
            {
              icon: <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />,
              title: '4–5 Agentic, Market-Ready Projects',
              desc: 'Build real, portfolio-worthy AI projects — not just theory exercises. Walk away with work you can demo in any job interview.',
              color: 'from-violet-500 to-pink-500',
              points: [],
            },
            {
              icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
              title: 'Personalized Mentor',
              desc: 'Every student gets a dedicated mentor for personalized training, doubt-solving, and career guidance — one-on-one, not generic group sessions.',
              color: 'from-amber-500 to-orange-500',
              points: [],
            },
            {
              icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
              title: 'Internship + Completion Certificate',
              desc: 'Earn an Internship Certificate for your project work and a Program Completion Certificate from Waynautic Academy — credentials you can proudly display on LinkedIn and your resume.',
              color: 'from-emerald-500 to-teal-600',
              points: [],
            },
            {
              icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />,
              title: 'Full Placement Assistance',
              desc: 'We prepare you end-to-end for the job market: mock interviews with real feedback, resume building, LinkedIn profile optimization, and 1 year of portal access.',
              color: 'from-rose-500 to-red-500',
              points: [],
            },
          ].map(({ icon, title, desc, color }) => (
            <div
              key={title}
              className="group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col justify-start"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 mb-3 sm:mb-4">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug">
                  {title}
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
              </p>
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
                href="mailto:pramod.gogadare@waynautic.com?subject=Enquiry%20-%20Waynautic%20Academy%20AI%20Program&body=Hi%20Pramod%2C%0A%0AI%20am%20interested%20in%20learning%20more%20about%20the%20Waynautic%20Academy%20AI%20Engineering%20Program.%0A%0APlease%20share%20more%20details.%0A%0AThank%20you"
                onClick={(e) => {
                  // Fallback: if mailto doesn't open within 500ms, open Gmail compose
                  const timeout = setTimeout(() => {
                    window.open(
                      'https://mail.google.com/mail/?view=cm&to=pramod.gogadare@waynautic.com&su=Enquiry%20-%20Waynautic%20Academy%20AI%20Program&body=Hi%20Pramod%2C%0A%0AI%20am%20interested%20in%20learning%20more%20about%20the%20Waynautic%20Academy%20AI%20Engineering%20Program.%0A%0APlease%20share%20more%20details.',
                      '_blank'
                    );
                  }, 500);
                  // If tab stays active (mailto opened successfully), cancel Gmail fallback
                  window.addEventListener('blur', () => clearTimeout(timeout), { once: true });
                }}
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

      {/* UPI / Barcode Payment Modal */}
      <PaymentBarcodeModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

    </div>
  );
}
