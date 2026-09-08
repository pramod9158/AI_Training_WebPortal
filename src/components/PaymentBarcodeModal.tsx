'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useWaynauticStore } from '@/lib/store';
import { getBarcodeConfig, submitCandidatePayment } from '@/lib/adminService';
import { BarcodePaymentConfig } from '@/lib/adminTypes';

interface PaymentBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentBarcodeModal: React.FC<PaymentBarcodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { profile } = useWaynauticStore();
  const [config, setConfig] = useState<BarcodePaymentConfig>(getBarcodeConfig());
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState(profile.displayName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfig(getBarcodeConfig());
      if (profile.displayName && profile.displayName !== 'Guest') {
        setFullName(profile.displayName);
      }
      if (profile.email) {
        setEmail(profile.email);
      }
      setErrorMessage('');
      setSubmittedSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const upiDeepLink = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${config.amount}&cu=${config.currency}&tn=WaynauticPro`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address so we can grant Pro access to your account.');
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI / UTR Transaction Reference number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCandidatePayment({
        userEmail: email,
        userName: fullName || email.split('@')[0],
        userId: profile.userId,
        amount: config.amount,
        currency: config.currency,
        transactionReference: cleanUtr,
        notes
      });

      if (res.success) {
        setSubmittedSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || 'Payment submission failed. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while submitting payment proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                  Upgrade to Pro AI Pass
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan barcode or UPI QR to unlock all 10 modules & lifetime certification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {submittedSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Payment Submitted for Verification!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2">
                  Thank you! Your reference <strong className="font-mono text-slate-900 dark:text-white">{utrNumber}</strong> has been logged in our system. Our admissions team will verify your payment and upgrade your account to <strong className="text-amber-500">Waynautic Pro</strong> shortly.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Email:</span>
                  <span className="font-mono font-medium">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="font-bold text-amber-500">Waynautic Pro Pass (Lifetime)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold">₹{config.amount} {config.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="inline-flex items-center text-amber-500 font-semibold gap-1">
                    <Clock className="w-3 h-3" /> Pending Verification
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
                >
                  Return to Academy
                </button>
              </div>
            </div>
          ) : (
            /* Standard Payment View */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Barcode & UPI Details */}
              <div className="md:col-span-6 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-900/60 dark:to-[#0A0E1A] rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="w-full">
                  <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Official UPI Barcode QR</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="relative mx-auto bg-white p-4 rounded-2xl shadow-md border-2 border-slate-200 dark:border-slate-700 w-52 h-52 flex flex-col items-center justify-center group">
                    {/* Visual QR Code Representation using SVG */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      {/* Corner 1 (Top Left) */}
                      <rect x="5" y="5" width="26" height="26" fill="currentColor" rx="4" />
                      <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                      <rect x="13" y="13" width="10" height="10" fill="currentColor" rx="1" />
                      
                      {/* Corner 2 (Top Right) */}
                      <rect x="69" y="5" width="26" height="26" fill="currentColor" rx="4" />
                      <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                      <rect x="77" y="13" width="10" height="10" fill="currentColor" rx="1" />

                      {/* Corner 3 (Bottom Left) */}
                      <rect x="5" y="69" width="26" height="26" fill="currentColor" rx="4" />
                      <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                      <rect x="13" y="77" width="10" height="10" fill="currentColor" rx="1" />

                      {/* Barcode & Matrix Grid Pattern */}
                      <rect x="36" y="7" width="5" height="5" fill="currentColor" />
                      <rect x="46" y="7" width="9" height="5" fill="currentColor" />
                      <rect x="58" y="7" width="5" height="5" fill="currentColor" />
                      
                      <rect x="36" y="17" width="7" height="6" fill="currentColor" />
                      <rect x="48" y="17" width="5" height="6" fill="currentColor" />
                      <rect x="58" y="17" width="6" height="6" fill="currentColor" />

                      <rect x="36" y="27" width="5" height="5" fill="currentColor" />
                      <rect x="46" y="27" width="10" height="5" fill="currentColor" />
                      <rect x="60" y="27" width="5" height="5" fill="currentColor" />

                      <rect x="8" y="37" width="14" height="6" fill="currentColor" />
                      <rect x="26" y="37" width="6" height="6" fill="currentColor" />
                      <rect x="36" y="37" width="12" height="6" fill="currentColor" />
                      <rect x="52" y="37" width="8" height="6" fill="currentColor" />
                      <rect x="65" y="37" width="12" height="6" fill="currentColor" />
                      <rect x="82" y="37" width="10" height="6" fill="currentColor" />

                      <rect x="8" y="47" width="6" height="6" fill="currentColor" />
                      <rect x="18" y="47" width="10" height="6" fill="currentColor" />
                      <rect x="34" y="47" width="16" height="6" fill="currentColor" />
                      <rect x="54" y="47" width="6" height="6" fill="currentColor" />
                      <rect x="66" y="47" width="10" height="6" fill="currentColor" />
                      <rect x="80" y="47" width="12" height="6" fill="currentColor" />

                      <rect x="8" y="57" width="12" height="6" fill="currentColor" />
                      <rect x="24" y="57" width="6" height="6" fill="currentColor" />
                      <rect x="34" y="57" width="8" height="6" fill="currentColor" />
                      <rect x="46" y="57" width="14" height="6" fill="currentColor" />
                      <rect x="64" y="57" width="8" height="6" fill="currentColor" />
                      <rect x="76" y="57" width="16" height="6" fill="currentColor" />

                      <rect x="36" y="69" width="6" height="6" fill="currentColor" />
                      <rect x="46" y="69" width="12" height="6" fill="currentColor" />
                      <rect x="62" y="69" width="6" height="6" fill="currentColor" />
                      <rect x="72" y="69" width="8" height="6" fill="currentColor" />
                      <rect x="84" y="69" width="8" height="6" fill="currentColor" />

                      <rect x="36" y="79" width="14" height="6" fill="currentColor" />
                      <rect x="54" y="79" width="8" height="6" fill="currentColor" />
                      <rect x="66" y="79" width="14" height="6" fill="currentColor" />
                      <rect x="84" y="79" width="8" height="6" fill="currentColor" />

                      <rect x="36" y="89" width="8" height="6" fill="currentColor" />
                      <rect x="48" y="89" width="8" height="6" fill="currentColor" />
                      <rect x="60" y="89" width="10" height="6" fill="currentColor" />
                      <rect x="74" y="89" width="6" height="6" fill="currentColor" />
                      <rect x="84" y="89" width="8" height="6" fill="currentColor" />

                      {/* Center Brand Badge */}
                      <circle cx="50" cy="50" r="10" fill="#0284C7" />
                      <path d="M46 50 L49 53 L54 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>

                  {/* Pricing Badge */}
                  <div className="mt-3">
                    <div className="inline-flex items-baseline space-x-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        ₹{config.amount}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {config.currency} / Lifetime
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Pay to: <strong>{config.payeeName}</strong>
                    </p>
                  </div>
                </div>

                {/* Copy UPI Button & Mobile App trigger */}
                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-300 font-bold truncate">
                      {config.upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-cyan-400 hover:bg-sky-100 font-sans font-bold text-[11px] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile Deep Link */}
                  <a
                    href={upiDeepLink}
                    className="sm:hidden flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <span>Open in UPI Banking App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Verification Form */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5 mb-1">
                    <span>Submit Payment Proof</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    After scanning the QR code and completing payment, enter your transaction reference (UTR) to instantly link payment to your student profile.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 flex-1">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Account Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Learner Full Name"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      12-Digit UTR / Transaction Ref Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 423891823901 or UPI/423..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Found in your GPay / PhonePe / Paytm payment receipt details.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Notes or Comments (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Paid from HDFC account"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Proof...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Payment for Approval</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Pro Features Included */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    What's included with Pro:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>All 10 Specialized Modules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>Verified Certificate</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>Lifetime Portal Access</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>Priority Support & Q&A</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
