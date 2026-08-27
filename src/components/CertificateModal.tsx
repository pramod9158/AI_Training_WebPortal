'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Award, Download, X, ShieldCheck, Sparkles, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  pathTitle: string;
  completionDate?: string;
  isUnlocked?: boolean;
  completedCount?: number;
  totalCount?: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  userName,
  pathTitle,
  completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  isUnlocked = true,
  completedCount = 0,
  totalCount = 0
}) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLockedWarning, setShowLockedWarning] = useState(false);

  const verificationId = useMemo(() => {
    const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100000);
    return (hash * 157) % 899999 + 100000;
  }, [userName]);

  if (!isOpen) return null;

  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (isUnlocked ? 100 : 0);
  const remainingTopics = Math.max(0, totalCount - completedCount);

  const handleDownloadPDF = async () => {
    if (!isUnlocked) {
      setShowLockedWarning(true);
      return;
    }
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Waynautic_Certificate_${userName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF certificate:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-cyan-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 text-slate-800 dark:text-slate-200 cursor-default my-auto"
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Award className={`w-6 h-6 ${isUnlocked ? 'text-amber-500' : 'text-slate-400'}`} />
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Official Certificate of Completion
              </h2>
              {!isUnlocked && (
                <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  <Lock className="w-3 h-3" />
                  <span>Locked ({percent}% Complete)</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Locked Warning Alert Banner */}
        {(!isUnlocked || showLockedWarning) && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-500/40 flex items-start space-x-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-extrabold text-amber-800 dark:text-amber-300">
                Certificate Locked: Complete All {totalCount > 0 ? totalCount : 'Required'} Topics to Unlock
              </div>
              <p className="font-medium text-xs leading-relaxed text-amber-700 dark:text-amber-200/90">
                You have completed <strong className="font-bold">{completedCount} of {totalCount}</strong> topics ({percent}%). Complete the remaining <strong className="font-bold">{remainingTopics}</strong> topic(s) to unlock and download your official verified credentials.
              </p>
            </div>
          </div>
        )}

        {/* Certificate Display Frame with Blur Wrapper when Locked */}
        <div className="overflow-x-auto p-1 relative rounded-2xl">
          <div className="relative w-fit mx-auto">
            
            {/* The Certificate Canvas */}
            <div
              ref={certRef}
              className={`w-[720px] sm:w-[800px] h-[500px] sm:h-[520px] mx-auto bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#0B0F19] dark:via-[#070A12] dark:to-[#0D121F] border-4 border-[#58CC02] dark:border-cyan-500/40 rounded-2xl p-8 sm:p-10 relative flex flex-col justify-between shadow-2xl text-center select-none transition-all ${
                !isUnlocked ? 'filter blur-[5px] opacity-60 pointer-events-none' : ''
              }`}
            >
              {/* Ambient Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Certificate Header */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-6 h-6 text-[#58CC02] dark:text-cyan-400" />
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-wider">WAYNAUTIC ACADEMY</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#1899D6] dark:text-cyan-400 font-bold">Verified Developer Certification</p>
              </div>

              {/* Recipient Info */}
              <div className="space-y-3 my-auto relative z-10">
                <p className="text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider font-semibold">This credential certifies that</p>
                <h1 className="text-3xl font-extrabold text-[#58CC02] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-300 dark:via-white dark:to-violet-300">
                  {userName || 'Developer Extraordinaire'}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto font-medium leading-relaxed">
                  has successfully completed all requirements, practical exercises, and quizzes for the learning path:
                </p>
                <div className="inline-block px-6 py-2 rounded-xl bg-sky-50 dark:bg-cyan-950/60 border-2 border-sky-300 dark:border-cyan-500/40 text-sky-800 dark:text-cyan-300 font-extrabold text-base sm:text-lg shadow-sm">
                  {pathTitle}
                </div>
              </div>

              {/* Footer Signatures & Date */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between relative z-10 text-left">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 font-bold">Date Issued</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{completionDate}</div>
                </div>

                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <span>Verification ID: WAC-{verificationId}</span>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 font-bold">Issued By</div>
                  <div className="text-xs font-bold text-sky-600 dark:text-cyan-400">Waynautic Academic Board</div>
                </div>
              </div>

            </div>

            {/* Lock Overlay Card When Incomplete */}
            {!isUnlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-[#0D121F]/90 backdrop-blur-md border-2 border-amber-400 dark:border-amber-500/60 shadow-2xl max-w-md space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
                    <Lock className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Certificate Locked</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      Complete all {totalCount} topics in <strong className="text-slate-900 dark:text-white">{pathTitle}</strong> to unlock and generate your official certificate.
                    </p>
                  </div>

                  {/* Progress Meter Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="text-amber-600 dark:text-amber-400">{completedCount} / {totalCount} Topics ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Continue Learning ({remainingTopics} Left)</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isUnlocked 
              ? '✓ All course requirements verified. Ready to download.' 
              : `🔒 ${remainingTopics} topic(s) remaining before certificate download is unlocked.`}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>

            {isUnlocked ? (
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs transition-all min-h-[42px]"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLockedWarning(true)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs cursor-not-allowed min-h-[42px]"
                title={`Complete all topics to unlock certificate (${percent}% complete)`}
              >
                <Lock className="w-4 h-4" />
                <span>Locked ({percent}%)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
