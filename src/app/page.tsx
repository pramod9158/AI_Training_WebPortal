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
  { category: 'Courses', q: 'How is the curriculum structured across modules?', a: 'The curriculum is organized across core progressive modules. Each module includes video lectures, live session reinforcement, reading notes, and interactive quizzes.' },
  { category: 'Learning', q: 'Is the learning self-paced or does it include live sessions?', a: 'Both! Every topic is covered via recorded video lectures, and reinforced through live sessions with your mentor. You get the flexibility of recorded content plus the depth of live interaction.' },
  { category: 'Learning', q: 'Will I build real AI projects?', a: 'Yes — you will build 4 to 5 agentic, market-ready AI projects during the program. These are portfolio-ready projects that demonstrate your skills to employers, not just theory or toy examples.' },
  { category: 'Learning', q: 'Do I get a personal mentor?', a: 'Yes. Every student is assigned a dedicated mentor who provides personalized guidance throughout the program, answers your questions, and keeps you on track to complete the curriculum.' },
  { category: 'Learning', q: 'What makes Waynautic different from free YouTube tutorials?', a: 'Waynautic provides a structured, mentor-guided path with live sessions, agentic AI projects, streak tracking, quizzes, certificates, mock interviews, and placement support — all designed for developers who want real skills, not just surface-level content.' },
  { category: 'Placements & Certificates', q: 'What certificates do I get after completing the program?', a: 'Upon successful completion of the 4-week AI training, you continue with a 3-month industry internship — the main highlight of our program. You receive two credentials: (1) an official 3-Month Internship Certificate for your production project work, and (2) a Program Completion Certificate from Waynautic Academy — both recognized credentials you can showcase on LinkedIn and your resume.' },
  { category: 'Placements & Certificates', q: 'How long do I get access to the academy portal?', a: 'You get 1 full year of access to the Waynautic Academy portal after enrollment — including all video topics, future content updates, live session recordings, and resources added during your access period.' },
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

