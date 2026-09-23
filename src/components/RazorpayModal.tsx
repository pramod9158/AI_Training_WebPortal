'use client';

import React, { useState, useEffect } from 'react';
import { useWaynauticStore } from '@/lib/store';
import {
  X,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: 'cohort' | 'expert_session';
}

// Helper to load Razorpay checkout script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  plan = 'cohort',
}) => {
  const { profile, updateProfile } = useWaynauticStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState('');

  const isCohort = plan === 'cohort';
  const originalPrice = isCohort ? '₹15,000' : '₹499';
  const currentPrice = isCohort ? '₹9,999' : '₹19';
  const priceInRupees = isCohort ? 9999 : 19;
  const planTitle = isCohort
    ? '4-Week Intensive Cohort Program'
    : '1-on-1 AI Expert Deep Dive';

  // Pre-fill profile info when opened
  useEffect(() => {
    if (isOpen) {
      if (profile.displayName && profile.displayName !== 'Guest') {
        setFullName(profile.displayName);
      }
      if (profile.email) {
        setEmail(profile.email);
      }
      setErrorMessage('');
      setPaymentSuccess(false);
      setVerifiedPaymentId('');
      setLoading(false);
      loadRazorpayScript();
    }
  }, [isOpen, profile.displayName, profile.email]);

  if (!isOpen) return null;

  const triggerConfettiCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'],
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for your course pass & invoice.');
      return;
    }

    if (!cleanName) {
      setErrorMessage('Please enter your full name for your certificate credentials.');
      return;
    }

    setLoading(true);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and try again.');
      }

      // 2. Create order on Next.js backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: cleanEmail,
          name: cleanName,
          phone: cleanPhone,
          userId: profile.userId || undefined,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment order.');
      }

      // 3. Configure Razorpay Checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Waynautic Academy',
        description: `${planTitle} Access`,
        order_id: orderData.orderId,
        prefill: {
          name: cleanName,
          email: cleanEmail,
          contact: cleanPhone,
        },
        theme: {
          color: '#06b6d4',
          backdrop_color: 'rgba(15, 23, 42, 0.85)',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment signature on backend
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                amount: orderData.amount,
                userEmail: cleanEmail,
                userName: cleanName,
                userId: profile.userId || undefined,
                phone: cleanPhone,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              // Immediately unlock Pro in local store
              updateProfile({
                plan: 'pro',
                displayName: cleanName || profile.displayName,
                email: cleanEmail || profile.email,
              });

              setVerifiedPaymentId(response.razorpay_payment_id);
              setPaymentSuccess(true);
              triggerConfettiCelebration();
            } else {
              setErrorMessage(verifyData.error || 'Payment verification failed. Please contact support.');
            }
          } catch (err: any) {
            setErrorMessage(err?.message || 'Error communicating with verification server.');
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', (resp: any) => {
        setLoading(false);
        setErrorMessage(
          resp.error?.description || 'Payment was unsuccessful or cancelled. Please try again.'
        );
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err?.message || 'Unable to start payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {planTitle}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  Razorpay Secure Checkout
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Test Mode
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {paymentSuccess ? (
            /* SUCCESS CELEBRATION VIEW */
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  Enrollment Confirmed! 🎉
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
                  Welcome to Waynautic Academy! Your {currentPrice} payment was verified via Razorpay and your 4-Week Cohort pass is now active.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left max-w-sm mx-auto text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{verifiedPaymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Account:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{email || profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentPrice} INR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Access Status:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Full Portal Unlocked
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/curriculum"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Start Learning Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors text-center"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD PAYMENT FORM VIEW */
            <form onSubmit={handlePayNow} className="space-y-5">
              
              {/* Plan Pricing Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Cohort Enrollment
                  </span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {planTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    1 Year full portal access + 4 weeks live mentoring
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400 line-through font-mono">
                    {originalPrice}
                  </div>
                  <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {currentPrice}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Save ₹5,001
                  </span>
                </div>
              </div>

              {/* Inclusions summary */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>56 topics video lectures, notes, quizzes & code labs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>4–5 portfolio-worthy agentic AI projects with code reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dual Certificate: Internship + Program Completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>End-to-end placement assistance & mock interviews</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Candidate Info Inputs */}
              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone / WhatsApp Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:brightness-110 text-white font-extrabold text-sm sm:text-base text-center transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Opening Razorpay Secure Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Proceed to Pay {currentPrice}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit SSL Encrypted</span>
                </div>
                <span>•</span>
                <span>Supports UPI, GPay, Cards, Netbanking</span>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
