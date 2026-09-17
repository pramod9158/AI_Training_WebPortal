'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  BookOpen, 
  Compass, 
  Mail, 
  Phone, 
  CheckCircle2, 
  MessageSquare, 
  X, 
  Send 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically open modal if URL hash is #contact
  useEffect(() => {
    const handleHashCheck = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#contact') {
        setIsContactModalOpen(true);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    window.addEventListener('waynautic_open_contact_modal', () => setIsContactModalOpen(true));

    return () => {
      window.removeEventListener('hashchange', handleHashCheck);
      window.removeEventListener('waynautic_open_contact_modal', () => setIsContactModalOpen(true));
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === '#contact') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <footer className="bg-slate-50 dark:bg-[#070A12] border-t border-slate-200 dark:border-slate-800/80 pt-10 pb-8 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================================================================== */}
        {/* PLATFORM NAVIGATION & LINKS (5-COLUMN GRID)                          */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-8 border-b border-slate-200 dark:border-slate-800/60">
          
          {/* Col 1: Platform Brand */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1 lg:col-span-1">
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
          </div>

          {/* Col 2: Core Modules */}
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
            </ul>
          </div>

          {/* Col 5: Contact Us (Right beside Navigation) */}
          <div id="contact" className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              <span>Contact Us</span>
            </h4>
            
            <div className="space-y-2">
              {/* Email Button */}
              <a
                href="mailto:contact@waynautic.com"
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors group"
                title="Send Email"
              >
                <div className="p-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">contact@waynautic.com</span>
              </a>

              {/* Phone Button */}
              <a
                href="tel:+919637611936"
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors group"
                title="Call Helpline"
              >
                <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">+91 9637611936</span>
              </a>

              {/* LinkedIn Button */}
              <a
                href="https://www.linkedin.com/company/waynautic-technologies"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors group"
                title="Follow on LinkedIn"
              >
                <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#0A66C2] dark:text-[#70b5f9] group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <span className="truncate font-medium">LinkedIn Page</span>
              </a>

              {/* Button to Fill Form */}
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5850EC] to-indigo-600 hover:from-[#4338CA] hover:to-indigo-700 text-white !text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 mt-1"
                style={{ color: '#FFFFFF' }}
              >
                <MessageSquare className="w-3.5 h-3.5 text-white !text-white" style={{ color: '#FFFFFF', stroke: '#FFFFFF' }} />
                <span className="text-white !text-white font-extrabold" style={{ color: '#FFFFFF' }}>Fill Contact Form</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} Waynautic Academy. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              About & Curriculum Guide
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CONTACT US FORM MODAL                                                */}
      {/* ==================================================================== */}
      {isContactModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-2.5 xs:p-4 sm:p-6 flex items-center justify-center min-h-screen animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div 
            className="relative my-auto w-full max-w-lg bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 xs:p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Contact Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-5 space-y-1 pr-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#5850EC] dark:text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Mail className="w-3 h-3" />
                <span>Admissions & Support</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Get in Touch
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Have a question or project? Send us a message and we&apos;ll get back to you promptly.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. A member of our admissions team will contact you shortly at <strong className="text-slate-900 dark:text-white">{formData.email}</strong>.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-[#5850EC] dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors min-h-[44px]"
                  >
                    Send another message
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First Name"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#5850EC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last Name"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#5850EC]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#5850EC]"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#5850EC]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5850EC] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#5850EC] hover:bg-[#4338CA] active:scale-[0.99] disabled:opacity-50 text-white !text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px] mt-1"
                  style={{ color: '#FFFFFF', backgroundColor: '#5850EC' }}
                >
                  <Send className="w-3.5 h-3.5 text-white !text-white" style={{ color: '#FFFFFF', stroke: '#FFFFFF' }} />
                  <span className="text-white !text-white font-extrabold" style={{ color: '#FFFFFF' }}>
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </span>
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </footer>
  );
};
