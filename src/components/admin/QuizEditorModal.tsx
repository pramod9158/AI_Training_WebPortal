'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion } from '@/data/seedModules';
import { getTopicQuiz, saveTopicQuiz } from '@/lib/curriculumService';
import { verifyAdminPasskey, isAdminAuthenticated } from '@/lib/adminService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { parseQuizMarkdown } from '@/lib/quizParser';
import { 
  X, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Save, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Mail, 
  Upload, 
  FileText, 
  Info, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
  onSaved?: () => void;
}

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  isOpen,
  onClose,
  topicId,
  topicTitle,
  onSaved
}) => {
  // Admin Authorization State (Requires credentials before unlocking, auto-clears if already signed into admin console)
  const [isAuthorized, setIsAuthorized] = useState(() => isAdminAuthenticated());
  const [authMode, setAuthMode] = useState<'passkey' | 'credentials'>('passkey');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  // Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  // Hidden File Input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && topicId) {
      setIsAuthorized(isAdminAuthenticated());
      setAdminPasskey('');
      setAdminEmail('');
      setAdminPassword('');
      setAuthError('');
      setUploadedFileName('');
      setShowFormatGuide(false);

      const existing = getTopicQuiz(topicId, topicTitle);
      // Deep clone so edits are local until saved
      setQuestions(JSON.parse(JSON.stringify(existing)));
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, topicId, topicTitle]);

  // Handle Admin Authorization
  const handleAuthorizeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifyingAuth(true);

    try {
      if (authMode === 'passkey') {
        if (!adminPasskey.trim()) {
          setAuthError('Please enter the administrative master passkey.');
          setIsVerifyingAuth(false);
          return;
        }

        const isValid = await verifyAdminPasskey(adminPasskey);
        if (isValid) {
          setIsAuthorized(true);
        } else {
          setAuthError('Invalid administrator passkey. Access denied.');
        }
      } else {
        if (!isSupabaseConfigured) {
          setAuthError('Supabase is not configured. Please use Master Passkey mode.');
          setIsVerifyingAuth(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail.trim(),
          password: adminPassword
        });

        if (error || !data.user) {
          setAuthError(error?.message || 'Authentication failed. Please verify credentials.');
          setIsVerifyingAuth(false);
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          setAuthError('Access Denied: Your account does not hold administrator privileges (role must be admin).');
        }
      }
    } catch {
      setAuthError('An unexpected error occurred during security verification.');
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  // Handle Markdown File Upload & Automatic Conversion
  const handleMarkdownFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || !text.trim()) {
        setErrorMessage('The selected markdown file is empty.');
        return;
      }

      const parsed = parseQuizMarkdown(text, topicId);
      if (parsed.length === 0) {
        setErrorMessage(
          'Could not extract quiz questions from this file. Please ensure it follows markdown format (Question, A/B/C/D options, and Correct marker).'
        );
        return;
      }

      setQuestions(parsed);
      setUploadedFileName(`${file.name} (${parsed.length} questions parsed)`);
      setSuccessMessage(`Successfully converted "${file.name}" into ${parsed.length} quiz questions! Review and click Save.`);
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 6000);
    };

    reader.readAsText(file);
    // Clear input so user can re-upload same file if re-edited
    e.target.value = '';
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-custom-${Date.now()}-${questions.length + 1}`,
      topicId,
      questionText: '',
      options: [
        'Option A',
        'Option B',
        'Option C',
        'Option D'
      ],
      correctOptionIndex: 0,
      explanation: 'Explanation for why this option is correct.'
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const opts = [...updated[qIndex].options];
    opts[optIndex] = text;
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      setErrorMessage('A topic quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setErrorMessage(`Question #${i + 1} cannot have an empty question prompt.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setErrorMessage(`Option #${j + 1} for Question #${i + 1} cannot be empty.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await saveTopicQuiz(topicId, questions);
      setSuccessMessage('Quiz questions saved successfully!');
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setErrorMessage('Failed to save quiz questions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-2.5 sm:p-4 flex items-center justify-center min-h-screen">
      <div 
        className="relative my-auto w-full max-w-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Markdown Upload */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleMarkdownFileUpload}
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          className="hidden" 
        />

        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Topic Quiz Questions ({questions.length})
                </h3>
                {isAuthorized && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Admin Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                Managing quiz for: <strong>{topicTitle}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================================
         * VIEW 1: SECURITY GATE (REQUIRES ADMIN CREDENTIALS BEFORE EDITING)
         * ===================================================================*/}
        {!isAuthorized ? (
          <div className="p-6 sm:p-10 text-center max-w-md mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-extrabold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Security Protocol 2.4
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                Administrator Verification Required
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Before uploading markdown quiz files or modifying quiz questions, please verify your administrator credentials.
              </p>
            </div>

            {/* Verification Method Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('passkey');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'passkey'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Master Passkey
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('credentials');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'credentials'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Email & Password
              </button>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold text-left animate-in fade-in">
                {authError}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthorizeAdmin} className="space-y-3.5 text-left">
              {authMode === 'passkey' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-500" />
                    <span>Admin Master Passkey *</span>
                  </label>
                  <input
                    type="password"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="Enter secret passkey"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-500"
                    autoFocus
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-500" />
                      <span>Admin Email Address *</span>
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@waynautic.ai"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-500" />
                      <span>Admin Password *</span>
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingAuth}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifyingAuth ? 'Verifying...' : 'Unlock Editor'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ===================================================================
           * VIEW 2: UNLOCKED QUIZ QUESTION EDITOR & AUTOMATIC MARKDOWN PARSER
           * ===================================================================*/
          <form onSubmit={handleSaveAll} className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Toolbar: Upload Markdown & Guide */}
            <div className="p-3 sm:p-4 bg-purple-500/5 dark:bg-purple-950/20 border-b border-slate-200 dark:border-slate-800/80 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Quiz File (.md)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFormatGuide(!showFormatGuide)}
                    className="px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-800/60 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-purple-500" />
                    <span>Format Guide</span>
                    {showFormatGuide ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-purple-700 dark:text-purple-400 font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                  <span>Auto-converts MD into Questions</span>
                </div>
              </div>

              {uploadedFileName && (
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Loaded: {uploadedFileName}</span>
                </div>
              )}

              {/* Collapsible Format Guide Panel */}
              {showFormatGuide && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>Supported Markdown Format</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Upload any <code>.md</code> or <code>.txt</code> file formatted with questions, choices, and correct markers. Our parser converts them into interactive test questions automatically:
                  </p>
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 text-[10px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
{`### Question 1: What is Temperature in LLM sampling?
A) Randomness and creativity control parameter
B) CPU overheating threshold
C) Batch size multiplier
D) Token encoding speed
Correct: A
Explanation: Temperature controls entropy in the probability distribution over candidate tokens.

### Question 2: Which framework is used for agentic workflows?
- [ ] PyTorch
- [x] LangGraph
- [ ] Scikit-Learn
- [ ] NumPy
Explanation: LangGraph enables cyclic state machine agents.`}
                  </pre>
                </div>
              )}
            </div>

            {/* Scrollable Questions Form */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-5">
              
              {/* Status Messages */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Question List */}
              <div className="space-y-4">
                {questions.map((q, qIndex) => (
                  <div 
                    key={q.id || qIndex} 
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800/90 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                        Question #{qIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIndex)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-xs font-bold flex items-center space-x-1"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                        Question Prompt *
                      </label>
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => handleUpdateQuestion(qIndex, { questionText: e.target.value })}
                        placeholder="e.g., What is the primary purpose of Context Windows in LLMs?"
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    {/* 4 Choices */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                        Options & Correct Answer (Select radio button for the correct answer) *
                      </label>
                      
                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isCorrect = q.correctOptionIndex === optIndex;
                          return (
                            <div 
                              key={optIndex}
                              className={`flex items-center space-x-2 p-2 sm:p-2.5 rounded-xl border transition-all ${
                                isCorrect 
                                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm' 
                                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${q.id || qIndex}`}
                                checked={isCorrect}
                                onChange={() => handleUpdateQuestion(qIndex, { correctOptionIndex: optIndex })}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="font-mono text-xs font-bold text-slate-500 w-5">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                                className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none"
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                required
                              />
                              {isCorrect && (
                                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 shrink-0">
                                  Correct Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                        Answer Explanation (Shown to students after answering)
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => handleUpdateQuestion(qIndex, { explanation: e.target.value })}
                        placeholder="e.g., Context windows determine the maximum number of tokens an LLM can retain."
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>

                  </div>
                ))}
              </div>

              {/* Add Another Question Button */}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800/80 hover:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs font-extrabold flex items-center justify-center space-x-2 transition-all min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Quiz Question</span>
              </button>

            </div>

            {/* Fixed Modal Footer */}
            <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_2px_0_0_#58A700] text-white text-xs font-extrabold flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Questions...' : 'Save All Quiz Questions'}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