// --- FAQ Accordion Item (AccioJob Style) -------------------------------------
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0d1426] transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs overflow-hidden">
      <button
        className="w-full text-left px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-4 cursor-pointer group"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="font-bold text-[#111827] dark:text-white text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        />
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-[#374151] dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
          {a}
        </div>
      )}
    </div>
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
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
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

  const scrollToProgramFees = (prog: 'functional' | 'performance' | 'ai', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedProgram(prog);
    setTimeout(() => {
      const el = document.getElementById('fees-structure');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 70);
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

        {/* Floating WhatsApp button (softened) */}
        <a
          href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20have%20a%20question%20regarding%20my%20course"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-110 transition-all"
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
      <section className="relative bg-white dark:bg-[#080d1c] overflow-hidden min-h-[80vh] flex items-center">
        {/* Mesh-light hero gradient §2.2 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(41,171,226,0.14), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 10%, rgba(124,58,237,0.12), transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(217,70,168,0.08), transparent 60%)'
        }} />

        <div className="relative container-xl py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Headline + subtitle + trust badges */}
            <div>
              {/* Eyebrow badge §7.2 */}
              <div className="eyebrow dark:eyebrow-dark mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                Placement-Focused Tech Training Programs
              </div>

              {/* H1 §3.2 — Home hero 36→48→60px, weight 600, tracking tight */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-navy-900 dark:text-white leading-[1.08] mb-6 tracking-[-0.025em]">
                Launch Your Tech Career with{' '}
                <span style={{ color: '#1a3fb0' }}>Placement-Focused Courses</span>{' '}
                &amp; 3-Month Industry Internship
              </h1>

              {/* Lead paragraph §3.2 — 20px, relaxed */}
              <p className="text-xl text-navy-800/70 dark:text-white/70 leading-relaxed mb-9 max-w-xl">
                Get job-ready through live, online, or self-paced courses. Learn from expert mentors, build real projects, and access placement opportunities with top companies.
              </p>

              {/* Trust badges §7.4 card-surface style */}
              <div className="flex flex-wrap gap-3 mb-9">
                {[
                  { icon: <Award className="w-4 h-4 text-brand-blue" />, label: 'Award-Winning Curriculum' },
                  { icon: <Users className="w-4 h-4 text-brand-blue" />, label: 'Expert Industry Mentors' },
                  { icon: <Shield className="w-4 h-4 text-brand-blue" />, label: 'Dual Certification' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-navy-900 shadow-card text-sm font-medium text-navy-900 dark:text-white/80" style={{ border: '1px solid rgba(10,17,40,0.10)' }}>
                    {icon}
                    {label}
                  </div>
                ))}
              </div>

              {/* CTAs §7.1 — primary gradient + outline */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#courses" className="btn-gradient text-base">
                  <BookOpen className="w-4 h-4" />
                  Explore Programs
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-base"
                >
                  <Phone className="w-4 h-4" />
                  Talk to Us
                </a>
              </div>
            </div>

            {/* RIGHT: Two stacked dark feature cards (AccioJob style) */}
            <div className="flex flex-col gap-4">

              {/* Card 1: Courses — styled like Screenshot 4 white card */}
              <div className="relative rounded-2xl p-6 sm:p-7 overflow-hidden transition-all duration-300 bg-white dark:bg-navy-900 border border-navy-900/10 dark:border-white/10 shadow-card hover:shadow-glow">
                {/* Top mockup window bar matching Screenshot 4 */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-navy-900/[0.07] dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-navy-900/15 dark:bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-navy-900/15 dark:bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-navy-900/15 dark:bg-white/20" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-paper dark:bg-white/5 border border-navy-900/[0.06] dark:border-white/10 text-[10px] font-mono text-navy-800/60 dark:text-white/60 font-medium">
                    flagship-programs
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-blue/10 dark:bg-brand-cyan/15 text-brand-blue dark:text-brand-cyan text-[11px] font-bold">
                    3 Career Tracks
                  </span>
                </div>

                <div className="relative">
                  <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-1">Industry-Ready Training</h3>
                  <p className="text-navy-800/70 dark:text-white/70 text-sm mb-4">4-week live cohort + 3-month industry internship. Placement-focused, mentor-guided.</p>

                  {/* 3 Programs listed — each clicks directly to that program's fee structure */}
                  <div className="space-y-2 mb-4">
                    {[
                      { key: 'functional' as const, label: 'Automation Testing' },
                      { key: 'performance' as const, label: 'Performance Testing' },
                      { key: 'ai' as const, label: 'AI Engineering & LLMs' },
                    ].map(prog => (
                      <div
                        key={prog.label}
                        onClick={(e) => scrollToProgramFees(prog.key, e)}
                        className="px-3.5 py-2.5 rounded-xl border border-navy-900/10 dark:border-white/10 bg-paper/70 dark:bg-white/5 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/15 hover:border-brand-blue/30 cursor-pointer hover:scale-[1.01] transition-all flex items-center justify-between group/item"
                        role="button"
                        tabIndex={0}
                        title={`View fees structure for ${prog.label}`}
                      >
                        <div className="font-bold text-sm leading-tight text-navy-900 dark:text-white group-hover/item:text-brand-blue dark:group-hover/item:text-brand-cyan transition-colors">{prog.label}</div>
                        <span className="text-xs font-semibold text-brand-blue dark:text-brand-cyan flex items-center gap-1 transition-colors">
                          Fees &amp; Tiers
                          <ArrowRight className="w-3.5 h-3.5 group-hover/item:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Key stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { val: '₹9,999', label: 'Starting Price' },
                      { val: '3 Months', label: 'Internship' },
                    ].map(s => (
                      <div key={s.label} className="bg-paper dark:bg-white/5 border border-navy-900/[0.07] dark:border-white/10 rounded-xl px-2 py-2 text-center">
                        <div className="text-navy-900 dark:text-white font-bold text-sm">{s.val}</div>
                        <div className="text-navy-800/60 dark:text-white/60 text-[10px] font-semibold mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Live Projects', 'Expert Mentors', 'Certificate', 'Placement Help'].map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-paper dark:bg-white/5 border border-navy-900/[0.07] dark:border-white/10 text-navy-800/80 dark:text-white/80 text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('fees-structure');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="btn-gradient w-full text-sm py-2.5 rounded-lg text-white font-bold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    View Fees Structure ↗
                  </button>
                </div>
              </div>

              {/* Card 2: Achievement Certificate — styled like Screenshot 4 white card */}
              <div
                className="relative rounded-2xl p-5 sm:p-6 overflow-hidden transition-all duration-300 bg-white dark:bg-navy-900 border border-navy-900/10 dark:border-white/10 shadow-card hover:shadow-glow cursor-pointer group"
                onClick={() => setCertModalOpen(true)}
              >
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Achievement Certificate
                    </span>
                    <span className="text-[10px] font-mono font-bold text-navy-800/60 dark:text-white/60 uppercase">GenAI &amp; ML 2025</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-16 sm:w-28 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-navy-900/10 dark:border-white/15 shadow-sm group-hover:border-amber-400 transition-all bg-slate-100 dark:bg-black/40 relative">
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
                      <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white leading-snug mb-1">
                        National Excellence Award
                      </h3>
                      <p className="text-navy-800/70 dark:text-white/70 text-xs leading-relaxed line-clamp-2">
                        Winner — Best AI/ML Testing Strategy. Recognized nationally for industry-leading curriculum.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-navy-900/[0.07] dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-brand-cyan text-[10px] font-bold">Dual Certified</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">Industry Recognized</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCertModalOpen(true);
                      }}
                      className="btn-gradient text-xs px-3.5 py-1.5 rounded-md text-white font-bold shadow-xs shrink-0 cursor-pointer"
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
          PROGRAMS & LEARNING TIERS SECTION
      =================================================================== */}
      <section id="courses" className="py-20 sm:py-28 bg-paper dark:bg-[#080d1c]">
        <div className="container-xl">

          {/* Section heading */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="eyebrow mb-4 dark:eyebrow-dark">
              <Sparkles className="w-3.5 h-3.5" />
              Specialized Career Tracks
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy-900 dark:text-white tracking-tight mb-3">
              Explore Programs &amp; Flexible Learning Tiers
            </h2>
            <p className="text-base text-navy-800/65 dark:text-white/60 leading-relaxed">
              Select a track below to explore Free Consultation, Live ₹19 Interactive Webinar, or the Full 4-Week Cohort with 3-Month Internship.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-xs max-w-xl mx-auto mb-10">
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
                    ? 'btn-gradient text-white shadow-glow'
                    : 'text-navy-800/70 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Course Cards — Faint modern tinted cards */}
          <div id="fees-structure" className="scroll-mt-24">
            {/* Notice Banner if redirected from protected portal */}
            {noticeParam === 'enroll_required' && (
              <div className="max-w-3xl mx-auto mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/8 border-2 border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start sm:items-center gap-3 shadow-xs">
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
                    badgeColor: 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60',
                    price: 'Free',
                    crossedPrice: '₹299',
                    priceTag: '100% Free',
                    priceTagColor: 'bg-emerald-500/8 text-emerald-600/90 dark:text-emerald-400/90',
                    desc: 'Get a personalized automation testing roadmap based on your background.',
                    features: ['Personalized QA automation roadmap', 'Career advisory for SDET & QA roles', '1-on-1 Selenium, Playwright & Jira guidance', 'CI/CD pipeline integration strategy'],
                    cta: 'Book Free Session',
                    ctaStyle: 'btn-outline border border-navy-900/15 text-navy-900 dark:text-white hover:border-brand-blue/40',
                    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform',
                    featured: false,
                  },
                  {
                    tier: 'Live Webinar',
                    badge: 'Popular',
                    badgeColor: 'bg-amber-500/8 text-amber-600/80 dark:text-amber-400/80 border-amber-500/20',
                    price: '₹19',
                    crossedPrice: '₹499',
                    priceTag: 'Intro Offer',
                    priceTagColor: 'bg-emerald-500/8 text-emerald-600/90 dark:text-emerald-400/90',
                    desc: 'Live interactive webinar on Selenium & Playwright automation with CI/CD.',
                    features: ['All Consultation features included', 'Live Webinar: Selenium & Playwright', 'Azure DevOps & CI/CD pipeline basics', 'Resume & LinkedIn profile audit'],
                    cta: 'Join Webinar for ₹19',
                    ctaStyle: 'bg-brand-blue hover:bg-[#15328c] text-white font-semibold shadow-sm',
                    ctaHref: null,
                    featured: false,
                  },
                  {
                    tier: '4-Week Intensive Cohort',
                    badge: '⚡ Flagship Masterclass',
                    badgeColor: 'bg-brand-blue text-white border-brand-blue/40',
                    price: '₹9,999',
                    crossedPrice: '₹20,000',
                    priceTag: 'GST Included',
                    priceTagColor: 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400',
                    desc: '4-week live training in automation testing + guaranteed 3-month industry internship.',
                    features: ['3-Month Industry Internship (main highlight)', 'Selenium & Playwright automation', 'Azure DevOps, Jira & CI/CD pipeline', '4-5 automation projects with code reviews', 'Dual Certification: Internship + Completion', 'Mock interviews & LinkedIn optimization'],
                    cta: 'Enroll in Automation (₹9,999)',
                    ctaStyle: 'btn-gradient text-white shadow-glow',
                    ctaHref: null,
                    featured: true,
                  },
                ].map(({ tier, badge, badgeColor, price, crossedPrice, priceTag, priceTagColor, desc, features, cta, ctaStyle, ctaHref, featured }) => (
                  <div
                    key={tier}
                    className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                      featured
                        ? 'bg-white dark:bg-navy-950 border-2 border-brand-blue shadow-glow'
                        : 'bg-white dark:bg-navy-900 border border-navy-900/10 dark:border-white/10 shadow-card hover:border-brand-blue/30'
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-brand-blue text-white text-[11px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
                        ⚡ Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{tier}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>{badge}</span>
                      </div>

                      <div className="mb-4 mt-2">
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
                    badgeColor: 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60',
                    price: 'Free',
                    crossedPrice: '₹299',
                    priceTag: '100% Free',
                    priceTagColor: 'bg-emerald-500/8 text-emerald-600/90 dark:text-emerald-400/90',
                    desc: 'Personalized performance engineering roadmap based on your background.',
                    features: ['Personalized performance testing roadmap', 'Career advisory for Performance Engineer & SRE roles', '1-on-1 JMeter, K6, LoadRunner guidance', 'APM tools: Grafana, Datadog & AppDynamics'],
                    cta: 'Book Free Session',
                    ctaStyle: 'btn-outline border border-navy-900/15 text-navy-900 dark:text-white hover:border-brand-blue/40',
                    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform',
                    featured: false,
                  },
                  {
                    tier: 'Live Perf Webinar',
                    badge: 'Popular',
                    badgeColor: 'bg-amber-500/8 text-amber-600/80 dark:text-amber-400/80 border-amber-500/20',
                    price: '₹19',
                    crossedPrice: '₹499',
                    priceTag: 'Intro Offer',
                    priceTagColor: 'bg-emerald-500/8 text-emerald-600/90 dark:text-emerald-400/90',
                    desc: 'Live interactive webinar covering JMeter, K6 & APM monitoring essentials.',
                    features: ['All Consultation features included', 'Live Webinar: JMeter & K6 load testing', 'Grafana & Datadog dashboards hands-on', 'Resume & LinkedIn audit for perf roles'],
                    cta: 'Join Webinar for ₹19',
                    ctaStyle: 'bg-brand-blue hover:bg-[#15328c] text-white font-semibold shadow-sm',
                    ctaHref: null,
                    featured: false,
                  },
                  {
                    tier: '4-Week Intensive Cohort',
                    badge: '⚡ Flagship Masterclass',
                    badgeColor: 'bg-brand-blue text-white border-brand-blue/40',
                    price: '₹9,999',
                    crossedPrice: '₹20,000',
                    priceTag: 'GST Included',
                    priceTagColor: 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400',
                    desc: '4-week live performance testing training + guaranteed 3-month industry internship.',
                    features: ['3-Month Industry Internship (main highlight)', 'JMeter, LoadRunner & K6 load testing', 'AppDynamics, Grafana & Datadog APM', 'Azure DevOps, Jira & CI/CD integration', '4-5 real-world performance projects', 'Dual Certification + placement assistance'],
                    cta: 'Enroll in Performance (₹9,999)',
                    ctaStyle: 'btn-gradient text-white shadow-glow',
                    ctaHref: null,
                    featured: true,
                  },
                ].map(({ tier, badge, badgeColor, price, crossedPrice, priceTag, priceTagColor, desc, features, cta, ctaStyle, ctaHref, featured }) => (
                  <div
                    key={tier}
                    className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                      featured
                        ? 'bg-white dark:bg-navy-950 border-2 border-brand-blue shadow-glow'
                        : 'bg-white dark:bg-navy-900 border border-navy-900/10 dark:border-white/10 shadow-card hover:border-brand-blue/30'
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-brand-blue text-white text-[11px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
                        ⚡ Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{tier}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>{badge}</span>
                      </div>
                      <div className="mb-4 mt-2">
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
                    badgeColor: 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60',
                    price: 'Free',
                    crossedPrice: '₹299',
                    priceTag: '100% Free',
                    priceTagColor: 'bg-emerald-500/8 text-emerald-600/90 dark:text-emerald-400/90',
                    desc: 'Get a personalized AI learning roadmap based on your current job & background.',
                    features: ['Personalized AI learning roadmap', 'Custom upskilling plan & curriculum', '1-on-1 strategy & doubt-clearing session', 'Career transition advisory for AI/LLM roles'],
                    cta: 'Book Free Session',
                    ctaStyle: 'btn-outline border border-navy-900/15 text-navy-900 dark:text-white hover:border-brand-blue/40',
                    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfLLPUZ4xeLHXxckuZ7gUwyPTodr8aUxsis3Zn_KIPYLlWwfA/viewform',
                    featured: false,
                  },
                  {
                    tier: 'Live AI Webinar',
                    badge: 'Popular',
                    badgeColor: 'bg-amber-500/8 text-amber-600/80 dark:text-amber-400/80 border-amber-500/20',
                    price: '₹19',
                    crossedPrice: '₹499',
                    priceTag: 'Intro Offer',
                    priceTagColor: 'bg-emerald-500/8 text-emerald-600/90 dark:text-emerald-400/90',
                    desc: 'Live interactive AI Webinar masterclass. Everything in Starter + live session.',
                    features: ['All Consultation features included', 'Live Interactive AI Webinar masterclass', 'Personalized resume & tech profile audit', 'Direct Q&A and hands-on project guidance'],
                    cta: 'Join Webinar for ₹19',
                    ctaStyle: 'bg-brand-blue hover:bg-[#15328c] text-white font-semibold shadow-sm',
                    ctaHref: null,
                    featured: false,
                  },
                  {
                    tier: '4-Week Intensive Cohort',
                    badge: '⚡ Flagship Masterclass',
                    badgeColor: 'bg-brand-blue text-white border-brand-blue/40',
                    price: '₹9,999',
                    crossedPrice: '₹20,000',
                    priceTag: 'GST Included',
                    priceTagColor: 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400',
                    desc: '4-week live AI training + guaranteed 3-month industry internship in AI engineering.',
                    features: ['3-Month Industry Internship (main highlight)', 'All benefits from ₹19 & Free tiers', '4 weeks live personalized AI training', 'Full Academy Portal: In-depth video lectures', '4–5 agentic AI portfolio projects', 'Dual Certification + placement assistance'],
                    cta: 'Enroll in AI Engineering (₹9,999)',
                    ctaStyle: 'btn-gradient text-white shadow-glow',
                    ctaHref: null,
                    featured: true,
                  },
                ].map(({ tier, badge, badgeColor, price, crossedPrice, priceTag, priceTagColor, desc, features, cta, ctaStyle, ctaHref, featured }) => (
                  <div
                    key={tier}
                    className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                      featured
                        ? 'bg-white dark:bg-navy-950 border-2 border-brand-blue shadow-glow'
                        : 'bg-white dark:bg-navy-900 border border-navy-900/10 dark:border-white/10 shadow-card hover:border-brand-blue/30'
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-brand-blue text-white text-[11px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
                        ⚡ Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{tier}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>{badge}</span>
                      </div>
                      <div className="mb-4 mt-2">
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
          LIVE SESSION PREVIEW — Video trigger section
      =================================================================== */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#080d1c]">
        <div className="container-xl flex items-center justify-center">
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            className="btn-gradient text-sm px-8 py-3.5 shadow-glow inline-flex items-center gap-2.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Watch Live Class Video
          </button>
        </div>
      </section>

      {/* ===================================================================
          WHY CHOOSE US — Feature grid
      =================================================================== */}
      <section className="py-20 sm:py-28 bg-paper dark:bg-[#080d1c]">
        <div className="container-xl">

          {/* Section heading block §7.3 */}
          <div className="text-center mb-12 sm:mb-14 max-w-2xl mx-auto">
            <div className="eyebrow mb-5 dark:eyebrow-dark">Our Advantage</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy-900 dark:text-white tracking-tight mb-4">
              Why Choose{' '}
              <span style={{ color: '#1a3fb0' }}>Waynautic Academy</span>
            </h2>
            <p className="text-lg text-navy-800/65 dark:text-white/65 leading-relaxed">
              We built what we wish existed — a no-fluff, depth-first engineering curriculum for serious developers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              { icon: <BookOpen className="w-5 h-5" />, title: 'Video Lectures + Live Sessions', desc: 'Every concept covered via recorded lectures and reinforced through live sessions with your mentor.', color: '#6b92ed', bg: '#f6f9fe' },
              { icon: <Clock className="w-5 h-5" />, title: '4-Week Structured Path', desc: 'A fast, focused journey from fundamentals to advanced production-grade skills and architectures.', color: '#9e79f7', bg: '#faf8fe' },
              { icon: <Rocket className="w-5 h-5" />, title: '4–5 Agentic Portfolio Projects', desc: 'Build real, portfolio-worthy projects — not toy examples. Work you can demo in any job interview.', color: '#e875ac', bg: '#fef7fb' },
              { icon: <Users className="w-5 h-5" />, title: 'Personalized 1-on-1 Mentor', desc: 'Every student gets a dedicated mentor for personalized training, doubt-solving, and career guidance.', color: '#eca549', bg: '#fefbf3' },
              { icon: <Award className="w-5 h-5" />, title: '3-Month Internship + Certificate', desc: 'Continue with an industry internship right after your training. Earn both an Internship & Completion Certificate.', color: '#2bb588', bg: '#f4fdf8' },
              { icon: <Target className="w-5 h-5" />, title: 'Full Placement Assistance', desc: 'End-to-end job market preparation: mock interviews, resume building, LinkedIn optimization, and 1-year portal access.', color: '#e86d6d', bg: '#fef7f7' },
            ].map(({ icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="group card-surface-hover p-7 transition-all duration-300 border border-slate-200/40 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: bg, color, border: '1px solid rgba(10,17,40,0.08)' }}
                  >
                    {icon}
                  </div>
                  <h3 className="font-display font-bold text-navy-900 dark:text-white text-lg leading-snug">{title}</h3>
                </div>
                <p className="text-sm text-navy-800/65 dark:text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          FAQ SECTION — AccioJob 2-Column Layout
      =================================================================== */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#080d1c]">
        <div className="container-xl">
          {/* Section heading block §7.3 */}
          <div className="text-center mb-12 sm:mb-14 max-w-2xl mx-auto">
            <div className="eyebrow mb-5 dark:eyebrow-dark">FAQs</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy-900 dark:text-white tracking-tight mb-4">
              <span style={{ color: '#1a3fb0' }}>Frequently</span> Asked Questions
            </h2>
            <p className="text-lg text-navy-800/65 dark:text-white/65 leading-relaxed">
              Everything you need to know about our curriculum, live sessions, certification, and policies.
            </p>
          </div>

          {/* AccioJob 2-Column: Left Category Sidebar + Right Accordion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Category Sidebar */}
            <div className="lg:col-span-3">
              <div className="card-surface p-2 flex flex-col gap-1 sticky top-28">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFaqCategory(cat)}
                    type="button"
                    className={`w-full py-3 px-4 rounded-md text-center text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      faqCategory === cat
                        ? 'text-white dark:text-white'
                        : 'text-navy-800/70 dark:text-white/60 hover:text-navy-900 dark:hover:text-white hover:bg-paper dark:hover:bg-white/5'
                    }`}
                    style={faqCategory === cat ? { background: 'linear-gradient(100deg,#1a3fb0,#29abe2)', boxShadow: '0 0 0 1px rgba(41,171,226,.15), 0 8px 32px -8px rgba(124,58,237,.25)', color: '#ffffff' } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Accordion List */}
            <div className="lg:col-span-9 space-y-3.5">
              {filteredFaqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          CTA BANNER — AccioJob style
      =================================================================== */}
      <section className="py-20 sm:py-28 bg-paper dark:bg-[#080d1c]">
        <div className="container-xl">
        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-navy-900 border border-navy-900/10 dark:border-white/10 shadow-card">
          {/* Top mockup window bar matching Screenshot 4 */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-b border-navy-900/[0.07] dark:border-white/10 bg-paper/60 dark:bg-white/5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-navy-900/15 dark:bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-navy-900/15 dark:bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-navy-900/15 dark:bg-white/20" />
            </div>
            <span className="px-3 py-0.5 rounded-full bg-white dark:bg-navy-950 border border-navy-900/[0.06] dark:border-white/10 text-xs font-mono text-navy-800/60 dark:text-white/60 font-medium">
              career-accelerator
            </span>
            <div className="w-12" />
          </div>

          <div className="relative z-10 px-8 sm:px-14 lg:px-16 py-12 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left */}
            <div className="text-center lg:text-left max-w-2xl">
              <div className="eyebrow mb-5">
                <Rocket className="w-3.5 h-3.5" />
                3 Flagship Engineering Programs
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy-900 dark:text-white mb-4 leading-tight tracking-tight">
                Ready to Accelerate Your Career in{' '}
                <span className="text-brand-blue">Automation, Performance, or AI?</span>
              </h2>
              <p className="text-lg text-navy-800/75 dark:text-white/75 leading-relaxed mb-6">
                Join our 4-week code-first masterclasses followed by a guaranteed <strong className="text-navy-900 dark:text-white font-bold">3-Month Industry Internship</strong>. Choose between <strong className="text-navy-900 dark:text-white font-bold">Automation Testing</strong>, <strong className="text-navy-900 dark:text-white font-bold">Performance Testing</strong>, or <strong className="text-navy-900 dark:text-white font-bold">AI Engineering</strong> — with personalized mentorship, dual certification, and full placement assistance.
              </p>
              {/* 3 Track Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-paper dark:bg-white/5 text-navy-800 dark:text-white border border-navy-900/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-brand-blue" /> Track 01: Automation Testing
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-paper dark:bg-white/5 text-navy-800 dark:text-white border border-navy-900/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-blue" /> Track 02: Performance Testing
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-paper dark:bg-white/5 text-navy-800 dark:text-white border border-navy-900/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-brand-blue" /> Track 03: AI Engineering
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4 shrink-0 w-full lg:w-72">
              <a
                href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20learn%20more%20about%20your%20programs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:pramod.gogadare@waynautic.com?subject=Enquiry%20-%20Waynautic%20Academy%20Programs"
                className="btn-outline flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-semibold rounded-xl text-center"
              >
                <Mail className="w-5 h-5" />
                Send us an Email
              </a>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Video Player Modal (Triggered by 'Watch Live Class Video' button) */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-bold text-white">Live Cohort Class Excerpt — Waynautic Academy</h4>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                aria-label="Close video"
              >
                ✕
              </button>
            </div>
            <div className="p-2 sm:p-4 bg-black">
              <VideoPlayer
                url="https://youtu.be/WAjTmgYvjA8"
                title="Waynautic Live Training Masterclass — Live Session Sneak Peek"
                topicId="live-session-preview"
                moduleTitle="Waynautic Live Mentorship Class"
              />
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal (Triggered from Hero Achievement Card) */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden border border-amber-500/40 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">GenAI &amp; ML Awards 2025 Certificate</h4>
              </div>
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                aria-label="Close certificate"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center">
              <div className="rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl mb-4 bg-black">
                <Image
                  src="/Innovation-Certificate.jpg"
                  alt="Waynautic Innovation Certificate - GenAI & ML Awards 2025"
                  width={600}
                  height={420}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-white mb-1">Winner — Best AI/ML Testing Strategy</h3>
                <p className="text-xs text-slate-400 max-w-md">Awarded nationally for groundbreaking enterprise AI testing architectures and industry-proven curricula.</p>
              </div>
              <a
                href="https://lnkd.in/p/dPmtiGUF"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs shadow-md transition-all"
              >
                View Announcement on LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp button (softened) */}
      <a
        href="https://wa.me/919158998226?text=Hi%20Waynautic%20Academy%2C%20I%20want%20to%20learn%20more%20about%20your%20programs"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-110 transition-all"
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
