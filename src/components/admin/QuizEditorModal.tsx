'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/data/seedModules';
import { getTopicQuiz, saveTopicQuiz } from '@/lib/curriculumService';
import { 
  X, 
  Plus, 
  Trash2, 
  HelpCircle, 
  CheckCircle2, 
  Save, 
  AlertCircle, 
  Check 
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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && topicId) {
      const existing = getTopicQuiz(topicId, topicTitle);
      // Deep clone so edits are local until saved
      setQuestions(JSON.parse(JSON.stringify(existing)));
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, topicId, topicTitle]);

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
      setErrorMessage('A topic must have at least one quiz question.');
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
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Topic Quiz Questions ({questions.length})
              </h3>
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

        {/* Scrollable Questions Form */}
        <form onSubmit={handleSaveAll} className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-5">
          
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

          {/* Question List */}
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div 
                key={q.id || qIndex} 
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800/90 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
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
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* 4 Choices */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                    Options & Correct Answer (Select the radio button for the correct choice) *
                  </label>
                  
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.correctOptionIndex === optIndex;
                      return (
                        <div 
                          key={optIndex}
                          className={`flex items-center space-x-2 p-2 sm:p-2.5 rounded-xl border transition-all ${
                            isCorrect 
                              ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30' 
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
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10">
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
                    Answer Explanation (Shown after student answers)
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(qIndex, { explanation: e.target.value })}
                    placeholder="e.g., Context windows determine the maximum number of tokens an LLM can retain."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

              </div>
            ))}
          </div>

          {/* Add Another Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-extrabold flex items-center justify-center space-x-2 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Quiz Question</span>
          </button>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
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
              className="px-5 py-2 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_2px_0_0_#58A700] text-white text-xs font-extrabold flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Questions...' : 'Save All Quiz Questions'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
