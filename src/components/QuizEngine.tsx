'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
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
      <div className="w-full bg-[#0D121F] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
        
        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800">
          <Award className={`w-12 h-12 ${passed ? 'text-amber-400' : 'text-slate-400'}`} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {passed ? 'Quiz Passed! Congratulations 🎉' : 'Keep Practicing!'}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {passed
              ? `You scored ${percentage}% on ${topicTitle}. Topic has been marked as complete!`
              : `You scored ${percentage}%. You need at least 70% to pass this quiz.`}
          </p>
        </div>

        {/* Score Ring / Card */}
        <div className="max-w-xs mx-auto p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-around">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{correctCount} / {questions.length}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Correct Answers</div>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <div className={`text-2xl font-bold ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>{percentage}%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Final Score</div>
          </div>
        </div>

        {/* Retake Button */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleRetake}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="w-full bg-[#0D121F] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Quiz Header & Progress Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Knowledge Check</span>
          <h3 className="text-lg font-bold text-white">Question {currentIndex + 1} of {questions.length}</h3>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          {Math.round(((currentIndex + 1) / questions.length) * 100)}% Progress
        </div>
      </div>

      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-violet-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="py-2">
        <h4 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
          {currentQuestion.questionText}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedForCurrent === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-7 h-7 rounded-lg text-xs font-mono flex items-center justify-center border ${
                  isSelected ? 'bg-cyan-500 text-black font-bold border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Callout Trigger */}
      {isAnswered && (
        <div className="pt-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
          </button>
          {showExplanation && (
            <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
              <span className="font-bold text-cyan-400 block mb-1">Explanation:</span>
              {currentQuestion.explanation}
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation Action */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          disabled={!isAnswered}
          onClick={handleNext}
          className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            isAnswered
              ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:brightness-110 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>{currentIndex === questions.length - 1 ? 'Finish & Submit' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
