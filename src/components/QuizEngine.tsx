'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, HelpCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '@/data/seedModules';

interface QuizEngineProps {
  topicId: string;
  topicTitle: string;
  questions: QuizQuestion[];
  onCompleteQuiz: (scorePercent: number) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  topicId,
  topicTitle,
  questions,
  onCompleteQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const selectedForCurrent = selectedOptions[currentIndex];
  const isAnswered = selectedForCurrent !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      calculateAndSubmitResult();
    }
  };

  const calculateAndSubmitResult = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setSubmitted(true);

    if (percentage >= 70) {
      // Trigger canvas confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }
    }

    onCompleteQuiz(percentage);
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedOptions({});
    setSubmitted(false);
    setShowExplanation(false);
  };

  if (submitted) {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="w-full bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
        
        <div className="inline-flex p-4 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
          <Award className={`w-12 h-12 ${passed ? 'text-amber-500' : 'text-slate-400'}`} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {passed ? 'Quiz Passed! Congratulations 🎉' : 'Keep Practicing!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-md mx-auto font-medium">
            {passed
              ? `You scored ${percentage}% on ${topicTitle}. Topic has been marked as complete!`
              : `You scored ${percentage}%. You need at least 70% to pass this quiz.`}
          </p>
        </div>

        {/* Score Ring / Card */}
        <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-around shadow-sm">
          <div>
            <div className="text-2xl font-extrabold text-sky-600 dark:text-cyan-400">{correctCount} / {questions.length}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Correct</div>
          </div>
          <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className={`text-2xl font-extrabold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{percentage}%</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Final Score</div>
          </div>
        </div>

        {/* Retake Button */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleRetake}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-sm transition-all flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-white" />
            <span>Retake Quiz</span>
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl space-y-5">
      
      {/* Quiz Header & Progress Bar */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-cyan-400 font-bold">Knowledge Check</span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Question {currentIndex + 1} of {questions.length}</h3>
        </div>
        <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
          {Math.round(((currentIndex + 1) / questions.length) * 100)}%
        </div>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
        <div 
          className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="py-2">
        <h4 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
          {currentQuestion.questionText}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-2.5 sm:space-y-3">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedForCurrent === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-between min-h-[48px] ${
                isSelected
                  ? 'bg-sky-50 dark:bg-cyan-950/60 border-sky-400 dark:border-cyan-500 text-sky-950 dark:text-cyan-200 shadow-md ring-2 ring-sky-300 dark:ring-cyan-500/20'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-7 h-7 rounded-xl text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                  isSelected ? 'bg-sky-500 text-white border-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-snug">{option}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-cyan-400 shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Callout Trigger */}
      {isAnswered && (
        <div className="pt-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
          </button>
          {showExplanation && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200 font-medium">
              <span className="font-bold text-sky-600 dark:text-cyan-400 block mb-1">Explanation:</span>
              {currentQuestion.explanation}
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation Action */}
      <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          disabled={!isAnswered}
          onClick={handleNext}
          className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all min-h-[44px] ${
            isAnswered
              ? 'bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 cursor-not-allowed'
          }`}
        >
          <span>{currentIndex === questions.length - 1 ? 'Finish & Submit Quiz' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
