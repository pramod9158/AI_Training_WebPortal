'use client';

import React, { useRef, useState } from 'react';
import { Award, Download, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  pathTitle: string;
  completionDate?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  userName,
  pathTitle,
  completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#070A12',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-[#0D121F] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Official Certificate of Completion</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Frame */}
        <div className="overflow-x-auto p-2">
          <div
            ref={certRef}
            className="w-[750px] sm:w-[800px] h-[520px] mx-auto bg-gradient-to-b from-[#0B0F19] via-[#070A12] to-[#0D121F] border-4 border-cyan-500/40 rounded-2xl p-10 relative flex flex-col justify-between shadow-2xl text-center select-none"
          >
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Certificate Header */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span className="text-lg font-bold text-white tracking-wider">WAYNAUTIC ACADEMY</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">Verified Developer Certification</p>
            </div>

            {/* Recipient Info */}
            <div className="space-y-4 my-auto relative z-10">
              <p className="text-xs uppercase text-slate-400 tracking-wider">This credential certifies that</p>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-300">
                {userName || 'Developer Extraordinaire'}
              </h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                has successfully completed all requirements, practical exercises, and quizzes for the learning path:
              </p>
              <div className="inline-block px-6 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold text-lg">
                {pathTitle}
              </div>
            </div>

            {/* Footer Signatures & Date */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between relative z-10 text-left">
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">Date Issued</div>
                <div className="text-xs font-bold text-slate-300">{completionDate}</div>
              </div>

              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Verification ID: WAC-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-slate-500">Issued By</div>
                <div className="text-xs font-bold text-cyan-400">Waynautic Academic Board</div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Close Preview
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
