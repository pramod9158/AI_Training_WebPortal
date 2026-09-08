'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Clock, 
  CreditCard, 
  AlertCircle,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { PaymentRecord } from '@/lib/adminTypes';
import { approvePayment, rejectPayment } from '@/lib/adminService';

interface PaymentActionModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentActionModal: React.FC<PaymentActionModalProps> = ({
  payment,
  onClose,
  onSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!payment) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await approvePayment(payment.id, adminNotes || 'Verified via Admin Console');
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to approve transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setErrorMessage('Please state a reason for rejecting this transaction.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await rejectPayment(payment.id, rejectionReason.trim());
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to reject transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Transaction Review
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify UTR & Manage Student Access
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Amount & Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Transaction Amount
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{payment.amount} <span className="text-xs font-semibold text-slate-500">{payment.currency}</span>
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              payment.status === 'verified'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : payment.status === 'pending'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              {payment.status}
            </span>
          </div>

          {/* UTR Reference Code Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Transaction Reference (UTR)
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-sm">
              <span className="font-bold text-slate-900 dark:text-white select-all">
                {payment.transactionReference}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(payment.transactionReference)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 text-xs font-bold shadow-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                Candidate Account
              </span>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {payment.userName || 'Learner'}
              </p>
              <p className="font-mono text-slate-500 text-[11px] truncate">
                {payment.userEmail}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                Payment Channel
              </span>
              <p className="font-bold text-slate-900 dark:text-white uppercase">
                {payment.paymentMethod}
              </p>
              <p className="text-slate-500 text-[11px]">
                {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {payment.notes && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                Candidate Notes
              </span>
              {payment.notes}
            </div>
          )}

          {/* Actions for Pending Status */}
          {payment.status === 'pending' ? (
            <div className="space-y-3 pt-2">
              {!showRejectInput ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Verification Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g., Matched in HDFC Bank UPI statements"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      disabled={loading}
                      onClick={handleApprove}
                      className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Pro</span>
                    </button>

                    <button
                      disabled={loading}
                      onClick={() => setShowRejectInput(true)}
                      className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 font-extrabold text-xs transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Submission</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Rejection Input Mode */
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                    Reason for Rejection *
                  </span>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. UTR not found in bank ledger or invalid amount"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      disabled={loading}
                      onClick={handleReject}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Already Verified / Rejected Info */
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              {payment.status === 'verified' ? (
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified & Pro Access Granted{payment.verifiedAt ? ` on ${new Date(payment.verifiedAt).toLocaleDateString()}` : ''}.</span>
                </div>
              ) : (
                <div className="space-y-1 text-rose-500">
                  <div className="flex items-center space-x-2 font-medium">
                    <XCircle className="w-4 h-4" />
                    <span>Transaction Marked Rejected</span>
                  </div>
                  {payment.rejectionReason && (
                    <p className="text-slate-400 text-[11px]">
                      Reason: {payment.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
