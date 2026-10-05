import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Briefcase, 
  FileText, 
  Lock, 
  CheckCircle2, 
  ArrowLeft,
  Mail,
  Phone,
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Waynautic Academy',
  description: 'Official Terms and Conditions, Policies, and Student Disclaimers for Waynautic Academy paid training programs and internship cohorts.',
};

export default function TermsPage() {
  const effectiveDate = 'October 5, 2026';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 transition-colors">
      {/* Top Breadcrumb & Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Academy</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              Effective Date: {effectiveDate}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden py-12 sm:py-16 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#0B101E] dark:to-[#070A12] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement & Policies
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Terms & Conditions of Enrollment
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before enrolling in any training program, live webinar, masterclass, or cohort operated by Waynautic Academy.
          </p>
        </div>
      </div>

      {/* Key Policy Highlights Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Strict No Refund */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border-2 border-rose-500/30 shadow-lg shadow-rose-500/5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              Strict No-Refund Policy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All program fees are strictly 100% non-refundable and non-transferable under all circumstances once paid.
            </p>
          </div>

          {/* Card 2: Exclusive Pune Jurisdiction */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              Pune Jurisdiction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All claims, legal actions, or disputes are subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra.
            </p>
          </div>

          {/* Card 3: Placement Assistance Only */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border-2 border-amber-500/30 shadow-lg shadow-amber-500/5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              No Job Guarantee
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We provide placement assistance and mock interviews. We do not guarantee jobs, CTC offers, or third-party interview calls.
            </p>
          </div>

          {/* Card 4: IP & Anti-Piracy */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border-2 border-purple-500/30 shadow-lg shadow-purple-500/5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              Proprietary IP & Anti-Piracy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All lectures, mind maps, notes, and code repositories are proprietary. Screen recording or redistribution is illegal.
            </p>
          </div>

        </div>
      </div>

      {/* Main Legal Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-10 text-sm leading-relaxed">
          
          {/* Section 1 */}
          <section id="section-1" className="space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 01</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              1. Enrolment & Legally Binding Agreement
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              These Terms and Conditions (&quot;<strong>Terms</strong>&quot;) constitute a legally binding electronic agreement between the enrolled student / participant (&quot;<strong>Student</strong>&quot;, &quot;<strong>You</strong>&quot;, or &quot;<strong>User</strong>&quot;) and <strong>Waynautic Academy</strong> (a division of Waynautic Technologies, &quot;<strong>Academy</strong>&quot;, &quot;<strong>We</strong>&quot;, &quot;<strong>Us</strong>&quot;, or &quot;<strong>Our</strong>&quot;).
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              By clicking &quot;Proceed to Pay&quot;, paying any program fee, signing up on the platform, or accessing any course materials, live sessions, webinars, quizzes, or internship assignments, you acknowledge that you have read, understood, and unreservedly agree to be bound by all the terms, policies, and disclaimers set forth herein. If you do not agree to these Terms, you must not proceed with payment or enrollment.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 2 */}
          <section id="section-2" className="space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 02</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>2. Fee Structure & Strict 100% No-Refund Policy</span>
            </h2>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-2 text-xs sm:text-sm">
              <strong className="block font-bold">CRITICAL NOTICE REGARDING FEES & CANCELLATIONS:</strong>
              <p>
                All tuition fees, registration fees, webinar passes, and consultation charges paid to Waynautic Academy are strictly <strong>NON-REFUNDABLE</strong> and <strong>NON-TRANSFERABLE</strong> under any circumstances whatsoever. Once a payment transaction is completed, no refund request shall be entertained, processed, or approved.
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              This strict No-Refund policy applies universally and unconditionally, including but not limited to the following situations:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Change of Mind or Personal Circumstances:</strong> Any change in your personal schedule, family emergencies, illness, travel, college examinations, official workplace commitments, or changes in career aspirations.</li>
              <li><strong>Inability to Attend Sessions:</strong> Inability or failure to attend live mentorship lectures, webinars, or doubt-clearing sessions. (All enrolled students receive portal access to recorded lecture content and notes).</li>
              <li><strong>Dissatisfaction with Learning Pace or Difficulty:</strong> Subjective dissatisfaction with the curriculum, instructor style, technological pace, assignment difficulty, or personal learning curve.</li>
              <li><strong>Technical Issues on Student&apos;s Side:</strong> Hardware limitations, computer malfunctioning, inadequate internet bandwidth, power cuts, or software compatibility issues on the student&apos;s device.</li>
              <li><strong>Expulsion or Account Termination:</strong> Suspension or termination of access arising from breach of the Student Code of Conduct, academic dishonesty, or violation of Intellectual Property rights.</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Chargebacks & Payment Reversals:</strong> Any unilateral chargeback, payment dispute, or payment reversal initiated through credit card companies, banks, or payment gateways without prior written consent from Waynautic Academy shall be deemed a material breach of contract. We reserve the full legal right to present this signed digital agreement, IP access logs, and transaction evidence to banks and law enforcement, and pursue legal recovery along with incidental damages and legal costs.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 3 */}
          <section id="section-3" className="space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 03</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              3. Governing Law & Exclusive Jurisdiction in Pune, India
            </h2>
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/60 text-cyan-950 dark:text-cyan-200 space-y-2 text-xs sm:text-sm">
              <strong className="block font-bold">TERRITORIAL JURISDICTION CLAUSE:</strong>
              <p>
                These Terms and Conditions, your enrollment, and all contractual or non-contractual disputes, claims, or controversies arising out of or related to Waynautic Academy programs shall be governed by, construed, and enforced in accordance with the <strong>laws of the Republic of India</strong>.
              </p>
              <p>
                You explicitly, irrevocably, and unconditionally consent that the <strong>competent courts situated in Pune, Maharashtra, India</strong> shall have <strong>exclusive territorial and subject-matter jurisdiction</strong> to hear, try, and resolve any disputes, claims, lawsuits, or legal proceedings. You waive any objection to Pune being an inconvenient forum.
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Mandatory Dispute Resolution:</strong> Prior to filing any formal legal action or consumer dispute, the student must notify Waynautic Academy in writing at <a href="mailto:info@waynautic.com" className="text-cyan-600 dark:text-cyan-400 underline font-semibold">info@waynautic.com</a> stating the exact nature of the grievance. Both parties agree to attempt amicable resolution in good faith for a minimum period of thirty (30) calendar days. If unresolved, the matter shall be referred to sole arbitration in Pune, conducted in English in accordance with the Indian Arbitration and Conciliation Act, 1996.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 4 */}
          <section id="section-4" className="space-y-3">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 04</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              4. Placement Assistance Disclaimer — Strictly No Job Guarantee
            </h2>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 space-y-2 text-xs sm:text-sm">
              <strong className="block font-bold">DISCLAIMER OF EMPLOYMENT & HIRING OUTCOMES:</strong>
              <p>
                Waynautic Academy is an educational training and upskilling institution. <strong>WE DO NOT GUARANTEE, PROMISE, OR WARRANT A JOB, PLACEMENT, MINIMUM SALARY / CTC PACKAGE, PROMOTION, OR EMPLOYMENT OFFER TO ANY CANDIDATE.</strong>
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>What Placement Assistance Entails:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Comprehensive technical resume review, ATS optimization, and portfolio structuring.</li>
              <li>Mock technical interviews and constructive feedback on AI engineering competencies.</li>
              <li>LinkedIn profile enhancements and job search strategies.</li>
              <li>Guidance on approaching prospective recruiters and navigating technical assessments.</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Third-Party Hiring Decisions:</strong> Final hiring, interview shortlisting, remuneration, and employment offers are solely and exclusively at the independent discretion of third-party hiring companies. Hiring depends entirely upon the student&apos;s own technical performance, academic background, communication abilities, problem-solving skills, and prevailing tech market conditions. Waynautic Academy shall never be held liable for any student&apos;s failure to secure employment.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 5 */}
          <section id="section-5" className="space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 05</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              5. 3-Month Industry Internship & Dual Certification Criteria
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Enrolled students in the Flagship Cohort receive the opportunity to continue with a <strong>3-Month Industry Internship</strong> following the 4-week intensive AI engineering curriculum.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Educational Nature:</strong> The internship is an educational, experiential training engagement designed to simulate real-world production AI environments and provide project credentials. It does not establish an employer-employee or contractor relationship between the student and Waynautic Academy or Waynautic Technologies.</li>
              <li><strong>Certification Eligibility:</strong> To receive the official <strong>3-Month Internship Certificate</strong> and the <strong>Waynautic Program Completion Certificate</strong>, the student must satisfy the mandatory graduation criteria: (a) complete the designated core curriculum modules, (b) pass required topic mastery quizzes with a minimum passing score, (c) build and submit the required portfolio capstone projects, and (d) abide by all professional standards.</li>
              <li>Certificates will not be awarded to students who do not submit deliverables or fail to complete the mandatory assignments.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 6 */}
          <section id="section-6" className="space-y-3">
            <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 06</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              6. Intellectual Property, Proprietary Materials & Anti-Piracy Policy
            </h2>
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-purple-950 dark:text-purple-200 space-y-2 text-xs sm:text-sm">
              <strong className="block font-bold">EXCLUSIVE COPYRIGHT & IP PROTECTION:</strong>
              <p>
                All videos, curriculum structures, mind maps, proprietary code templates, quizzes, reading notes, and architectural diagrams are the exclusive, copyrighted intellectual property of Waynautic Academy / Waynautic Technologies.
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Upon verified enrollment, you are granted a limited, personal, non-exclusive, non-transferable, revocable single-user license to access the course content solely for your own private, individual education.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Strictly Prohibited Actions:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Screen recording, ripping, capturing, or downloading video lectures or audio streams.</li>
              <li>Sharing your user credentials, passwords, or session links with third parties.</li>
              <li>Publishing, uploading, or distributing course materials on public platforms including GitHub, YouTube, Google Drive, Telegram, torrents, or personal blogs.</li>
              <li>Reselling, sublicensing, or commercially exploiting any curriculum assets.</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300">
              Any infringement or unauthorized dissemination shall result in immediate account termination with zero refund, and will trigger civil damages claims and criminal proceedings under the <strong>Indian Copyright Act, 1957</strong> and the <strong>Information Technology Act, 2000</strong>.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 7 */}
          <section id="section-7" className="space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 07</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              7. Student Code of Conduct & Zero Tolerance Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              We maintain a professional, respectful, and inclusive learning atmosphere for all students and mentors. Students are required to adhere to high standards of professional ethics:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Decorum:</strong> Maintain polite, professional, and respectful discourse during live lectures, code reviews, and community channels.</li>
              <li><strong>Zero Tolerance:</strong> Profanity, hate speech, sexual harassment, personal attacks, discriminatory remarks, or unsolicited commercial advertising / spam will result in immediate and permanent expulsion without refund.</li>
              <li><strong>Academic Integrity:</strong> Plagiarism or submitting another candidate&apos;s code as your own capstone project is strictly prohibited and will disqualify the candidate from receiving certification.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 8 */}
          <section id="section-8" className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 08</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              8. Curriculum Adjustments, Faculty & Schedule Flexibility
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Artificial Intelligence and software engineering methodologies evolve at an extraordinary velocity. To ensure that our students receive cutting-edge education, Waynautic Academy reserves the full right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Update, modify, add, or replace curriculum topics, libraries, models, and tools without prior notice.</li>
              <li>Reschedule live sessions or modify class timings with reasonable advance notice in the event of mentor unavailability or emergency circumstances.</li>
              <li>Allocate or substitute qualified instructors and industry mentors to ensure seamless continuity of training.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 9 */}
          <section id="section-9" className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 09</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              9. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              All courses, video lessons, software tools, mentoring sessions, and services are provided strictly on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis, without express or implied warranties of any kind, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Limitation of Liability:</strong> Under no circumstances shall Waynautic Academy, its parent company, directors, officers, mentors, employees, or contractors be liable for any indirect, incidental, special, punitive, exemplary, or consequential damages, including loss of profits, career delays, data loss, business interruption, or emotional distress arising out of or related to your enrollment.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              In any event and under any legal theory (contract, tort, negligence, or otherwise), the aggregate liability of Waynautic Academy to you shall be strictly limited and capped at the <strong>actual amount paid by you</strong> for the specific enrolled program.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 10 */}
          <section id="section-10" className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 10</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              10. Communications & Operational Consent
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              By registering on our platform or providing your contact details, you grant explicit consent to receive essential transactional and educational communications from Waynautic Academy via Email, WhatsApp, and Phone/SMS. These include:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Official enrollment invoices, payment receipts, and tax breakdowns.</li>
              <li>Zoom / Google Meet webinar and lecture access links.</li>
              <li>Curriculum updates, project evaluation reports, and certificate releases.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 11 */}
          <section id="section-11" className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span>Section 11</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              11. Contact & Legal Grievance Redressal
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              For any formal queries, clarifications, or grievance redressal regarding these Terms and Conditions, please contact our legal and administrative office:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs sm:text-sm">
              <p><strong>Institution:</strong> Waynautic Academy (Waynautic Technologies)</p>
              <p><strong>Official Email:</strong> <a href="mailto:info@waynautic.com" className="text-cyan-600 dark:text-cyan-400 font-semibold underline">info@waynautic.com</a> / <a href="mailto:academy@waynautic.com" className="text-cyan-600 dark:text-cyan-400 font-semibold underline">academy@waynautic.com</a></p>
              <p><strong>Helpline & WhatsApp:</strong> <a href="https://wa.me/919158998226" className="text-cyan-600 dark:text-cyan-400 font-semibold underline">+91 9158998226</a></p>
              <p><strong>Jurisdiction & Operations:</strong> Pune, Maharashtra, 411041, India</p>
            </div>
          </section>

        </div>
      </div>

      {/* Bottom Floating Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>
          © {new Date().getFullYear()} Waynautic Academy. All rights reserved. Registered in Pune, Maharashtra.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link href="/curriculum" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Curriculum
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
