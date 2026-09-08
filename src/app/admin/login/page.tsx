'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { verifyAdminPasskey, isAdminAuthenticated, setAdminSession } from '@/lib/adminService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'passkey' | 'supabase'>('passkey');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If already authenticated as admin, redirect to /admin
    if (isAdminAuthenticated()) {
      router.replace('/admin');
    }
  }, [router]);

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!passkey.trim()) {
      setErrorMessage('Please enter the administrative master passkey.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyAdminPasskey(passkey);
      if (isValid) {
        router.push('/admin');
      } else {
        setErrorMessage('Invalid administrative security key. Please check credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during security key verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase is not configured yet. Please use Master Passkey login.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if role is admin in user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin') {
          setAdminSession(data.user.email);
          router.push('/admin');
        } else {
          setErrorMessage('Access Denied: Your account does not hold administrator privileges (role must be admin).');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#080C14] text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors">
      
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Academy</span>
        </Link>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Authorized Staff Only</span>
        </div>
      </header>

      {/* Center Login Container */}
      <main className="w-full max-w-md mx-auto my-auto py-6 sm:py-8">
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/10 dark:bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Title */}
          <div className="text-center space-y-3 mb-6 relative z-10">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Waynautic Admin Console
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Candidate Tracking & Barcode Payment Management
              </p>
            </div>
          </div>

          {/* Login Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('passkey');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg transition-all ${
                loginMode === 'passkey'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Master Passkey
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('supabase');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg transition-all ${
                loginMode === 'supabase'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Email & Password
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form 1: Master Passkey */}
          {loginMode === 'passkey' ? (
            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Administrative Security Key</span>
                  <span className="text-[10px] text-slate-400 font-mono">Emergency Gateway</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter security passkey..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Enter your authorized administrative key to unlock console.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Form 2: Supabase Credentials */
            <form onSubmit={handleSupabaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@waynautic.ai"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Admin Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Waynautic Security Protocol 2.4 • End-to-End Audited</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} Waynautic Academy. All rights reserved. Confidential Administration Interface.
      </footer>
    </div>
  );
}
