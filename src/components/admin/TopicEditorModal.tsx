import React, { useState, useEffect, useRef } from 'react';
import { MODULES, Topic, QuizQuestion } from '@/data/seedModules';
import { saveTopic, deleteTopic, saveTopicQuiz, getTopicQuiz } from '@/lib/curriculumService';
import { verifyAdminPasskey, isAdminAuthenticated } from '@/lib/adminService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { parseQuizMarkdown } from '@/lib/quizParser';
import { 
  X, 
  Save, 
  Trash2, 
  BookOpen, 
  Video, 
  Clock, 
  FileText, 
  Layers, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Mail, 
  Upload, 
  Play, 
  Eye, 
  Code,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface TopicEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: Topic | null;
  defaultModuleSlug?: string;
  onSaved?: (topic: Topic) => void;
  onDeleted?: (topicId: string) => void;
}

export const TopicEditorModal: React.FC<TopicEditorModalProps> = ({
  isOpen,
  onClose,
  topic,
  defaultModuleSlug,
  onSaved,
  onDeleted
}) => {
  // Admin Authorization State (Requires credentials before editing, auto-clears if already signed into admin console)
  const [isAuthorized, setIsAuthorized] = useState(() => isAdminAuthenticated());
  const [authMode, setAuthMode] = useState<'passkey' | 'credentials'>('passkey');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form Fields
  const [moduleSlug, setModuleSlug] = useState<string>(defaultModuleSlug || 'llms');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [textContent, setTextContent] = useState('');
  const [notesFileName, setNotesFileName] = useState('');
  const [notesPreviewMode, setNotesPreviewMode] = useState<'editor' | 'preview'>('editor');

  // Quiz Upload & Questions State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizFileName, setQuizFileName] = useState('');
  const [showQuizPreview, setShowQuizPreview] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // File Input References
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const notesFileInputRef = useRef<HTMLInputElement>(null);
  const quizFileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(topic?.id);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsAuthorized(isAdminAuthenticated());
      setAdminPasskey('');
      setAdminEmail('');
      setAdminPassword('');
      setAuthError('');
      setErrorMessage('');
      setSuccessMessage('');
      setVideoFileName('');
      setNotesFileName('');
      setNotesPreviewMode('editor');
      setShowQuizPreview(false);

      if (topic) {
        setModuleSlug(topic.moduleSlug);
        setTitle(topic.title);
        setSlug(topic.slug);
        setDescription(topic.description);
        setVideoUrl(topic.videoUrl);
        setEstimatedMinutes(topic.estimatedMinutes || 15);
        setTextContent(topic.textContent || '');

        const existingQuiz = getTopicQuiz(topic.id, topic.title);
        setQuizQuestions(existingQuiz);
        setQuizFileName(existingQuiz.length > 0 ? `Loaded platform quiz (${existingQuiz.length} questions)` : '');
      } else {
        setModuleSlug(defaultModuleSlug || 'llms');
        setTitle('');
        setSlug('');
        setDescription('');
        setVideoUrl('https://www.youtube.com/embed/zxQyTK8ckyY');
        setEstimatedMinutes(15);
        setTextContent('# Lesson Title\n\n## Overview\nExplain the technical foundations here.\n\n```python\n# Code Example\nprint("Hello Waynautic")\n```\n');
        setQuizQuestions([]);
        setQuizFileName('');
      }
    }
  }, [topic, defaultModuleSlug, isOpen]);

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
        // Email & Password Supabase Verification
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

        // Verify role === 'admin'
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
      setAuthError('An unexpected error occurred during security clearance.');
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  // Video File Upload Handler
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      setVideoFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
      setSuccessMessage(`Video file "${file.name}" loaded successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // HTML or Markdown Notes File Upload Handler
  const handleNotesFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setTextContent(text);
          setNotesFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
          setSuccessMessage(`Notes file "${file.name}" uploaded and loaded into editor.`);
          setTimeout(() => setSuccessMessage(''), 3500);
        }
      };
      reader.readAsText(file);
    }
  };

  // Quiz Markdown (.md) File Upload Handler
  const handleQuizFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const parsed = parseQuizMarkdown(text, topic?.id || 'temp-topic');
          if (parsed.length === 0) {
            setErrorMessage(`Could not parse questions from "${file.name}". Please ensure standard quiz markdown formatting (Questions, options A/B/C/D, Correct: X).`);
          } else {
            setQuizQuestions(parsed);
            setQuizFileName(`${file.name} (${parsed.length} questions parsed)`);
            setSuccessMessage(`Loaded ${parsed.length} quiz questions from "${file.name}".`);
            setShowQuizPreview(true);
            setTimeout(() => setSuccessMessage(''), 4000);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Auto-fill slug from title if creating new topic
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage('Administrator verification required before saving.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter a topic title.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please provide a brief summary description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await saveTopic({
        id: topic?.id,
        moduleSlug,
        title,
        slug,
        description,
        videoUrl,
        videoProvider: 'youtube',
        estimatedMinutes: Number(estimatedMinutes) || 15,
        textContent
      });

      // If quiz questions were uploaded or modified, associate and save with this topic
      if (quizQuestions && quizQuestions.length > 0) {
        const mappedQuestions = quizQuestions.map((q, idx) => ({
          ...q,
          id: q.id.startsWith('q-') ? q.id : `q-${saved.id}-${idx + 1}`,
          topicId: saved.id
        }));
        await saveTopicQuiz(saved.id, mappedQuestions);
      }

      setSuccessMessage('Topic and associated curriculum assets saved successfully!');
      if (onSaved) onSaved(saved);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save topic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthorized || !topic?.id) return;
    const confirm = window.confirm(`Are you sure you want to remove the topic "${topic.title}"?`);
    if (!confirm) return;

    setIsSubmitting(true);
    try {
      await deleteTopic(topic.id);
      if (onDeleted) onDeleted(topic.id);
      onClose();
    } catch {
      setErrorMessage('Failed to delete topic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isDirectVideo = 
    videoUrl.toLowerCase().endsWith('.mp4') || 
    videoUrl.toLowerCase().endsWith('.webm') || 
    videoUrl.startsWith('blob:') || 
    videoUrl.startsWith('data:video');

  const isHtmlNotes = 
    textContent.trim().startsWith('<!DOCTYPE') ||
    textContent.trim().startsWith('<html') ||
    textContent.trim().startsWith('<div') ||
    (textContent.includes('<p>') && !textContent.trim().startsWith('#'));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-2.5 sm:p-4 flex items-center justify-center min-h-screen">
      <div 
        className="relative my-auto w-full max-w-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={videoFileInputRef}
          onChange={handleVideoFileUpload}
          accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
          className="hidden" 
        />

        <input 
          type="file" 
          ref={notesFileInputRef}
          onChange={handleNotesFileUpload}
          accept=".html,.htm,.md,.markdown,.txt,text/html,text/markdown"
          className="hidden" 
        />

        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {isEditing ? 'Edit Curriculum Topic' : 'Add New Curriculum Topic'}
                </h3>
                {isAuthorized && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Admin Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? `Modifying "${topic?.title}"` : 'Create a new topic lesson for candidates'}
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
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Security Protocol 2.4
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                Administrator Verification Required
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Before uploading video files, HTML notes, or modifying curriculum specifications, please verify your administrator credentials.
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
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Admin Master Passkey *</span>
                  </label>
                  <input
                    type="password"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="Enter secret passkey"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500"
                    autoFocus
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Admin Email Address *</span>
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@waynautic.ai"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Admin Password *</span>
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isVerifyingAuth}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isVerifyingAuth ? 'Verifying...' : 'Unlock Editor'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ===================================================================
           * VIEW 2: UNLOCKED CURRICULUM TOPIC EDITOR WITH UPLOAD CAPABILITIES
           * ===================================================================*/
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4">
            
            {/* Status Messages */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Module Assignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                <span>Module Assignment *</span>
              </label>
              <select
                value={moduleSlug}
                onChange={(e) => setModuleSlug(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500"
              >
                {MODULES.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    Module {m.orderIndex}: {m.title} ({m.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {/* Title and Slug Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Transformer Self-Attention Deep Dive"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., transformer-self-attention"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Description / Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                Brief Summary Description *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Learn how multi-head query, key, and value matrices calculate context vectors."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {/* Video File Upload & URL Configuration */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Video className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                  <span>Video Content (Upload Video File or Paste Embed URL)</span>
                </label>

                {/* Upload Video Button */}
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video File (.mp4, .webm)</span>
                </button>
              </div>

              {videoFileName && (
                <div className="flex items-center space-x-2 text-xs text-sky-700 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-cyan-800/60 font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Uploaded file active: <strong>{videoFileName}</strong></span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Or Direct Video / Embed URL:</span>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setVideoFileName('');
                    }}
                    placeholder="https://www.youtube.com/embed/... or direct .mp4 link"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Est. Duration:</span>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">mins</span>
                  </div>
                </div>
              </div>

              {/* Video Player Live Preview */}
              {videoUrl && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">Video Player Live Preview:</span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video max-h-48 flex items-center justify-center">
                    {isDirectVideo ? (
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <iframe src={videoUrl} title="Video Preview" className="w-full h-full border-0" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes Content & HTML/MD File Upload */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                  <span>Lesson Notes (Upload .HTML / .MD or Write Directly)</span>
                </label>

                <div className="flex items-center space-x-2">
                  {/* Toggle Preview / Edit */}
                  <button
                    type="button"
                    onClick={() => setNotesPreviewMode(notesPreviewMode === 'editor' ? 'preview' : 'editor')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center space-x-1 transition-colors"
                  >
                    {notesPreviewMode === 'editor' ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5" />
                        <span>Edit Code</span>
                      </>
                    )}
                  </button>

                  {/* Upload Notes File Button */}
                  <button
                    type="button"
                    onClick={() => notesFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Notes File (.html / .md)</span>
                  </button>
                </div>
              </div>

              {notesFileName && (
                <div className="flex items-center space-x-2 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>File imported: <strong>{notesFileName}</strong> ({isHtmlNotes ? 'HTML Format' : 'Markdown Format'})</span>
                </div>
              )}

              {/* Editor or Live Preview */}
              {notesPreviewMode === 'editor' ? (
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={9}
                  placeholder="# Lesson Title&#10;&#10;Or paste full HTML: <h2>Section Header</h2><p>Notes text...</p>"
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-sky-500"
                />
              ) : (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 max-h-60 overflow-y-auto text-xs leading-relaxed">
                  {isHtmlNotes ? (
                    <div dangerouslySetInnerHTML={{ __html: textContent }} />
                  ) : (
                    <pre className="font-mono whitespace-pre-wrap">{textContent}</pre>
                  )}
                </div>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input 
              type="file" 
              ref={videoFileInputRef} 
              accept="video/mp4,video/webm" 
              onChange={handleVideoFileUpload} 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={notesFileInputRef} 
              accept=".md,.markdown,.html,.txt" 
              onChange={handleNotesFileUpload} 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={quizFileInputRef} 
              accept=".md,.markdown,.txt" 
              onChange={handleQuizFileUpload} 
              className="hidden" 
            />

            {/* Topic Quiz Assessment (.MD File Upload) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                    <span>Topic Quiz Questions (Upload .MD Quiz File)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload a markdown quiz file with multiple choice questions, options, and explanations.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {quizQuestions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowQuizPreview(!showQuizPreview)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center space-x-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showQuizPreview ? 'Hide Preview' : `Preview (${quizQuestions.length})`}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => quizFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Quiz .MD</span>
                  </button>
                </div>
              </div>

              {quizFileName && (
                <div className="flex items-center justify-between text-xs text-sky-700 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/40 px-3 py-2 rounded-lg border border-sky-200 dark:border-cyan-800/60 font-mono">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Active quiz: <strong>{quizFileName}</strong> ({quizQuestions.length} questions ready)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizQuestions([]);
                      setQuizFileName('');
                      setShowQuizPreview(false);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-[11px] font-sans font-bold hover:underline shrink-0 ml-2"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Collapsible Questions Preview */}
              {showQuizPreview && quizQuestions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 max-h-60 overflow-y-auto space-y-3">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Q{qIdx + 1}. {q.questionText}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0 font-bold">
                          Answer: {String.fromCharCode(65 + q.correctOptionIndex)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx} 
                            className={`p-1.5 rounded flex items-center space-x-1.5 ${
                              optIdx === q.correctOptionIndex 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)})</span>
                            <span className="truncate">{opt}</span>
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Topic</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center space-x-2">
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
                  className="px-5 py-2 rounded-xl bg-[#1CB0F6] hover:bg-[#1899D6] border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6] text-white text-xs font-extrabold flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Topic Changes'}</span>
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
