'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, BookOpen, Compass, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <footer className="bg-slate-50 dark:bg-[#070A12] border-t border-slate-200 dark:border-slate-800/80 pt-12 sm:pt-16 pb-8 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================================================================== */}
        {/* CONTACT US SECTION: Get in Touch                                      */}
        {/* ==================================================================== */}
        <section id="contact" className="scroll-mt-24 pb-16 sm:pb-20 border-b border-slate-200 dark:border-slate-800/80">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5850EC] dark:text-[#818cf8] tracking-tight">
              Get in Touch
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              We&apos;d love to hear from you! Whether you have a question, a project, or just want to say hello.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start max-w-5xl mx-auto">
            
            {/* Left: Contact Info */}
            <div className="lg:col-span-5 space-y-8 pt-2">
              
              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5850EC] dark:text-indigo-400 shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Email</h3>
                  <a
                    href="mailto:contact@waynautic.com"
                    className="text-sm text-slate-600 dark:text-slate-300 hover:text-[#5850EC] dark:hover:text-indigo-400 transition-colors font-medium mt-0.5 block"
                  >
                    contact@waynautic.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5850EC] dark:text-indigo-400 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Phone</h3>
                  <a
                    href="tel:+919637611936"
                    className="text-sm text-slate-600 dark:text-slate-300 hover:text-[#5850EC] dark:hover:text-indigo-400 transition-colors font-medium mt-0.5 block"
                  >
                    +91 9637611936
                  </a>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5850EC] dark:text-indigo-400 shrink-0 mt-0.5">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">LinkedIn</h3>
                  <a
                    href="https://www.linkedin.com/company/waynautic-technologies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#5850EC] dark:text-indigo-400 hover:underline font-medium mt-0.5 block break-all"
                  >
                    linkedin.com/company/waynautic-technologies
                  </a>
                </div>
              </div>

            </div>

            {/* Right: Contact Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-[#0D121F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                
                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent!</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                      Thank you for reaching out. A member of our team will get back to you shortly at <span className="font-semibold text-slate-900 dark:text-white">{formData.email}</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
                      }}
                      className="text-xs font-mono text-[#5850EC] dark:text-indigo-400 hover:underline font-bold pt-2"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="First Name"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5850EC] transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Last Name"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5850EC] transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5850EC] transition-all"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5850EC] transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your message here..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5850EC] transition-all resize-y"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-[#5850EC] hover:bg-[#4338CA] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
                    >
                      Send Message
                    </button>

                  </form>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* ==================================================================== */}
        {/* PLATFORM NAVIGATION & LINKS                                          */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-slate-200 dark:border-slate-800/60">
          
          {/* Col 1: Platform Brand */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
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

          {/* Col 2: Learning Modules */}
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
    </footer>
  );
};

