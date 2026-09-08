'use client';

import React, { useState, useEffect } from 'react';
import { MODULES, Topic } from '@/data/seedModules';
import { saveTopic, deleteTopic } from '@/lib/curriculumService';
import { 
  X, 
  Save, 
  Trash2, 
  BookOpen, 
  Video, 
  Clock, 
  FileText, 
  Layers, 
  Sparkles, 
  Check 
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
  const [moduleSlug, setModuleSlug] = useState<string>(defaultModuleSlug || 'llms');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = Boolean(topic?.id);

  useEffect(() => {
    if (topic) {
      setModuleSlug(topic.moduleSlug);
      setTitle(topic.title);
      setSlug(topic.slug);
      setDescription(topic.description);
      setVideoUrl(topic.videoUrl);
      setEstimatedMinutes(topic.estimatedMinutes || 15);
      setTextContent(topic.textContent || '');
    } else {
      setModuleSlug(defaultModuleSlug || 'llms');
      setTitle('');
      setSlug('');
      setDescription('');
      setVideoUrl('https://www.youtube.com/embed/zxQyTK8ckyY');
      setEstimatedMinutes(15);
      setTextContent('# Lesson Title\n\n## Overview\nExplain the technical foundations here.\n\n```python\n# Code Example\nprint("Hello Waynautic")\n```\n');
    }
    setErrorMessage('');
    setSuccessMessage('');
  }, [topic, defaultModuleSlug, isOpen]);

  // Auto-fill slug from title if creating new topic
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setSuccessMessage('Topic saved successfully!');
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
    if (!topic?.id) return;
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-2.5 sm:p-4 flex items-center justify-center min-h-screen">
      <div 
        className="relative my-auto w-full max-w-3xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {isEditing ? 'Edit Curriculum Topic' : 'Add New Curriculum Topic'}
              </h3>
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

        {/* Scrollable Form Body */}
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

          {/* Module Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              <span>Target Module *</span>
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

          {/* Description */}
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

          {/* Video URL and Estimated Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                <span>Video Embed URL</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/zxQyTK8ckyY"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                <span>Est. Duration (Mins)</span>
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Markdown Lesson Notes Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                <span>Markdown Lesson Notes & Technical Specs</span>
              </label>
              <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-500">
                <span>Supports GFM Markdown & Syntax Blocks</span>
              </div>
            </div>
            
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={9}
              placeholder="# Lesson Title&#10;&#10;Explain technical concepts, add code blocks, and diagrams."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Modal Footer Actions */}
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
                <span>{isSubmitting ? 'Saving...' : 'Save Topic'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
