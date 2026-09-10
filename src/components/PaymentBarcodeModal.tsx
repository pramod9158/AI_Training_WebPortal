'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  MessageCircle,
  RefreshCw,
  Crown
} from 'lucide-react';
import { useWaynauticStore } from '@/lib/store';
import { getBarcodeConfig, submitCandidatePayment, getCandidateLatestPayment } from '@/lib/adminService';
import { BarcodePaymentConfig, PaymentRecord } from '@/lib/adminTypes';
import { trackPaymentModalOpened, trackPaymentSubmitted } from '@/lib/analytics';

const SUPPORT_PHONE = '9158998226';

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
  const [errorMessage, setErrorMessage] = useState('');

  // Payment Status State from Supabase DB
  const [latestPayment, setLatestPayment] = useState<PaymentRecord | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const payment = await getCandidateLatestPayment(profile.userId, profile.email);
      setLatestPayment(payment);
    } catch (err) {
      console.warn('Could not query payment status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      trackPaymentModalOpened();
      setConfig(getBarcodeConfig());
      if (profile.displayName && profile.displayName !== 'Guest') {
        setFullName(profile.displayName);
      }
      if (profile.email) {
        setEmail(profile.email);
      }
      setErrorMessage('');
      setShowNewForm(false);
      fetchStatus();
    }
  }, [isOpen, profile.userId, profile.email, profile.displayName]);

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
        trackPaymentSubmitted(config.amount, cleanUtr);
        if (res.payment) {
          setLatestPayment(res.payment);
        } else {
          await fetchStatus();
        }
        setShowNewForm(false);
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

  const isPro = profile.plan === 'pro' || profile.plan === 'enterprise' || latestPayment?.status === 'verified';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-2.5 sm:p-4 flex items-center justify-center min-h-screen">
      <div 
        className="relative my-auto w-full max-w-2xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 sm:p-2 rounded-xl text-white shadow-md ${
              isPro 
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20'
                : latestPayment?.status === 'rejected'
                ? 'bg-gradient-to-tr from-rose-500 to-red-600 shadow-rose-500/20'
                : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20'
            }`}>
              {isPro ? <Crown className="w-4 h-4 sm:w-5 sm:h-5" /> : <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  {isPro 
                    ? 'Waynautic Pro Pass Active' 
                    : latestPayment?.status === 'rejected'
                    ? 'Payment Verification Status'
                    : 'Upgrade to Pro AI Pass'}
                </h3>
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Pro Member
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {isPro 
                  ? 'Your account has full access to all curriculum modules and certifications'
                  : 'Official payment gateway with instant database synchronization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4">
          
          {loadingStatus ? (
            /* Loading DB State */
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Checking payment verification status in database...
              </p>
            </div>
          ) : isPro ? (
            /* 1. VERIFIED PRO STATE */
            <div className="py-6 sm:py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Payment Approved & Pro Pass Active! 🎉
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Your payment has been verified by the admissions team. Your account has permanent access to all 10 specialized modules, interactive coding environments, and verified graduation certification.
                </p>
              </div>

              {latestPayment && (
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">UTR Reference:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{latestPayment.transactionReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Verified:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{latestPayment.amount} {latestPayment.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified On:</span>
                    <span className="font-mono">{latestPayment.verifiedAt ? new Date(latestPayment.verifiedAt).toLocaleDateString() : 'Active'}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/curriculum"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs transition-all active:scale-95"
                >
                  Explore Full Curriculum
                </Link>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          ) : latestPayment?.status === 'rejected' && !showNewForm ? (
            /* 2. REJECTED / NOT APPROVED STATE (WITH REASON & PHONE 9158998226) */
            <div className="py-4 space-y-4 animate-in zoom-in-95 duration-200">
              
              {/* Alert Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900/60 flex items-start space-x-3.5 text-rose-800 dark:text-rose-200">
                <XCircle className="w-7 h-7 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-rose-900 dark:text-rose-100">
                    Payment Verification Not Approved
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                    Your submitted payment reference was reviewed by the admissions administrator and could not be verified into our records.
                  </p>
                </div>
              </div>

              {/* Specific Rejection Reason Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                  Admin Decline Reason
                </span>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/50 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
                  &ldquo;{latestPayment.rejectionReason || 'UTR number could not be reconciled with our UPI/bank statements.'}&rdquo;
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-mono pt-1">
                  <span>Logged Reference: <strong className="text-slate-800 dark:text-slate-200">{latestPayment.transactionReference}</strong></span>
                  <span>Amount: ₹{latestPayment.amount}</span>
                </div>
              </div>

              {/* Direct Support Contact Card with 9158998226 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-500/20 dark:border-amber-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <h5 className="font-extrabold text-xs sm:text-sm">
                    Need Help or Paid Successfully? Contact Us Immediately:
                  </h5>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  If you have already made the transfer, entered the wrong reference number, or have payment proof from your banking app, please contact our admissions helpdesk at <strong className="font-bold text-slate-900 dark:text-white underline">{SUPPORT_PHONE}</strong> for instant manual verification.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <a
                    href={`tel:${SUPPORT_PHONE}`}
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs shadow-md hover:opacity-90 transition-opacity"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>Call {SUPPORT_PHONE}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(`Hello Waynautic Admissions, my payment reference (${latestPayment.transactionReference}) was declined for ${profile.email || 'my account'}. Please help verify.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Support ({SUPPORT_PHONE})</span>
                  </a>
                </div>
              </div>

              {/* Action: Re-submit UTR */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewForm(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <span>Re-submit Corrected UTR / Pay Again</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>

            </div>

          ) : latestPayment?.status === 'pending' && !showNewForm ? (
            /* 3. PENDING REVIEW STATE */
            <div className="py-6 sm:py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/20 animate-pulse">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Payment Awaiting Admin Approval
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Your reference <strong className="font-mono text-slate-900 dark:text-white">{latestPayment.transactionReference}</strong> is currently pending review with our admissions team. Verification turnaround is typically within 15 minutes.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono font-medium">{latestPayment.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan to Grant:</span>
                  <span className="font-bold text-amber-500">Waynautic Pro Pass (Lifetime)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-bold">₹{latestPayment.amount} {latestPayment.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submitted:</span>
                  <span className="font-mono">{new Date(latestPayment.createdAt).toLocaleDateString()} at {new Date(latestPayment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Priority Contact Box */}
              <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 text-xs text-sky-800 dark:text-sky-300 flex items-center justify-between">
                <span>Need expedited verification? Call support:</span>
                <a href={`tel:${SUPPORT_PHONE}`} className="font-extrabold underline text-sky-600 dark:text-cyan-400">
                  {SUPPORT_PHONE}
                </a>
              </div>

              <div className="pt-2 flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={fetchStatus}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(true)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  Enter Different UTR
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

          ) : (
            /* 4. STANDARD PAYMENT / QR VIEW */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
              
              {/* Left Column: Barcode & UPI Details */}
              <div className="md:col-span-5 flex flex-col items-center justify-between p-3.5 sm:p-4 bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-900/60 dark:to-[#0A0E1A] rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="w-full">
                  <div className="flex items-center justify-center space-x-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Official UPI Barcode QR</span>
                  </div>

                  {/* Responsive QR Code Container */}
                  <div className="relative mx-auto bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center overflow-hidden group">
                    {config.qrImageUrl ? (
                      <img 
                        src={config.qrImageUrl} 
                        alt="Official PhonePe / UPI QR Code" 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                        <rect x="5" y="5" width="26" height="26" fill="currentColor" rx="4" />
                        <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                        <rect x="13" y="13" width="10" height="10" fill="currentColor" rx="1" />
                        <rect x="69" y="5" width="26" height="26" fill="currentColor" rx="4" />
                        <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                        <rect x="77" y="13" width="10" height="10" fill="currentColor" rx="1" />
                        <rect x="5" y="69" width="26" height="26" fill="currentColor" rx="4" />
                        <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                        <rect x="13" y="77" width="10" height="10" fill="currentColor" rx="1" />
                        <circle cx="50" cy="50" r="9" fill="#0284C7" />
                        <path d="M46 50 L49 53 L54 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </div>

                  {/* Pricing Badge */}
                  <div className="mt-2.5">
                    <div className="inline-flex items-baseline space-x-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        ₹{config.amount}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {config.currency} / Lifetime
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pay to: <strong className="text-slate-700 dark:text-slate-300">{config.payeeName}</strong>
                    </p>
                  </div>
                </div>

                {/* Copy UPI Button & Mobile App trigger */}
                <div className="w-full mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-300 font-bold truncate text-[11px]">
                      {config.upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-cyan-400 hover:bg-sky-100 font-sans font-bold text-[10px] transition-colors shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
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
                    <span>Open in UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Verification Form */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>Submit Payment Reference</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scan with GPay, PhonePe, Paytm, or BHIM. Enter your 12-digit UTR number below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        Account Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Learner Name"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      12-Digit UTR / Transaction Ref *
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 423891823901 or UPI/..."
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Found in your GPay / PhonePe / Paytm payment receipt details.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Paid from HDFC account"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting to Admissions...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Payment for Approval</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Direct support note with 9158998226 */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Questions about payment?</span>
                  <a href={`tel:${SUPPORT_PHONE}`} className="font-bold text-indigo-600 dark:text-cyan-400 underline">
                    Helpline: {SUPPORT_PHONE}
                  </a>
                </div>

                {/* Pro Features Included */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    What's included with Pro:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 dark:text-slate-300">
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
