'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  CheckCircle2,
  AlertCircle,
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
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { getAllTopics, getResumeTopic, getResumeLearningUrl } from '@/lib/curriculumService';
import { useWaynauticStore } from '@/lib/store';
import { OnboardingTour } from '@/components/OnboardingTour';
import { RazorpayModal } from '@/components/RazorpayModal';
import { VideoPlayer } from '@/components/VideoPlayer';

// --- Module icon mapping -----------------------------------------------------
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

// --- FAQ data ----------------------------------------------------------------
const FAQ_CATEGORIES = ['Courses', 'Learning', 'Placements & Certificates', 'Policies & Terms'];

const FAQS: { category: string; q: string; a: string }[] = [
  { category: 'Courses', q: 'What topics and programs does Waynautic Academy offer?', a: 'We offer 3 industry-aligned flagship programs: (1) Automation Testing Program (Selenium, Playwright, Azure DevOps, Jira, CI/CD), (2) Performance Testing Program (JMeter, LoadRunner, K6, Grafana, Datadog), and (3) AI Training Program (Python, LLMs, Prompt Engineering, Vector Databases, RAG Systems, AI Agents). All programs include 4 weeks of live training followed by a 3-month industry internship.' },
  { category: 'Courses', q: 'Is the curriculum beginner-friendly?', a: 'Yes! All 3 tracks start with strong coding and foundational tools before progressing to advanced enterprise architectures. The curriculum is designed for students and working professionals across all streams — no prior experience needed.' },
  { category: 'Courses', q: 'How long does the program take?', a: 'The structured path is designed to be completed in 4 weeks — covering basics to advanced AI in a fast, focused format. The curriculum is also available for self-paced learners who want to go at their own speed.' },
  { category: 'Courses', q: 'How many topics and modules are available?', a: 'Currently 56 in-depth topics organized across 10 core modules. Each topic includes video lectures, live session reinforcement, reading notes, and interactive quizzes.' },
  { category: 'Learning', q: 'Is the learning self-paced or does it include live sessions?', a: 'Both! Every topic is covered via recorded video lectures, and reinforced through live sessions with your mentor. You get the flexibility of recorded content plus the depth of live interaction.' },
  { category: 'Learning', q: 'Will I build real AI projects?', a: 'Yes — you will build 4 to 5 agentic, market-ready AI projects during the program. These are portfolio-ready projects that demonstrate your skills to employers, not just theory or toy examples.' },
  { category: 'Learning', q: 'Do I get a personal mentor?', a: 'Yes. Every student is assigned a dedicated mentor who provides personalized guidance throughout the program, answers your questions, and keeps you on track to complete the curriculum.' },
  { category: 'Learning', q: 'What makes Waynautic different from free YouTube tutorials?', a: 'Waynautic provides a structured, mentor-guided path with live sessions, agentic AI projects, streak tracking, quizzes, certificates, mock interviews, and placement support — all designed for developers who want real skills, not just surface-level content.' },
  { category: 'Placements & Certificates', q: 'What certificates do I get after completing the program?', a: 'Upon successful completion of the 4-week AI training, you continue with a 3-month industry internship — the main highlight of our program. You receive two credentials: (1) an official 3-Month Internship Certificate for your production project work, and (2) a Program Completion Certificate from Waynautic Academy — both recognized credentials you can showcase on LinkedIn and your resume.' },
  { category: 'Placements & Certificates', q: 'How long do I get access to the academy portal?', a: 'You get 1 full year of access to the Waynautic Academy portal after enrollment — including all 56 topics, future content updates, live session recordings, and resources added during your access period.' },
  { category: 'Placements & Certificates', q: 'What placement assistance does Waynautic provide?', a: 'We provide comprehensive placement support including: mock interviews with real feedback, resume building assistance, LinkedIn profile optimization, and guidance on how to apply for AI/ML Engineer and LLM Engineer roles effectively.' },
  { category: 'Placements & Certificates', q: 'Will I be job-ready after completing this program?', a: 'Yes — that is our goal. By the end of the program you will have real AI projects in your portfolio, a polished resume and LinkedIn profile, interview practice, and two certificates. You will be equipped to confidently apply for AI engineering roles.' },
  { category: 'Placements & Certificates', q: 'Who is this program designed for?', a: 'This program is open to college students and working professionals across all streams. No prior AI experience is required. Whether you are looking to switch careers or upskill in your current role, this program will get you AI-ready.' },
  { category: 'Placements & Certificates', q: 'How do I enroll or get more details?', a: 'Reach out directly to Pramod Gogadare on WhatsApp at +91 9158998226. Our team will walk you through the enrollment process, batch details, and answer any questions you have.' },
  { category: 'Policies & Terms', q: 'What is the fee refund policy?', a: 'All program fees, webinar passes, and consultation charges are strictly 100% non-refundable and non-transferable under all circumstances once paid. This policy applies unconditionally to personal schedule conflicts, change of mind, or inability to attend sessions.' },
  { category: 'Policies & Terms', q: 'Do you guarantee a job or salary package?', a: 'No. Waynautic Academy provides placement assistance (resume reviews, mock interviews, career guidance, and portfolio critiques). We strictly do not guarantee employment, minimum CTC packages, or third-party interview calls, as hiring decisions remain at the sole discretion of prospective employers.' },
  { category: 'Policies & Terms', q: 'What is the legal jurisdiction for any disputes?', a: 'All program agreements, transactions, and student enrollments are governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra, India.' },
  { category: 'Policies & Terms', q: 'Can I download or share the curriculum materials?', a: 'No. All videos, code repositories, mind maps, notes, and quiz questions are proprietary intellectual property. Unauthorized screen recording, downloading, credential sharing, or redistribution is strictly prohibited and subject to legal prosecution under the Indian Copyright Act, 1957.' },
];

