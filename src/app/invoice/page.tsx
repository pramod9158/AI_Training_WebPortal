import React from 'react';
import Link from 'next/link';
import { Download, FileText, CheckCircle2, ArrowLeft, Printer, Shield, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Official Invoice - Performance Testing Program | Waynautic Academy',
  description: 'Download the official enrollment invoice for Track 02: Performance Testing and Engineering Masterclass.',
};

export default function InvoicePage() {
  const invoiceNo = 'WN-INV-2026-PT084';
  const invoiceDate = '15 October 2026';
  const studentName = 'Ashish Pawar';
  const studentEmail = 'ashish.performance@outlook.com';
  const studentPhone = '+91 6356418487';
  const programName = 'Track 02: Performance Testing & Engineering Masterclass';
  const amountPaid = 4000;
  const balanceDue = 4000;
  const totalAgreed = 8000;
  const originalPrice = 9999;
  const discount = 1999;

  return (
    <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-200 transition-colors py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Academy</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            Invoice: <strong className="text-cyan-600 dark:text-cyan-400">{invoiceNo}</strong>
          </span>
        </div>

        {/* Invoice Header Card */}
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold tracking-wider mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Direct UPI Payment (Installment 1 of 2)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Official Enrollment Invoice
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Issued for <strong>{studentName}</strong> ({studentEmail} • {studentPhone}) • Date: {invoiceDate}
              </p>
            </div>

            {/* Download CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="/api/download-invoice"
                download="Waynautic_Invoice_Performance_Testing.pdf"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download Invoice PDF</span>
              </a>
              <a
                href="/Waynautic_Invoice_Performance_Testing.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Open in Tab</span>
              </a>
            </div>
          </div>

          {/* Key Facts Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Total Agreed Fee</span>
              <strong className="text-base sm:text-lg font-black text-slate-900 dark:text-white">₹{totalAgreed.toLocaleString('en-IN')}</strong>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">(₹{discount.toLocaleString('en-IN')} scholarship)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">Paid (Inst. 1)</span>
              <strong className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">₹{amountPaid.toLocaleString('en-IN')}</strong>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Cleared via UPI</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">Balance Due (Inst. 2)</span>
              <strong className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-400">₹{balanceDue.toLocaleString('en-IN')}</strong>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">Due: Next Month (Nov)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Program Track</span>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block truncate leading-tight">Performance Testing</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Masterclass Program</span>
            </div>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>PDF Document Preview</span>
            </span>
            <div className="flex items-center gap-3">
              <a
                href="/api/download-invoice"
                download="Waynautic_Invoice_Performance_Testing.pdf"
                className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </a>
            </div>
          </div>

          <div className="relative w-full aspect-[1/1.38] bg-slate-200 dark:bg-slate-950">
            <iframe
              src="/Waynautic_Invoice_Performance_Testing.pdf#toolbar=1&navpanes=0&scrollbar=1"
              title="Invoice PDF"
              className="w-full h-full border-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