// --- Animated Counter --------------------------------------------------------
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

// --- FAQ Accordion Item -------------------------------------------------------
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="w-full text-left px-6 sm:px-8 py-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-cyan-400/50 dark:hover:border-cyan-500/40 shadow-sm hover:shadow-md transition-all group"
      onClick={() => setOpen(!open)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors text-left leading-snug">
          {q}
        </span>
        {open
          ? <ChevronUp className="w-5 h-5 text-cyan-500 shrink-0" />
          : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
        }
      </div>
      {open && (
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-left border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
          {a}
        </p>
      )}
    </button>
  );
}

// --- Hero floating card keywords ---------------------------------------------
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

// --- Main Component ----------------------------------------------------------
function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, progress, streak } = useWaynauticStore();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'cohort' | 'expert_session' | 'consultation'>('cohort');
  const [topics, setTopics] = useState(getAllTopics());
  const [faqCategory, setFaqCategory] = useState('Courses');
  const [selectedProgram, setSelectedProgram] = useState<'ai' | 'functional' | 'performance'>('functional');
  const isLoggedIn = Boolean(profile.userId || profile.email);
  const isEnrolled = profile.plan === 'pro' || profile.plan === 'enterprise';

  const handleSelectProgram = (prog: 'functional' | 'performance' | 'ai') => {
    setSelectedProgram(prog);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => {
        const el = document.getElementById('fees-structure');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }
  };

  const enrollParam = searchParams.get('enroll');
  const noticeParam = searchParams.get('notice');

  // Auto-open modal if returning from auth with ?enroll=cohort or ?enroll=expert_session or ?enroll=consultation
  useEffect(() => {
    if (enrollParam === 'cohort' || enrollParam === 'expert_session' || enrollParam === 'consultation') {
      if (enrollParam === 'consultation') {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform', '_blank');
        router.replace('/');
        return;
      } else if (enrollParam === 'expert_session') {
        setSelectedPlan('expert_session');
      } else {
        setSelectedPlan('cohort');
      }

      if (!isLoggedIn) {
        router.replace('/signup?redirectTo=' + encodeURIComponent(`/?enroll=${enrollParam}`));
      } else if (isLoggedIn && (enrollParam !== 'cohort' || !isEnrolled)) {
        setPaymentModalOpen(true);
        const pricingEl = document.getElementById('pricing');
        if (pricingEl) {
          pricingEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (isLoggedIn && isEnrolled && enrollParam === 'cohort') {
        router.replace('/dashboard');
      }
    }
  }, [enrollParam, isLoggedIn, isEnrolled, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.hash.includes('error=') || window.location.hash.includes('error_code='))) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#automation-testing') {
        setSelectedProgram('functional');
        setTimeout(() => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#performance-testing') {
        setSelectedProgram('performance');
        setTimeout(() => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#ai-training') {
        setSelectedProgram('ai');
        setTimeout(() => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#pricing') {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const handleCurriculumChange = () => setTopics(getAllTopics());
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  const continueTopic = useMemo(() => getResumeTopic(profile, progress), [profile, progress]);
  const resumeUrl = useMemo(() => getResumeLearningUrl(profile, progress), [profile, progress]);

  const filteredFaqs = FAQS.filter((f) => f.category === faqCategory);

  // =========================================================================
  // LOGGED-IN VIEW: Only for ACTIVE PAID STUDENTS (isEnrolled)
  // =========================================================================
  if (isLoggedIn && isEnrolled) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-violet-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Onboarding Tour Overlay */}
        <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

        {/* Hero Section */}
        <section className="relative pt-8 pb-16 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
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
        <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
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

  // =========================================================================
  // GUEST / VISITOR VIEW: Full Marketing & Value Landing Page
  // =========================================================================
  return (
    <div className="relative overflow-x-hidden bg-white dark:bg-[#0a0f1e]">

      {/* Onboarding Tour */}
      <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

      {/* ===================================================================
          HERO SECTION — AccioJob style: left headline + right feature cards
      =================================================================== */}
      <section className="relative bg-[#f8fafc] dark:bg-[#080d1c] overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(to right, rgba(14,42,92,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,42,92,0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        {/* Radial blue glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-gradient-radial from-blue-500/10 to-transparent blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-gradient-radial from-violet-500/8 to-transparent blur-[80px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Headline + subtitle + trust badges */}
            <div>
              {/* Top badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Placement-Focused Tech Training Programs
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-black text-slate-900 dark:text-white leading-[1.15] mb-5 tracking-tight">
                Launch Your Tech Career with{' '}
                <span className="text-[#2563eb]">Placement-Focused Courses</span>{' '}
                &amp; 3-Month Industry Internship
              </h1>

              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xl">
                Get job-ready through live, online, or self-paced courses. Learn from expert mentors, build real projects, and access placement opportunities with top companies.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Award className="w-4 h-4 text-amber-500" />
                  Award-Winning Curriculum
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Users className="w-4 h-4 text-blue-500" />
                  Expert Industry Mentors
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Dual Certification
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#courses"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4fd8] text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  Explore Programs
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Talk to Us
                </a>
              </div>
            </div>

            {/* RIGHT: Two stacked dark feature cards (AccioJob style) */}
            <div className="flex flex-col gap-4">

              {/* Card 1: Courses */}
              <div
                className="relative rounded-2xl p-6 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ background: 'linear-gradient(135deg, #0e2a5c 0%, #0f1f4a 100%)' }}
                onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 blur-2xl" />
                <div className="relative">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                    3 Flagship Programs
                  </span>
                  <h3 className="text-xl font-black text-white mb-1">Industry-Ready Training</h3>
                  <p className="text-blue-200/80 text-sm mb-4">Get placed through structured live training with real project work and mentorship.</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Live Projects', 'Expert Mentors', 'Certificate', '3-Month Internship'].map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs font-semibold">{tag}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0e2a5c] font-bold text-sm hover:bg-blue-50 transition-colors"
                  >
                    View Programs ↗
                  </button>
                </div>
              </div>

              {/* Card 2: Achievement Certificate (AccioJob right card with visual Certificate preview) */}
              <div
                className="relative rounded-2xl p-5 sm:p-6 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform group"
                style={{ background: 'linear-gradient(135deg, #1e0c50 0%, #2d0c6a 100%)' }}
                onClick={() => document.getElementById('certificate')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="absolute bottom-0 right-0 w-44 h-44 bg-violet-500/15 rounded-full translate-y-10 translate-x-10 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/25 border border-violet-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Achievement Certificate
                    </span>
                    <span className="text-[10px] font-mono font-bold text-violet-300/80 uppercase">GenAI &amp; ML 2025</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-16 sm:w-28 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 border-amber-400/50 shadow-lg group-hover:border-amber-400 transition-all bg-black/40 relative">
                      <Image
                        src="/Innovation-Certificate.jpg"
                        alt="Achievement Certificate - GenAI & ML Awards 2025"
                        width={120}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1">
                        <span className="text-[8px] font-black text-amber-300 uppercase tracking-tighter">Verified</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug mb-1">
                        National Excellence Award
                      </h3>
                      <p className="text-violet-200/80 text-xs leading-relaxed line-clamp-2">
                        Winner — Best AI/ML Testing Strategy. Recognized nationally for industry-leading curriculum.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-violet-500/20">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-violet-500/30 text-violet-200 text-[10px] font-bold">Dual Certified</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">Industry Recognized</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('certificate')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#1e0c50] font-bold text-xs hover:bg-violet-50 transition-colors shadow-sm shrink-0"
                    >
                      See Certificate ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          IMPACT STATS — Dark navy section with big numbers (AccioJob puzzle cards)
      =================================================================== */}
      <section className="py-12 sm:py-16" style={{ background: '#0d1b3e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-10">
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-1">Our Impact So Far</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Impact Created</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: 50, suffix: '+', label: 'STUDENTS ENROLLED', icon: <Users className="w-6 h-6" /> },
              { value: 12, suffix: ' LPA', label: 'HIGHEST PACKAGE', icon: <TrendingUp className="w-6 h-6" /> },
              { value: 30, suffix: '+', label: 'PARTNER COMPANIES', icon: <Target className="w-6 h-6" /> },
              { value: 100, suffix: '%', label: 'PLACEMENT ASSISTANCE', icon: <Award className="w-6 h-6" /> },
            ].map(({ value, suffix, label, icon }) => (
              <div
                key={label}
                className="relative rounded-2xl p-6 sm:p-8 text-center overflow-hidden group hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #0e2a5c 0%, #0f1f4a 100%)' }}
              >
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors rounded-2xl" />
                <div className="relative">
                  <div className="flex justify-center mb-3 text-blue-400">{icon}</div>
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1.5">
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <p className="text-blue-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          COURSES SECTION — AccioJob-style lavender cards with tabs
      =================================================================== */}
      <section id="courses" className="py-16 sm:py-24 bg-[#f8fafc] dark:bg-[#080d1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">

          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              3 Specialized Career Tracks
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] mb-4 tracking-tight">
              <span className="text-[#2563eb]">Live, Online,</span> and Self-Paced Courses{' '}
              <br className="hidden sm:block" />with Placement Assistance
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl mx-auto">
              Personalized roadmaps, 1-on-1 industry mentorship, and comprehensive cohort training tailored for developers and tech professionals.
            </p>
          </div>

          {/* ===============================================================
              ACCIOJOB-STYLE 3 FLAGSHIP COURSES LISTING
          =============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {[
              {
                id: 'functional',
                title: 'Automation Testing',
                subTitle: 'SDET & Automation Cohort',
                duration: '4 Weeks + 3M Internship',
                icon: <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
                headerBg: 'bg-gradient-to-br from-[#ebeaff] to-[#f4f2ff] dark:from-[#131738] dark:to-[#1a1c3d]',
                tags: ['Java', 'Selenium', 'Playwright', 'Azure DevOps', 'Jira', 'CI/CD'],
                projects: '4-5 Projects',
                students: '50+ Enrolled',
                nextBatch: 'Nov 2026',
                price: '₹9,999',
                crossedPrice: '₹20,000',
                curriculumUrl: '/curriculum/functional-testing',
                bannerText: '3-MONTH INDUSTRY INTERNSHIP INCLUDED',
                bannerBg: 'bg-[#4338ca] dark:bg-[#3730a3]',
              },
              {
                id: 'performance',
                title: 'Performance Testing',
                subTitle: 'Load & APM Engineering',
                duration: '4 Weeks + 3M Internship',
                icon: <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                iconBg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
                headerBg: 'bg-gradient-to-br from-[#e8f1ff] to-[#f0f6ff] dark:from-[#0d1f3d] dark:to-[#13284f]',
                tags: ['JMeter', 'LoadRunner', 'K6', 'Grafana', 'Datadog', 'AppDynamics'],
                projects: '4-5 Projects',
                students: '40+ Enrolled',
                nextBatch: 'Nov 2026',
                price: '₹9,999',
                crossedPrice: '₹20,000',
                curriculumUrl: '/curriculum/performance-testing',
                bannerText: '3-MONTH INDUSTRY INTERNSHIP INCLUDED',
                bannerBg: 'bg-[#1e40af] dark:bg-[#1e3a8a]',
              },
              {
                id: 'ai',
                title: 'AI Engineering & LLMs',
                subTitle: 'GenAI, RAG & Agents',
                duration: '4 Weeks + 3M Internship',
                icon: <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
                iconBg: 'bg-violet-100 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
                headerBg: 'bg-gradient-to-br from-[#f2eafa] to-[#faf4ff] dark:from-[#21113b] dark:to-[#2c154f]',
                tags: ['Python', 'LLMs', 'Prompt Eng', 'Vector DB', 'RAG', 'AI Agents'],
                projects: '4-5 Projects',
                students: '60+ Enrolled',
                nextBatch: 'Nov 2026',
                price: '₹9,999',
                crossedPrice: '₹20,000',
                curriculumUrl: '/curriculum/ai-engineering',
                bannerText: '3-MONTH INDUSTRY INTERNSHIP INCLUDED',
                bannerBg: 'bg-[#6b21a8] dark:bg-[#581c87]',
              },
            ].map(course => (
              <div
                key={course.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0d1426] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5"
              >
                <div>
                  {/* Card Header (Lavender / Tinted gradient with AccioJob style icon + duration pill) */}
                  <div className={`p-6 border-b border-slate-100 dark:border-slate-800/60 ${course.headerBg}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm ${course.iconBg}`}>
                        {course.icon}
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {course.duration}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {course.subTitle}
                    </p>
                  </div>

                  {/* Middle Tech Chips */}
                  <div className="p-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                      Key Tools &amp; Frameworks
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-5 min-h-[58px]">
                      {course.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* 3-column stats bar (AccioJob signature course meta) */}
                    <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 p-2.5 text-center mb-6">
                      <div className="px-1">
                        <FileText className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <span className="block text-[11px] font-black text-slate-900 dark:text-white leading-tight">{course.projects}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Projects</span>
                      </div>
                      <div className="px-1">
                        <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <span className="block text-[11px] font-black text-slate-900 dark:text-white leading-tight">{course.students}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Learners</span>
                      </div>
                      <div className="px-1">
                        <Sparkles className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                        <span className="block text-[11px] font-black text-slate-900 dark:text-white leading-tight">{course.nextBatch}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Next Batch</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{course.price}</span>
                          <span className="text-sm font-semibold text-slate-400 line-through font-mono">{course.crossedPrice}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">GST Included · Limited Seats</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Popular
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={course.curriculumUrl}
                        className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Curriculum
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectProgram(course.id as any);
                          if (!isLoggedIn) {
                            router.push('/signup?redirectTo=' + encodeURIComponent('/?enroll=cohort'));
                          } else {
                            setSelectedPlan('cohort');
                            setPaymentModalOpen(true);
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4fd8] text-white text-xs font-bold text-center flex items-center justify-center gap-1 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5 cursor-pointer"
                      >
                        Enroll Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom solid strip (AccioJob scholarship / internship highlight) */}
                <div className={`py-2 px-4 text-center text-white text-[11px] font-black uppercase tracking-wider ${course.bannerBg}`}>
                  {course.bannerText}
                </div>
              </div>
            ))}
          </div>

          {/* Section Divider & Granular Tier Explorer */}
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Compare Flexible Learning Tiers
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Select a track below to explore Free Consultation, Live ₹19 Interactive Webinar, or the Full 4-Week Cohort with 3-Month Internship.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto mb-10">
            {([
              { key: 'functional', label: 'Automation Testing' },
              { key: 'performance', label: 'Performance Testing' },
              { key: 'ai', label: 'AI Engineering' },
            ] as { key: 'functional' | 'performance' | 'ai'; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectProgram(key)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedProgram === key
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Course Cards — AccioJob-style lavender/purple tinted cards */}
          <div id="fees-structure" className="scroll-mt-24">
            {/* Notice Banner if redirected from protected portal */}
            {noticeParam === 'enroll_required' && (
              <div className="max-w-3xl mx-auto mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start sm:items-center gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <strong className="font-bold">Enrollment Required:</strong> The Academy portal is exclusively available to enrolled students. Please complete your enrollment below to access the curriculum.
                </div>
              </div>
            )}

            {/* Automation Testing Program */}
            {selectedProgram === 'functional' && (
              <div id="automation-testing" className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {[
                  {
                    tier: 'Free Consultation',
                    badge: 'Starter',
                    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                    price: 'Free',
                    crossedPrice: '₹299',
                    priceTag: '100% Free',
                    priceTagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    desc: 'Get a personalized automation testing roadmap based on your background.',
                    features: ['Personalized QA automation roadmap', 'Career advisory for SDET & QA roles', '1-on-1 Selenium, Playwright & Jira guidance', 'CI/CD pipeline integration strategy'],
                    cta: 'Book Free Session',
                    ctaStyle: 'border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform',
                    featured: false,
                    stats: ['Selenium & Playwright', 'Azure DevOps', 'Jira & CI/CD'],
                  },
                  {
                    tier: 'Live Webinar',
                    badge: 'Popular',
                    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                    price: '₹19',
                    crossedPrice: '₹499',
                    priceTag: 'Intro Offer',
                    priceTagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    desc: 'Live interactive webinar on Selenium & Playwright automation with CI/CD.',
                    features: ['All Consultation features included', 'Live Webinar: Selenium & Playwright', 'Azure DevOps & CI/CD pipeline basics', 'Resume & LinkedIn profile audit'],
                    cta: 'Join Webinar for ₹19',
                    ctaStyle: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white',
                    ctaHref: null,
                    featured: false,
                    stats: ['Selenium', 'Playwright', 'CI/CD'],
                  },
                  {
                    tier: '4-Week Intensive Cohort',
                    badge: '⚡ Flagship Masterclass',
                    badgeColor: 'bg-[#2563eb] text-white border-blue-600',
                    price: '₹9,999',
                    crossedPrice: '₹20,000',
                    priceTag: 'GST Included',
                    priceTagColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                    desc: '4-week live training in automation testing + guaranteed 3-month industry internship.',
                    features: ['3-Month Industry Internship (main highlight)', 'Selenium & Playwright automation', 'Azure DevOps, Jira & CI/CD pipeline', '4-5 automation projects with code reviews', 'Dual Certification: Internship + Completion', 'Mock interviews & LinkedIn optimization'],
                    cta: 'Enroll in Automation (₹9,999)',
                    ctaStyle: 'bg-[#2563eb] hover:bg-[#1d4fd8] text-white shadow-lg shadow-blue-500/25',
                    ctaHref: null,
                    featured: true,
                    stats: ['Selenium', 'Playwright', 'JMeter', 'Azure DevOps'],
                  },
                ].map(({ tier, badge, badgeColor, price, crossedPrice, priceTag, priceTagColor, desc, features, cta, ctaStyle, ctaHref, featured, stats }) => (
                  <div
                    key={tier}
                    className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${
                      featured
                        ? 'bg-white dark:bg-[#0e1730] border-2 border-[#2563eb] shadow-xl shadow-blue-500/10'
                        : 'bg-[#f1f0f7] dark:bg-[#0f1525] border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#2563eb] text-white text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                        ⚡ Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{tier}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>{badge}</span>
                      </div>

                      {/* Duration / stats pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {stats.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-slate-400 dark:text-slate-500 line-through font-mono">{crossedPrice}</span>
                          <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{price}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${priceTagColor}`}>{priceTag}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{desc}</p>
                      </div>

                      <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-4" />

                      <ul className="space-y-2.5 mb-6">
                        {features.map((f, i) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${i === 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className={i === 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-300'}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {ctaHref ? (
                      <a
                        href={ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${ctaStyle}`}
                      >
                        <span>{cta}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLoggedIn) {
                            router.push('/signup?redirectTo=' + encodeURIComponent('/?enroll=' + (tier.includes('Webinar') ? 'expert_session' : 'cohort')));
                          } else {
                            setSelectedPlan(tier.includes('Webinar') ? 'expert_session' : 'cohort');
                            setPaymentModalOpen(true);
                          }
                        }}
                        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 ${ctaStyle}`}
                      >
                        <span>{cta}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Performance Testing Program */}
            {selectedProgram === 'performance' && (
              <div id="performance-testing" className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {[
                  {
                    tier: 'Free Consultation',
                    badge: 'Starter',
                    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                    price: 'Free',
                    crossedPrice: '₹299',
                    priceTag: '100% Free',
                    priceTagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    desc: 'Personalized performance engineering roadmap based on your background.',
                    features: ['Personalized performance testing roadmap', 'Career advisory for Performance Engineer & SRE roles', '1-on-1 JMeter, K6, LoadRunner guidance', 'APM tools: Grafana, Datadog & AppDynamics'],
                    cta: 'Book Free Session',
                    ctaStyle: 'border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform',
                    featured: false,
                    stats: ['JMeter', 'K6', 'Grafana'],
                  },
                  {
                    tier: 'Live Perf Webinar',
                    badge: 'Popular',
                    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                    price: '₹19',
                    crossedPrice: '₹499',
                    priceTag: 'Intro Offer',
                    priceTagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    desc: 'Live interactive webinar covering JMeter, K6 & APM monitoring essentials.',
                    features: ['All Consultation features included', 'Live Webinar: JMeter & K6 load testing', 'Grafana & Datadog dashboards hands-on', 'Resume & LinkedIn audit for perf roles'],
                    cta: 'Join Webinar for ₹19',
                    ctaStyle: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white',
                    ctaHref: null,
                    featured: false,
                    stats: ['JMeter', 'K6', 'Grafana'],
                  },
                  {
                    tier: '4-Week Intensive Cohort',
                    badge: '⚡ Flagship Masterclass',
                    badgeColor: 'bg-[#2563eb] text-white border-blue-600',
                    price: '₹9,999',
                    crossedPrice: '₹20,000',
                    priceTag: 'GST Included',
                    priceTagColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                    desc: '4-week live performance testing training + guaranteed 3-month industry internship.',
                    features: ['3-Month Industry Internship (main highlight)', 'JMeter, LoadRunner & K6 load testing', 'AppDynamics, Grafana & Datadog APM', 'Azure DevOps, Jira & CI/CD integration', '4-5 real-world performance projects', 'Dual Certification + placement assistance'],
                    cta: 'Enroll in Performance (₹9,999)',
                    ctaStyle: 'bg-[#2563eb] hover:bg-[#1d4fd8] text-white shadow-lg shadow-blue-500/25',
                    ctaHref: null,
                    featured: true,
                    stats: ['JMeter', 'LoadRunner', 'K6', 'Grafana'],
                  },
                ].map(({ tier, badge, badgeColor, price, crossedPrice, priceTag, priceTagColor, desc, features, cta, ctaStyle, ctaHref, featured, stats }) => (
                  <div
                    key={tier}
                    className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${
                      featured
                        ? 'bg-white dark:bg-[#0e1730] border-2 border-[#2563eb] shadow-xl shadow-blue-500/10'
                        : 'bg-[#f1f0f7] dark:bg-[#0f1525] border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#2563eb] text-white text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                        ⚡ Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{tier}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>{badge}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {stats.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{s}</span>
                        ))}
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-slate-400 line-through font-mono">{crossedPrice}</span>
                          <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{price}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${priceTagColor}`}>{priceTag}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{desc}</p>
                      </div>
                      <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-4" />
                      <ul className="space-y-2.5 mb-6">
                        {features.map((f, i) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${i === 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className={i === 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-300'}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {ctaHref ? (
                      <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${ctaStyle}`}>
                        <span>{cta}</span><ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <button type="button"
                        onClick={() => {
                          if (!isLoggedIn) { router.push('/signup?redirectTo=' + encodeURIComponent('/?enroll=' + (tier.includes('Webinar') ? 'expert_session' : 'cohort-performance'))); }
                          else { setSelectedPlan(tier.includes('Webinar') ? 'expert_session' : 'cohort'); setPaymentModalOpen(true); }
                        }}
                        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 ${ctaStyle}`}
                      >
                        <span>{cta}</span><ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AI Training Program */}
            {selectedProgram === 'ai' && (
              <div id="ai-training" className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {[
                  {
                    tier: 'Free Consultation',
                    badge: 'Starter',
                    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                    price: 'Free',
                    crossedPrice: '₹299',
                    priceTag: '100% Free',
                    priceTagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    desc: 'Get a personalized AI learning roadmap based on your current job & background.',
                    features: ['Personalized AI learning roadmap', 'Custom upskilling plan & curriculum', '1-on-1 strategy & doubt-clearing session', 'Career transition advisory for AI/LLM roles'],
                    cta: 'Book Free Session',
                    ctaStyle: 'border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform',
                    featured: false,
                    stats: ['LLMs', 'RAG', 'AI Agents'],
                  },
                  {
                    tier: 'Live AI Webinar',
                    badge: 'Popular',
                    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                    price: '₹19',
                    crossedPrice: '₹499',
                    priceTag: 'Intro Offer',
                    priceTagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    desc: 'Live interactive AI Webinar masterclass. Everything in Starter + live session.',
                    features: ['All Consultation features included', 'Live Interactive AI Webinar masterclass', 'Personalized resume & tech profile audit', 'Direct Q&A and hands-on project guidance'],
                    cta: 'Join Webinar for ₹19',
                    ctaStyle: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white',
                    ctaHref: null,
                    featured: false,
                    stats: ['LLMs', 'Prompt Eng', 'Vector DB'],
                  },
                  {
                    tier: '4-Week Intensive Cohort',
                    badge: '⚡ Flagship Masterclass',
                    badgeColor: 'bg-[#2563eb] text-white border-blue-600',
                    price: '₹9,999',
                    crossedPrice: '₹20,000',
                    priceTag: 'GST Included',
                    priceTagColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                    desc: '4-week live AI training + guaranteed 3-month industry internship in AI engineering.',
                    features: ['3-Month Industry Internship (main highlight)', 'All benefits from ₹19 & Free tiers', '4 weeks live personalized AI training', 'Full Academy Portal: 56+ video topics', '4–5 agentic AI portfolio projects', 'Dual Certification + placement assistance'],
                    cta: 'Enroll in AI Engineering (₹9,999)',
                    ctaStyle: 'bg-[#2563eb] hover:bg-[#1d4fd8] text-white shadow-lg shadow-blue-500/25',
                    ctaHref: null,
                    featured: true,
                    stats: ['LLMs', 'RAG Systems', 'AI Agents', 'Vector DB'],
                  },
                ].map(({ tier, badge, badgeColor, price, crossedPrice, priceTag, priceTagColor, desc, features, cta, ctaStyle, ctaHref, featured, stats }) => (
                  <div
                    key={tier}
                    className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${
                      featured
                        ? 'bg-white dark:bg-[#0e1730] border-2 border-[#2563eb] shadow-xl shadow-blue-500/10'
                        : 'bg-[#f1f0f7] dark:bg-[#0f1525] border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#2563eb] text-white text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                        ⚡ Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{tier}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>{badge}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {stats.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{s}</span>
                        ))}
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-slate-400 line-through font-mono">{crossedPrice}</span>
                          <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{price}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${priceTagColor}`}>{priceTag}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{desc}</p>
                      </div>
                      <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-4" />
                      <ul className="space-y-2.5 mb-6">
                        {features.map((f, i) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${i === 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className={i === 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-300'}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {ctaHref ? (
                      <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${ctaStyle}`}>
                        <span>{cta}</span><ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <button type="button"
                        onClick={() => {
                          if (!isLoggedIn) { router.push('/signup?redirectTo=' + encodeURIComponent('/?enroll=' + (tier.includes('Webinar') ? 'expert_session' : 'cohort'))); }
                          else { setSelectedPlan(tier.includes('Webinar') ? 'expert_session' : 'cohort'); setPaymentModalOpen(true); }
                        }}
                        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 ${ctaStyle}`}
                      >
                        <span>{cta}</span><ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================
          LIVE SESSION PREVIEW — Video section
      =================================================================== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#080d1c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Live Class Sneak Peek
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              See How We Teach in Real Live Sessions
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Watch an authentic excerpt from our live cohort mentorship classes — hands-on coding, live problem-solving, and mentor-student interaction.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D121F] shadow-2xl p-2 sm:p-3">
            <VideoPlayer
              url="https://youtu.be/WAjTmgYvjA8"
              title="Waynautic Live Training Masterclass — Live Session Sneak Peek"
              topicId="live-session-preview"
              moduleTitle="Waynautic Live Mentorship Class"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, text: '100% Practical & Code-First' },
              { icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, text: 'Live Doubt Clearing & Q&A' },
              { icon: <CheckCircle2 className="w-4 h-4 text-violet-500" />, text: 'Real Industry Mentors' },
            ].map(({ icon, text }) => (
              <div key={text} className="p-3 rounded-2xl bg-[#f8fafc] dark:bg-[#0f1525] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 shadow-sm text-center">
                {icon}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          ACHIEVEMENT / CERTIFICATE SECTION — Alternating layout (title left, card right)
          Exactly like AccioJob's feature sections
      =================================================================== */}
      <section id="certificate" className="py-16 sm:py-24 bg-[#f8fafc] dark:bg-[#080d1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Title & description */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Industry Recognition & Accreditations
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-[1.2] mb-5 tracking-tight">
                Learn from an{' '}
                <span className="text-[#2563eb]">Award-Winning</span>{' '}
                AI Engineering Team
              </h2>

              <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Our curriculum and mentorship are built on proven industry excellence, recognized nationally for breakthrough AI testing strategies and production systems.
              </p>

              <ul className="space-y-3.5 mb-8">
                {[
                  'Winner — Best AI/ML Testing Strategy 2025',
                  'GenAI and ML Awards by leading industry body',
                  'Setting new industry benchmarks for AI reliability',
                  'Curriculum shaped by real production projects',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2563eb]" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://lnkd.in/p/dPmtiGUF"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                View Announcement on LinkedIn
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* RIGHT: Certificate card preview */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative max-w-md w-full">
                {/* Decorative blur */}
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-white dark:bg-[#0e1730] rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-300">Industry Achievement Certificate</span>
                    </div>
                  </div>
                  <a
                    href="https://lnkd.in/p/dPmtiGUF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <Image
                      src="/Innovation-Certificate.jpg"
                      alt="Winner of the Best AI/ML Testing Strategy 2025 at the GenAI and ML Awards"
                      width={480}
                      height={340}
                      className="w-full h-auto object-cover group-hover:opacity-95 transition-opacity"
                    />
                    <div className="p-4">
                      <p className="text-xs font-black text-slate-900 dark:text-white">🌟 Best AI/ML Testing Strategy 2025</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">GenAI and ML Awards · Click to view on LinkedIn</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          WHY CHOOSE US — Feature grid (AccioJob alternating section style)
      =================================================================== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#080d1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">

          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3">Our Advantage</span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Why Choose{' '}
              <span className="text-[#2563eb]">Waynautic Academy</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base">
              We built what we wish existed — a no-fluff, depth-first engineering curriculum for serious developers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              { icon: <BookOpen className="w-5 h-5" />, title: '56 Topics — Video + Live Sessions', desc: 'Every topic covered via recorded lectures and reinforced through live sessions with your mentor.', color: '#2563eb', bg: '#eff6ff' },
              { icon: <Clock className="w-5 h-5" />, title: '4-Week Structured Path', desc: 'A fast, focused journey from fundamentals to advanced production-grade skills and architectures.', color: '#7c3aed', bg: '#f5f3ff' },
              { icon: <Rocket className="w-5 h-5" />, title: '4–5 Agentic Portfolio Projects', desc: 'Build real, portfolio-worthy projects — not toy examples. Work you can demo in any job interview.', color: '#db2777', bg: '#fdf2f8' },
              { icon: <Users className="w-5 h-5" />, title: 'Personalized 1-on-1 Mentor', desc: 'Every student gets a dedicated mentor for personalized training, doubt-solving, and career guidance.', color: '#d97706', bg: '#fffbeb' },
              { icon: <Award className="w-5 h-5" />, title: '3-Month Internship + Certificate', desc: 'Continue with an industry internship right after your training. Earn both an Internship & Completion Certificate.', color: '#059669', bg: '#ecfdf5' },
              { icon: <Target className="w-5 h-5" />, title: 'Full Placement Assistance', desc: 'End-to-end job market preparation: mock interviews, resume building, LinkedIn optimization, and 1-year portal access.', color: '#dc2626', bg: '#fff1f2' },
            ].map(({ icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="group p-6 sm:p-7 rounded-2xl bg-[#f8fafc] dark:bg-[#0f1525] border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-transparent transition-all duration-300"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: bg, color }}
                  >
                    {icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{title}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          FAQ SECTION
      =================================================================== */}
      <section className="py-16 sm:py-24 bg-[#f8fafc] dark:bg-[#080d1c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3">FAQs</span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
              <span className="text-[#2563eb]">Frequently</span> Asked Questions
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-8 flex-wrap">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                type="button"
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  faqCategory === cat
                    ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
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

      {/* ===================================================================
          CTA BANNER — Dark navy, AccioJob style
      =================================================================== */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #0e2a5c 50%, #1a0d4a 100%)' }}>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-[80px] rounded-full" />

          <div className="relative z-10 px-6 sm:px-12 lg:px-16 py-14 sm:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left */}
            <div className="text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
                <Rocket className="w-3.5 h-3.5" />
                3 Flagship Engineering Programs
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
                Ready to Accelerate Your Career in{' '}
                <span className="text-blue-300">Automation, Performance, or AI?</span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                Join our 4-week code-first masterclasses followed by a guaranteed <strong>3-Month Industry Internship</strong>. Choose between <strong>Automation Testing</strong>, <strong>Performance Testing</strong>, or <strong>AI Engineering</strong> — with personalized mentorship, dual certification, and full placement assistance.
              </p>
              {/* 3 Track Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Track 01: Automation Testing
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Track 02: Performance Testing
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Track 03: AI Engineering
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4 shrink-0 w-full lg:w-72">
              <a
                href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20learn%20more%20about%20your%20programs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:pramod.gogadare@waynautic.com?subject=Enquiry%20-%20Waynautic%20Academy%20Programs"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/15 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
              >
                <Mail className="w-5 h-5" />
                Send us an Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20learn%20more%20about%20your%20programs"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 transition-all"
        title="Chat with us on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.552 4.116 1.518 5.847L0 24l6.335-1.652A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.004-1.37l-.358-.214-3.76.98 1.006-3.65-.234-.374A9.775 9.775 0 012.182 12c0-5.422 4.396-9.818 9.818-9.818 5.423 0 9.818 4.396 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z" />
        </svg>
      </a>

      {/* Official Razorpay Checkout Modal */}
      <RazorpayModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        plan={selectedPlan}
      />

    </div>
  );
}

export default function HomePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">Loading Waynautic Academy...</div>}>
      <HomePageContent />
    </React.Suspense>
  );
}
